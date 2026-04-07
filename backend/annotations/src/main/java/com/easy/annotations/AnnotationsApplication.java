package com.easy.annotations;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class AnnotationsApplication {

	public static void main(String[] args) {
		SpringApplication.run(AnnotationsApplication.class, args);
	}

}
