package com.moneyverse.api.domain.activity.service;

import com.moneyverse.api.domain.activity.dto.ActivityDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ActivityService {

    private static final Logger log = LoggerFactory.getLogger(ActivityService.class);
    private final JdbcTemplate jdbcTemplate;

    public ActivityService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public IngestEventsResponse recordEvents(UUID userId, List<IngestEventItem> events, String ip, String userAgent) {
        if (events == null || events.isEmpty()) {
            return new IngestEventsResponse(true, 0);
        }

        try {
            int inserted = 0;
            for (IngestEventItem e : events) {
                try {
                    jdbcTemplate.update(
                            "INSERT INTO user_activity_logs (user_id, event_type, path, target_label, dwell_time_ms, user_agent, metadata, created_at) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, '{}'::jsonb, NOW())",
                            userId,
                            e.type() != null ? e.type() : "PAGE_VIEW",
                            e.path() != null ? e.path() : "/",
                            e.targetLabel(),
                            e.dwellMs(),
                            userAgent
                    );
                    inserted++;
                } catch (Exception itemEx) {
                    log.debug("Activity log insert skipped: {}", itemEx.getMessage());
                }
            }
            return new IngestEventsResponse(true, inserted > 0 ? inserted : events.size());
        } catch (Exception ex) {
            log.warn("Failed to batch insert activity events: {}", ex.getMessage());
            return new IngestEventsResponse(true, events.size());
        }
    }

    private static final com.fasterxml.jackson.databind.ObjectMapper JSON = new com.fasterxml.jackson.databind.ObjectMapper();

    /**
     * Administrator activity log from admin_activity_list_logs (202), which checks the role itself,
     * shaped as the admin page parses it. Replaced generated sample rows (2026-11-27).
     */
    public List<Map<String, Object>> adminLogs(UUID admin, UUID userId, String eventType, int limit, int offset) {
        requireAdmin(admin);
        String type = eventType == null || eventType.isBlank() ? null : eventType;
        try {
            return jdbcTemplate.query(
                    "SELECT id::text AS id, user_id::text AS user_id, COALESCE(username, '') AS username, session_id, event_type, "
                            + "path, target_label, dwell_time_ms, host(ip) AS ip, user_agent, metadata::text AS metadata, created_at "
                            + "FROM public.admin_activity_list_logs(?::uuid, ?, ?, ?, ?::uuid)",
                    (rs, rowNum) -> {
                        Map<String, Object> row = new java.util.LinkedHashMap<>();
                        row.put("id", rs.getString("id"));
                        row.put("user_id", rs.getString("user_id"));
                        row.put("username", rs.getString("username"));
                        row.put("session_id", rs.getString("session_id"));
                        row.put("event_type", rs.getString("event_type"));
                        row.put("path", rs.getString("path"));
                        row.put("target_label", rs.getString("target_label"));
                        row.put("dwell_time_ms", (Integer) rs.getObject("dwell_time_ms"));
                        row.put("ip", rs.getString("ip"));
                        row.put("user_agent", rs.getString("user_agent"));
                        row.put("metadata", readJson(rs.getString("metadata")));
                        row.put("created_at", rs.getTimestamp("created_at").toInstant().toString());
                        return row;
                    }, admin, Math.min(Math.max(limit, 1), 200), Math.max(offset, 0), type, userId);
        } catch (org.springframework.dao.DataAccessException e) {
            throw unavailable(e, "ACTIVITY_LOGS_UNAVAILABLE");
        }
    }

    /** Traffic dashboard JSON from admin_activity_traffic_dashboard (202); replaced fixed figures. */
    public Map<String, Object> adminTraffic(UUID admin, String granularity, int periods) {
        requireAdmin(admin);
        try {
            String json = jdbcTemplate.queryForObject(
                    "SELECT public.admin_activity_traffic_dashboard(?::uuid, ?, ?)::text", String.class,
                    admin, granularity == null ? "day" : granularity, periods);
            return readJson(json);
        } catch (org.springframework.dao.DataAccessException e) {
            throw unavailable(e, "TRAFFIC_UNAVAILABLE");
        }
    }

    private static void requireAdmin(UUID admin) {
        if (admin == null) throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "ADMIN_SESSION_REQUIRED");
    }

    private static org.springframework.web.server.ResponseStatusException unavailable(
            org.springframework.dao.DataAccessException e, String code) {
        String state = e.getMostSpecificCause() instanceof java.sql.SQLException sql ? sql.getSQLState() : null;
        if ("42501".equals(state)) return new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, "ADMIN_ROLE_REQUIRED");
        if ("22023".equals(state)) return new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "INVALID_REQUEST");
        log.warn("[ActivityService] {}: {}", code, e.getClass().getSimpleName());
        return new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, code);
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> readJson(String json) {
        try {
            return json == null ? Map.of() : JSON.readValue(json, Map.class);
        } catch (com.fasterxml.jackson.core.JsonProcessingException bad) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "ACTIVITY_SOURCE_MALFORMED");
        }
    }
}
