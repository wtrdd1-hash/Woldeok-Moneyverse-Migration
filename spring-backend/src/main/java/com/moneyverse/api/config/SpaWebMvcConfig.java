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

import java.io.File;
import java.io.IOException;

/**
 * Spring Boot Single Fat JAR WebMvc & SPA Router Configuration
 * Serves frontend static assets from file:/srv/moneyverse-data/frontend-static/ and classpath:/static/
 * Supports Next.js SSG exported routes (e.g. /status -> status.html, /admin -> admin.html)
 * and falls back to index.html with strict SEO/Security headers.
 */
@Configuration
public class SpaWebMvcConfig implements WebMvcConfigurer {

    static boolean isBackendRoute(String path) {
        if (path == null) return false;
        String normalized = path.startsWith("/") ? path.substring(1) : path;
        return normalized.equals("api") || normalized.startsWith("api/")
                || normalized.equals("app-api") || normalized.startsWith("app-api/")
                || normalized.equals("auth") || normalized.startsWith("auth/")
                || normalized.equals("seo") || normalized.startsWith("seo/")
                || normalized.startsWith(".well-known")
                || normalized.startsWith("v3/api-docs") || normalized.startsWith("swagger-ui")
                || normalized.equals("health") || normalized.startsWith("actuator");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("file:/srv/moneyverse-data/frontend-static/", "classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        // Never let a missing API/Android gateway silently become HTTP 200 HTML.
                        if (isBackendRoute(resourcePath)) return null;

                        String cleanPath = resourcePath;
                        if (cleanPath.startsWith("/")) {
                            cleanPath = cleanPath.substring(1);
                        }
                        while (cleanPath.endsWith("/")) {
                            cleanPath = cleanPath.substring(0, cleanPath.length() - 1);
                        }

                        // 1. Root route ("") -> index.html
                        if (cleanPath.isEmpty()) {
                            Resource indexHtml = location.createRelative("index.html");
                            if (indexHtml.exists() && indexHtml.isReadable()) {
                                return indexHtml;
                            }
                        }

                        // 2. Exact static file request (with extension, e.g. .js, .css, .png, .ico, .txt, .html)
                        Resource exactResource = location.createRelative(cleanPath);
                        if (exactResource.exists() && exactResource.isReadable()) {
                            try {
                                File file = exactResource.getFile();
                                if (file.isFile()) {
                                    return exactResource;
                                }
                            } catch (Exception ignored) {
                                if (cleanPath.contains(".")) {
                                    return exactResource;
                                }
                            }
                        }

                        // 3. Sub-route without extension -> look for cleanPath + ".html" (e.g. status -> status.html, admin -> admin.html)
                        Resource htmlCandidate = location.createRelative(cleanPath + ".html");
                        if (htmlCandidate.exists() && htmlCandidate.isReadable()) {
                            return htmlCandidate;
                        }

                        // 4. Sub-directory with index.html -> look for cleanPath + "/index.html"
                        Resource subIndexCandidate = location.createRelative(cleanPath + "/index.html");
                        if (subIndexCandidate.exists() && subIndexCandidate.isReadable()) {
                            return subIndexCandidate;
                        }

                        // 5. Fallback for client-side SPA routing -> index.html
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

                filterChain.doFilter(request, response);
            }
        };
    }
}
