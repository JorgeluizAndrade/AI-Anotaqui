package com.easy.annotations.infra.transcription;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class FfmpegConverter {

    public Path convertToWavMono16k(Path inputFilePath, Path outputWavPath) {
        log.info("Audio conversion started. input={}, output={}", inputFilePath, outputWavPath);

        ProcessBuilder processBuilder = new ProcessBuilder(
                "ffmpeg",
                "-y",
                "-i", inputFilePath.toString(),
                "-ar", "16000",
                "-ac", "1",
                outputWavPath.toString());

        try {
            Process process = processBuilder.start();

            Thread stdoutThread = new Thread(() -> consumeStream(process.getInputStream(), false), "ffmpeg-stdout");
            Thread stderrThread = new Thread(() -> consumeStream(process.getErrorStream(), true), "ffmpeg-stderr");
            stdoutThread.start();
            stderrThread.start();

            int exitCode = process.waitFor();
            stdoutThread.join();
            stderrThread.join();

            if (exitCode != 0) {
                throw new IllegalStateException("ffmpeg exited with code " + exitCode);
            }

            log.info("Audio conversion finished successfully. output={}", outputWavPath);
            return outputWavPath;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while converting audio with ffmpeg", e);
        } catch (IOException e) {
            throw new RuntimeException("Could not execute ffmpeg conversion", e);
        }
    }

    private void consumeStream(InputStream stream, boolean stderr) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (stderr) {
                    log.warn("[ffmpeg][stderr] {}", line);
                } else {
                    log.info("[ffmpeg][stdout] {}", line);
                }
            }
        } catch (IOException e) {
            log.error("Error reading ffmpeg process stream", e);
        }
    }
}
