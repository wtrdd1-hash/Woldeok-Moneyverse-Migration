package com.moneyverse.api.config;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * P0 privacy boundary for private member APIs and privileged SEO/audit diagnostics.
 * Never grant identity using untrusted X-User-Id or x-actor-user-id headers.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 11)
public class SensitiveApiBoundaryFilter extends OncePerRequestFilter {
    private final UserAuthService userAuthService;
    private final AdminAuthService adminAuthService;

    public SensitiveApiBoundaryFilter(UserAuthService userAuthService, AdminAuthService adminAuthService) {
        this.userAuthService = userAuthService;
        this.adminAuthService = adminAuthService;
    }

    static boolean isMemberPrivatePath(String p) {
        return p.startsWith("/api/support/") || p.startsWith("/api/v1/support/")
                || p.startsWith("/api/chat/") || p.startsWith("/api/v1/chat/")
                || (p.startsWith("/api/wallet/") && !p.endsWith("/summary")) || (p.startsWith("/api/v1/wallet/") && !p.endsWith("/summary"))
                || p.equals("/api/bonds/my-holdings") || p.equals("/api/v1/bonds/my-holdings")
                || p.equals("/api/bonds/my-repo-loans") || p.equals("/api/v1/bonds/my-repo-loans")
                // Owner-specific personal space, growth/credit and advisor projections.
                || p.matches("^/api/(v1/)?(space|spaces)(/.*)?$")
                   && !p.matches("^/api/(v1/)?(space|spaces)/real-estate/districts/?$")
                || p.matches("^/api/(v1/)?progression(/.*)?$")
                || p.matches("^/api/(v1/)?advisor(/.*)?$");
    }

    static boolean isAdminDiagnosticsPath(String p) {
        return p.startsWith("/api/v1/seo/status") || p.startsWith("/api/seo/status")
                || p.startsWith("/seo/status")
                || p.equals("/api/v1/seo/gsc/analytics") || p.equals("/api/seo/gsc/analytics")
                || p.equals("/seo/gsc/analytics")
                || p.equals("/api/v1/audit/frontend-errors") || p.equals("/api/audit/frontend-errors");
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String p = request.getRequestURI();
        return !isMemberPrivatePath(p) && !isAdminDiagnosticsPath(p);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");

        if ("OPTIONS".equals(request.getMethod()) && request.getHeader("Origin") != null
                && request.getHeader("Access-Control-Request-Method") != null) {
            chain.doFilter(request, response); // Existing Spring CORS policy decides actual origin.
            return;
        }

        if (isAdminDiagnosticsPath(request.getRequestURI())) {
            if (adminAuthService.resolveVerifiedAdminActor(request).isEmpty()) {
                fail(response, 401, "admin_session_required");
                return;
            }
            if (isWrite(request) && !adminAuthService.hasVerifiedSessionCsrf(request)) {
                fail(response, 403, "csrf_required");
                return;
            }
            chain.doFilter(request, response);
            return;
        }

        Optional<UserAuthService.SessionInfo> session = userAuthService.resolveSession(request);
        if (session.isEmpty() || !session.get().isSignedIn() || session.get().getUserId() == null) {
            fail(response, 401, "member_session_required");
            return;
        }

        UUID actor = session.get().getUserId();
        if (!matchesActor(request.getHeader("X-User-Id"), actor)
                || !matchesActor(request.getHeader("x-actor-user-id"), actor)) {
            fail(response, 403, "forged_actor_header");
            return;
        }

        if (isWrite(request) && !csrfMatches(session.get(), request.getHeader("X-CSRF-Token"))) {
            fail(response, 403, "csrf_required");
            return;
        }

        // User-facing finance, property tax and progression writes require canonical
        // owner-scoped posting receipts, not a successful JSON response alone.
        if (isWrite(request) && request.getRequestURI().matches("^/api/(v1/)?(space|spaces|progression|advisor)(/.*)?$")) {
            fail(response, 503, "source_receipt_not_verified");
            return;
        }
        // No direct wallet ledger write is trustworthy until canonical posting/receipt QA is done.
        // Canonical ledger write allowed
        if (isWrite(request) && request.getRequestURI().matches("^/api/(v1/)?wallet/.*")) {
            fail(response, 503, "canonical_wallet_ledger_not_verified");
            return;
        }

        final String actorHeader = actor.toString();
        HttpServletRequest wrapped = new HttpServletRequestWrapper(request) {
            private boolean isActorHeader(String name) {
                return name != null && ("X-User-Id".equalsIgnoreCase(name)
                        || "x-actor-user-id".equalsIgnoreCase(name));
            }

            @Override public String getHeader(String name) {
                return isActorHeader(name) ? actorHeader : super.getHeader(name);
            }

            @Override public Enumeration<String> getHeaders(String name) {
                return isActorHeader(name) ? Collections.enumeration(List.of(actorHeader)) : super.getHeaders(name);
            }

            @Override public Enumeration<String> getHeaderNames() {
                LinkedHashSet<String> names = new LinkedHashSet<>(Collections.list(super.getHeaderNames()));
                names.add("X-User-Id");
                names.add("x-actor-user-id");
                return Collections.enumeration(names);
            }
        };
        chain.doFilter(wrapped, response);
    }

    private static boolean matchesActor(String supplied, UUID actor) {
        if (supplied == null || supplied.isBlank()) return true;
        try {
            return actor.equals(UUID.fromString(supplied.trim()));
        } catch (Exception ignored) {
            return false;
        }
    }

    private static boolean isWrite(HttpServletRequest r) {
        return !List.of("GET", "HEAD", "OPTIONS").contains(r.getMethod());
    }

    private static boolean csrfMatches(UserAuthService.SessionInfo session, String token) {
        if (token == null || token.isBlank() || session.getCsrfHash() == null) return false;
        return MessageDigest.isEqual(session.getCsrfHash().getBytes(StandardCharsets.UTF_8),
                UserAuthService.sha256(token).getBytes(StandardCharsets.UTF_8));
    }

    private static void fail(HttpServletResponse response, int code, String reason) throws IOException {
        response.setStatus(code);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"ok\":false,\"status\":" + code + ",\"code\":\"" + reason + "\"}");
    }
}
