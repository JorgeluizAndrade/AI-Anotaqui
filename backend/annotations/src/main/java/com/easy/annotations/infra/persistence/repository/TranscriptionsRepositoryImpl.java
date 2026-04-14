package com.easy.annotations.infra.persistence.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.easy.annotations.domain.model.Transcriptions;
import com.easy.annotations.domain.repository.ITranscriptionsRepository;
import com.easy.annotations.infra.persistence.entity.TranscriptionsEntity;
import com.easy.annotations.infra.persistence.mapper.TranscriptionsMapper;

@Repository
public class TranscriptionsRepositoryImpl implements ITranscriptionsRepository {

    private final TranscriptionsJpaRepository jpaRepository;

    public TranscriptionsRepositoryImpl(TranscriptionsJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Transcriptions save(Transcriptions transcriptions) {
        TranscriptionsEntity entity = TranscriptionsMapper.toEntity(transcriptions);
        TranscriptionsEntity saved = jpaRepository.save(entity);
        return TranscriptionsMapper.toDomain(saved);
    }

    @Override
    public Optional<Transcriptions> findById(Integer id) {
        return jpaRepository.findById(id).map(TranscriptionsMapper::toDomain);
    }
}
