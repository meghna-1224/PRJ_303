
package com.prj303.backend.service;

import com.prj303.backend.entity.Job;
import com.prj303.backend.entity.CandidateProfile;
import com.prj303.backend.repository.JobRepository;
import com.prj303.backend.repository.CandidateProfileRepository;
import org.springframework.core.ParameterizedTypeReference;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
public class NlpMatchService {

    private final JobRepository jobRepository;
    private final CandidateProfileRepository profileRepository;
    private final RestClient restClient;

    public NlpMatchService(
            JobRepository jobRepository,
            CandidateProfileRepository profileRepository,
            RestClient.Builder restClientBuilder) {

        this.jobRepository = jobRepository;
        this.profileRepository = profileRepository;

        this.restClient = restClientBuilder
                .baseUrl("http://localhost:8000")
                .build();
    }

    public Map<String, Object> matchJobs(Long userId) {

        // 1. Get the candidate's saved profile from MySQL
        CandidateProfile profile = profileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException(
                        "Candidate profile not found"));

        // 2. Get all jobs from MySQL
        List<Job> jobs = jobRepository.findAll();

        // 3. Prepare candidate skills for FastAPI
        String candidateSkills = profile.getSkills();

        if (candidateSkills == null ||
                candidateSkills.isBlank()) {
            throw new RuntimeException(
                    "Please add skills to your profile first");
        }

        // 4. Convert Java Job entities into the format
        // expected by the Python MatchRequest model
        List<Map<String, Object>> jobData = jobs.stream()
                .map(job -> {
                    Map<String, Object> jobMap = new LinkedHashMap<>();

                    jobMap.put("id", job.getId());
                    jobMap.put("title", job.getTitle());
                    jobMap.put("description",
                            job.getDescription() == null
                                    ? ""
                                    : job.getDescription());
                    jobMap.put("requiredSkills",
                            job.getRequiredSkills() == null
                                    ? ""
                                    : job.getRequiredSkills());

                    return jobMap;
                })
                .toList();

        // 5. Prepare the complete request for FastAPI
        Map<String, Object> request = new LinkedHashMap<>();

        request.put("candidateSkills", candidateSkills);
        request.put("jobs", jobData);

        // 6. Call the Python NLP service
        Map<String, Object> response = restClient.post()
                .uri("/match/tfidf")
                .body(request)
                .retrieve()
                .body(
                        new ParameterizedTypeReference<Map<String, Object>>() {
                        });

        // 7. Return the ranked results to the controller
        return response;
    }
}