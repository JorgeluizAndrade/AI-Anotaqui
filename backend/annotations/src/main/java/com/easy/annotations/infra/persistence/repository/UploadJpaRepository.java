package com.easy.annotations.infra.persistence.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.easy.annotations.infra.persistence.entity.UploadEntity;

public interface UploadJpaRepository extends JpaRepository<UploadEntity, Integer> {
	
	Optional<UploadEntity>findByFileName(String fileName);
}

