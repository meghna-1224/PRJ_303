package com.prj303.backend.controller;

import com.prj303.backend.service.NlpMatchService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/matches")
public class NlpMatchController {

    private final NlpMatchService nlpMatchService;

    public NlpMatchController(
            NlpMatchService nlpMatchService) {

        this.nlpMatchService = nlpMatchService;
    }

    // =========================================================
    // TF-IDF MATCHING
    // =========================================================

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> matchJobs(
            @PathVariable Long userId) {

        Map<String, Object> results = nlpMatchService.matchJobs(userId);

        return ResponseEntity.ok(results);
    }

    // =========================================================
    // SBERT MATCHING
    // =========================================================

    @GetMapping("/sbert/{userId}")
    public ResponseEntity<Map<String, Object>> matchJobsSbert(
            @PathVariable Long userId) {

        Map<String, Object> results = nlpMatchService.matchJobsSbert(userId);

        return ResponseEntity.ok(results);
    }
}