package com.easy.annotations.domain.repository;

import java.util.Optional;

import com.easy.annotations.domain.model.Transcriptions;

public interface ITranscriptionsRepository {
    Transcriptions save(Transcriptions transcriptions);
    Optional<Transcriptions> findById(Integer id);
}
