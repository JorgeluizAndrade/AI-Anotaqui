package com.easy.annotations.application.usecase;
import org.springframework.stereotype.Component;

import com.easy.annotations.domain.model.Upload;
import com.easy.annotations.domain.repository.IUploadRepository;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class FindFileByIdUseCase {

	private final IUploadRepository uploadRepository;
	
	public FindFileByIdUseCase(IUploadRepository uploadRepository) {
		// TODO Auto-generated constructor stub\
		this.uploadRepository = uploadRepository;
	}

	public Upload findById(Integer id) {
		log.info("Found ID: {}", id);
		return uploadRepository.getUploadById(id);
	}
	
}
