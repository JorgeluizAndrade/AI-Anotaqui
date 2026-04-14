package com.easy.annotations.application.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Component;

import com.easy.annotations.domain.model.AiOutputs;
import com.easy.annotations.domain.repository.IAiOutputsRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class AIService implements IAIService {

	private final IAiOutputsRepository repository;

	@Override
	public AiOutputs getOutput(Integer id) {
		// TODO Auto-generated method stub
		return repository.getById(id).orElseThrow(() -> new RuntimeException("Not found output"));
	}

	@Override
	public List<AiOutputs> findAllOutputs() {
		// TODO Auto-generated method stub
		return repository.findAllAiOutputs();
	}

	@Override
	public AiOutputs updatePartial(Integer id, AiOutputs partialUpdate) {

		if (partialUpdate == null) {
			throw new IllegalArgumentException("Partial update cannot be null");
		}

		return repository.getById(id).map(existing -> {

			if (existing.getCreatedAt() == null) {
				throw new IllegalStateException("Existing entity without createdAt");
			}

			if (partialUpdate.getCreatedAt() != null && !partialUpdate.getCreatedAt().equals(existing.getCreatedAt())) {
				throw new IllegalStateException("createdAt cannot be modified");
			}

			if (partialUpdate.getId() != null && !partialUpdate.getId().equals(id)) {
				throw new IllegalStateException("ID mismatch");
			}

			if (partialUpdate.getTextOutput() != null) {
				existing.setTextOutput(partialUpdate.getTextOutput());
			}

			if (partialUpdate.getTitle() != null) {
				existing.setTitle(partialUpdate.getTitle());
			}

			if (partialUpdate.getStatus() != null) {
				existing.setStatus(partialUpdate.getStatus());
			}

			if (partialUpdate.getErrMessage() != null) {
				existing.setErrMessage(partialUpdate.getErrMessage());
			}

			if (partialUpdate.getPrompt() != null) {
				existing.setPrompt(partialUpdate.getPrompt());
			}

			if (partialUpdate.getModel() != null) {
				existing.setModel(partialUpdate.getModel());
			}

			if (partialUpdate.getType() != null) {
				existing.setType(partialUpdate.getType());
			}

			existing.setUpdatedAt(Instant.now());

			return repository.save(existing);

		}).orElseThrow(() -> new RuntimeException("Not able to update"));
	}

}
