package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Resolves the live session without requiring direct access to restricted identity tables. */
@Component
public class AdminLogIdentityResolver {
    static final String SESSION_SQL = "SELECT id, user_id FROM public.auth_sessions " +
            "WHERE token_hash = ? AND user_id IS NOT NULL " +
            "AND revoked_at IS NULL AND expires_at > NOW()";
    static final String ROLES_SQL = "SELECT role::text AS role FROM public.admin_current_roles(?)";

    private final JdbcTemplate jdbc;

    public AdminLogIdentityResolver(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<VerifiedSession> resolve(HttpServletRequest request) {
        if (request == null) return Optional.empty();
        String token = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if (("mv_session".equals(c.getName()) || "__Host-mv_session".equals(c.getName())) &&
                        c.getValue() != null && !c.getValue().isBlank()) {
                    token = c.getValue();
                    break;
                }
            }
        }
        if (token == null) {
            String authorization = request.getHeader("Authorization");
            if (authorization != null && authorization.startsWith("Bearer ")) {
                token = authorization.substring(7).trim();
            }
        }
        if (token == null || token.isBlank() || token.length() > 4096) return Optional.empty();
        try {
            SessionIds ids = jdbc.queryForObject(SESSION_SQL, (rs, n) ->
                    new SessionIds(UUID.fromString(rs.getString("id")),
                            UUID.fromString(rs.getString("user_id"))),
                    UserAuthService.sha256(token));
            if (ids == null) return Optional.empty();
            List<String> roles = jdbc.query(ROLES_SQL,
                    (rs, n) -> rs.getString("role"), ids.userId());
            return Optional.of(new VerifiedSession(ids.sessionId(), ids.userId(), List.copyOf(roles)));
        } catch (Exception ignored) {
            // Missing privileges, missing roles, expired tokens and database faults must all fail closed.
            return Optional.empty();
        }
    }

    record SessionIds(UUID sessionId, UUID userId) { }
    public record VerifiedSession(UUID sessionId, UUID userId, List<String> roles) { }
}
