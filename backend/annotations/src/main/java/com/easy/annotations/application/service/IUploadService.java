package com.easy.annotations.application.service;

import org.springframework.web.multipart.MultipartFile;

import com.easy.annotations.domain.model.Upload;

public interface IUploadService {
	Upload save(MultipartFile file);
}
