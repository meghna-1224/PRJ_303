package com.prj303.backend.service;

import com.prj303.backend.entity.Application;
import com.prj303.backend.entity.Job;
import com.prj303.backend.entity.User;
import com.prj303.backend.repository.ApplicationRepository;
import com.prj303.backend.repository.JobRepository;
import com.prj303.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            UserRepository userRepository,
            JobRepository jobRepository) {

        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
    }

    public Application applyForJob(Long userId, Long jobId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (applicationRepository.existsByUserIdAndJobId(userId, jobId)) {
            throw new RuntimeException("Already applied to this job");
        }

        Application application = new Application();

        application.setUser(user);
        application.setJob(job);
        application.setStatus("APPLIED");
        application.setAppliedAt(LocalDateTime.now());

        return applicationRepository.save(application);
    }

    public List<Application> getUserApplications(Long userId) {
        return applicationRepository.findByUserId(userId);
    }
}