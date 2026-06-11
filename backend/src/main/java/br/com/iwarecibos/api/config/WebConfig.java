package br.com.iwarecibos.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * MVC configuration. CORS is handled centrally by the Spring Security filter
 * chain (see {@code SecurityConfig#corsConfigurationSource}) so it applies
 * consistently to authenticated and pre-flight requests.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
}
