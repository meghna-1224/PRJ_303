package com.prj303.backend.service;

import com.prj303.backend.entity.Job;
import com.prj303.backend.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobService {

    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public Job createJob(Job job) {
        return jobRepository.save(job);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Optional<Job> getJobById(Long id) {
        return jobRepository.findById(id);
    }

    public List<Job> searchJobs(String title) {
        return jobRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<Job> getJobsByLocation(String location) {
        return jobRepository.findByLocation(location);
    }
}