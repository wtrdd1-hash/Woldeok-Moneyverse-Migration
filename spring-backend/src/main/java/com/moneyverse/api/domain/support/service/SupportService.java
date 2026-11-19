package com.moneyverse.api.domain.support.service;

import com.moneyverse.api.domain.support.dto.SupportDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Private member support: actor is supplied only by a database-verified session boundary. */
@Service
public class SupportService {
    private static final Logger log = LoggerFactory.getLogger(SupportService.class);
    private final JdbcTemplate jdbcTemplate;

    public SupportService(JdbcTemplate jdbcTemplate) { this.jdbcTemplate = jdbcTemplate; }

    private static OffsetDateTime date(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant().atOffset(ZoneOffset.UTC);
    }

    private List<SupportThreadItem> recentOwnerThreads(UUID actor) {
        return jdbcTemplate.query("""
                SELECT thread_id, subject, status, created_at, updated_at, last_message_at
                FROM public.support_my_threads(?::uuid, 100)
                """, (rs, n) -> new SupportThreadItem(
                (UUID) rs.getObject("thread_id"), actor, rs.getString("subject"),
                rs.getString("status"), date(rs.getTimestamp("created_at")),
                date(rs.getTimestamp("updated_at")), date(rs.getTimestamp("last_message_at"))
        ), actor);
    }

    public ThreadListResponse listThreads(UUID actor, String status) {
        try {
            List<SupportThreadItem> items = recentOwnerThreads(actor).stream()
                    .filter(item -> status == null || status.isBlank() || status.trim().equals(item.status()))
                    .limit(50).toList();
            return new ThreadListResponse(true, items, items.size());
        } catch (Exception ex) {
            log.warn("[SupportService] canonical owner threads unavailable");
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "SUPPORT_THREADS_UNAVAILABLE", ex);
        }
    }

    /** Counts cover only the 100 latest owner threads, never pretend to be a global total. */
    public ThreadSummaryResponse summary(UUID actor) {
        try {
            List<SupportThreadItem> recent = recentOwnerThreads(actor);
            int open = (int) recent.stream().filter(x -> "open".equals(x.status())).count();
            int waiting = (int) recent.stream().filter(x -> "waiting_user".equals(x.status())).count();
            int resolved = (int) recent.stream().filter(x -> "resolved".equals(x.status())).count();
            return new ThreadSummaryResponse(true, recent.size(), open, waiting, resolved);
        } catch (Exception ex) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "SUPPORT_SUMMARY_UNAVAILABLE", ex);
        }
    }

    @Transactional
    public ThreadCreateResponse createThread(UUID actor, NewThreadRequest req) {
        UUID key;
        try {
            key = (req.idempotencyKey() != null && !req.idempotencyKey().isBlank())
                    ? UUID.fromString(req.idempotencyKey().trim())
                    : UUID.randomUUID();
        } catch (Exception e) {
            key = UUID.randomUUID();
        }

        String subject = (req.subject() != null && !req.subject().isBlank()) ? req.subject().trim() : "고객지원 문의";
        String body = (req.body() != null && !req.body().isBlank()) ? req.body().trim() : "내용 없음";

        String sql = "SELECT thread_id, status, created_at FROM public.support_create_thread(?::uuid, ?::uuid, ?::text, ?::text)";
        Map<String, Object> result = jdbcTemplate.queryForMap(sql, actor, key, subject, body);

        UUID threadId = (UUID) result.get("thread_id");
        String status = (String) result.get("status");
        Timestamp createdAt = (Timestamp) result.get("created_at");
        OffsetDateTime createdDt = date(createdAt);

        SupportThreadItem item = new SupportThreadItem(threadId, actor, subject, status, createdDt, createdDt, createdDt);
        return new ThreadCreateResponse(true, item);
    }

    public MessageListResponse listMessages(UUID actor, UUID threadId) {
        try {
            List<SupportMessageItem> messages = jdbcTemplate.query("""
                    SELECT message_id, sender_kind, body, created_at
                    FROM public.support_thread_messages(?::uuid, ?::uuid, 500)
                    """, (rs, n) -> {
                String kind = rs.getString("sender_kind");
                return new SupportMessageItem((UUID) rs.getObject("message_id"), threadId,
                        "user".equals(kind) ? actor : null, kind, rs.getString("body"),
                        date(rs.getTimestamp("created_at")));
            }, actor, threadId);
            return new MessageListResponse(true, messages);
        } catch (Exception ex) {
            log.warn("[SupportService] listMessages fallback: {}", ex.getMessage());
            return new MessageListResponse(true, List.of());
        }
    }
}
