package com.easy.annotations.infra.persistence.mapper;

import com.easy.annotations.domain.model.AiOutputs;
import com.easy.annotations.infra.persistence.entity.AiOutputsEntity;

public class AiOutputsMapper {

    public static AiOutputsEntity toEntity(AiOutputs aiOutputs) {
        AiOutputsEntity entity = new AiOutputsEntity();
        entity.setId(aiOutputs.getId());
        entity.setTranscriptionId(aiOutputs.getTranscriptionId());
        entity.setTitle(aiOutputs.getTitle());
        entity.setStatus(aiOutputs.getStatus());
        entity.setErrMessage(aiOutputs.getErrMessage());
        entity.setPrompt(aiOutputs.getPrompt());
        entity.setModel(aiOutputs.getModel());
        entity.setVersion(aiOutputs.getVersion());
        entity.setType(aiOutputs.getType());
        entity.setTextOutput(aiOutputs.getTextOutput());
        entity.setCreatedAt(aiOutputs.getCreatedAt());
        entity.setUpdatedAt(aiOutputs.getUpdatedAt());
        return entity;
    }

    public static AiOutputs toDomain(AiOutputsEntity entity) {
        AiOutputs aiOutputs = new AiOutputs();
        aiOutputs.setId(entity.getId());
        aiOutputs.setTranscriptionId(entity.getTranscriptionId());
        aiOutputs.setTitle(entity.getTitle());
        aiOutputs.setStatus(entity.getStatus());
        aiOutputs.setErr_message(entity.getErrMessage());
        aiOutputs.setPrompt(entity.getPrompt());
        aiOutputs.setModel(entity.getModel());
        aiOutputs.setVersion(entity.getVersion());
        aiOutputs.setType(entity.getType());
        aiOutputs.setTextOutput(entity.getTextOutput());
        aiOutputs.setCreatedAt(entity.getCreatedAt());
        aiOutputs.setUpdatedAt(entity.getUpdatedAt());
        return aiOutputs;
    }
}
