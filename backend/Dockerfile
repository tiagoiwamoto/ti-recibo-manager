FROM eclipse-temurin:25-jre-alpine

WORKDIR /app

# Certificado Let's Encrypt (selecionado previamente por copy-certificates.sh).
# O mesmo par e usado pelo frontend, garantindo um certificado compartilhado.
COPY certificates/ /certificates/

COPY target/*.jar app.jar

EXPOSE 8443

ENTRYPOINT ["java", "-Dspring.profiles.active=local", "-Dserver.port=8443", "-jar", "app.jar"]
