FROM alpine:latest

# Instalar OpenJDK 25 e certificados
RUN apk add --no-cache \
    openjdk25-jdk \
    ca-certificates \
    openssl

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8080

ENV SERVER_PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["sh", "-c", "java -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE} -Dserver.port=${SERVER_PORT} -jar app.jar"]
