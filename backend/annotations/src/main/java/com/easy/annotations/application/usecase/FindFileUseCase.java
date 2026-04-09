package com.easy.annotations.application.usecase;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

import javax.management.RuntimeErrorException;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;

import com.easy.annotations.domain.model.Upload;
import com.easy.annotations.domain.repository.IUploadRepository;


@Component
public class FindFileUseCase {
	private final Path rootLocation = Paths.get("upload-dir");

	private final IUploadRepository uploadRepository;

	public FindFileUseCase(IUploadRepository uploadRepository) {
		// TODO Auto-generated constructor stub
		this.uploadRepository = uploadRepository;
	}

	public Upload loadFile(String filename) throws MalformedURLException {
		try {
			Path file = load(filename);
			Resource resource = new UrlResource(file.toUri());
			if (resource.exists() || resource.isReadable()) {
				return uploadRepository.getUploadByFilename(filename);
			} else {
				throw new RuntimeException("Could not read file: " + filename);

			}
		} catch (MalformedURLException e) {
			throw new MalformedURLException("Could not read file: " + filename);
		}
	}

	public Path load(String filename) {
		return rootLocation.resolve(filename);
	}
}