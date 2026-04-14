package com.easy.annotations.application.service;

import java.util.List;

import com.easy.annotations.domain.model.AiOutputs;

public interface IAIService {    
    AiOutputs getOutput(Integer id);

    List<AiOutputs> findAllOutputs();
	
}
