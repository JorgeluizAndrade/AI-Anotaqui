package com.easy.annotations.handlers;

import org.springframework.stereotype.Component;

import com.easy.annotations.domain.event.TranscriptionsRequested;
import com.easy.annotations.domain.model.Status;
import com.easy.annotations.domain.model.Transcriptions;
import com.easy.annotations.domain.repository.ITranscriptionsRepository;
import com.easy.annotations.infra.queue.EventBus;
import com.easy.annotations.infra.queue.EventHandler;

@Component
public class TranscriptionHandler implements EventHandler<TranscriptionsRequested> {

	private final ITranscriptionsRepository repository;
	private final EventBus eventBus;

	public TranscriptionHandler(EventBus eventBus, ITranscriptionsRepository repository) {
		// TODO Auto-generated constructor stub
		this.eventBus = eventBus;
		this.repository = repository;
	}

	@Override
	public void handle(TranscriptionsRequested event) {
		// TODO Auto-generated method stub
		Transcriptions transcriptions = new Transcriptions();

		transcriptions.setTitle("Anotaqui: " + event.getFileName());
		transcriptions.setUploadId(event.getId());
		transcriptions.setStatus(Status.PROCESSING);

		try {
			String fakeRawText = "Texto fake para teste";

			transcriptions.setRawText(fakeRawText);

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
