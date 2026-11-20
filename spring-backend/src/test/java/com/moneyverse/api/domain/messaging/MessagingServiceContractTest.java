package com.moneyverse.api.domain.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.support.service.SupportService;
import com.moneyverse.api.domain.support.dto.SupportDtos.NewThreadRequest;
import com.moneyverse.api.domain.chat.service.ChatService;
import com.moneyverse.api.domain.chat.dto.ChatDtos.SendMessageRequest;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.web.server.ResponseStatusException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class MessagingServiceContractTest {
    final JdbcTemplate jdbc=mock(JdbcTemplate.class);
    final SupportService support=new SupportService(jdbc);
    final ChatService chat=new ChatService(jdbc);
    final UUID actor=UUID.fromString("00000000-0000-0000-0000-000000000101");
    final UUID conversation=UUID.fromString("00000000-0000-0000-0000-000000000202");
    final UUID receipt=UUID.fromString("00000000-0000-0000-0000-000000000303");
    final String key="00000000-0000-0000-0000-000000000404";
    final Timestamp created=Timestamp.from(Instant.parse("2026-11-20T00:00:00Z"));
    void status(int status,Runnable action) {
        var error=assertThrows(ResponseStatusException.class,action::run);
        assertEquals(status,error.getStatusCode().value());
        assertFalse(error.getReason().contains("private-synthetic-content"));
    }
    void stubSupport() {
        when(jdbc.queryForMap(contains("public.support_create_thread"),eq(actor),eq(UUID.fromString(key)),anyString(),anyString()))
            .thenReturn(Map.of("thread_id",receipt,"status","open","created_at",created));
        when(jdbc.queryForMap(contains("FROM public.support_my_threads"),eq(actor),eq(receipt)))
            .thenReturn(Map.of("thread_id",receipt,"subject","QA","status","open","created_at",created,"updated_at",created,"last_message_at",created));
        when(jdbc.queryForMap(contains("FROM public.support_thread_messages"),eq(actor),eq(receipt)))
            .thenReturn(Map.of("message_id",receipt,"sender_kind","user","body","😀".repeat(1000),"created_at",created));
    }
    void stubChat(String body,String sequence) {
        when(jdbc.queryForMap(contains("public.private_chat_send"),eq(actor),eq(conversation),eq(UUID.fromString(key)),anyString()))
            .thenReturn(Map.of("message_id",receipt,"sequence",sequence,"body",body,"created_at",created));
    }
    @Test void supportNeverInventsAReplacementRetryKey() {
        for(String invalid:new String[]{"","not-a-uuid","1-1-1-1-1"," "+key})
            status(400,()->support.createThread(actor,new NewThreadRequest(invalid,"QA","Synthetic")));
        verifyNoInteractions(jdbc);
    }
    @Test void chatNeverInventsAReplacementRetryKey() {
        for(String invalid:new String[]{"","not-a-uuid","1-1-1-1-1"," "+key})
            status(400,()->chat.sendMessage(actor,conversation,new SendMessageRequest("Synthetic",invalid)));
        verifyNoInteractions(jdbc);
    }
    @Test void supportRejectsBlankOversizeAndMalformedUnicodeBeforeSql() {
        for(String body:new String[]{""," ","a".repeat(1001),"\u0000","\uD800"})
            status(400,()->support.createThread(actor,new NewThreadRequest(key,"QA",body)));
        status(400,()->support.createThread(actor,new NewThreadRequest(key,"","Synthetic")));
        status(400,()->support.createThread(actor,new NewThreadRequest(key,"x".repeat(121),"Synthetic")));
        verifyNoInteractions(jdbc);
    }
    @Test void chatRejectsBlankOversizeAndExistingDatabaseControlRestrictionBeforeSql() {
        for(String body:new String[]{""," ","a".repeat(1001),"\n","hello\nworld","\u0000","\uD800"})
            status(400,()->chat.sendMessage(actor,conversation,new SendMessageRequest(body,key)));
        verifyNoInteractions(jdbc);
    }
    @Test void supportAcceptsExactly1000CodePointsWithoutTruncatingOrChangingRetryKey() {
        String body="😀".repeat(1000);stubSupport();
        var result=support.createThread(actor,new NewThreadRequest(key,"QA",body));
        assertTrue(result.ok());assertEquals("QA",result.thread().subject());
        assertEquals(receipt,result.thread().id());assertEquals(actor,result.thread().userId());
        verify(jdbc).queryForMap(contains("public.support_create_thread"),eq(actor),eq(UUID.fromString(key)),eq("QA"),eq(body));
    }
    @Test void supportReplayCannotLabelAnOldThreadWithADifferentRequestedSubjectOrBody() {
        stubSupport();
        status(409,()->support.createThread(actor,new NewThreadRequest(key,"Different subject","Synthetic")));
        status(409,()->support.createThread(actor,new NewThreadRequest(key,"QA","Different body")));
    }
    @Test void chatPreservesLargeSequenceAsExactJsonTextAndCanonicalReceipt() {
        String body="😀".repeat(1000);stubChat(body,"9223372036854775807");
        var result=chat.sendMessage(actor,conversation,new SendMessageRequest(body,key));
        assertTrue(result.ok());assertEquals(body,result.message().body());
        assertEquals(actor,result.message().senderUserId());assertEquals(conversation,result.message().conversationId());
        var sequence=new ObjectMapper().findAndRegisterModules().valueToTree(result).at("/message/sequence");
        assertTrue(sequence.isTextual());assertEquals("9223372036854775807",sequence.textValue());
        verify(jdbc).queryForMap(contains("public.private_chat_send"),eq(actor),eq(conversation),eq(UUID.fromString(key)),eq(body));
    }
    @Test void supportRequiresCompleteCanonicalCreationReceipt() {
        when(jdbc.queryForMap(anyString(),eq(actor),any(),anyString(),anyString())).thenReturn(Map.of());
        status(503,()->support.createThread(actor,new NewThreadRequest(key,"QA","Synthetic")));
    }
    @Test void chatRequiresMatchingBodyAndCompleteCanonicalReceipt() {
        stubChat("Different","1");
        status(503,()->chat.sendMessage(actor,conversation,new SendMessageRequest("Synthetic",key)));
        stubChat("Synthetic","0");
        status(503,()->chat.sendMessage(actor,conversation,new SendMessageRequest("Synthetic",key)));
        stubChat("Synthetic","9223372036854775808");
        status(503,()->chat.sendMessage(actor,conversation,new SendMessageRequest("Synthetic",key)));
        when(jdbc.queryForMap(anyString(),eq(actor),eq(conversation),any(),anyString())).thenReturn(Map.of());
        status(503,()->chat.sendMessage(actor,conversation,new SendMessageRequest("Synthetic",key)));
    }
    @Test void unavailableSupportHistoryNeverBecomesSuccessfulEmptyHistory() {
        when(jdbc.query(anyString(),any(RowMapper.class),eq(actor),eq(conversation)))
            .thenThrow(new DataAccessResourceFailureException("private-synthetic-content"));
        status(503,()->support.listMessages(actor,conversation));
    }
    @Test void unavailableChatHistoryNeverBecomesSuccessfulEmptyHistory() {
        when(jdbc.queryForObject(contains("pg_proc"),eq(Boolean.class))).thenReturn(false);
        when(jdbc.query(anyString(),any(RowMapper.class),eq(actor),eq(conversation),anyInt()))
            .thenThrow(new DataAccessResourceFailureException("private-synthetic-content"));
        status(503,()->chat.listMessages(actor,conversation,50));
    }
    @Test void deliberateOwnerRefusalAndMissingPrivilegeRemainDistinct() {
        when(jdbc.query(anyString(),any(RowMapper.class),eq(actor),eq(conversation)))
            .thenThrow(new DataAccessResourceFailureException("private-synthetic-content",
                new SQLException("thread owner required","42501")));
        status(403,()->support.listMessages(actor,conversation));
        when(jdbc.query(anyString(),any(RowMapper.class),eq(actor),eq(conversation)))
            .thenThrow(new DataAccessResourceFailureException("private-synthetic-content",
                new SQLException("permission denied for function support_thread_messages","42501")));
        status(503,()->support.listMessages(actor,conversation));
    }
    @Test void malformedOrOverflowUnreadCountDoesNotFabricateZeroOrClamp() {
        for(String raw:new String[]{"bad","01","-1","2147483648"}) {
            when(jdbc.queryForObject(contains("private_chat_total_unread"),eq(String.class),eq(actor))).thenReturn(raw);
            status(503,()->chat.totalUnreadCount(actor));
        }
        when(jdbc.queryForObject(contains("private_chat_total_unread"),eq(String.class),eq(actor))).thenReturn("0");
        assertEquals(0,chat.totalUnreadCount(actor));
    }
    @Test void wrongConversationInCanonicalHistoryIsNotReturnedToTheMember() throws Exception {
        when(jdbc.queryForObject(contains("pg_proc"),eq(Boolean.class))).thenReturn(false);
        var rs=mock(java.sql.ResultSet.class);
        when(rs.getObject("id")).thenReturn(receipt);
        when(rs.getObject("conversation_id")).thenReturn(UUID.fromString(key));
        when(rs.getObject("sender_id")).thenReturn(actor);
        when(rs.getString("body")).thenReturn("Synthetic");
        when(rs.getString("sequence")).thenReturn("9223372036854775807");
        when(rs.getTimestamp("created_at")).thenReturn(created);
        when(jdbc.query(anyString(),any(RowMapper.class),eq(actor),eq(conversation),eq(50))).thenAnswer(call->{
            RowMapper<?> mapper=call.getArgument(1);return java.util.List.of(mapper.mapRow(rs,0));
        });
        status(503,()->chat.listMessages(actor,conversation,50));
    }
    @Test void incompleteConversationIdentityCannotBePresentedAsVerifiedPeer() throws Exception {
        var rs=mock(java.sql.ResultSet.class);
        when(rs.getObject("conversation_id")).thenReturn(conversation);
        when(rs.getString("unread_count")).thenReturn("0");
        when(rs.getTimestamp("created_at")).thenReturn(created);
        when(jdbc.query(contains("private_chat_list_conversations"),any(RowMapper.class),eq(actor),eq(50))).thenAnswer(call->{
            RowMapper<?> mapper=call.getArgument(1);return java.util.List.of(mapper.mapRow(rs,0));
        });
        when(jdbc.queryForObject(contains("private_chat_total_unread"),eq(String.class),eq(actor))).thenReturn("0");
        status(503,()->chat.listConversations(actor,50));
    }
    @Test void knownSendRefusalsUseSafeStatusAndKeepCanonicalFunctionBoundary() {
        when(jdbc.queryForMap(anyString(),eq(actor),eq(conversation),any(),anyString()))
            .thenThrow(new DataAccessResourceFailureException("private-synthetic-content",new SQLException("idempotency conflict","22023")));
        status(409,()->chat.sendMessage(actor,conversation,new SendMessageRequest("Synthetic",key)));
    }
}
