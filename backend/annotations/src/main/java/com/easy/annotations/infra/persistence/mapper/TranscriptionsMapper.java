package com.easy.annotations.infra.persistence.mapper;

import com.easy.annotations.domain.model.Transcriptions;
import com.easy.annotations.infra.persistence.entity.TranscriptionsEntity;

public class TranscriptionsMapper {

    public static TranscriptionsEntity toEntity(Transcriptions transcriptions) {
        TranscriptionsEntity entity = new TranscriptionsEntity();
        entity.setId(transcriptions.getId());
        entity.setTitle(transcriptions.getTitle());
        entity.setStatus(transcriptions.getStatus());
        entity.setErrMessage(transcriptions.getErrMessage());
        entity.setRawText(transcriptions.getRawText());
        entity.setUploadId(transcriptions.getUploadId());
        entity.setCreatedAt(transcriptions.getCreatedAt());
        entity.setUpdatedAt(transcriptions.getUpdatedAt());
        return entity;
    }

    public static Transcriptions toDomain(TranscriptionsEntity entity) {
        Transcriptions transcriptions = new Transcriptions();
        transcriptions.setId(entity.getId());
        transcriptions.setTitle(entity.getTitle());
        transcriptions.setStatus(entity.getStatus());
        transcriptions.setErrMessage(entity.getErrMessage());
        transcriptions.setRawText(entity.getRawText());
        transcriptions.setUploadId(entity.getUploadId());
        transcriptions.setCreatedAt(entity.getCreatedAt());
        transcriptions.setUpdatedAt(entity.getUpdatedAt());
        return transcriptions;
    }
}
