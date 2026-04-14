package com.easy.annotations.handlers;

import java.time.Instant;

import org.springframework.stereotype.Component;

import com.easy.annotations.domain.event.AICompleted;
import com.easy.annotations.domain.event.AIRequested;
import com.easy.annotations.domain.model.AiOutputs;
import com.easy.annotations.domain.model.Status;
import com.easy.annotations.domain.model.Transcriptions;
import com.easy.annotations.domain.repository.IAiOutputsRepository;
import com.easy.annotations.domain.repository.ITranscriptionsRepository;
import com.easy.annotations.infra.ai.AIEngine;
import com.easy.annotations.infra.queue.EventBus;
import com.easy.annotations.infra.queue.EventHandler;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class AIHandler implements EventHandler<AIRequested> {

    private static final String PROMPT_TEMPLATE = """
            Analyze the following transcription from a lecture or sermon.

            Extract:
            1. Main ideas
            2. Key insights
            3. Reflections
            4. Practical applications

            Be clear, structured, and concise.

            Transcription:
            %s
            """;

    private final EventBus eventBus;
    private final ITranscriptionsRepository transcriptionsRepository;
    private final IAiOutputsRepository aiOutputsRepository;
    private final AIEngine aiEngine;

    public AIHandler(
            EventBus eventBus,
            ITranscriptionsRepository transcriptionsRepository,
            IAiOutputsRepository aiOutputsRepository,
            AIEngine aiEngine) {
        this.eventBus = eventBus;
        this.transcriptionsRepository = transcriptionsRepository;
        this.aiOutputsRepository = aiOutputsRepository;
        this.aiEngine = aiEngine;
    }

    @Override
    public void handle(AIRequested event) {
        log.info("AI processing started. uploadId={}, transcriptionId={}", event.getUploadId(), event.getTranscriptionId());

        AiOutputs aiOutput = new AiOutputs();
        aiOutput.setTranscriptionId(event.getTranscriptionId());
        aiOutput.setStatus(Status.PROCESSING);
        aiOutput.setType("LECTURE_ANALYSIS");
        aiOutput.setModel("gemini-2.0-flash");
        aiOutput.setVersion(1);
        aiOutput.setCreatedAt(Instant.now());
        aiOutput.setUpdatedAt(Instant.now());

        aiOutput = aiOutputsRepository.save(aiOutput);

        try {
            Transcriptions transcription = transcriptionsRepository.findById(event.getTranscriptionId())
                    .orElseThrow(() -> new IllegalStateException(
                            "Transcription not found: id=" + event.getTranscriptionId()));

            String prompt = PROMPT_TEMPLATE.formatted(transcription.getRawText());
            String analysisResult = aiEngine.analyze(transcription.getRawText());

            aiOutput.setPrompt(prompt);
            aiOutput.setTextOutput(analysisResult);
            aiOutput.setTitle(extractTitle(analysisResult));
            aiOutput.setStatus(Status.DONE);
            aiOutput.setErr_message(null);
            aiOutput.setUpdatedAt(Instant.now());
            aiOutput = aiOutputsRepository.save(aiOutput);

            eventBus.publish(new AICompleted(event.getUploadId(), event.getTranscriptionId(), aiOutput.getId()));
            log.info("AI processing completed and event emitted. uploadId={}, transcriptionId={}, aiOutputId={}",
                    event.getUploadId(), event.getTranscriptionId(), aiOutput.getId());
        } catch (Exception e) {
            log.error("AI processing failed. uploadId={}, transcriptionId={}",
                    event.getUploadId(), event.getTranscriptionId(), e);
            aiOutput.setStatus(Status.ERROR);
            aiOutput.setErr_message(e.getMessage());
            aiOutput.setUpdatedAt(Instant.now());
            aiOutputsRepository.save(aiOutput);
        }
    }

    private String extractTitle(String output) {
        if (output == null || output.isBlank()) {
            return "AI Analysis";
        }

        String firstLine = output.lines()
                .map(String::trim)
                .filter(line -> !line.isBlank())
                .findFirst()
                .orElse("AI Analysis");

        return firstLine
                .replace("**", "")
                .replace("#", "")
                .replace("Title:", "")
                .replace("Título:", "")
                .trim();
    }
}
