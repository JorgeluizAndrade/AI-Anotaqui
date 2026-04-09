package com.easy.annotations.infra.persistence.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.easy.annotations.domain.model.Upload;
import com.easy.annotations.domain.repository.IUploadRepository;
import com.easy.annotations.infra.persistence.entity.UploadEntity;
import com.easy.annotations.infra.persistence.mapper.UploadMapper;

@Repository
public class UploadRepositoryImpl implements IUploadRepository {

	private final UploadJpaRepository jpaRepository;

	public UploadRepositoryImpl(UploadJpaRepository jpaRepository) {
		this.jpaRepository = jpaRepository;
	}

	@Override
	public Upload save(Upload upload) {
		UploadEntity entity = UploadMapper.toEntity(upload);
		UploadEntity saved = jpaRepository.save(entity);
		return UploadMapper.toDomain(saved);
	}

	@Override
	public Upload getUploadByFilename(String filename) {
		Optional<UploadEntity> entityOpt = jpaRepository.findByFileName(filename);
		return entityOpt.map(UploadMapper::toDomain).orElse(null);
	}

}
