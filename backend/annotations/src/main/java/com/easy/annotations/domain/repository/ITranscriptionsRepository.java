package com.easy.annotations.domain.repository;

import com.easy.annotations.domain.model.Transcriptions;

public interface ITranscriptionsRepository {
    Transcriptions save(Transcriptions transcriptions);
}
