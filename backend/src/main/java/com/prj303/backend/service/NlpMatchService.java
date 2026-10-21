package com.prj303.backend.service;

import com.prj303.backend.entity.Job;
import com.prj303.backend.entity.CandidateProfile;
import com.prj303.backend.entity.Resume;

import com.prj303.backend.repository.JobRepository;
import com.prj303.backend.repository.CandidateProfileRepository;
import com.prj303.backend.repository.ResumeRepository;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class NlpMatchService {

        private final JobRepository jobRepository;
        private final CandidateProfileRepository profileRepository;
        private final ResumeRepository resumeRepository;
        private final RestClient restClient;

        public NlpMatchService(
                        JobRepository jobRepository,
                        CandidateProfileRepository profileRepository,
                        ResumeRepository resumeRepository,
                        RestClient.Builder restClientBuilder) {

                this.jobRepository = jobRepository;
                this.profileRepository = profileRepository;
                this.resumeRepository = resumeRepository;

                this.restClient = restClientBuilder
                                .baseUrl("http://localhost:8000")
                                .build();
        }

        // =========================================================
        // FINAL JOB MATCHING
        // TF-IDF + SBERT + SKILL COVERAGE
        // =========================================================

        public Map<String, Object> matchJobs(Long userId) {

                // 1. Get candidate profile
                CandidateProfile profile = profileRepository
                                .findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Candidate profile not found"));

                // 2. Get all jobs
                List<Job> jobs = jobRepository.findAll();

                // 3. Get manually entered profile skills
                String profileSkills = profile.getSkills();

                // 4. Get skills extracted from the latest resume
                String resumeSkills = "";

                Resume resume = resumeRepository
                                .findByUserId(userId)
                                .orElse(null);

                if (resume != null &&
                                resume.getExtractedSkills() != null &&
                                !resume.getExtractedSkills().isBlank()) {

                        resumeSkills = resume.getExtractedSkills();
                }

                // 5. Combine manual skills + resume skills
                String candidateSkills = combineSkills(
                                profileSkills,
                                resumeSkills);

                if (candidateSkills.isBlank()) {

                        throw new RuntimeException(
                                        "Please add skills to your profile or upload a resume first");
                }

                // 6. Convert jobs to NLP request format
                List<Map<String, Object>> jobData = jobs.stream()
                                .map(job -> {

                                        Map<String, Object> jobMap = new LinkedHashMap<>();

                                        jobMap.put(
                                                        "id",
                                                        job.getId());

                                        jobMap.put(
                                                        "title",
                                                        job.getTitle());

                                        jobMap.put(
                                                        "description",
                                                        job.getDescription() == null
                                                                        ? ""
                                                                        : job.getDescription());

                                        jobMap.put(
                                                        "requiredSkills",
                                                        job.getRequiredSkills() == null
                                                                        ? ""
                                                                        : job.getRequiredSkills());

                                        return jobMap;
                                })
                                .toList();

                // =====================================================
                // 7. Prepare common NLP request
                // =====================================================

                Map<String, Object> request = new LinkedHashMap<>();

                request.put(
                                "candidateSkills",
                                candidateSkills);

                request.put(
                                "jobs",
                                jobData);

                // =====================================================
                // 8. Get TF-IDF results
                // =====================================================

                Map<String, Object> tfidfResponse = restClient.post()
                                .uri("/match/tfidf")
                                .body(request)
                                .retrieve()
                                .body(
                                                new ParameterizedTypeReference<Map<String, Object>>() {
                                                });

                // =====================================================
                // 9. Get SBERT results
                // =====================================================

                Map<String, Object> sbertResponse = restClient.post()
                                .uri("/match/sbert")
                                .body(request)
                                .retrieve()
                                .body(
                                                new ParameterizedTypeReference<Map<String, Object>>() {
                                                });

                // =====================================================
                // 10. Extract result lists
                // =====================================================

                List<Map<String, Object>> tfidfMatches = (List<Map<String, Object>>) tfidfResponse.get("matches");

                List<Map<String, Object>> sbertMatches = (List<Map<String, Object>>) sbertResponse.get("matches");

                // =====================================================
                // 11. Combine results
                // =====================================================

                Map<Long, Map<String, Object>> finalMatches = new LinkedHashMap<>();

                // Add SBERT results first
                for (Map<String, Object> sbertMatch : sbertMatches) {

                        Long jobId = ((Number) sbertMatch.get("jobId"))
                                        .longValue();

                        Map<String, Object> finalMatch = new LinkedHashMap<>();

                        finalMatch.put(
                                        "jobId",
                                        jobId);

                        finalMatch.put(
                                        "title",
                                        sbertMatch.get("title"));

                        finalMatch.put(
                                        "sbertScore",
                                        sbertMatch.get("similarityScore"));

                        // Explainability
                        finalMatch.put(
                                        "matchingSkills",
                                        sbertMatch.get("matchingSkills"));

                        finalMatch.put(
                                        "missingSkills",
                                        sbertMatch.get("missingSkills"));

                        finalMatches.put(
                                        jobId,
                                        finalMatch);
                }

                // =====================================================
                // 12. Add TF-IDF and calculate final score
                //
                // FINAL SCORE:
                // TF-IDF = 30%
                // SBERT = 40%
                // Skill Match = 30%
                //
                // If there are ZERO matching required skills,
                // final score is forced to ZERO.
                // =====================================================

                for (Map<String, Object> tfidfMatch : tfidfMatches) {

                        Long jobId = ((Number) tfidfMatch.get("jobId"))
                                        .longValue();

                        Map<String, Object> finalMatch = finalMatches.get(jobId);

                        if (finalMatch == null) {
                                continue;
                        }

                        double tfidfScore = ((Number) tfidfMatch.get("similarityScore"))
                                        .doubleValue();

                        double sbertScore = ((Number) finalMatch.get("sbertScore"))
                                        .doubleValue();

                        // -------------------------------------------------
                        // Get matching and missing skills
                        // -------------------------------------------------

                        List<String> matchingSkills = convertToStringList(
                                        finalMatch.get("matchingSkills"));

                        List<String> missingSkills = convertToStringList(
                                        finalMatch.get("missingSkills"));

                        int matchingSkillCount = matchingSkills.size();

                        int missingSkillCount = missingSkills.size();

                        int totalRequiredSkills = matchingSkillCount +
                                        missingSkillCount;

                        // -------------------------------------------------
                        // Calculate skill coverage
                        // -------------------------------------------------

                        double skillCoverage = 0.0;

                        if (totalRequiredSkills > 0) {

                                skillCoverage = (double) matchingSkillCount
                                                / totalRequiredSkills;
                        }

                        // -------------------------------------------------
                        // Final score
                        // -------------------------------------------------

                        double finalScore;

                        /*
                         * If the candidate has no direct overlap with
                         * the required skills, do not allow semantic
                         * similarity alone to produce a high job match.
                         */
                        if (matchingSkillCount == 0) {

                                finalScore = 0.0;

                        } else {

                                finalScore = (tfidfScore * 0.30)
                                                +
                                                (sbertScore * 0.40)
                                                +
                                                (skillCoverage * 0.30);
                        }

                        // -------------------------------------------------
                        // Store scores
                        // -------------------------------------------------

                        finalMatch.put(
                                        "tfidfScore",
                                        tfidfScore);

                        finalMatch.put(
                                        "skillCoverage",
                                        skillCoverage);

                        finalMatch.put(
                                        "finalScore",
                                        finalScore);

                        // Store cleaned skill lists
                        finalMatch.put(
                                        "matchingSkills",
                                        matchingSkills);

                        finalMatch.put(
                                        "missingSkills",
                                        missingSkills);
                }

                // =====================================================
                // 13. Sort by final score
                // =====================================================

                List<Map<String, Object>> sortedMatches = finalMatches.values()
                                .stream()
                                .sorted(
                                                Comparator.comparingDouble(
                                                                match -> -((Number) match.get(
                                                                                "finalScore"))
                                                                                .doubleValue()))
                                .toList();

                // =====================================================
                // 14. Prepare final response
                // =====================================================

                Map<String, Object> response = new LinkedHashMap<>();

                response.put(
                                "algorithm",
                                "TF-IDF + SBERT + Skill Coverage Hybrid Matching");

                response.put(
                                "tfidfWeight",
                                0.30);

                response.put(
                                "sbertWeight",
                                0.40);

                response.put(
                                "skillCoverageWeight",
                                0.30);

                response.put(
                                "candidateSkills",
                                candidateSkills);

                response.put(
                                "matches",
                                sortedMatches);

                return response;
        }

        // =========================================================
        // SBERT ENDPOINT
        // Kept separately for testing/debugging
        // =========================================================

        public Map<String, Object> matchJobsSbert(Long userId) {

                CandidateProfile profile = profileRepository
                                .findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Candidate profile not found"));

                List<Job> jobs = jobRepository.findAll();

                String profileSkills = profile.getSkills();

                String resumeSkills = "";

                Resume resume = resumeRepository
                                .findByUserId(userId)
                                .orElse(null);

                if (resume != null &&
                                resume.getExtractedSkills() != null &&
                                !resume.getExtractedSkills().isBlank()) {

                        resumeSkills = resume.getExtractedSkills();
                }

                // Combine manual profile skills
                // with latest resume-extracted skills
                String candidateSkills = combineSkills(
                                profileSkills,
                                resumeSkills);

                if (candidateSkills.isBlank()) {

                        throw new RuntimeException(
                                        "Please add skills to your profile or upload a resume first");
                }

                List<Map<String, Object>> jobData = jobs.stream()
                                .map(job -> {

                                        Map<String, Object> jobMap = new LinkedHashMap<>();

                                        jobMap.put(
                                                        "id",
                                                        job.getId());

                                        jobMap.put(
                                                        "title",
                                                        job.getTitle());

                                        jobMap.put(
                                                        "description",
                                                        job.getDescription() == null
                                                                        ? ""
                                                                        : job.getDescription());

                                        jobMap.put(
                                                        "requiredSkills",
                                                        job.getRequiredSkills() == null
                                                                        ? ""
                                                                        : job.getRequiredSkills());

                                        return jobMap;
                                })
                                .toList();

                Map<String, Object> request = new LinkedHashMap<>();

                request.put(
                                "candidateSkills",
                                candidateSkills);

                request.put(
                                "jobs",
                                jobData);

                Map<String, Object> response = restClient.post()
                                .uri("/match/sbert")
                                .body(request)
                                .retrieve()
                                .body(
                                                new ParameterizedTypeReference<Map<String, Object>>() {
                                                });

                return response;
        }

        // =========================================================
        // COMBINE PROFILE + RESUME SKILLS
        // =========================================================

        private String combineSkills(
                        String profileSkills,
                        String resumeSkills) {

                Set<String> combinedSkills = new LinkedHashSet<>();

                // -----------------------------------------------------
                // Manually entered profile skills
                // -----------------------------------------------------

                if (profileSkills != null &&
                                !profileSkills.isBlank()) {

                        Arrays.stream(
                                        profileSkills.split(","))
                                        .map(String::trim)
                                        .filter(
                                                        skill -> !skill.isBlank())
                                        .forEach(
                                                        combinedSkills::add);
                }

                // -----------------------------------------------------
                // Resume extracted skills
                // -----------------------------------------------------

                if (resumeSkills != null &&
                                !resumeSkills.isBlank()) {

                        Arrays.stream(
                                        resumeSkills.split(","))
                                        .map(String::trim)
                                        .filter(
                                                        skill -> !skill.isBlank())
                                        .forEach(
                                                        combinedSkills::add);
                }

                return String.join(
                                ", ",
                                combinedSkills);
        }

        // =========================================================
        // CONVERT NLP SKILL LIST TO JAVA STRING LIST
        // =========================================================

        private List<String> convertToStringList(
                        Object skillsObject) {

                if (skillsObject == null) {
                        return List.of();
                }

                if (skillsObject instanceof List<?>) {

                        return ((List<?>) skillsObject)
                                        .stream()
                                        .map(String::valueOf)
                                        .toList();
                }

                return List.of(
                                String.valueOf(skillsObject));
        }
}