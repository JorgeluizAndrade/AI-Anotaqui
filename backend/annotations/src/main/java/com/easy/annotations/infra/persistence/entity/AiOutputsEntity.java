package com.easy.annotations.infra.persistence.entity;

import java.time.Instant;

import com.easy.annotations.domain.model.Status;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ai_outputs")
@Getter
@Setter
public class AiOutputsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "transcription_id", nullable = false)
    private Integer transcriptionId;

    @Column
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "err_message")
    private String errMessage;

    @Column(columnDefinition = "TEXT")
    private String prompt;

    @Column
    private String model;

    @Column
    private int version;

    @Column
    private String type;

    @Column(name = "text_output", columnDefinition = "TEXT")
    private String textOutput;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();
}
