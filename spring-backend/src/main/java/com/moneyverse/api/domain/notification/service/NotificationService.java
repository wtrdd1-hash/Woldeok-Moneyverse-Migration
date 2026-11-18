package com.moneyverse.api.domain.notification.service;

import com.moneyverse.api.domain.notification.dto.NotificationDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static ResponseStatusException unavailable(String source) {
        log.warn("Notification source unavailable: {}", source);
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "NOTIFICATION_SOURCE_UNAVAILABLE");
    }

    private final JdbcTemplate jdbcTemplate;

    public NotificationService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public NotificationListResponse listNotifications(UUID userId, int limit, Boolean unreadOnly) {
        try {
            int sanitizedLimit = Math.min(Math.max(limit, 1), 100);
            String sql;
            Object[] params;

            if (Boolean.TRUE.equals(unreadOnly)) {
                sql = "SELECT id, user_id, category, title, body, link, dedupe_key, is_read, read_at, created_at " +
                        "FROM in_app_notifications WHERE user_id = ? AND is_read = false " +
                        "ORDER BY created_at DESC LIMIT ?";
                params = new Object[]{userId, sanitizedLimit};
            } else {
                sql = "SELECT id, user_id, category, title, body, link, dedupe_key, is_read, read_at, created_at " +
                        "FROM in_app_notifications WHERE user_id = ? " +
                        "ORDER BY created_at DESC LIMIT ?";
                params = new Object[]{userId, sanitizedLimit};
            }

            List<NotificationItem> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
                UUID id = (UUID) rs.getObject("id");
                UUID uid = (UUID) rs.getObject("user_id");
                String category = rs.getString("category");
                String title = rs.getString("title");
                String body = rs.getString("body");
                String link = rs.getString("link");
                String dedupeKey = rs.getString("dedupe_key");
                boolean isRead = rs.getBoolean("is_read");
                Timestamp readAtTs = rs.getTimestamp("read_at");
                OffsetDateTime readAt = readAtTs != null ? readAtTs.toInstant().atOffset(ZoneOffset.UTC) : null;
                Timestamp createdAtTs = rs.getTimestamp("created_at");
                if (createdAtTs == null) throw new IllegalStateException("NOTIFICATION_CREATED_AT_MISSING");
                OffsetDateTime createdAt = createdAtTs.toInstant().atOffset(ZoneOffset.UTC);

                return new NotificationItem(id, uid, category, title, body, link, dedupeKey, isRead, readAt, createdAt);
            }, params);

            int unread = unreadCount(userId);
            return new NotificationListResponse(true, list, list.size(), unread);
        } catch (Exception ex) {
            throw unavailable("notification_list");
        }
    }

    public int unreadCount(UUID userId) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM in_app_notifications WHERE user_id = ? AND is_read = false",
                    Integer.class,
                    userId
            );
            if (count == null) throw unavailable("unread_count_null");
            return count;
        } catch (Exception ex) {
            throw unavailable("unread_count");
        }
    }

    @Transactional
    public MarkReadResponse markRead(UUID userId, UUID notificationId) {
        try {
            int updated = jdbcTemplate.update(
                    "UPDATE in_app_notifications SET is_read = true, read_at = NOW() WHERE id = ? AND user_id = ?",
                    notificationId,
                    userId
            );
            return new MarkReadResponse(updated > 0, notificationId, true);
        } catch (Exception ex) {
            throw unavailable("mark_read");
        }
    }

    @Transactional
    public MarkAllReadReceiptResponse markAllReadWithReceipt(UUID userId) {
        try {
            int updated = jdbcTemplate.update(
                    "UPDATE in_app_notifications SET is_read = true, read_at = NOW() WHERE user_id = ? AND is_read = false",
                    userId
            );
            return new MarkAllReadReceiptResponse(true, updated, 0);
        } catch (Exception ex) {
            throw unavailable("mark_all_read");
        }
    }
}
