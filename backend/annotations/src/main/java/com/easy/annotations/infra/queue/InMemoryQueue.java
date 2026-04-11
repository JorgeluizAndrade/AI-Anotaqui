package com.easy.annotations.infra.queue;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

import org.springframework.stereotype.Component;

@Component
public class InMemoryQueue {

    private final BlockingQueue<Object> queue = new LinkedBlockingQueue<>();

    public void enqueue(Object event) {
        try {
            queue.put(event); // bloqueia se necessário
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error enqueuing event", e);
        }
    }

    public Object dequeue() {
        try {
            return queue.take(); // bloqueia até ter evento
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error dequeuing event", e);
        }
    }
}
