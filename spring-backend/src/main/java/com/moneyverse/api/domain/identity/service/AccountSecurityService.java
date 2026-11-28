package com.moneyverse.api.domain.identity.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Service
public class AccountSecurityService {

    private static final Logger log = LoggerFactory.getLogger(AccountSecurityService.class);
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public AccountSecurityService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getActiveSessions(UUID userId, UUID currentSessionId) {
        String sql = """
            SELECT id, created_at, expires_at, reauthenticated_at
            FROM auth_sessions
            WHERE user_id = ? AND revoked_at IS NULL AND expires_at > NOW()
            ORDER BY created_at DESC
            """;
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Map<String, Object> session = new LinkedHashMap<>();
                UUID id = UUID.fromString(rs.getString("id"));
                session.put("id", id.toString());
                session.put("isCurrent", id.equals(currentSessionId));
                Timestamp cat = rs.getTimestamp("created_at");
                session.put("createdAt", cat != null ? cat.toInstant().toString() : Instant.now().toString());
                Timestamp exp = rs.getTimestamp("expires_at");
                session.put("expiresAt", exp != null ? exp.toInstant().toString() : null);
                Timestamp reauth = rs.getTimestamp("reauthenticated_at");
                session.put("reauthenticatedAt", reauth != null ? reauth.toInstant().toString() : null);
                return session;
            }, userId);
        } catch (Exception e) {
            log.error("[AccountSecurityService] getActiveSessions error: {}", e.getMessage());
            return List.of();
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSecurityEvents(UUID userId, String category, String sort) {
        // account_recent_security_events (214) is the actor-bound read; the table itself is not granted.
        // It returns the newest events only (type, time), which is all the account page shows. A category
        // filter reads the function's maximum window so that up to 20 matching events remain.
        String type = ("login".equalsIgnoreCase(category) || "settings".equalsIgnoreCase(category))
                ? category.toLowerCase(Locale.ROOT) : null;
        List<Map<String, Object>> events;
        try {
            events = jdbcTemplate.query(
                    "SELECT event_type, created_at FROM public.account_recent_security_events(?::uuid, ?)",
                    (rs, rowNum) -> {
                        Map<String, Object> event = new LinkedHashMap<>();
                        event.put("type", rs.getString("event_type"));
                        event.put("createdAt", rs.getTimestamp("created_at").toInstant().toString());
                        return event;
                    }, userId, type == null ? 20 : 50);
        } catch (DataAccessException e) {
            // An empty list would claim "no sign-ins recorded"; say the source is unavailable instead.
            log.warn("[AccountSecurityService] security events unavailable: {}", e.getClass().getSimpleName());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SECURITY_EVENTS_UNAVAILABLE");
        }
        List<Map<String, Object>> filtered = new ArrayList<>(events.stream()
                .filter(e -> type == null || type.equals(e.get("type"))).limit(20).toList());
        if ("oldest".equalsIgnoreCase(sort)) Collections.reverse(filtered);
        return filtered;
    }

    @Transactional
    public boolean revokeOtherSession(UUID userId, UUID currentSessionId, UUID targetSessionId) {
        if (targetSessionId.equals(currentSessionId)) {
            return false;
        }
        int rows = jdbcTemplate.update(
            "UPDATE auth_sessions SET revoked_at = NOW() WHERE id = ? AND user_id = ? AND revoked_at IS NULL",
            targetSessionId, userId
        );
        return rows > 0;
    }

    @Transactional
    public int revokeOtherSessions(UUID userId, UUID currentSessionId) {
        return jdbcTemplate.update(
            "UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = ? AND id != ? AND revoked_at IS NULL",
            userId, currentSessionId
        );
    }
}
