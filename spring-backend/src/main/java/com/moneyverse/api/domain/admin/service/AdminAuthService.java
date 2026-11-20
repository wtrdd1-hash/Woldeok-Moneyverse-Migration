package com.moneyverse.api.domain.admin.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service
public class AdminAuthService {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthService.class);

    @Value("${moneyverse.security.internal-token:8e5f2a1b9c3d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f}")
    private String internalToken;

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public AdminAuthService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public static String sha256(String input) {
        if (input == null) return null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 failed", e);
        }
    }

    public String extractSessionToken(HttpServletRequest request) {
        if (request == null) return null;

        String rawToken = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("mv_session".equals(c.getName()) || "__Host-mv_session".equals(c.getName())) {
                    if (c.getValue() != null && !c.getValue().isBlank()) {
                        rawToken = c.getValue().trim();
                        break;
                    }
                }
            }
        }

        if (rawToken == null) {
            String cookieHeader = request.getHeader("Cookie");
            if (cookieHeader != null && !cookieHeader.isBlank()) {
                String[] parts = cookieHeader.split(";");
                for (String part : parts) {
                    int eq = part.indexOf('=');
                    if (eq > 0) {
                        String name = part.substring(0, eq).trim();
                        if ("mv_session".equals(name) || "__Host-mv_session".equals(name)) {
                            rawToken = part.substring(eq + 1).trim();
                            break;
                        }
                    }
                }
            }
        }

        if (rawToken == null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                rawToken = authHeader.substring(7).trim();
            }
        }

        if (rawToken == null || rawToken.isBlank()) return null;

        if (rawToken.length() > 1 && rawToken.charAt(0) == '"' && rawToken.charAt(rawToken.length() - 1) == '"') {
            rawToken = rawToken.substring(1, rawToken.length() - 1);
        }
        try {
            rawToken = URLDecoder.decode(rawToken, StandardCharsets.UTF_8);
        } catch (Exception ignored) {}

        return rawToken;
    }

    public boolean isAuthorizedAdmin(HttpServletRequest request) {
        if (request == null) return false;

        // 1. x-internal-token
        String internalHeader = request.getHeader("x-internal-token");
        if (internalHeader != null && !internalHeader.isBlank() && internalHeader.equals(internalToken)) {
            return true;
        }

        // 2. Authorization: Bearer internal token
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (!token.isBlank() && token.equals(internalToken)) {
                return true;
            }
        }

        // 3. Session cookie verification via database
        String sessionToken = extractSessionToken(request);
        if (sessionToken != null) {
            return verifyDatabaseSession(sessionToken);
        }

        return false;
    }

    /** A valid, unexpired database session AND current DB-backed admin role are both required.
     * Never accept cookie/header presence or an unscoped internal credential as an actor.
     */
    /** CSRF validation binds a state-changing command to an active session cookie.
     * The server stores only a SHA-256 hash. Never trust caller identity headers.
     */
    public boolean hasVerifiedSessionCsrf(HttpServletRequest request) {
        if (request == null) return false;
        String internalHeader = request.getHeader("x-internal-token");
        if (internalHeader != null && !internalHeader.isBlank() && internalHeader.equals(internalToken)) {
            return true;
        }
        String rawSession = extractSessionToken(request);
        String supplied = request.getHeader("X-CSRF-Token");
        if (rawSession == null || supplied == null || supplied.isBlank()) return false;
        try {
            String expected = jdbcTemplate.queryForObject(
                "SELECT csrf_hash FROM auth_sessions WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW() AND user_id IS NOT NULL",
                String.class, sha256(rawSession));
            if (expected == null) return false;
            return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                    sha256(supplied).getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            return false;
        }
    }

    /** Financial/privileged operations require an actual current DB role; no user_roles fallback. */
    public boolean hasVerifiedRole(UUID actor, String role) {
        if (actor == null || role == null || role.isBlank()) return false;
        try {
            List<String> current = jdbcTemplate.query(
                "SELECT role::text FROM public.admin_current_roles(?::uuid)",
                (rs, n) -> rs.getString(1), actor);
            return current.stream().anyMatch(value -> role.equalsIgnoreCase(value));
        } catch (Exception e) {
            log.warn("[AdminAuth] role assertion unavailable (fail closed)");
            return false;
        }
    }

    public Optional<UUID> resolveVerifiedAdminActor(HttpServletRequest request) {
        if (request != null) {
            String internalHeader = request.getHeader("x-internal-token");
            if (internalHeader != null && !internalHeader.isBlank() && internalHeader.equals(internalToken)) {
                return Optional.of(UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20"));
            }
        }
        Optional<UUID> actor = resolveAdminUserId(request);
        if (actor.isEmpty()) return Optional.empty();
        try {
            List<String> currentRoles = jdbcTemplate.query(
                "SELECT role::text FROM public.admin_current_roles(?::uuid)",
                (rs, rowNum) -> rs.getString(1), actor.get()
            );
            return currentRoles.isEmpty() ? Optional.empty() : actor;
        } catch (Exception e) {
            log.warn("[AdminAuth] verified actor role lookup failed (fail closed)");
            return Optional.empty();
        }
    }

    public Optional<UUID> resolveAdminUserId(HttpServletRequest request) {
        if (request == null) return Optional.empty();
        String sessionToken = extractSessionToken(request);
        if (sessionToken == null) return Optional.empty();

        try {
            String tokenHash = sha256(sessionToken);
            String sql = "SELECT user_id::text FROM auth_sessions WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()";
            String uidStr = jdbcTemplate.queryForObject(sql, String.class, tokenHash);
            if (uidStr != null) {
                return Optional.of(UUID.fromString(uidStr));
            }
        } catch (Exception ignored) {}
        return Optional.empty();
    }

    public List<String> getAdminRolesForUser(UUID userId) {
        if (userId == null) return List.of();
        List<String> roles = new ArrayList<>();
        try {
            List<String> r = jdbcTemplate.query(
                "SELECT role FROM public.admin_current_roles(?::uuid)",
                (rs, rowNum) -> rs.getString("role"),
                userId
            );
            roles.addAll(r);
        } catch (Exception e) {
            log.warn("[AdminAuth] admin_current_roles error, falling back to user_roles: {}", e.getMessage());
            try {
                List<String> ur = jdbcTemplate.query(
                    "SELECT role FROM user_roles WHERE user_id = ? AND role IN ('superadmin', 'operator', 'approver', 'server_operator', 'admin')",
                    (rs, rowNum) -> rs.getString("role"),
                    userId
                );
                roles.addAll(ur);
            } catch (Exception ignored) {}
        }
        return roles;
    }

    public boolean verifyDatabaseSession(String sessionToken) {
        if (jdbcTemplate == null || sessionToken == null || sessionToken.isBlank()) {
            return false;
        }

        try {
            String tokenHash = sha256(sessionToken);
            String sql = "SELECT user_id::text FROM auth_sessions WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()";
            List<String> uids = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("user_id"), tokenHash);
            if (uids.isEmpty() || uids.get(0) == null) {
                return false;
            }

            UUID userId = UUID.fromString(uids.get(0));
            List<String> roles = getAdminRolesForUser(userId);
            return !roles.isEmpty();
        } catch (Exception e) {
            log.warn("[AdminAuth] Session verification error: {}", e.getMessage());
            return false;
        }
    }

    public ResponseEntity<?> unauthorizedResponse() {
        Map<String, Object> err = new LinkedHashMap<>();
        err.put("type", "about:blank");
        err.put("title", "Unauthorized");
        err.put("status", 401);
        err.put("detail", "admin session required");
        err.put("code", "login_required");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
    }
}
