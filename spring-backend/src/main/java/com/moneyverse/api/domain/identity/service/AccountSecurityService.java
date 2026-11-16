package com.moneyverse.api.domain.identity.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
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
        String orderClause = "oldest".equalsIgnoreCase(sort) ? "ASC" : "DESC";
        String catClause = ("login".equalsIgnoreCase(category) || "settings".equalsIgnoreCase(category))
                ? " AND event_type = '" + category.toLowerCase() + "'"
                : "";

        String sql = "SELECT id, event_type, created_at, ip_address, user_agent " +
                     "FROM auth_security_events " +
                     "WHERE user_id = ?" + catClause + " " +
                     "ORDER BY created_at " + orderClause + " LIMIT 20";
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Map<String, Object> event = new LinkedHashMap<>();
                event.put("id", rs.getString("id"));
                event.put("type", rs.getString("event_type"));
                Timestamp cat = rs.getTimestamp("created_at");
                event.put("createdAt", cat != null ? cat.toInstant().toString() : Instant.now().toString());
                event.put("ipAddress", rs.getString("ip_address"));
                event.put("userAgent", rs.getString("user_agent"));
                return event;
            }, userId);
        } catch (Exception e) {
            log.debug("[AccountSecurityService] getSecurityEvents fallback: {}", e.getMessage());
            return List.of();
        }
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
