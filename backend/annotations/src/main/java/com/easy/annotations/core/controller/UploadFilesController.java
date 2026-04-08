package com.easy.annotations.core.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.easy.annotations.application.service.UploadService;
import com.easy.annotations.domain.model.Upload;

@Controller
@RequestMapping("/api/file")
public class UploadFilesController {

	private final UploadService uploadService;

	public UploadFilesController(UploadService uploadService) {
		// TODO Auto-generated constructor stub
		this.uploadService = uploadService;
	}

	@PostMapping
	public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
		try {

			String contentType = file.getContentType();
			
			System.out.println(contentType);

			if (!contentType.equals("audio/mpeg") && !contentType.equals("audio/mp4")) {
				return ResponseEntity.badRequest().body("Invalid format.");
			}

			uploadService.save(file);

			return ResponseEntity.ok("File uploded successfully: " + file.getOriginalFilename());

		} catch (Exception e) {
			return ResponseEntity.status(500).body("Err in upload");
		}

	}
	
	@GetMapping("find/{id}")
	public ResponseEntity<Upload>  findById(@PathVariable Integer id){
		return ResponseEntity.ok(uploadService.findById(id));
	}
}
