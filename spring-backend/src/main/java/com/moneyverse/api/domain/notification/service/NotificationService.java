package com.moneyverse.api.domain.notification.service;

import com.moneyverse.api.domain.notification.dto.NotificationDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
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
                OffsetDateTime createdAt = createdAtTs != null ? createdAtTs.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC);

                return new NotificationItem(id, uid, category, title, body, link, dedupeKey, isRead, readAt, createdAt);
            }, params);

            int unread = unreadCount(userId);
            return new NotificationListResponse(true, list, list.size(), unread);
        } catch (Exception ex) {
            log.warn("Failed to query in_app_notifications for user {}: {}", userId, ex.getMessage());
            return new NotificationListResponse(true, List.of(), 0, 0);
        }
    }

    public int unreadCount(UUID userId) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM in_app_notifications WHERE user_id = ? AND is_read = false",
                    Integer.class,
                    userId
            );
            return count != null ? count : 0;
        } catch (Exception ex) {
            log.warn("Failed to query unread count for user {}: {}", userId, ex.getMessage());
            return 0;
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
            log.warn("Failed to mark notification {} read for user {}: {}", notificationId, userId, ex.getMessage());
            return new MarkReadResponse(false, notificationId, false);
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
            log.warn("Failed to mark all notifications read for user {}: {}", userId, ex.getMessage());
            return new MarkAllReadReceiptResponse(true, 0, 0);
        }
    }
}
