package com.moneyverse.api.domain.support.service;

import com.moneyverse.api.domain.support.dto.SupportDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
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
        // SECURITY DEFINER function verifies ownership and restricts row selection;
        // do not query support_threads directly under the application role.
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
            log.warn("[SupportService] canonical owner thread source unavailable");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Support owner read model unavailable");
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
            log.warn("[SupportService] canonical owner summary unavailable");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Support owner summary unavailable");
        }
    }

    @Transactional
    public ThreadCreateResponse createThread(UUID actor, NewThreadRequest req) {
        // Do not revive direct table INSERT or invent an idempotent receipt.
        // Requires a reviewed support_create_thread function transaction and QA first.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Support write receipt not verified");
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
            log.warn("[SupportService] verified owner thread messages unavailable");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Support thread messages unavailable");
        }
    }
}
