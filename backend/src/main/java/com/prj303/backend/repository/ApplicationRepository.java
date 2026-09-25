package com.prj303.backend.repository;

import com.prj303.backend.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByUserId(Long userId);

    boolean existsByUserIdAndJobId(Long userId, Long jobId);
}