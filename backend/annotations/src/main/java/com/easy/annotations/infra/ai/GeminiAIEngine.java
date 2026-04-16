package com.easy.annotations.infra.ai;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.easy.annotations.infra.ai.AIEngine;

@Component
public class GeminiAIEngine implements AIEngine {

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

	private final RestTemplate restTemplate;
	private final String apiUrl;
	private final String apiKey;

	public GeminiAIEngine(RestTemplateBuilder restTemplateBuilder,
			@Value("${gemini.api-url:https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent}") String apiUrl,
			@Value("${gemini.api-key:}") String apiKey) {
		this.restTemplate = restTemplateBuilder.build();
		this.apiUrl = apiUrl;
		this.apiKey = apiKey;
	}

	@Override
	public String analyze(String text) {
		System.out.println("API KEY: " + apiKey);

		if (apiKey == null || apiKey.isBlank()) {
			throw new IllegalStateException("Gemini API key is not configured. Set gemini.api-key.");
		}

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		headers.set("X-goog-api-key", apiKey);

		Map<String, Object> body = Map.of("contents",
				List.of(Map.of("parts", List.of(Map.of("text", PROMPT_TEMPLATE.formatted(text))))));

		ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, new HttpEntity<>(body, headers), Map.class);

		return extractText(response.getBody());
	}

	@SuppressWarnings("unchecked")
	private String extractText(Map<String, Object> payload) {
		if (payload == null) {
			throw new IllegalStateException("Gemini response was empty");
		}

		List<Map<String, Object>> candidates = (List<Map<String, Object>>) payload.get("candidates");
		if (candidates == null || candidates.isEmpty()) {
			throw new IllegalStateException("Gemini response does not contain candidates");
		}

		Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
		if (content == null) {
			throw new IllegalStateException("Gemini response does not contain content");
		}

		List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
		if (parts == null || parts.isEmpty()) {
			throw new IllegalStateException("Gemini response does not contain content parts");
		}

		Object text = parts.get(0).get("text");
		if (text == null) {
			throw new IllegalStateException("Gemini response content part does not contain text");
		}

		return text.toString();
	}
}
