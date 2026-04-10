package com.easy.annotations.domain.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;


@RequiredArgsConstructor
@Getter
@Setter
public class TranscriptionsRequested {

	private final Integer id;
	private final String filePath;
	private final String fileName;
	

	
}
