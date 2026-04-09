package com.easy.annotations.application.usecase;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.easy.annotations.domain.event.UploadCreated;
import com.easy.annotations.domain.model.Status;
import com.easy.annotations.domain.model.Upload;
import com.easy.annotations.domain.repository.IUploadRepository;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class UploadFileUseCase {

	private final IUploadRepository uploadRepository;
	private final ApplicationEventPublisher eventPublisher;

	private final Path rootLocation = Paths.get("upload-dir");

	public UploadFileUseCase(IUploadRepository uploadRepository, ApplicationEventPublisher eventPublisher) {
		// TODO Auto-generated constructor stub
		this.uploadRepository = uploadRepository;
		this.eventPublisher = eventPublisher;
	}

	public Upload uploadFile(MultipartFile file) {
		log.info("Uploading file: {}", file.getOriginalFilename());

		String contentType = file.getContentType();

		log.info("Content Type of file: {}", contentType);

		try {

			Upload uplaod = new Upload();

			uplaod.setFileName(file.getOriginalFilename());
			uplaod.setFilePath(rootLocation.toString());
			uplaod.setStatus(Status.PROCESSING);

			Upload saved = uploadRepository.save(uplaod);

			Files.copy(file.getInputStream(), this.rootLocation.resolve(file.getOriginalFilename()),
					StandardCopyOption.REPLACE_EXISTING);

			log.info("Persisted file ID : {}", saved.getId());
			log.info("Persisted file NAME: {}", saved.getFileName());
			log.info("Persisted file STATUS: {}", saved.getStatus());

			UploadCreated event = new UploadCreated(saved.getId(), saved.getFileName(), saved.getFilePath(),
					Status.DONE, uplaod.getCreatedAt());

			eventPublisher.publishEvent(event);

			log.info("OrderCreatedEvent published name: {}", event.getFileName());
			log.info("OrderCreatedEvent published ID: {}", event.getId());
			log.info("Persisted file STATUS: {}", event.getStatus());

			return saved;
		} catch (IOException e) {
			throw new RuntimeException("Falha ao salvar", e);
		}

	}
}
