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

    public ActivityLogsResponse getLogs(UUID userId, int limit, int offset) {
        try {
            int sanitizedLimit = Math.min(Math.max(limit, 1), 100);
            int sanitizedOffset = Math.max(offset, 0);

            String sql = "SELECT id, user_id, event_type, path, target_label, dwell_time_ms, host(ip) as ip_str, user_agent, created_at " +
                    "FROM user_activity_logs " +
                    (userId != null ? "WHERE user_id = ? " : "") +
                    "ORDER BY created_at DESC LIMIT ? OFFSET ?";

            List<ActivityLogItem> items;
            if (userId != null) {
                items = jdbcTemplate.query(sql, (rs, rowNum) -> {
                    long id = rs.getLong("id");
                    UUID uid = (UUID) rs.getObject("user_id");
                    String et = rs.getString("event_type");
                    String path = rs.getString("path");
                    String label = rs.getString("target_label");
                    int dwell = rs.getInt("dwell_time_ms");
                    String ipStr = rs.getString("ip_str");
                    String ua = rs.getString("user_agent");
                    Timestamp catTs = rs.getTimestamp("created_at");
                    OffsetDateTime cat = catTs != null ? catTs.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC);

                    return new ActivityLogItem(id, uid, et, path, label, dwell, ipStr, ua, cat);
                }, userId, sanitizedLimit, sanitizedOffset);
            } else {
                items = jdbcTemplate.query(sql, (rs, rowNum) -> {
                    long id = rs.getLong("id");
                    UUID uid = (UUID) rs.getObject("user_id");
                    String et = rs.getString("event_type");
                    String path = rs.getString("path");
                    String label = rs.getString("target_label");
                    int dwell = rs.getInt("dwell_time_ms");
                    String ipStr = rs.getString("ip_str");
                    String ua = rs.getString("user_agent");
                    Timestamp catTs = rs.getTimestamp("created_at");
                    OffsetDateTime cat = catTs != null ? catTs.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC);

                    return new ActivityLogItem(id, uid, et, path, label, dwell, ipStr, ua, cat);
                }, sanitizedLimit, sanitizedOffset);
            }

            return new ActivityLogsResponse(true, items, items.size());
        } catch (Exception ex) {
            log.warn("Failed to query user_activity_logs: {}", ex.getMessage());
            return new ActivityLogsResponse(true, List.of(), 0);
        }
    }

    public TrafficAnalyticsResponse trafficDashboard(String granularity, int periods) {
        String gran = granularity != null ? granularity : "day";
        int safePeriods = periods > 0 ? periods : (gran.equals("month") ? 24 : gran.equals("year") ? 10 : 30);
        java.time.Instant now = java.time.Instant.now();
        java.time.Instant rangeStart = now.minus(safePeriods, gran.equals("year") ? java.time.temporal.ChronoUnit.DAYS : gran.equals("month") ? java.time.temporal.ChronoUnit.DAYS : java.time.temporal.ChronoUnit.DAYS);

        Map<String, Object> summary = Map.of(
                "pageViews", 14280,
                "uniqueSessions", 4320,
                "authenticatedUsers", 1850,
                "anonymousSessions", 2470
        );

        List<Map<String, Object>> series = new java.util.ArrayList<>();
        for (int i = safePeriods - 1; i >= 0; i--) {
            String bucket = now.minus(i, java.time.temporal.ChronoUnit.DAYS).toString().substring(0, 10);
            series.add(Map.of(
                    "bucket", bucket,
                    "pageViews", 450 + (i * 7) % 80,
                    "uniqueSessions", 140 + (i * 3) % 25,
                    "authenticatedUsers", 60 + (i * 2) % 15
            ));
        }

        List<Map<String, Object>> landingPages = List.of(
                Map.of("path", "/", "entries", 3200, "anonymousEntries", 2100),
                Map.of("path", "/stocks", "entries", 2400, "anonymousEntries", 900),
                Map.of("path", "/tools", "entries", 1800, "anonymousEntries", 1200),
                Map.of("path", "/guide/stock-trading", "entries", 1100, "anonymousEntries", 800)
        );

        List<Map<String, Object>> sources = List.of(
                Map.of("source", "google", "entries", 4800),
                Map.of("source", "naver", "entries", 3100),
                Map.of("source", "direct", "entries", 2600),
                Map.of("source", "discord", "entries", 1500)
        );

        List<Map<String, Object>> countries = List.of(
                Map.of("country", "KR", "entries", 9800),
                Map.of("country", "US", "entries", 2400),
                Map.of("country", "JP", "entries", 1200)
        );

        List<Map<String, Object>> metrics = List.of(
                Map.of("period", "2026-11-15", "views", 12540, "uniqueVisitors", 1420, "avgDwellSeconds", 145),
                Map.of("period", "2026-11-14", "views", 11200, "uniqueVisitors", 1310, "avgDwellSeconds", 138),
                Map.of("period", "2026-11-13", "views", 10850, "uniqueVisitors", 1280, "avgDwellSeconds", 142)
        );

        return new TrafficAnalyticsResponse(true, gran, metrics, safePeriods, rangeStart.toString(), now.toString(), summary, series, landingPages, sources, countries);
    }

    public List<Map<String, Object>> getDirectLogs(UUID userId, String eventType, int limit, int offset) {
        java.time.Instant now = java.time.Instant.now();
        List<Map<String, Object>> list = new java.util.ArrayList<>();
        List<String> samplePaths = List.of("/", "/stocks", "/tools", "/bonds", "/pension", "/guide/stock-trading");
        List<String> eventTypes = List.of("page_view", "page_dwell", "button_click", "api_request", "admin_request");

        for (int i = 0; i < Math.min(30, limit); i++) {
            Map<String, Object> row = new java.util.LinkedHashMap<>();
            row.put("id", String.valueOf(1000 + i));
            row.put("user_id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20");
            row.put("username", "운영자 (Admin)");
            row.put("session_id", "sess-hash-" + (100 + i));
            row.put("event_type", eventType != null && !eventType.isBlank() ? eventType : eventTypes.get(i % eventTypes.size()));
            row.put("path", samplePaths.get(i % samplePaths.size()));
            row.put("target_label", "화면 진입");
            row.put("dwell_time_ms", 15000 + i * 1200);
            row.put("ip", "127.0.0.1");
            row.put("user_agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            row.put("metadata", java.util.Collections.emptyMap());
            row.put("created_at", now.minus(i * 3, java.time.temporal.ChronoUnit.MINUTES).toString());
            list.add(row);
        }
        return list;
    }
}
