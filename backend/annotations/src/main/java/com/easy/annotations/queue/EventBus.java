package com.easy.annotations.queue;

import org.springframework.stereotype.Component;

@Component
public class EventBus {

    private final InMemoryQueue queue;

    public EventBus(InMemoryQueue queue) {
        this.queue = queue;
    }

    public void publish(Object event) {
        queue.enqueue(event);
    }
}
