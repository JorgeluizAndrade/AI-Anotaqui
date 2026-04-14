package com.easy.annotations.infra.persistence.repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

	@Override
	public AiOutputs getById(Integer id) {
		// TODO Auto-generated method stub
		Optional<AiOutputsEntity> entityOpt = jpaRepository.findById(id);
	
		return entityOpt.map(AiOutputsMapper::toDomain).orElse(null);
	}

	@Override
	public List<AiOutputs> findAllAiOutputs() {
		// TODO Auto-generated method stub
		var entitys  = jpaRepository.findAll();
		
		return entitys.stream().map(AiOutputsMapper::toDomain).collect(Collectors.toList());
	}
}
