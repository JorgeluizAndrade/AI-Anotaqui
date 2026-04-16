package com.easy.annotations.handlers;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpServerErrorException;

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
			You are an expert teacher and knowledge synthesizer, capable of explaining complex topics with clarity, depth, and structure.

			Analyze the transcription below and transform it into a well-structured explanatory text.

			Your goal is NOT to summarize, but to TEACH the content in a clear and deep way.

			Core writing style:
			- Write as an explanatory article (not just bullet points)
			- Use natural, well-connected paragraphs
			- Introduce and explain concepts before using them
			- Build ideas progressively (from simple → deeper understanding)
			- Avoid superficial explanations

			Content objectives:
			- Identify the central theme
			- Explain key concepts with clarity and precision
			- Expand important ideas with deeper reasoning
			- When relevant, include definitions, examples, or analogies
			- Preserve the original meaning, but improve clarity and structure

			Important constraints:
			- Avoid generic phrases and repetition
			- Do NOT overuse bullet points
			- Prefer depth over quantity
			- Keep the language aligned with the original context (technical, theological, or educational)

			Output format (strictly follow):

			Title:
			(A clear and meaningful title)

			Explanation:
			(A continuous, well-structured explanation in paragraph form.
			This is the main part. It should feel like a mini-article or teaching material.)

			Insights:
			- (Deeper or non-obvious insights derived from the content)
			- (Conceptual, philosophical, or structural observations)

			Reflection:
			(A thoughtful paragraph about the broader meaning, implications, or lessons)

			Practical Applications:
			- (Concrete ways to apply the content in real life, studies, or practice)

			Transcription:
			%s
			""";

	private static final int MAX_ATTEMPTS = 4;
	int delay = 1000;
	String analysisResult = null;

	private final EventBus eventBus;
	private final ITranscriptionsRepository transcriptionsRepository;
	private final IAiOutputsRepository aiOutputsRepository;
	private final AIEngine aiEngine;

	public AIHandler(EventBus eventBus, ITranscriptionsRepository transcriptionsRepository,
			IAiOutputsRepository aiOutputsRepository, AIEngine aiEngine) {
		this.eventBus = eventBus;
		this.transcriptionsRepository = transcriptionsRepository;
		this.aiOutputsRepository = aiOutputsRepository;
		this.aiEngine = aiEngine;
	}

	@Override
	public void handle(AIRequested event) {
		log.info("AI processing started. uploadId={}, transcriptionId={}", event.getUploadId(),
				event.getTranscriptionId());

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
			Transcriptions transcription = transcriptionsRepository.findById(event.getTranscriptionId()).orElseThrow(
					() -> new IllegalStateException("Transcription not found: id=" + event.getTranscriptionId()));

			String prompt = PROMPT_TEMPLATE.formatted(transcription.getRawText());

			for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
				try {
					analysisResult = aiEngine.analyze(prompt);
					break;
				} catch (HttpServerErrorException e) {
					if (e.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE) {
						log.warn("Attempt {} failed with 503. Retrying in {} ms...", attempt, delay);

						if (attempt == MAX_ATTEMPTS) {
							throw e;
						}

						Thread.sleep(delay);
						delay *= 2;
					} else {
						throw e;
					}
				}
			}

			aiOutput.setPrompt(prompt);
			aiOutput.setTextOutput(analysisResult);
			aiOutput.setTitle("Anotaqui > " + nameTitle(Instant.now()));
			aiOutput.setStatus(Status.DONE);
			aiOutput.setErr_message(null);
			aiOutput.setUpdatedAt(Instant.now());
			aiOutputsRepository.save(aiOutput);

			eventBus.publish(new AICompleted(event.getUploadId(), event.getTranscriptionId(), aiOutput.getId()));
			log.info("AI processing completed and event emitted. uploadId={}, transcriptionId={}, aiOutputId={}",
					event.getUploadId(), event.getTranscriptionId(), aiOutput.getId());
		} catch (Exception e) {
			log.error("AI processing failed. uploadId={}, transcriptionId={}", event.getUploadId(),
					event.getTranscriptionId(), e);
			aiOutput.setStatus(Status.ERROR);
			aiOutput.setErr_message(e.getMessage());
			aiOutput.setUpdatedAt(Instant.now());
			aiOutputsRepository.save(aiOutput);
		}
	}

	private String nameTitle(Instant output) {
		  DateTimeFormatter formatador = DateTimeFormatter.ofPattern("dd/MM/yyyy")
	                .withZone(ZoneId.systemDefault());
		
	       return formatador.format(output);
	}
}
