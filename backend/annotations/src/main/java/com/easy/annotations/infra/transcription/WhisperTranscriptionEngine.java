package com.easy.annotations.infra.transcription;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;


@Component
@Slf4j
public class WhisperTranscriptionEngine implements ITranscriptionEngine {

	@Override
	public String transcribe(String filePath, String fileName) {
		// TODO Auto-generated method stub
		try {

			ProcessBuilder processBuilder = new ProcessBuilder(

					"whisper", filePath + fileName, "--model", "base", "--language", "pt", "--output_format", "txt");
			
			
			processBuilder.redirectErrorStream(true);
			
			Process process = processBuilder.start();

			
			// reduz o número de acessos ao disco ou rede ao ler grandes blocos de dados de uma vez
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream())
            );

            StringBuilder output = new StringBuilder();
            String line;

            while ((line = reader.readLine()) != null) {
                log.info(line);
            }

            int exitCode = process.waitFor();

            if (exitCode != 0) {
                throw new RuntimeException("Whisper failed with exit code: " + exitCode);
            }
            
            String txtFile = filePath.replaceAll("\\.[^.]+$", ".txt");

            return Files.readString(Path.of(txtFile));

		} catch (Exception e) {
			// TODO: handle exception
			throw new RuntimeException("Error running Whisper", e);
		}
	}

}
