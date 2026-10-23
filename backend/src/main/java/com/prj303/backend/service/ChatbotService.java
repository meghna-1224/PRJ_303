package com.prj303.backend.service;

import org.springframework.stereotype.Service;
import java.util.Locale;

@Service
public class ChatbotService {

    public String getResponse(String message) {

        if (message == null || message.isBlank()) {
            return "Please type a question so I can help you.";
        }

        String input = message.toLowerCase(Locale.ROOT)
                .replaceAll("[^\\p{L}\\p{N}\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();

        System.out.println("Chatbot normalized input: [" + input + "]");

        // Registration
        if (containsAny(input, "register", "registration",
                "sign up", "signup", "create account",
                "how can i create an account",
                "make an account", "new account",
                "join pgrkam", "account creation",
                "join the portal", "join this portal",
                "become a member", "become a candidate",
                "create my account","i want to register", "need to register",
                "make a new account", "open an account")) {

            return "To create an account, open the Registration page "
                    + "and enter the required details, such as your name, "
                    + "email and password. Submit the form to register.";
        }

        // Login
        if (containsAny(input, "login", "log in", "sign in",
                "signin", "access my account", "cannot log in",
                "can't log in", "forgot password","i forgot my password",
                "i have forgotten my password",
                 "can't access my account",
                "cannot access my account",
                "unable to access my account",
                "i cannot sign in", "i can't sign in",
                "password forgotten", "reset my password",
                "having trouble logging in")) {

            return "To access your account, open the Login page and "
                    + "enter your registered email and password. "
                    + "If you cannot log in, check your credentials "
                    + "or use the password recovery option if available.";
        }

        // Job applications — check before general job queries
        if (containsAny(input, "application", "applications",
        "applied", "my submissions", "application status",
        "track my application", "check my application",
        "did my application go through",
        "view my submitted applications",
        "status of my application")) {

        return "You can check your submitted job applications "
            + "in the My Applications section of the portal.";
        }

        // Applying for jobs
        if (containsAny(input, "apply", "applying",
                "how do i get this job", "submit my cv",
                "submit my resume", "send my application")) {

            return "To apply, open the Jobs section, select a job, "
                    + "review its requirements and use the application "
                    + "option available on its details page.";
        }

        // Job recommendations
        if (containsAny(input, "recommend", "recommendation",
                "job match", "job matches", "suitable jobs",
                "jobs for my skills", "jobs that fit me",
                 "what jobs suit my skills",
                "which jobs suit my skills",
                "jobs suitable for me",
                "jobs matching my skills","jobs suited to my experience",
                "find jobs based on my skills","which jobs match my profile",
                "recommend jobs for me","suggest suitable jobs",
                "jobs related to my qualifications")) {

            return "For suitable job recommendations, complete your "
                    + "candidate profile and keep your skills, education "
                    + "and experience up to date. Then open Recommended Jobs.";
        }

        // Profile
        if (containsAny(input, "profile", "edit my details",
                "update my details", "change my information",
                "update my skills", "candidate details","edit my profile",
                "change my profile","update my education",
                "update my experience","how do i edit my profile",
                "my profile details","how can i update my education",
                "i want to update my experience")) {

            return "Open the Profile section to view or update your "
                    + "candidate information. Keeping your skills, "
                    + "education and experience current can help with "
                    + "job recommendations.";
        }

        // General job search
        if (containsAny(input, "job", "jobs", "vacancy",
                "vacancies", "employment opportunities",
                "find work", "search for work", "openings",
                "available positions", "job listings", "job search",
                "find a job", "look for a job",
                "search for jobs", "available jobs",
                "job opportunities near me",
                "what jobs are available",
                "show me available jobs")) {

            return "Open the Jobs section to browse available "
                    + "opportunities. Select a job to view its details, "
                    + "requirements, location and application options.";
        }

        // Employment services
        if (containsAny(input, "employment services",
                "pgrkam services", "what services")) {

            return "PGRKAM helps candidates explore employment "
                    + "opportunities, manage their profiles and "
                    + "apply for suitable jobs through the portal.";
        }

        // Greetings
        if (containsAny(input, "hi", "hello", "hey",
                "hii", "helo", "good morning",
                "good afternoon", "good evening")) {

            return "Hello! I'm the PGRKAM Assistant. I can help you "
                    + "with registration, login, profiles, jobs, "
                    + "applications and job recommendations.";
        }

        // Help
        if (containsAny(input, "help", "what can you do",
                "how can you help", "what can i ask")) {

            return "I can guide you through account registration, "
                    + "login, profile management, job searching, "
                    + "applications and job recommendations. "
                    + "Ask me a question in your own words.";
        }

        return "I'm not sure I understood that question yet. "
                + "You can ask me how to create an account, log in, "
                + "update your profile, find jobs, apply for a job "
                + "or view your applications.";
    }

    private boolean containsAny(String input, String... phrases) {
    for (String phrase : phrases) {
        String normalizedPhrase = phrase.toLowerCase(Locale.ROOT)
                .replaceAll("[^\\p{L}\\p{N}\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();

        if (!normalizedPhrase.isEmpty()
                && (" " + input + " ").contains(
                        " " + normalizedPhrase + " ")) {
            return true;
        }
    }
    return false;
}
}
