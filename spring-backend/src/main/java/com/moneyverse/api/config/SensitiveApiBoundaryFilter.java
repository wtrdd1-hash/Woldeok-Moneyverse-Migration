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
        String normalized = p.startsWith("/app-api/") ? p.replaceFirst("^/app-api", "/api") : p;
        return normalized.startsWith("/api/support/") || normalized.startsWith("/api/v1/support/")
                || normalized.startsWith("/api/chat/") || normalized.startsWith("/api/v1/chat/")
                || normalized.startsWith("/api/account") || normalized.startsWith("/api/v1/account")
                // A legacy wallet root/overview/balance is always a private, session-owned read.
                // Exclude /summary: guests receive signedIn=false/null, and server refuses identity headers.
                || normalized.matches("^/api/(v1/)?wallet(/(overview|balance)/?)?$")
                || normalized.startsWith("/api/banking/pockets") || normalized.startsWith("/api/v1/banking/pockets")
                || (normalized.startsWith("/api/photos") && !normalized.contains("/uploads")) || (normalized.startsWith("/api/v1/photos") && !normalized.contains("/uploads"))
                || normalized.startsWith("/api/wallet/transfer") || normalized.startsWith("/api/v1/wallet/transfer")
                || normalized.equals("/api/bonds/my-holdings") || normalized.equals("/api/v1/bonds/my-holdings")
                || normalized.equals("/api/bonds/my-repo-loans") || normalized.equals("/api/v1/bonds/my-repo-loans")
                // Owner-specific personal space, growth/credit and advisor projections.
                || normalized.matches("^/api/(v1/)?(space|spaces)(/.*)?$")
                   && !normalized.matches("^/api/(v1/)?(space|spaces)/real-estate/districts/?$")
                || normalized.matches("^/api/(v1/)?progression(/.*)?$")
                // Owner-scoped reads added 2026-11-25: a forged actor header is refused, not ignored.
                || normalized.matches("^/api/(v1/)?(engagement|early-game|business-types|business-equity|rewards)(/.*)?$")
                || normalized.matches("^/api/(v1/)?wallet/activity(/.*)?$")
                // Security 2026-11-26: BankController writes (deposit, withdraw, movements, claim-interest,
                // borrow, repay) checked the session but never the CSRF token.
                || normalized.matches("^/api/(v1/)?(bank|banking)(/.*)?$")
                || normalized.matches("^/api/(v1/)?businesses/my-v2/?$")
                || normalized.matches("^/api/(v1/)?shop/holdings/?$")
                || normalized.matches("^/api/(v1/)?advisor(/.*)?$")
                // OWASP API1:2023 BOLA prevention for casino betting, inventory, work assignments and stock orders
                || normalized.startsWith("/api/casino/play") || normalized.startsWith("/api/v1/casino/play")
                || normalized.startsWith("/api/casino/dice") || normalized.startsWith("/api/v1/casino/dice")
                || normalized.startsWith("/api/shop/purchase") || normalized.startsWith("/api/v1/shop/purchase")
                || normalized.startsWith("/api/shop/inventory") || normalized.startsWith("/api/v1/shop/inventory")
                || normalized.startsWith("/api/work/") || normalized.startsWith("/api/v1/work/")
                || normalized.startsWith("/api/stocks/orders") || normalized.startsWith("/api/v1/stocks/orders")
                || normalized.startsWith("/api/stocks/portfolio") || normalized.startsWith("/api/v1/stocks/portfolio")
                || normalized.startsWith("/api/arena/battles") || normalized.startsWith("/api/v1/arena/battles")
                // Security review 2026-11-25: these writes resolved the member from a header.
                || normalized.matches("^/api/(v1/)?stocks/league/(join|copy-trade/(subscribe|cancel))/?$")
                || normalized.matches("^/api/(v1/)?crafting/execute/?$");
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
        String p;
        try {
            p = BoundaryPaths.of(request);
        } catch (IllegalArgumentException malformed) {
            return false; // fail closed: an undecodable path gets the member boundary
        }
        if (isPublicGalleryRead(request.getMethod(), p)) return true;
        return !isMemberPrivatePath(p) && !isAdminDiagnosticsPath(p)
                && !(isWrite(request) && isSessionOnlyWritePath(p));
    }

    /**
     * The published gallery list is a guest page (NestJS GET /photos had no session guard;
     * 2026-11-25). Only GET/HEAD of the exact list path; submit, withdraw, mine and uploads
     * stay member-only.
     */
    static boolean isPublicGalleryRead(String method, String p) {
        return ("GET".equals(method) || "HEAD".equals(method)) && p.matches("^/(app-)?api/(v1/)?photos/?$");
    }

    /**
     * Writes that checked the session but not the CSRF token (security review
     * 2026-11-25). Only their writes are filtered; their public reads are not.
     */
    static boolean isSessionOnlyWritePath(String p) {
        String n = p.startsWith("/app-api/") ? p.replaceFirst("^/app-api", "/api") : p;
        return n.matches("^/api/(v1/)?(profile/image|collections/[^/]+|stocks/alerts(/[^/]+)?|privacy/requests|board/stock-posts)/?$");
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

        String path = boundaryPath(request);
        if (isAdminDiagnosticsPath(path)) {
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
        if (isWrite(request) && path.matches("^/api/(v1/)?(space|spaces|progression|advisor)(/.*)?$")) {
            fail(response, 503, "source_receipt_not_verified");
            return;
        }
        // Legacy wallet-transfer clients supply no stable idempotency key. Block only
        // that unsafe alias. The /api/v1/wallet/transfer controller demands a
        // caller-stable UUID and a verified session + CSRF before any ledger SQL.
        if (isWrite(request) && path.equals("/api/wallet/transfer")) {
            fail(response, 503, "legacy_wallet_transfer_idempotency_not_verified");
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

    private static String boundaryPath(HttpServletRequest request) {
        try {
            return BoundaryPaths.of(request);
        } catch (IllegalArgumentException malformed) {
            return request.getRequestURI();
        }
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
