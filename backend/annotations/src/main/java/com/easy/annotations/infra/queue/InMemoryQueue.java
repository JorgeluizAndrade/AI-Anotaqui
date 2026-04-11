package com.easy.annotations.infra.queue;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

import org.springframework.stereotype.Component;

/*
 * Blocking queues from the java.util.concurrent package are 
 * often a good fit for this kind of setup. 
 * They handle thread coordination for you, so producers will 
 * naturally pause when the queue is full and consumers 
 * will pause when it’s empty. This prevents busy waiting and keeps 
 * CPU usage reasonable without extra work on your part. 
 */

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
