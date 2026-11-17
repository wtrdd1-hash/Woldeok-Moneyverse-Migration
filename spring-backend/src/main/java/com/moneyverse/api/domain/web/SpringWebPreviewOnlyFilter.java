package com.moneyverse.api.domain.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * Prevents the self-contained public preview instance from becoming a second
 * API/auth/finance writer, even if an edge route is accidentally broadened.
 * The regular Spring backend never activates this filter.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@ConditionalOnProperty(prefix = "moneyverse.web", name = "preview-restricted", havingValue = "true")
public final class SpringWebPreviewOnlyFilter extends OncePerRequestFilter {
    private static final Set<String> READ_ONLY = Set.of(
            "/spring-web",
            "/spring-web/status",
            "/spring-web/account-deletion",
            "/assets/spring-web-site.css",
            "/assets/spring-web-account-deletion.css",
            "/health"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String method = request.getMethod();
        String path = request.getRequestURI();
        if (!("GET".equals(method) || "HEAD".equals(method)) || !READ_ONLY.contains(path)) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.setHeader("Cache-Control", "private, no-store");
            response.setHeader("X-Robots-Tag", "noindex, nofollow");
            response.setHeader("X-Content-Type-Options", "nosniff");
            response.setHeader("Referrer-Policy", "no-referrer");
            return;
        }
        chain.doFilter(request, response);
    }
}
