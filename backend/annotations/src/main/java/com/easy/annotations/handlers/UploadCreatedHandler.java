package com.easy.annotations.handlers;

import org.springframework.stereotype.Component;

import com.easy.annotations.domain.event.TranscriptionsRequested;
import com.easy.annotations.domain.event.UploadCreated;
import com.easy.annotations.infra.queue.EventBus;
import com.easy.annotations.infra.queue.EventHandler;

@Component
public class UploadCreatedHandler implements EventHandler<UploadCreated> {

	private final EventBus eventBus;

	public UploadCreatedHandler(EventBus eventBus) {
		this.eventBus = eventBus;
	}

	@Override
	public void handle(UploadCreated event) {
		TranscriptionsRequested next = new TranscriptionsRequested(event.getId(), event.getFilePath(),
				event.getFileName());

		eventBus.publish(next);
	}
}
