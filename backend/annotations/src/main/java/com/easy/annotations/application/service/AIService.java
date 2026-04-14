package com.easy.annotations.application.service;

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
		return repository.getById(id);
	}

	@Override
	public List<AiOutputs> findAllOutputs() {
		// TODO Auto-generated method stub
		return repository.findAllAiOutputs();
	}

}
