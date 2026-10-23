package com.prj303.backend.controller;

import com.prj303.backend.entity.Resume;
import com.prj303.backend.service.ResumeService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping("/upload/{userId}")
    public ResponseEntity<?> uploadResume(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {

        try {
            return ResponseEntity.ok(
                    resumeService.uploadResume(userId, file));
        } catch (IOException | RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Resume> getResume(
            @PathVariable Long userId) {

        Resume resume = resumeService.getResume(userId);

        return resume == null
                ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(resume);
    }
}
