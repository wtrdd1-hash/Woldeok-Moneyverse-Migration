package com.moneyverse.api.domain.chat.service;

import com.moneyverse.api.domain.chat.dto.ChatDtos.*;
import com.moneyverse.api.domain.messaging.MessageContract;
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
    private final JdbcTemplate jdbcTemplate;

    public ChatService(JdbcTemplate jdbcTemplate) { this.jdbcTemplate = jdbcTemplate; }

    private static OffsetDateTime date(Timestamp timestamp) {
        return MessageContract.date(timestamp);
    }

    public ConversationListResponse listConversations(UUID actor, int limit) {
        MessageContract.actor(actor);
        try {
            int bounded = Math.min(100, Math.max(1, limit));
            List<ConversationItem> rows = jdbcTemplate.query("""
                SELECT conversation_id, peer_user_id, peer_display_name, last_message_body,
                       unread_count::text AS unread_count, last_message_at, created_at
                FROM public.private_chat_list_conversations(?::uuid, ?::integer)
                """, (rs, n) -> {
                Timestamp recent = rs.getTimestamp("last_message_at");
                if (recent == null) recent = rs.getTimestamp("created_at");
                UUID id=(UUID)rs.getObject("conversation_id"),peer=(UUID)rs.getObject("peer_user_id");
                String name=rs.getString("peer_display_name");
                if(id==null||peer==null||name==null||name.isBlank())throw MessageContract.unavailable();
                return new ConversationItem(id,peer,name,
                        rs.getString("last_message_body"), MessageContract.count(rs.getString("unread_count")), date(recent));
            }, actor, bounded);
            return new ConversationListResponse(true, rows, totalUnreadCount(actor));
        } catch (Exception ex) {
            throw MessageContract.failure(ex);
        }
    }

    public int totalUnreadCount(UUID actor) {
        MessageContract.actor(actor);
        try {
            String result = jdbcTemplate.queryForObject(
                    "SELECT public.private_chat_total_unread(?::uuid)::text", String.class, actor);
            if (result == null) throw new IllegalStateException("canonical unread count missing");
            return MessageContract.count(result);
        } catch (Exception ex) {
            throw MessageContract.failure(ex);
        }
    }

    public MessageListResponse listMessages(UUID actor, UUID conversationId, int limit) {
        MessageContract.actor(actor);
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
            List<ChatMessageItem> rows = jdbcTemplate.query(sql, (rs, n) -> {
                UUID id=(UUID)rs.getObject("id"),conversation=(UUID)rs.getObject("conversation_id"),sender=(UUID)rs.getObject("sender_id");
                String body=rs.getString("body");
                if(id==null||sender==null||!conversationId.equals(conversation)||body==null)throw MessageContract.unavailable();
                return new ChatMessageItem(id,conversation,sender,body,MessageContract.sequence(rs.getString("sequence")),
                    date(rs.getTimestamp("created_at")));
            },actor,conversationId,bounded);
            return new MessageListResponse(true, rows);
        } catch (Exception ex) {
            throw MessageContract.failure(ex);
        }
    }

    @Transactional
    public SendMessageResponse sendMessage(UUID actor,UUID conversationId,SendMessageRequest request) {
        MessageContract.actor(actor);
        if(conversationId==null||request==null)throw MessageContract.invalid("INVALID_CONVERSATION");
        UUID key=MessageContract.key(request.idempotencyKey());
        String body=MessageContract.text(request.body(),1000,true);
        try {
            Map<String,Object> row=jdbcTemplate.queryForMap(
                "SELECT message_id,sequence::text AS sequence,body,created_at FROM public.private_chat_send(?::uuid,?::uuid,?::uuid,?::text)",
                actor,conversationId,key,body);
            UUID id=MessageContract.receiptId(row,"message_id");
            if(!(row.get("sequence") instanceof String raw)||!body.equals(row.get("body")))throw MessageContract.unavailable();
            String sequence=MessageContract.sequence(raw);
            return new SendMessageResponse(true,new ChatMessageItem(id,conversationId,actor,body,sequence,
                MessageContract.receiptDate(row)));
        } catch(Exception error) { throw MessageContract.failure(error); }
    }
}
