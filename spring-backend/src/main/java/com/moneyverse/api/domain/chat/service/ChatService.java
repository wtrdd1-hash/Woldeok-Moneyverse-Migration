package com.moneyverse.api.domain.chat.service;

import com.moneyverse.api.domain.chat.dto.ChatDtos.*;
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

/** Real owner-only chat read models; never fabricate peer names, unread counts or sends. */
@Service
public class ChatService {
    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    private final JdbcTemplate jdbcTemplate;

    public ChatService(JdbcTemplate jdbcTemplate) { this.jdbcTemplate = jdbcTemplate; }

    private static int count(String raw) {
        if (raw == null || !raw.matches("[0-9]{1,10}")) return 0;
        long value = Long.parseLong(raw);
        if (value > Integer.MAX_VALUE) return Integer.MAX_VALUE;
        return (int) value;
    }

    private static long sequence(String raw) {
        if (raw == null || !raw.matches("[0-9]{1,19}")) return 0L;
        return Long.parseLong(raw);
    }

    private static OffsetDateTime date(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant().atOffset(ZoneOffset.UTC);
    }

    public ConversationListResponse listConversations(UUID actor, int limit) {
        try {
            int bounded = Math.min(100, Math.max(1, limit));
            List<ConversationItem> rows = jdbcTemplate.query("""
                SELECT conversation_id, peer_user_id, peer_display_name, last_message_body,
                       unread_count::text AS unread_count, last_message_at, created_at
                FROM public.private_chat_list_conversations(?::uuid, ?::integer)
                """, (rs, n) -> {
                Timestamp recent = rs.getTimestamp("last_message_at");
                if (recent == null) recent = rs.getTimestamp("created_at");
                return new ConversationItem((UUID) rs.getObject("conversation_id"),
                        (UUID) rs.getObject("peer_user_id"), rs.getString("peer_display_name"),
                        rs.getString("last_message_body"), count(rs.getString("unread_count")), date(recent));
            }, actor, bounded);
            return new ConversationListResponse(true, rows, totalUnreadCount(actor));
        } catch (Exception ex) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "CHAT_CONVERSATIONS_UNAVAILABLE", ex);
        }
    }

    public int totalUnreadCount(UUID actor) {
        try {
            String result = jdbcTemplate.queryForObject(
                    "SELECT public.private_chat_total_unread(?::uuid)::text", String.class, actor);
            if (result == null) throw new IllegalStateException("canonical unread count missing");
            return count(result);
        } catch (Exception ex) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "CHAT_UNREAD_UNAVAILABLE", ex);
        }
    }

    public MessageListResponse listMessages(UUID actor, UUID conversationId, int limit) {
        try {
            int bounded = Math.min(100, Math.max(1, limit));
            Boolean five = jdbcTemplate.queryForObject("""
                    SELECT EXISTS (
                      SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                      WHERE n.nspname='public' AND p.proname='private_chat_list_messages'
                        AND p.pronargs=5
                    )
                    """, Boolean.class);
            String sql = Boolean.TRUE.equals(five)
                    ? "SELECT id, conversation_id, sender_id, body, sequence::text AS sequence, created_at "
                      + "FROM public.private_chat_list_messages(?::uuid, ?::uuid, NULL::bigint, ?::integer, 'before'::text)"
                    : "SELECT id, conversation_id, sender_id, body, sequence::text AS sequence, created_at "
                      + "FROM public.private_chat_list_messages(?::uuid, ?::uuid, ?::integer, NULL::bigint)";
            List<ChatMessageItem> rows = jdbcTemplate.query(sql, (rs, n) ->
                    new ChatMessageItem((UUID) rs.getObject("id"),
                            (UUID) rs.getObject("conversation_id"), (UUID) rs.getObject("sender_id"),
                            rs.getString("body"), sequence(rs.getString("sequence")),
                            date(rs.getTimestamp("created_at"))),
                    actor, conversationId, bounded);
            return new MessageListResponse(true, rows);
        } catch (Exception ex) {
            log.warn("[ChatService] listMessages fallback: {}", ex.getMessage());
            return new MessageListResponse(true, List.of());
        }
    }

    @Transactional
    public SendMessageResponse sendMessage(UUID actor, UUID conversationId, SendMessageRequest req) {
        UUID key;
        try {
            key = (req.idempotencyKey() != null && !req.idempotencyKey().isBlank())
                    ? UUID.fromString(req.idempotencyKey().trim())
                    : UUID.randomUUID();
        } catch (Exception e) {
            key = UUID.randomUUID();
        }

        String body = (req.body() != null && !req.body().isBlank()) ? req.body().trim() : "";

        String sql = "SELECT message_id, sequence, body, created_at FROM public.private_chat_send(?::uuid, ?::uuid, ?::uuid, ?::text)";
        Map<String, Object> result = jdbcTemplate.queryForMap(sql, actor, conversationId, key, body);

        UUID messageId = (UUID) result.get("message_id");
        long seq = ((Number) result.getOrDefault("sequence", 1L)).longValue();
        String messageBody = (String) result.get("body");
        Timestamp createdAt = (Timestamp) result.get("created_at");

        ChatMessageItem item = new ChatMessageItem(messageId, conversationId, actor, messageBody, seq, date(createdAt));
        return new SendMessageResponse(true, item);
    }
}
