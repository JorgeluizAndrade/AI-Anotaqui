package com.easy.annotations.handlers;

import org.springframework.stereotype.Component;

import com.easy.annotations.domain.event.AIRequested;
import com.easy.annotations.domain.event.TranscriptionCompleted;
import com.easy.annotations.infra.queue.EventBus;
import com.easy.annotations.infra.queue.EventHandler;

@Component
public class TranscriptionCompletedHandler implements EventHandler<TranscriptionCompleted> {

    private final EventBus eventBus;

    public TranscriptionCompletedHandler(EventBus eventBus) {
        this.eventBus = eventBus;
    }

    @Override
    public void handle(TranscriptionCompleted event) {
        eventBus.publish(new AIRequested(event.getUploadId(), event.getTranscriptionId()));
    }
}
