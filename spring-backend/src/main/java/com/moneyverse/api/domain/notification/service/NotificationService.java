package com.moneyverse.api.domain.notification.service;

import com.moneyverse.api.domain.notification.dto.NotificationDtos.*;
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

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final JdbcTemplate jdbcTemplate;

    public NotificationService(JdbcTemplate jdbcTemplate) { this.jdbcTemplate = jdbcTemplate; }

    private static ResponseStatusException unavailable(String source) {
        log.warn("Notification canonical source unavailable: {}", source);
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "NOTIFICATION_SOURCE_UNAVAILABLE");
    }

    @Transactional(readOnly = true)
    public NotificationListResponse listNotifications(UUID userId, int limit, Boolean unreadOnly) {
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "SESSION_REQUIRED");
        int sanitizedLimit = Math.max(1, Math.min(limit, 100));
        try {
            List<NotificationItem> list = jdbcTemplate.query(
                    "SELECT id, user_id, category, title, body, link, dedupe_key, is_read, read_at, created_at " +
                    "FROM public.member_notifications_list(?::uuid, ?::int, ?::boolean)",
                    (rs, rowNum) -> {
                        UUID id = (UUID) rs.getObject("id");
                        UUID owner = (UUID) rs.getObject("user_id");
                        Timestamp created = rs.getTimestamp("created_at");
                        if (created == null || !userId.equals(owner)) {
                            throw new IllegalStateException("NOTIFICATION_OWNER_OR_TIME_MISSING");
                        }
                        Timestamp readAt = rs.getTimestamp("read_at");
                        return new NotificationItem(id, owner, rs.getString("category"),
                                rs.getString("title"), rs.getString("body"), rs.getString("link"),
                                rs.getString("dedupe_key"), rs.getBoolean("is_read"),
                                readAt == null ? null : readAt.toInstant().atOffset(ZoneOffset.UTC),
                                created.toInstant().atOffset(ZoneOffset.UTC));
                    }, userId, sanitizedLimit, Boolean.TRUE.equals(unreadOnly));
            Integer total = jdbcTemplate.queryForObject(
                    "SELECT public.member_notifications_total_count(?::uuid)", Integer.class, userId);
            int unread = unreadCount(userId);
            if (total == null || total < list.size()) throw unavailable("notification_total_count_unknown");
            return new NotificationListResponse(true, list, total, unread);
        } catch (Exception e) {
            throw unavailable("notification_list");
        }
    }

    @Transactional(readOnly = true)
    public int unreadCount(UUID userId) {
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "SESSION_REQUIRED");
        try {
            Integer unread = jdbcTemplate.queryForObject(
                    "SELECT public.member_notifications_unread_count(?::uuid)", Integer.class, userId);
            if (unread == null || unread < 0) throw unavailable("unread_count_missing");
            return unread;
        } catch (Exception e) {
            throw unavailable("unread_count");
        }
    }

    @Transactional
    public MarkReadResponse markRead(UUID userId, UUID notificationId) {
        if (userId == null || notificationId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "NOTIFICATION_REQUEST_INVALID");
        }
        try {
            List<MarkReadResponse> rows = jdbcTemplate.query(
                    "SELECT id, is_read FROM public.member_notification_mark_read(?::uuid, ?::uuid)",
                    (rs, n) -> new MarkReadResponse(rs.getBoolean("is_read"),
                            (UUID)rs.getObject("id"), rs.getBoolean("is_read")),
                    userId, notificationId);
            return rows.isEmpty() ? new MarkReadResponse(false, notificationId, false) : rows.get(0);
        } catch (Exception e) {
            throw unavailable("mark_read");
        }
    }

    @Transactional
    public MarkAllReadReceiptResponse markAllReadWithReceipt(UUID userId) {
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "SESSION_REQUIRED");
        try {
            MarkAllReadReceiptResponse receipt = jdbcTemplate.queryForObject(
                    "SELECT updated_count, unread_count FROM public.member_notification_mark_all_read(?::uuid)",
                    (rs, n) -> new MarkAllReadReceiptResponse(true,
                            rs.getInt("updated_count"), rs.getInt("unread_count")), userId);
            if (receipt == null || receipt.markedCount() < 0 || receipt.remainingUnreadCount() < 0) {
                throw unavailable("mark_all_read_receipt_missing");
            }
            return receipt;
        } catch (Exception e) {
            throw unavailable("mark_all_read");
        }
    }
}
