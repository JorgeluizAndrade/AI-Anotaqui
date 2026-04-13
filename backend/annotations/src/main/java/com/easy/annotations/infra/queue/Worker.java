package com.easy.annotations.infra.queue;

import java.util.Map;

import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class Worker {

    private final InMemoryQueue queue;
    private final Map<Class<?>, EventHandler<?>> handlers;

    public Worker(InMemoryQueue queue, Map<Class<?>, EventHandler<?>> handlers) {
        this.queue = queue;
        this.handlers = handlers;
    }

    @PostConstruct
    public void start() {
        Thread workerThread = new Thread(this::processLoop, "event-worker");
        workerThread.start();
    }

    private void processLoop() {
        while (true) {
            Object event = queue.dequeue();
            log.info("Dispashed event IN WORKER: {}", event);
            dispatch(event);
        }
    }

    @SuppressWarnings("unchecked")
    private <T> void dispatch(Object event) {
        EventHandler<T> handler = (EventHandler<T>) handlers.get(event.getClass());

        if (handler == null) {
            log.warn("No handler for event: {}", event.getClass().getSimpleName());
            return;
        }

        try {
            handler.handle((T) event);
        } catch (Exception e) {
            log.error("Error processing event: {}", event.getClass().getSimpleName(), e);
        }
    }
}
