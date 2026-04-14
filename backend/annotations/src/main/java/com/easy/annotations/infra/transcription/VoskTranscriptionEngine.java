package com.easy.annotations.infra.transcription;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class VoskTranscriptionEngine implements TranscriptionEngine {
	
	
	@Value("${transcription.python-path}")
	private String pythonPath;

	@Value("${transcription.script-path}")
	private String scriptPath;

	
    private final ObjectMapper objectMapper;

    public VoskTranscriptionEngine(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public String transcribe(Path wavFilePath) {
        log.info("Transcription started with Vosk. wavFile={}", wavFilePath);

        ProcessBuilder processBuilder = new ProcessBuilder(
        		 	pythonPath,
        		 	scriptPath,
                wavFilePath.toString());

        try {
            Process process = processBuilder.start();

            String stdout = readAll(process.getInputStream());
            String stderr = readAll(process.getErrorStream());

            int exitCode = process.waitFor();

            if (!stderr.isBlank()) {
                log.warn("[vosk][stderr] {}", stderr);
            }
            log.info("[vosk][stdout] {}", stdout);

            if (exitCode != 0) {
                throw new IllegalStateException("Vosk script failed with code " + exitCode);
            }

            Map<String, Object> payload = objectMapper.readValue(stdout, new TypeReference<>() {
            });

            if (payload.containsKey("error")) {
                throw new IllegalStateException(String.valueOf(payload.get("error")));
            }

            String text = String.valueOf(payload.getOrDefault("text", "")).trim();
            log.info("Transcription finished with Vosk. chars={}", text.length());
            return text;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while waiting for Vosk script", e);
        } catch (IOException e) {
            throw new RuntimeException("Error while executing Vosk script", e);
        }
    }

    private String readAll(InputStream stream) throws IOException {
        StringBuilder builder = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line).append(System.lineSeparator());
            }
        }
        return builder.toString().trim();
    }
}
