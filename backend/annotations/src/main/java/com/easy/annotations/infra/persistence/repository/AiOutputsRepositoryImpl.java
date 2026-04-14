package com.easy.annotations.infra.persistence.repository;

import org.springframework.stereotype.Repository;

import com.easy.annotations.domain.model.AiOutputs;
import com.easy.annotations.domain.repository.IAiOutputsRepository;
import com.easy.annotations.infra.persistence.entity.AiOutputsEntity;
import com.easy.annotations.infra.persistence.mapper.AiOutputsMapper;

@Repository
public class AiOutputsRepositoryImpl implements IAiOutputsRepository {

    private final AiOutputsJpaRepository jpaRepository;

    public AiOutputsRepositoryImpl(AiOutputsJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public AiOutputs save(AiOutputs aiOutputs) {
        AiOutputsEntity entity = AiOutputsMapper.toEntity(aiOutputs);
        AiOutputsEntity saved = jpaRepository.save(entity);
        return AiOutputsMapper.toDomain(saved);
    }
}
