package com.easy.annotations.infra.transcription;

import java.nio.file.Path;

public interface TranscriptionEngine {

    String transcribe(Path wavFilePath);
}
