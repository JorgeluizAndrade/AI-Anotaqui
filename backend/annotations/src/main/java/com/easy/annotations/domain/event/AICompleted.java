package com.easy.annotations.domain.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AICompleted {

    private final Integer uploadId;
    private final Integer transcriptionId;
    private final Integer aiOutputId;
}
