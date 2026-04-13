package com.easy.annotations.domain.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TranscriptionCompleted {

    private final Integer uploadId;
    private final Integer transcriptionId;
    private final String text;
}
