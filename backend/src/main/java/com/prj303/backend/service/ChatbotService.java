
package com.prj303.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ChatbotService {

        @Value("${gemini.api.key}")
        private String apiKey;

        @Value("${gemini.api.url}")
        private String apiUrl;

        private final RestClient restClient = RestClient.create();

        private static final String SYSTEM_PROMPT = """
                        You are the PGRKAM Assistant, a helpful AI chatbot for the
                        PGRKAM employment portal.

                        Your responsibilities:
                        1. Help users understand how to register and log in.
                        2. Explain how candidates can manage their profiles.
                        3. Guide candidates through uploading resumes.
                        4. Explain how to search for jobs and apply for them.
                        5. Explain job recommendations and how matching works.
                        6. Help users understand their applications.

                        Important rules:
                        - Be friendly, clear, and concise.
                        - Answer in the language used by the user whenever possible.
                        - You may understand and respond in multiple languages.
                        - Keep answers relevant to the PGRKAM employment portal.
                        - Never invent job vacancies, application statuses, or user details.
                        - You do not have access to live database records or individual
                          candidate information.
                        - If a user asks for information you cannot access, explain
                          that they should check their portal dashboard.
                        - Do not ask users to share passwords, API keys, or sensitive
                          personal information.
                        - If a question is unrelated to the portal, politely guide
                          the user back to PGRKAM-related topics.
                        """;

        public String getResponse(String message) {

                if (message == null || message.isBlank()) {
                        return "Please type a question so I can help you.";
                }

                try {
                        Map<String, Object> requestBody = Map.of(
                                        "systemInstruction", Map.of(
                                                        "parts", List.of(
                                                                        Map.of("text", SYSTEM_PROMPT))),
                                        "contents", List.of(
                                                        Map.of(
                                                                        "role", "user",
                                                                        "parts", List.of(
                                                                                        Map.of("text", message)))),
                                        "generationConfig", Map.of(
                                                        "temperature", 0.4,
                                                        "maxOutputTokens", 512));

                        Map<?, ?> response = restClient.post()
                                        .uri(apiUrl)
                                        .header("x-goog-api-key", apiKey)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(requestBody)
                                        .retrieve()
                                        .body(Map.class);

                        if (response == null) {
                                return "I couldn't generate a response. Please try again.";
                        }

                        Object candidatesObject = response.get("candidates");

                        if (!(candidatesObject instanceof List<?> candidates)
                                        || candidates.isEmpty()) {
                                return "I couldn't generate a response. Please rephrase your question.";
                        }

                        Object contentObject = ((Map<?, ?>) candidates.get(0)).get("content");

                        if (!(contentObject instanceof Map<?, ?> content)) {
                                return "I couldn't generate a response. Please try again.";
                        }

                        Object partsObject = content.get("parts");

                        if (!(partsObject instanceof List<?> parts)) {
                                return "I couldn't generate a response. Please try again.";
                        }

                        List<String> textParts = new ArrayList<>();

                        for (Object part : parts) {
                                if (part instanceof Map<?, ?> partMap
                                                && partMap.get("text") instanceof String text) {
                                        textParts.add(text);
                                }
                        }

                        String result = String.join("\n", textParts).trim();

                        return result.isEmpty()
                                        ? "I couldn't generate a response. Please try again."
                                        : result;

                } catch (RestClientResponseException e) {

                        System.err.println("Gemini API returned status: " + e.getStatusCode());

                        if (e.getStatusCode().value() == 401
                                        || e.getStatusCode().value() == 403) {
                                return "The chatbot authentication failed. Please contact the administrator.";
                        }

                        if (e.getStatusCode().value() == 429) {
                                return "The chatbot is receiving too many requests right now. Please try again later.";
                        }

                        return "The chatbot service is temporarily unavailable. Please try again.";

                } catch (Exception e) {

                        System.err.println("Gemini chatbot error: " + e.getMessage());

                        return "Sorry, I'm having trouble connecting to the chatbot. Please try again.";
                }
        }
}
