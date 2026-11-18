package com.moneyverse.api.config;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/** Front-door authorization for *all* administrator APIs; controller checks are defense in depth. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class AdminApiBoundaryFilter extends OncePerRequestFilter {
    private final AdminAuthService adminAuthService;

    public AdminApiBoundaryFilter(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !(path.startsWith("/api/v1/admin/") || path.startsWith("/api/admin/"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("X-Robots-Tag", "noindex, nofollow, no-store");
        if (adminAuthService.resolveVerifiedAdminActor(request).isEmpty()) {
            fail(response, HttpServletResponse.SC_UNAUTHORIZED, "login_required");
            return;
        }
        String method = request.getMethod();
        if (!("GET".equals(method) || "HEAD".equals(method) || "OPTIONS".equals(method))
                && !adminAuthService.hasVerifiedSessionCsrf(request)) {
            fail(response, HttpServletResponse.SC_FORBIDDEN, "csrf_required");
            return;
        }
        chain.doFilter(request, response);
    }

    private void fail(HttpServletResponse response, int code, String reason) throws IOException {
        response.setStatus(code);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"ok\":false,\"status\":" + code + ",\"code\":\"" + reason + "\"}");
    }
}
