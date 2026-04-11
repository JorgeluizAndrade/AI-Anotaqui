package com.easy.annotations.config;

import org.springframework.context.annotation.Configuration;

import com.easy.annotations.infra.queue.EventHandler;
import com.easy.annotations.infra.queue.EventTypeResolver;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.context.annotation.Bean;


@Configuration
public class EventHandlerConfig {

	@Bean
    public Map<Class<?>, EventHandler<?>> handlerMap(List<EventHandler<?>> handlers) {
        Map<Class<?>, EventHandler<?>> map = new HashMap<>();

        for (EventHandler<?> handler : handlers) {
            Class<?> eventType = EventTypeResolver.resolveEventType(handler);
            map.put(eventType, handler);
        }

        return map;
    }

}
