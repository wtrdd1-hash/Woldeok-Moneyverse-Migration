package com.moneyverse.api.domain.support.service;

import com.moneyverse.api.domain.support.dto.SupportDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class SupportService {

    private static final Logger log = LoggerFactory.getLogger(SupportService.class);
    private final JdbcTemplate jdbcTemplate;

    public SupportService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public ThreadListResponse listThreads(UUID userId, String status) {
        try {
            String sql;
            Object[] params;

            if (status != null && !status.isBlank()) {
                sql = "SELECT id, user_id, subject, status, created_at, updated_at, last_message_at " +
                        "FROM support_threads WHERE user_id = ? AND status = ? " +
                        "ORDER BY last_message_at DESC LIMIT 50";
                params = new Object[]{userId, status.trim()};
            } else {
                sql = "SELECT id, user_id, subject, status, created_at, updated_at, last_message_at " +
                        "FROM support_threads WHERE user_id = ? " +
                        "ORDER BY last_message_at DESC LIMIT 50";
                params = new Object[]{userId};
            }

            List<SupportThreadItem> threads = jdbcTemplate.query(sql, (rs, rowNum) -> {
                UUID id = (UUID) rs.getObject("id");
                UUID uid = (UUID) rs.getObject("user_id");
                String subj = rs.getString("subject");
                String st = rs.getString("status");
                Timestamp catTs = rs.getTimestamp("created_at");
                OffsetDateTime cat = catTs != null ? catTs.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC);
                Timestamp uatTs = rs.getTimestamp("updated_at");
                OffsetDateTime uat = uatTs != null ? uatTs.toInstant().atOffset(ZoneOffset.UTC) : cat;
                Timestamp lmatTs = rs.getTimestamp("last_message_at");
                OffsetDateTime lmat = lmatTs != null ? lmatTs.toInstant().atOffset(ZoneOffset.UTC) : cat;

                return new SupportThreadItem(id, uid, subj, st, cat, uat, lmat);
            }, params);

            return new ThreadListResponse(true, threads, threads.size());
        } catch (Exception ex) {
            log.warn("Failed to query support_threads for user {}: {}", userId, ex.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Support source unavailable");
        }
    }

    public ThreadSummaryResponse summary(UUID userId) {
        try {
            Integer total = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM support_threads WHERE user_id = ?",
                    Integer.class,
                    userId
            );
            Integer open = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM support_threads WHERE user_id = ? AND status = 'open'",
                    Integer.class,
                    userId
            );
            Integer waiting = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM support_threads WHERE user_id = ? AND status = 'waiting_user'",
                    Integer.class,
                    userId
            );
            Integer resolved = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM support_threads WHERE user_id = ? AND status = 'resolved'",
                    Integer.class,
                    userId
            );

            return new ThreadSummaryResponse(
                    true,
                    total != null ? total : 0,
                    open != null ? open : 0,
                    waiting != null ? waiting : 0,
                    resolved != null ? resolved : 0
            );
        } catch (Exception ex) {
            log.warn("Failed to query support summary for user {}: {}", userId, ex.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Support source unavailable");
        }
    }

    @Transactional
    public ThreadCreateResponse createThread(UUID userId, NewThreadRequest req) {
        UUID threadId = UUID.randomUUID();
        UUID createKey = UUID.randomUUID();
        if (req.idempotencyKey() != null && !req.idempotencyKey().isBlank()) {
            try {
                createKey = UUID.fromString(req.idempotencyKey().trim());
            } catch (Exception ignored) {}
        }

        try {
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            jdbcTemplate.update(
                    "INSERT INTO support_threads (id, user_id, subject, status, create_key, created_at, updated_at, last_message_at) " +
                            "VALUES (?, ?, ?, 'open', ?, NOW(), NOW(), NOW())",
                    threadId,
                    userId,
                    req.subject() != null ? req.subject() : "고객 문의",
                    createKey
            );

            if (req.body() != null && !req.body().isBlank()) {
                UUID msgId = UUID.randomUUID();
                jdbcTemplate.update(
                        "INSERT INTO support_messages (id, thread_id, sender_user_id, sender_kind, body, idempotency_key, created_at) " +
                                "VALUES (?, ?, ?, 'user', ?, ?, NOW())",
                        msgId,
                        threadId,
                        userId,
                        req.body(),
                        createKey
                );
            }

            SupportThreadItem item = new SupportThreadItem(threadId, userId, req.subject(), "open", now, now, now);
            return new ThreadCreateResponse(true, item);
        } catch (Exception ex) {
            log.warn("Failed to create support thread for user {}: {}", userId, ex.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Support persistence unavailable");
        }
    }

    public MessageListResponse listMessages(UUID userId, UUID threadId) {
        try {
            String sql = "SELECT m.id, m.thread_id, m.sender_user_id, m.sender_kind, m.body, m.created_at " +
                    "FROM support_messages m " +
                    "JOIN support_threads t ON m.thread_id = t.id " +
                    "WHERE t.id = ? AND t.user_id = ? " +
                    "ORDER BY m.created_at ASC";

            List<SupportMessageItem> messages = jdbcTemplate.query(sql, (rs, rowNum) -> {
                UUID id = (UUID) rs.getObject("id");
                UUID tid = (UUID) rs.getObject("thread_id");
                UUID senderUid = (UUID) rs.getObject("sender_user_id");
                String kind = rs.getString("sender_kind");
                String body = rs.getString("body");
                Timestamp catTs = rs.getTimestamp("created_at");
                OffsetDateTime cat = catTs != null ? catTs.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC);

                return new SupportMessageItem(id, tid, senderUid, kind, body, cat);
            }, threadId, userId);

            return new MessageListResponse(true, messages);
        } catch (Exception ex) {
            log.warn("Failed to query messages for thread {}: {}", threadId, ex.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Support source unavailable");
        }
    }
}
