package com.easy.annotations.infra.queue;

public interface EventHandler<T> {
	void handle(T event);
}
