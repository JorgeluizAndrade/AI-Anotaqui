package com.easy.annotations.application.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.easy.annotations.application.usecase.FindFileUseCase;
import com.easy.annotations.application.usecase.UploadFileUseCase;
import com.easy.annotations.domain.model.Upload;

import java.net.MalformedURLException;

@Service
public class UploadService implements IUploadService {

	private final UploadFileUseCase fileUseCase;
	private final FindFileUseCase findFileByIdUseCase;

	public UploadService(UploadFileUseCase fileUseCase, FindFileUseCase findFileByIdUseCase) {
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
	public Upload findFile(String filename) throws MalformedURLException {
		try {
			return findFileByIdUseCase.loadFile(filename);

		} catch (MalformedURLException e) {
			// TODO: handle exception
			throw new MalformedURLException("Could not read file: " + filename);
		}
	}

}
