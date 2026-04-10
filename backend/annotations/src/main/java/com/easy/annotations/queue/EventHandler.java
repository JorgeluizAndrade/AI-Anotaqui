package com.easy.annotations.queue;

public interface EventHandler<T> {
	void handle(T event);
}
