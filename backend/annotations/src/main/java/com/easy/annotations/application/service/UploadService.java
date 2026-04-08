package com.easy.annotations.application.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.easy.annotations.application.usecase.FindFileByIdUseCase;
import com.easy.annotations.application.usecase.UploadFileUseCase;
import com.easy.annotations.core.dto.UploadDto;
import com.easy.annotations.domain.model.Upload;


@Service
public class UploadService implements IUploadService{

	private final UploadFileUseCase fileUseCase;
	private final FindFileByIdUseCase findFileByIdUseCase;
	
	
	public UploadService(UploadFileUseCase fileUseCase, FindFileByIdUseCase findFileByIdUseCase) {
		// TODO Auto-generated constructor stub
		this.fileUseCase = fileUseCase;
		this.findFileByIdUseCase = findFileByIdUseCase;
	}
	
	
	
	@Override
	public Upload save(MultipartFile file) {
		// TODO Auto-generated method stub
		return fileUseCase.uploadFile(file);

	}



	@Override
	public Upload findById(Integer id) {
		return findFileByIdUseCase.findById(id);
	}

	
	
}
