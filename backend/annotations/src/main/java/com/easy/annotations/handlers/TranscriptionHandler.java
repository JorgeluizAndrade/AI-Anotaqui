package com.easy.annotations.handlers;

import org.springframework.stereotype.Component;

import com.easy.annotations.domain.event.TranscriptionsRequested;
import com.easy.annotations.domain.model.Status;
import com.easy.annotations.domain.model.Transcriptions;
import com.easy.annotations.domain.repository.ITranscriptionsRepository;
import com.easy.annotations.infra.queue.EventBus;
import com.easy.annotations.infra.queue.EventHandler;
import com.easy.annotations.infra.transcription.ITranscriptionEngine;

@Component
public class TranscriptionHandler implements EventHandler<TranscriptionsRequested> {

	private final ITranscriptionsRepository repository;
	private final ITranscriptionEngine engine;
	private final EventBus eventBus;

	public TranscriptionHandler(EventBus eventBus, ITranscriptionsRepository repository, ITranscriptionEngine engine) {
		// TODO Auto-generated constructor stub
		this.eventBus = eventBus;
		this.repository = repository;
		this.engine = engine;
	}

	@Override
	public void handle(TranscriptionsRequested event) {
		// TODO Auto-generated method stub
		Transcriptions transcriptions = new Transcriptions();

		transcriptions.setTitle("Anotaqui: " + event.getFileName());
		transcriptions.setUploadId(event.getId());
		transcriptions.setStatus(Status.PROCESSING);

		try {
			// chamada da engine
			String stout = engine.transcribe(event.getFilePath(), event.getFileName());
			
	
			transcriptions.setRawText(stout);

			transcriptions.setStatus(Status.DONE);

			// fazer nova chamada Transcription Completed.

			
			
			repository.save(transcriptions);

		} catch (Exception e) {
			// TODO: handle exception
			transcriptions.setStatus(Status.ERROR);
			transcriptions.setErrMessage(e.getMessage());
			repository.save(transcriptions);
		}

	}

}
