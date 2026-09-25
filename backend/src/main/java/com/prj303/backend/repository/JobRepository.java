package com.prj303.backend.repository;

import com.prj303.backend.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByLocation(String location);

    List<Job> findByTitleContainingIgnoreCase(String title);
}