package com.easy.annotations.domain.repository;

import java.util.List;
import java.util.Optional;

import com.easy.annotations.domain.model.AiOutputs;

public interface IAiOutputsRepository {
    AiOutputs save(AiOutputs aiOutputs);
    
    Optional<AiOutputs> getById(Integer id);
    
    List<AiOutputs> findAllAiOutputs();
}
