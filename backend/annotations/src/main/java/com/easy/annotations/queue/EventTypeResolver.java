package com.easy.annotations.queue;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

public class EventTypeResolver {

    public static Class<?> resolveEventType(EventHandler<?> handler) {
        Type[] interfaces = handler.getClass().getGenericInterfaces();

        for (Type type : interfaces) {
            if (type instanceof ParameterizedType paramType) {
                if (paramType.getRawType().equals(EventHandler.class)) {
                    Type actualType = paramType.getActualTypeArguments()[0];

                    if (actualType instanceof Class<?>) {
                        return (Class<?>) actualType;
                    }
                }
            }
        }

        throw new RuntimeException(
            "Could not resolve event type for handler: " + handler.getClass()
        );
    }
}
