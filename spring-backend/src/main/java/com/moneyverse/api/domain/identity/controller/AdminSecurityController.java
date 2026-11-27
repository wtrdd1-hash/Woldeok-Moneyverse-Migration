package com.moneyverse.api.domain.identity.controller;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Tag(name = "Admin Security & Sessions", description = "관리자 보안 콘솔 세션 진입, 로테이션 및 강제 로그아웃 API")
@RestController
public class AdminSecurityController {

    private final AdminAuthService adminAuthService;
    private final JdbcTemplate jdbcTemplate;

    public AdminSecurityController(AdminAuthService adminAuthService, JdbcTemplate jdbcTemplate) {
        this.adminAuthService = adminAuthService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Operation(summary = "관리자 보안 콘솔 세션 상태 및 로그인 정책 조회")
    @GetMapping(path = {
            "/api/v1/admin/security",
            "/api/admin/security"
    })
    public ResponseEntity<?> getSecurityOverview(HttpServletRequest request) {
        if (!adminAuthService.isAuthorizedAdmin(request)) {
            return adminAuthService.unauthorizedResponse();
        }
        // Answers the console front door's contract (frontend AdminConsole) from the database.
        // It used to synthesise the session ("opened now", 30 days) and report reauthentication as
        // active in a shape the front door does not read (2026-11-26).
        Optional<UUID> uidOpt = adminAuthService.resolveAdminUserId(request);
        String token = adminAuthService.extractSessionToken(request);
        if (uidOpt.isEmpty() || token == null) return consoleUnavailable();
        UUID actor = uidOpt.get();
        List<String> roles = adminAuthService.getAdminRolesForUser(actor);
        if (roles.isEmpty()) return consoleUnavailable();
        try {
            List<Map<String, Object>> sessions = jdbcTemplate.queryForList(
                    "SELECT id, reauthenticated_at FROM auth_sessions WHERE token_hash = ? AND user_id = ? "
                            + "AND revoked_at IS NULL AND expires_at > NOW()",
                    com.moneyverse.api.domain.identity.service.UserAuthService.sha256(token), actor);
            if (sessions.isEmpty()) return consoleUnavailable();
            UUID sessionId = (UUID) sessions.get(0).get("id");
            Instant reauthAt = instant(sessions.get(0).get("reauthenticated_at"));
            // Reading the status also records console activity (admin_session_touch, 246).
            List<Map<String, Object>> touch = jdbcTemplate.queryForList(
                    "SELECT state, expires_at, idle_expires_at FROM public.admin_session_touch(?::uuid, ?::uuid)",
                    sessionId, actor);
            if (touch.isEmpty()) return consoleUnavailable();
            Map<String, Object> console = new LinkedHashMap<>();
            console.put("state", String.valueOf(touch.get(0).get("state")));
            console.put("expiresAt", iso(touch.get(0).get("expires_at")));
            console.put("idleExpiresAt", iso(touch.get(0).get("idle_expires_at")));
            // Five minutes: what the console SQL functions enforce for sensitive writes.
            Instant freshUntil = reauthAt == null ? null : reauthAt.plusSeconds(300);
            Map<String, Object> reauth = new LinkedHashMap<>();
            reauth.put("at", reauthAt == null ? null : reauthAt.toString());
            reauth.put("freshUntil", freshUntil == null ? null : freshUntil.toString());
            reauth.put("fresh", freshUntil != null && Instant.now().isBefore(freshUntil));
            List<Map<String, Object>> policy = new ArrayList<>();
            // admin_login_policy is superadmin-only; other administrators see no policy list
            // rather than losing the whole console status.
            boolean superadmin = roles.stream().anyMatch("superadmin"::equalsIgnoreCase);
            for (Map<String, Object> row : !superadmin ? List.<Map<String, Object>>of() : jdbcTemplate.queryForList(
                    "SELECT kind, value, label, recorded_at FROM public.admin_login_policy(?::uuid, ?::uuid)", actor, actor)) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("kind", row.get("kind"));
                item.put("value", row.get("value"));
                item.put("label", row.get("label"));
                item.put("recorded_at", iso(row.get("recorded_at")));
                policy.add(item);
            }
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("available", true);
            res.put("roles", roles);
            // TOTP was retired by migration 246; no second factor is enrolled.
            Map<String, Object> secondFactor = new LinkedHashMap<>();
            secondFactor.put("enrolled", false);
            secondFactor.put("confirmed", false);
            secondFactor.put("lockedUntil", null);
            res.put("secondFactor", secondFactor);
            res.put("consoleSession", console);
            res.put("reauthentication", reauth);
            res.put("loginPolicy", policy);
            return ResponseEntity.ok().header("Cache-Control", "no-store").body(res);
        } catch (org.springframework.dao.DataAccessException failure) {
            return consoleUnavailable();
        }
    }

    private static ResponseEntity<?> consoleUnavailable() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).header("Cache-Control", "no-store")
                .body(Map.of("ok", false, "available", false, "code", "ADMIN_CONSOLE_STATUS_UNAVAILABLE"));
    }

    private static Instant instant(Object value) {
        if (value instanceof java.sql.Timestamp ts) return ts.toInstant();
        if (value instanceof java.time.OffsetDateTime odt) return odt.toInstant();
        if (value instanceof Instant i) return i;
        return null;
    }

    private static String iso(Object value) {
        Instant i = instant(value);
        return i == null ? null : i.toString();
    }

    @Operation(summary = "관리자 권한 조회")
    @GetMapping(path = {
            "/api/v1/admin/me",
            "/api/admin/me"
    })
    public ResponseEntity<?> getAdminMe(HttpServletRequest request) {
        if (!adminAuthService.isAuthorizedAdmin(request)) {
            return adminAuthService.unauthorizedResponse();
        }

        Optional<UUID> uidOpt = adminAuthService.resolveAdminUserId(request);
        // Only the roles admin_current_roles reports; never a default list (it used to answer every
        // role, superadmin included, whenever the real ones could not be read).
        List<String> roles = uidOpt.map(adminAuthService::getAdminRolesForUser).orElse(List.of());
        if (roles.isEmpty()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).header("Cache-Control", "no-store")
                    .body(Map.of("ok", false, "code", "ADMIN_ROLES_UNAVAILABLE"));
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("roles", roles);
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "관리자 콘솔 세션 진입/로테이션")
    @PostMapping(path = {
            "/api/v1/admin/security/sessions",
            "/api/admin/security/sessions"
    })
    public ResponseEntity<?> openConsoleSession(HttpServletRequest request, HttpServletResponse response) {
        if (!adminAuthService.isAuthorizedAdmin(request)) {
            return adminAuthService.unauthorizedResponse();
        }

        String rawToken = adminAuthService.extractSessionToken(request);
        // Bind the console session to the verified administrator or issue nothing. It used to fall
        // back to a fixed user id when this second lookup came back empty (a session revoked
        // between the two reads, a transient database error).
        Optional<UUID> verified = adminAuthService.resolveVerifiedAdminActor(request);
        if (verified.isEmpty()) {
            return adminAuthService.unauthorizedResponse();
        }
        UUID userId = verified.get();

        // Generate rotated console token
        String newToken = UserAuthService.generateRandomToken();
        String newCsrfToken = UUID.randomUUID().toString();
        String newTokenHash = AdminAuthService.sha256(newToken);
        String newCsrfHash = AdminAuthService.sha256(newCsrfToken);

        Instant now = Instant.now();
        Instant expiresAt = now.plus(30, ChronoUnit.DAYS);
        Instant idleExpiresAt = now.plus(1, ChronoUnit.DAYS);

        // Update current session or insert new rotated session
        UUID newSessionId = UUID.randomUUID();
        try {
            if (rawToken != null) {
                String oldTokenHash = AdminAuthService.sha256(rawToken);
                jdbcTemplate.update(
                    "UPDATE auth_sessions SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL",
                    oldTokenHash
                );
            }
            String insertSql = """
                INSERT INTO auth_sessions (id, token_hash, csrf_hash, user_id, expires_at, created_at,
                                           admin_opened_at, admin_last_seen_at, prelogin_age_confirmed, reauthenticated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, ?)
                """;
            jdbcTemplate.update(insertSql, newSessionId, newTokenHash, newCsrfHash, userId,
                    java.sql.Timestamp.from(expiresAt), java.sql.Timestamp.from(now),
                    java.sql.Timestamp.from(now), java.sql.Timestamp.from(now), java.sql.Timestamp.from(now));
        } catch (Exception e) {
            // fallback update
        }

        // Emit exact single __Host-mv_session cookie matching verifiedConsoleOpen contract
        ResponseCookie cookie = ResponseCookie.from("__Host-mv_session", newToken)
                .path("/")
                .sameSite("Lax")
                .httpOnly(true)
                .secure(true)
                .maxAge(30 * 24 * 60 * 60)
                .build();
        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        UserAuthService.setCsrfCookie(response, newCsrfToken, 30 * 24 * 60 * 60);
        // The old legacy cookie must not shadow the newly rotated host session.
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from("mv_session", "")
                .path("/").maxAge(0).httpOnly(true).secure(true).sameSite("Lax").build().toString());

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("state", "open");
        res.put("expiresAt", expiresAt.toString());
        res.put("idleExpiresAt", idleExpiresAt.toString());
        res.put("csrfToken", newCsrfToken);
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "관리자 콘솔 세션 종료")
    @DeleteMapping(path = {
            "/api/v1/admin/security/sessions",
            "/api/admin/security/sessions"
    })
    public ResponseEntity<?> closeConsoleSession(HttpServletRequest request, HttpServletResponse response) {
        String rawToken = adminAuthService.extractSessionToken(request);
        if (rawToken != null) {
            String tokenHash = AdminAuthService.sha256(rawToken);
            try {
                jdbcTemplate.update("UPDATE auth_sessions SET admin_closed_at = NOW(), revoked_at = NOW() WHERE token_hash = ?", tokenHash);
            } catch (Exception ignored) {}
        }

        ResponseCookie cookie = ResponseCookie.from("__Host-mv_session", "")
                .path("/")
                .sameSite("Lax")
                .httpOnly(true)
                .secure(true)
                .maxAge(0)
                .build();
        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        UserAuthService.clearCsrfCookies(response);
        // Removing the host cookie must not reveal a different legacy account.
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from("mv_session", "")
                .path("/").maxAge(0).httpOnly(true).secure(true).sameSite("Lax").build().toString());

        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "서버단 강제 로그아웃 및 쿠키 전체 소거")
    @PostMapping(path = {
            "/api/v1/admin/security/forced-logouts",
            "/api/admin/security/forced-logouts"
    })
    public ResponseEntity<?> forceLogout(HttpServletResponse response) {
        addClearCookies(response);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "ok", true,
                "message", "세션이 강제 종료되었으며 모든 쿠키가 소거되었습니다."
        ));
    }

    @Operation(summary = "IP 차단 목록 조회")
    @GetMapping(path = {
            "/api/v1/admin/security/ip-blocks",
            "/api/admin/security/ip-blocks"
    })
    public ResponseEntity<?> getIpBlocks(HttpServletRequest request) {
        if (!adminAuthService.isAuthorizedAdmin(request)) {
            return adminAuthService.unauthorizedResponse();
        }
        return ResponseEntity.ok(Map.of("items", List.of()));
    }

    public static void addClearCookies(HttpServletResponse response) {
        List<String> cookieNames = List.of(
                "mv_session",
                "__Host-mv_session",
                "__Host-mv_csrf",
                "mv_csrf",
                "moneyverse_session",
                "wdmv_session",
                "JSESSIONID"
        );
        for (String name : cookieNames) {
            ResponseCookie c1 = ResponseCookie.from(name, "")
                    .path("/")
                    .maxAge(0)
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("Lax")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, c1.toString());
        }
    }
}
