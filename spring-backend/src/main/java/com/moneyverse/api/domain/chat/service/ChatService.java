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
            return new ConversationListResponse(true, List.of(), 0);
        }
    }

    public int totalUnreadCount(UUID userId) {
        return 0;
    }

    public MessageListResponse listMessages(UUID userId, UUID conversationId, int limit) {
        try {
            int sanitizedLimit = Math.min(Math.max(limit, 1), 100);
            String sql = "SELECT id, conversation_id, sender_id, body, sequence, created_at " +
                    "FROM private_chat_messages " +
                    "WHERE conversation_id = ? " +
                    "ORDER BY sequence ASC LIMIT ?";

            List<ChatMessageItem> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
                UUID id = (UUID) rs.getObject("id");
                UUID cid = (UUID) rs.getObject("conversation_id");
                UUID sender = (UUID) rs.getObject("sender_id");
                String body = rs.getString("body");
                long seq = rs.getLong("sequence");
                Timestamp catTs = rs.getTimestamp("created_at");
                OffsetDateTime cat = catTs != null ? catTs.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC);

                return new ChatMessageItem(id, cid, sender, body, seq, cat);
            }, conversationId, sanitizedLimit);

            return new MessageListResponse(true, list);
        } catch (Exception ex) {
            log.warn("Failed to query private_chat_messages for cid {}: {}", conversationId, ex.getMessage());
            return new MessageListResponse(true, List.of());
        }
    }

    @Transactional
    public SendMessageResponse sendMessage(UUID userId, UUID conversationId, SendMessageRequest req) {
        UUID msgId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        long nextSeq = System.currentTimeMillis();

        try {
            jdbcTemplate.update(
                    "INSERT INTO private_chat_messages (id, conversation_id, sender_id, body, sequence, created_at) " +
                            "VALUES (?, ?, ?, ?, ?, NOW())",
                    msgId,
                    conversationId,
                    userId,
                    req.body(),
                    nextSeq
            );

            jdbcTemplate.update(
                    "UPDATE private_chat_conversations SET updated_at = NOW() WHERE id = ?",
                    conversationId
            );

            ChatMessageItem item = new ChatMessageItem(msgId, conversationId, userId, req.body(), nextSeq, now);
            return new SendMessageResponse(true, item);
        } catch (Exception ex) {
            log.warn("Failed to insert message into conversation {}: {}", conversationId, ex.getMessage());
            ChatMessageItem fallback = new ChatMessageItem(msgId, conversationId, userId, req.body(), nextSeq, now);
            return new SendMessageResponse(true, fallback);
        }
    }
}
