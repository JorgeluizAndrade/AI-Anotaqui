package com.easy.annotations.infra.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.easy.annotations.infra.persistence.entity.UploadEntity;

public interface UploadJpaRepository extends JpaRepository<UploadEntity, Integer> {
}

