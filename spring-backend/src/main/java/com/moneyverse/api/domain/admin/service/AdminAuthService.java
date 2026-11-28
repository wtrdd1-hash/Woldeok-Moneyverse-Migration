package com.moneyverse.api.domain.admin.service;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service
public class AdminAuthService {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthService.class);


    private final JdbcTemplate jdbcTemplate;

    @Autowired
    /**
     * Administrator step-up window: the current session must have re-verified the password within
     * this many seconds (migration 031; the same window as LocalAuthController's reauthentication
     * and the NestJS ReauthGuard). Step-up re-authentication, not an independent second factor;
     * the independent TOTP credential was retired by migration 197 (owner decision pending).
     */
    public static final int STEP_UP_WINDOW_SECONDS = 900;

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
        return UserAuthService.extractSessionToken(request);
    }

    public boolean isAuthorizedAdmin(HttpServletRequest request) {
        // Network transport credentials cannot identify an audited human administrator.
        return request != null && resolveVerifiedAdminActor(request).isPresent();
    }

    /** A valid, unexpired database session AND current DB-backed admin role are both required.
     * Never accept cookie/header presence or an unscoped internal credential as an actor.
     */
    /** CSRF validation binds a state-changing command to an active session cookie.
     * The server stores only a SHA-256 hash. Never trust caller identity headers.
     */
    public boolean hasVerifiedSessionCsrf(HttpServletRequest request) {
        if (request == null) return false;
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

    /**
     * Step-up proof: this request's own session (by token hash), owned by the verified
     * administrator, re-verified its password within the window. Another session's proof does not
     * count, and anything unreadable answers false (fail closed).
     */
    public boolean hasRecentSessionReauthentication(HttpServletRequest request, int windowSeconds) {
        if (request == null || windowSeconds <= 0) return false;
        String raw = extractSessionToken(request);
        if (raw == null || raw.isBlank()) return false;
        Optional<UUID> actor = resolveVerifiedAdminActor(request);
        if (actor.isEmpty()) return false;
        try {
            Integer n = jdbcTemplate.queryForObject(
                "SELECT count(*)::int FROM auth_sessions WHERE token_hash = ? AND user_id = ? AND revoked_at IS NULL "
                    + "AND expires_at > NOW() AND reauthenticated_at IS NOT NULL "
                    + "AND reauthenticated_at > NOW() - make_interval(secs => ?)",
                Integer.class, sha256(raw), actor.get(), windowSeconds);
            return n != null && n == 1;
        } catch (Exception e) {
            log.warn("[AdminAuth] step-up proof lookup failed (fail closed)");
            return false;
        }
    }

    /**
     * Independent TOTP candidate (migration 366): whether this request's administrator must present
     * a second-factor proof for scoped writes. Enrolled administrators are enforced; everyone once
     * the owner enables the admin_totp_required switch. An unreadable answer counts as enforced
     * (fail closed) -- the proof check that follows then refuses.
     */
    public boolean secondFactorEnforced(HttpServletRequest request) {
        Optional<UUID> actor = resolveVerifiedAdminActor(request);
        if (actor.isEmpty()) return true;
        try {
            Boolean enforced = jdbcTemplate.queryForObject(
                    "SELECT enforced FROM public.admin_totp_requirement(?::uuid)", Boolean.class, actor.get());
            return enforced == null || enforced;
        } catch (Exception e) {
            log.warn("[AdminAuth] second factor requirement unavailable (fail closed)");
            return true;
        }
    }

    /** A proof for this scope minted in this request's own session (by token hash); else false. */
    public boolean hasSecondFactorProof(HttpServletRequest request, String scope) {
        if (scope == null) return false;
        String raw = extractSessionToken(request);
        if (raw == null || raw.isBlank()) return false;
        Optional<UUID> actor = resolveVerifiedAdminActor(request);
        if (actor.isEmpty()) return false;
        try {
            Boolean valid = jdbcTemplate.queryForObject(
                    "SELECT public.admin_totp_proof_valid(?::uuid, s.id, ?) FROM auth_sessions s "
                            + "WHERE s.token_hash = ? AND s.user_id = ?::uuid AND s.revoked_at IS NULL AND s.expires_at > NOW()",
                    Boolean.class, actor.get(), scope, sha256(raw), actor.get());
            return Boolean.TRUE.equals(valid);
        } catch (Exception e) {
            log.warn("[AdminAuth] second factor proof lookup failed (fail closed)");
            return false;
        }
    }

    /** The id of this request's live session, owned by the given actor; empty if unreadable. */
    public Optional<UUID> currentSessionId(HttpServletRequest request, UUID actor) {
        String raw = extractSessionToken(request);
        if (raw == null || raw.isBlank() || actor == null) return Optional.empty();
        try {
            List<String> ids = jdbcTemplate.query(
                    "SELECT id::text FROM auth_sessions WHERE token_hash = ? AND user_id = ?::uuid AND revoked_at IS NULL AND expires_at > NOW()",
                    (rs, n) -> rs.getString(1), sha256(raw), actor);
            return ids.size() == 1 ? Optional.of(UUID.fromString(ids.get(0))) : Optional.empty();
        } catch (Exception e) {
            log.warn("[AdminAuth] session lookup failed (fail closed)");
            return Optional.empty();
        }
    }

    public Optional<UUID> resolveVerifiedAdminActor(HttpServletRequest request) {
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

    /** Same rule as resolveVerifiedAdminActor for a raw session token (Socket.IO handshake cookie). */
    public Optional<UUID> resolveVerifiedAdminActorByToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) return Optional.empty();
        try {
            List<String> ids = jdbcTemplate.query(
                "SELECT user_id::text FROM auth_sessions WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW() AND user_id IS NOT NULL",
                (rs, rowNum) -> rs.getString(1), sha256(rawToken));
            if (ids.size() != 1) return Optional.empty();
            UUID actor = UUID.fromString(ids.get(0));
            List<String> roles = jdbcTemplate.query("SELECT role::text FROM public.admin_current_roles(?::uuid)", (rs, rowNum) -> rs.getString(1), actor);
            return roles.isEmpty() ? Optional.empty() : Optional.of(actor);
        } catch (Exception e) {
            log.warn("[AdminAuth] socket admin lookup failed (fail closed)");
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
            // Fail closed. The former fallback read user_roles (not granted by the migration
            // chain) and so granted roles exactly when the authoritative function failed.
            log.warn("[AdminAuth] admin_current_roles unavailable (fail closed)");
            return List.of();
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
