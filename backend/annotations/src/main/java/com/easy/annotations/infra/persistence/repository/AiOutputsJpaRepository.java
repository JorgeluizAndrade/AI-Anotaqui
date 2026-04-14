package com.easy.annotations.infra.persistence.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.easy.annotations.infra.persistence.entity.AiOutputsEntity;

public interface AiOutputsJpaRepository extends JpaRepository<AiOutputsEntity, Integer> {
}
