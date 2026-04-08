package com.easy.annotations.application.usecase;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import com.easy.annotations.UploadDto;
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

	
	public UploadFileUseCase(IUploadRepository uploadRepository, ApplicationEventPublisher eventPublisher) {
		// TODO Auto-generated constructor stub
		this.uploadRepository =  uploadRepository;
		this.eventPublisher = eventPublisher;
	}
	
	public Upload uploadFile(UploadDto uploadDto) {		
        log.info("Uploading file: {}", uploadDto.fileName());
		// como fazer upload de arquivos mp3 ou mp4 em spring boot.
        Upload uplaod = new Upload();
        
        
        // fazer um mapper
        uplaod.setFileName(uploadDto.fileName());
        uplaod.setFilePath(uploadDto.filePath());     
        uplaod.setStatus(Status.PROCESSING);
        

        Upload saved = uploadRepository.save(uplaod);
        
      
        UploadCreated event = new UploadCreated(saved.getId(), saved.getFileName(), saved.getFilePath(), Status.DONE);
      
        
        eventPublisher.publishEvent(event);        
        
        log.info("OrderCreatedEvent published: {}", event.getFileName(), "ID: {}",event.getId());
        
        
 		return saved;
	}
}
