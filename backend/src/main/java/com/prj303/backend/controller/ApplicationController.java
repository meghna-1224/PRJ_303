package com.prj303.backend.controller;

import com.prj303.backend.entity.Application;
import com.prj303.backend.service.ApplicationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyForJob(
            @RequestParam Long userId,
            @RequestParam Long jobId) {

        try {

            Application application = applicationService.applyForJob(userId, jobId);

            return ResponseEntity.ok(application);

        } catch (RuntimeException e) {

            if (e.getMessage() != null &&
                    e.getMessage().equals("Already applied to this job")) {

                return ResponseEntity
                        .status(409)
                        .body("You have already applied to this job.");
            }

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Application>> getUserApplications(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                applicationService.getUserApplications(userId));
    }
}