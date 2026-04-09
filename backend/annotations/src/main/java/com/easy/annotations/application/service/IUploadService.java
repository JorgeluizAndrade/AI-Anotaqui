package com.easy.annotations.application.service;

import java.net.MalformedURLException;

import org.springframework.web.multipart.MultipartFile;

import com.easy.annotations.domain.model.Upload;

public interface IUploadService {
	Upload save(MultipartFile file);
	Upload findFile(String filename) throws MalformedURLException;
}
