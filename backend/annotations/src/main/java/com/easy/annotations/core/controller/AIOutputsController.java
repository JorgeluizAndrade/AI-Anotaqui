package com.easy.annotations.core.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.easy.annotations.application.service.IAIService;
import com.easy.annotations.domain.model.AiOutputs;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/annotations")
public class AIOutputsController {

	private final IAIService service;

	@GetMapping("/{id}")
	public ResponseEntity<AiOutputs> getById(@PathVariable Integer id) {
		AiOutputs output = service.getOutput(id);

		return ResponseEntity.ok().header(HttpHeaders.ACCEPT, "Output=\"" + output.getTitle() + "\"").body(output);
	}

	@GetMapping()
	public ResponseEntity<List<AiOutputs>> getAll() {
		List<AiOutputs> outputs = service.findAllOutputs();
		return ResponseEntity.ok().header(HttpHeaders.ACCEPT).body(outputs);
	}

	@PatchMapping("/{id}")
	public ResponseEntity<AiOutputs> updatePartial(@PathVariable Integer id, @RequestBody AiOutputs aiOutputs) {
		var att = service.updatePartial(id, aiOutputs);

		return ResponseEntity.ok(att);

	}

}
