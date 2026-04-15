FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests


FROM eclipse-temurin:21-jre
WORKDIR /app

RUN apt-get update && apt-get install -y python3 python3-pip python3-venv ffmpeg && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install vosk

COPY --from=build /app/target/*.jar app.jar

COPY scripts/transcribe_vosk.py /app/scripts/transcribe_vosk.py
RUN chmod +x /app/scripts/transcribe_vosk.py

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]