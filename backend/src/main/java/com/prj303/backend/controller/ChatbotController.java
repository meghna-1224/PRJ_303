package com.prj303.backend.controller;

import com.prj303.backend.dto.ChatRequest;
import com.prj303.backend.dto.ChatResponse;
import com.prj303.backend.service.ChatbotService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatRequest request) {

        String response = chatbotService.getResponse(
                request.getMessage());

        return ResponseEntity.ok(
                new ChatResponse(response));
    }
}