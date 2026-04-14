package com.easy.annotations.handlers;

import java.nio.file.Path;
import java.time.Instant;

import org.springframework.stereotype.Component;

import com.easy.annotations.domain.event.TranscriptionCompleted;
import com.easy.annotations.domain.event.TranscriptionsRequested;
import com.easy.annotations.domain.model.Status;
import com.easy.annotations.domain.model.Transcriptions;
import com.easy.annotations.domain.repository.ITranscriptionsRepository;
import com.easy.annotations.infra.queue.EventBus;
import com.easy.annotations.infra.queue.EventHandler;
import com.easy.annotations.infra.transcription.FfmpegConverter;
import com.easy.annotations.infra.transcription.TranscriptionEngine;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class TranscriptionHandler implements EventHandler<TranscriptionsRequested> {

    private final ITranscriptionsRepository repository;
    private final TranscriptionEngine engine;
    private final EventBus eventBus;
    private final FfmpegConverter ffmpegConverter;

    public TranscriptionHandler(
            EventBus eventBus,
            ITranscriptionsRepository repository,
            TranscriptionEngine engine,
            FfmpegConverter ffmpegConverter) {
        this.eventBus = eventBus;
        this.repository = repository;
        this.engine = engine;
        this.ffmpegConverter = ffmpegConverter;
    }

    @Override
    public void handle(TranscriptionsRequested event) {
        Transcriptions transcription = new Transcriptions();
        transcription.setTitle("Anotaqui: " + event.getFileName());
        transcription.setUploadId(event.getId());
        transcription.setStatus(Status.PROCESSING);
        transcription.setUpdatedAt(Instant.now());

        transcription = repository.save(transcription);

        try {
            Path inputAudioPath = resolveInputPath(event.getFilePath(), event.getFileName());
            Path wavPath = buildWavPath(inputAudioPath);

            ffmpegConverter.convertToWavMono16k(inputAudioPath, wavPath);

            String text = engine.transcribe(wavPath);

            transcription.setRawText(text);
            transcription.setStatus(Status.DONE);
            transcription.setErrMessage(null);
            transcription.setUpdatedAt(Instant.now());
            transcription = repository.save(transcription);

            eventBus.publish(new TranscriptionCompleted(
                    transcription.getUploadId(),
                    transcription.getId(),
                    transcription.getRawText()));

            log.info("Transcription completed and event emitted. uploadId={}, transcriptionId={}",
                    transcription.getUploadId(), transcription.getId());
        } catch (Exception e) {
            log.error("Error during transcription pipeline. uploadId={}", event.getId(), e);
            transcription.setStatus(Status.ERROR);
            transcription.setErrMessage(e.getMessage());
            transcription.setUpdatedAt(Instant.now());
            repository.save(transcription);
        }
    }

    private Path resolveInputPath(String filePath, String fileName) {
        Path pathFromEvent = Path.of(filePath);
        if (pathFromEvent.getFileName() != null && pathFromEvent.getFileName().toString().equals(fileName)) {
            return pathFromEvent;
        }
        return pathFromEvent.resolve(fileName);
    }

    private Path buildWavPath(Path inputAudioPath) {
        String fileName = inputAudioPath.getFileName().toString();
        int extensionIndex = fileName.lastIndexOf('.');
        String baseName = extensionIndex > 0 ? fileName.substring(0, extensionIndex) : fileName;
        return inputAudioPath.getParent().resolve(baseName + "-16k-mono.wav");
    }
}
