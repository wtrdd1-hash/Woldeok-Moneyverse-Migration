package com.moneyverse.api.domain.chat.service;

import com.moneyverse.api.domain.chat.dto.ChatDtos.*;
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

/** Real owner-only chat read models; never fabricate peer names, unread counts or sends. */
@Service
public class ChatService {
    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    private final JdbcTemplate jdbcTemplate;

    public ChatService(JdbcTemplate jdbcTemplate) { this.jdbcTemplate = jdbcTemplate; }

    private static int count(String raw) {
        if (raw == null || !raw.matches("[0-9]{1,10}"))
            throw new IllegalStateException("Chat count source is invalid");
        long value = Long.parseLong(raw);
        if (value > Integer.MAX_VALUE) throw new IllegalStateException("Chat count exceeds wire range");
        return (int) value;
    }

    private static long sequence(String raw) {
        if (raw == null || !raw.matches("[0-9]{1,19}"))
            throw new IllegalStateException("Chat sequence source is invalid");
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
            log.warn("[ChatService] owner conversation read unavailable");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Owner chat conversations unavailable");
        }
    }

    public int totalUnreadCount(UUID actor) {
        try {
            // Test DB returns bigint, Prod DB returns text: explicit cast normalizes wire truth.
            String result = jdbcTemplate.queryForObject(
                    "SELECT public.private_chat_total_unread(?::uuid)::text", String.class, actor);
            return count(result);
        } catch (Exception ex) {
            log.warn("[ChatService] owner unread receipt unavailable");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Owner unread chat count unavailable");
        }
    }

    public MessageListResponse listMessages(UUID actor, UUID conversationId, int limit) {
        try {
            int bounded = Math.min(100, Math.max(1, limit));
            // The authoritative production PostgreSQL function takes 5 arguments;
            // isolated Test still has an older 4-argument owner function. Inspect actual
            // catalog signature rather than guessing and swallowing schema errors.
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
            log.warn("[ChatService] owner conversation messages unavailable");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Owner conversation messages unavailable");
        }
    }

    @Transactional
    public SendMessageResponse sendMessage(UUID actor, UUID conversationId, SendMessageRequest req) {
        // Keep sends disabled until a canonical owner, idempotency and persisted receipt
        // integration test can prove every accepted message was actually committed.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Private chat write receipt not verified");
    }
}
