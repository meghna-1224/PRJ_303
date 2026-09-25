package com.prj303.backend.controller;

import com.prj303.backend.entity.CandidateProfile;
import com.prj303.backend.service.CandidateProfileService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class CandidateProfileController {

    private final CandidateProfileService profileService;

    public CandidateProfileController(
            CandidateProfileService profileService) {

        this.profileService = profileService;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<CandidateProfile> saveProfile(
            @PathVariable Long userId,
            @RequestBody CandidateProfile profile) {

        CandidateProfile savedProfile = profileService.saveOrUpdateProfile(userId, profile);

        return ResponseEntity.ok(savedProfile);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<CandidateProfile> getProfile(
            @PathVariable Long userId) {

        return profileService.getProfile(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}