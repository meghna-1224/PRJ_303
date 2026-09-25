package com.prj303.backend.service;

import com.prj303.backend.entity.CandidateProfile;
import com.prj303.backend.entity.User;
import com.prj303.backend.repository.CandidateProfileRepository;
import com.prj303.backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CandidateProfileService {

    private final CandidateProfileRepository profileRepository;
    private final UserRepository userRepository;

    public CandidateProfileService(
            CandidateProfileRepository profileRepository,
            UserRepository userRepository) {

        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    public CandidateProfile saveOrUpdateProfile(
            Long userId,
            CandidateProfile profile) {

        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();

        Optional<CandidateProfile> existingProfile = profileRepository.findByUserId(userId);

        CandidateProfile profileToSave;

        if (existingProfile.isPresent()) {

            profileToSave = existingProfile.get();

        } else {

            profileToSave = new CandidateProfile();
            profileToSave.setUser(user);
        }

        profileToSave.setEducation(profile.getEducation());
        profileToSave.setDegree(profile.getDegree());
        profileToSave.setSkills(profile.getSkills());
        profileToSave.setExperienceYears(profile.getExperienceYears());
        profileToSave.setLocation(profile.getLocation());
        profileToSave.setPreferredLocation(profile.getPreferredLocation());

        return profileRepository.save(profileToSave);
    }

    public Optional<CandidateProfile> getProfile(Long userId) {

        return profileRepository.findByUserId(userId);
    }
}