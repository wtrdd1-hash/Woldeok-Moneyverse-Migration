package com.moneyverse.api.domain.chat.service;

import com.moneyverse.api.domain.chat.dto.ChatDtos.*;
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
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    private final JdbcTemplate jdbcTemplate;

    public ChatService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public ConversationListResponse listConversations(UUID userId, int limit) {
        try {
            int sanitizedLimit = Math.min(Math.max(limit, 1), 100);
            String sql = "SELECT c.id, c.user1_id, c.user2_id, c.updated_at " +
                    "FROM private_chat_conversations c " +
                    "WHERE c.user1_id = ? OR c.user2_id = ? " +
                    "ORDER BY c.updated_at DESC LIMIT ?";

            List<ConversationItem> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
                UUID cid = (UUID) rs.getObject("id");
                UUID u1 = (UUID) rs.getObject("user1_id");
                UUID u2 = (UUID) rs.getObject("user2_id");
                UUID peer = userId.equals(u1) ? u2 : u1;
                Timestamp uatTs = rs.getTimestamp("updated_at");
                OffsetDateTime uat = uatTs != null ? uatTs.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC);

                return new ConversationItem(cid, peer, "회원", "최근 메시지", 0, uat);
            }, userId, userId, sanitizedLimit);

            return new ConversationListResponse(true, list, totalUnreadCount(userId));
        } catch (Exception ex) {
            log.warn("Failed to query private_chat_conversations for user {}: {}", userId, ex.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Private chat source unavailable");
        }
    }

    public int totalUnreadCount(UUID userId) {
        // No verified unread receipt read model exists yet: never invent zero unread.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Unread chat count unverified");
    }

    public MessageListResponse listMessages(UUID userId, UUID conversationId, int limit) {
        try {
            int sanitizedLimit = Math.min(Math.max(limit, 1), 100);
            String sql = "SELECT m.id, m.conversation_id, m.sender_id, m.body, m.sequence, m.created_at " +
                    "FROM private_chat_messages m " +
                    "JOIN private_chat_conversations c ON c.id = m.conversation_id " +
                    "WHERE m.conversation_id = ? AND (c.user1_id = ? OR c.user2_id = ?) " +
                    "ORDER BY m.sequence ASC LIMIT ?";

            List<ChatMessageItem> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
                UUID id = (UUID) rs.getObject("id");
                UUID cid = (UUID) rs.getObject("conversation_id");
                UUID sender = (UUID) rs.getObject("sender_id");
                String body = rs.getString("body");
                long seq = rs.getLong("sequence");
                Timestamp catTs = rs.getTimestamp("created_at");
                OffsetDateTime cat = catTs != null ? catTs.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC);

                return new ChatMessageItem(id, cid, sender, body, seq, cat);
            }, conversationId, userId, userId, sanitizedLimit);

            return new MessageListResponse(true, list);
        } catch (Exception ex) {
            log.warn("Failed to query private_chat_messages for cid {}: {}", conversationId, ex.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Private chat source unavailable");
        }
    }

    @Transactional
    public SendMessageResponse sendMessage(UUID userId, UUID conversationId, SendMessageRequest req) {
        // Authorization alone is insufficient: canonical owner-scoped writer, idempotency and
        // persisted message receipt must be verified before resuming user-facing send.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Private chat write receipt unverified");
    }
}
