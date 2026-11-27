package com.moneyverse.api.config;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.admin.totp.AdminTotpScopes;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

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
        String path;
        try {
            path = BoundaryPaths.of(request);
        } catch (IllegalArgumentException malformed) {
            return false; // cannot tell which route this is: keep the boundary (fail closed)
        }
        // (2026-11-25) The blog notifier is admin-only; the former unauthenticated
        // exemption let anyone send Telegram/Discord messages with arbitrary links.
        // Older admin REST controllers also use /admin/** (without /api). Protect
        // those JSON endpoints at the Spring entrypoint, including direct port access.
        // Actual SSR/static admin HTML is separately protected by the earlier
        // AdminHtmlBoundaryFilter and keeps browser-login redirect semantics.
        if (path.startsWith("/admin/")) {
            boolean htmlGet = ("GET".equals(request.getMethod()) || "HEAD".equals(request.getMethod()))
                    && AdminHtmlBoundaryFilter.isSensitiveAdminPath(path);
            return htmlGet;
        }
        return !(path.startsWith("/api/v1/admin/") || path.startsWith("/api/admin/"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("X-Robots-Tag", "noindex, nofollow, no-store");
        // Browser preflight does not carry session cookies. Delegate it to the configured
        // Spring CORS origin/method policy; this never authorizes an actual API operation.
        if ("OPTIONS".equals(request.getMethod())
                && request.getHeader("Origin") != null
                && request.getHeader("Access-Control-Request-Method") != null) {
            chain.doFilter(request, response);
            return;
        }
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
        // Step-up (owner decisions v2026.11.27.1457.1/1507.1): every administrator write needs this
        // session's recent password re-verification. Step-up re-authentication, not an independent
        // second factor. Opening and closing the console are the only
        // exemption: they are how an administrator reaches the console at all, and rotation
        // inherits (never mints) the re-verification time.
        if (!("GET".equals(method) || "HEAD".equals(method) || "OPTIONS".equals(method))
                && !isConsoleSessionPath(request)
                && !adminAuthService.hasRecentSessionReauthentication(request, AdminAuthService.STEP_UP_WINDOW_SECONDS)) {
            fail(response, HttpServletResponse.SC_UNAUTHORIZED, "reauthentication_required");
            return;
        }
        // Independent TOTP candidate (migration 366): a scoped high-risk write needs a proof minted
        // in this session for this scope whenever the actor is enforced. Unscoped writes keep the
        // rule above; the scope table is AdminTotpScopes.
        Optional<String> scope = scopeOf(request);
        if (scope.isPresent() && adminAuthService.secondFactorEnforced(request)
                && !adminAuthService.hasSecondFactorProof(request, scope.get())) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"ok\":false,\"status\":401,\"code\":\"second_factor_required\",\"scope\":\""
                    + scope.get() + "\"}");
            return;
        }
        chain.doFilter(request, response);
    }

    private static Optional<String> scopeOf(HttpServletRequest request) {
        try {
            return AdminTotpScopes.scopeFor(request.getMethod(), BoundaryPaths.of(request));
        } catch (IllegalArgumentException malformed) {
            return Optional.empty(); // shouldNotFilter already kept the boundary for this request
        }
    }

    private static boolean isConsoleSessionPath(HttpServletRequest request) {
        try {
            String path = BoundaryPaths.of(request);
            return "/api/v1/admin/security/sessions".equals(path) || "/api/admin/security/sessions".equals(path);
        } catch (IllegalArgumentException malformed) {
            return false;
        }
    }

    private void fail(HttpServletResponse response, int code, String reason) throws IOException {
        response.setStatus(code);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"ok\":false,\"status\":" + code + ",\"code\":\"" + reason + "\"}");
    }
}
