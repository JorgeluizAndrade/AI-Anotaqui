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

@Component
public class GeminiAIEngine implements AIEngine {

    private static final String PROMPT_TEMPLATE = """
            Analyze the following transcription from a lecture or sermon.

            Extract:
            1. Main ideas
            2. Key insights
            3. Reflections
            4. Practical applications

            Return your answer with this structure:
            - Title
            - Key points
            - Reflection
            - Practical application

            Be clear, structured, and concise.

            Transcription:
            %s
            """;

    private final RestTemplate restTemplate;
    private final String apiUrl;
    private final String apiKey;

    public GeminiAIEngine(
            RestTemplateBuilder restTemplateBuilder,
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

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", PROMPT_TEMPLATE.formatted(text))))));

        
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
