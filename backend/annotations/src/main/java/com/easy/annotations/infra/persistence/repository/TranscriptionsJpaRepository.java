package com.easy.annotations.infra.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.easy.annotations.infra.persistence.entity.TranscriptionsEntity;

public interface TranscriptionsJpaRepository extends JpaRepository<TranscriptionsEntity, Integer> {
}
