package com.moneyverse.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Spring Boot Single Fat JAR WebMvc & SPA Router Configuration
 * Serves embedded frontend static assets from classpath:/static/
 * and routes client-side paths to index.html with strict SEO/Security headers.
 */
@Configuration
public class SpaWebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);

                        // If exact static file exists (e.g. css, js, images, favicon.ico), serve it directly
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }

                        // Do not route API or Swagger requests to index.html (let Spring handle 404/API)
                        if (resourcePath.startsWith("api/") || resourcePath.startsWith("api")
                                || resourcePath.startsWith("v3/api-docs") || resourcePath.startsWith("swagger-ui")
                                || resourcePath.startsWith("health") || resourcePath.startsWith("actuator")) {
                            return null;
                        }

                        // Otherwise forward client-side route to index.html
                        Resource indexHtml = location.createRelative("index.html");
                        if (indexHtml.exists() && indexHtml.isReadable()) {
                            return indexHtml;
                        }

                        return null;
                    }
                });
    }

    /**
     * Security & SEO Header Filter:
     * - Adds X-Robots-Tag: noindex, nofollow, no-store for /admin/* and /api/*
     * - Enforces nosniff and frame protection
     */
    @Bean
    public OncePerRequestFilter securityAndSeoHeaderFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                    throws ServletException, IOException {
                String uri = request.getRequestURI();

                // Enforce noindex on Admin and API routes (SEO-3)
                if (uri.startsWith("/admin") || uri.startsWith("/api/")) {
                    response.setHeader("X-Robots-Tag", "noindex, nofollow, no-store");
                }

                // Security baseline headers
                response.setHeader("X-Content-Type-Options", "nosniff");
                response.setHeader("X-Frame-Options", "SAMEORIGIN");
                response.setHeader("X-Backend-Engine", "Spring-Boot-3.3-Enterprise");

                filterChain.doFilter(request, response);
            }
        };
    }
}
