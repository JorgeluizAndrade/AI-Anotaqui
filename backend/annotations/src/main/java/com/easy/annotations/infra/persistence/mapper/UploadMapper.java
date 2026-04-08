package com.easy.annotations.infra.persistence.mapper;

import com.easy.annotations.domain.model.Upload;
import com.easy.annotations.infra.persistence.entity.UploadEntity;


public class UploadMapper {

    public static UploadEntity toEntity(Upload upload) {
        UploadEntity entity = new UploadEntity();
        entity.setId(upload.getId());
        entity.setFileName(upload.getFileName());
        entity.setFilePath(upload.getFilePath());
        entity.setStatus(upload.getStatus());
        entity.setCreatedAt(upload.getCreatedAt());
        entity.setUpdatedAt(upload.getUpdatedAt());
        return entity;
    }

    public static Upload toDomain(UploadEntity entity) {
        Upload upload = new Upload();
        upload.setId(entity.getId());
        upload.setFileName(entity.getFileName());
        upload.setFilePath(entity.getFilePath());
        upload.setStatus(entity.getStatus());
        upload.setCreatedAt(entity.getCreatedAt());
        upload.setUpdatedAt(entity.getUpdatedAt());
        return upload;
    }
}
