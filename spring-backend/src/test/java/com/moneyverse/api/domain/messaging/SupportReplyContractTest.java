package com.moneyverse.api.domain.messaging;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.support.controller.SupportController;
import com.moneyverse.api.domain.support.service.SupportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class SupportReplyContractTest {
    final JdbcTemplate jdbc=mock(JdbcTemplate.class);
    final UserAuthService auth=mock(UserAuthService.class);
    final UUID actor=UUID.fromString("00000000-0000-0000-0000-000000000101");
    final UUID thread=UUID.fromString("00000000-0000-0000-0000-000000000202");
    final UUID message=UUID.fromString("00000000-0000-0000-0000-000000000303");
    final String key="00000000-0000-0000-0000-000000000404";
    final Timestamp created=Timestamp.from(Instant.parse("2026-11-20T00:00:00Z"));
    final String path="/api/v1/support/threads/"+thread+"/messages";
    final MockMvc mvc=MockMvcBuilders.standaloneSetup(
        new SupportController(new SupportService(jdbc),new MemberApiGuard(auth))).build();
    @BeforeEach void signIn() {
        var session=new UserAuthService.SessionInfo();session.setUserId(actor);
        session.setCsrfHash(UserAuthService.sha256("synthetic-proof"));
        when(auth.resolveSession(any())).thenReturn(Optional.of(session));
    }
    String json(String key,String body) {
        return "{\"idempotencyKey\":\""+key+"\",\"body\":\""+body+"\"}";
    }
    void receipt(String body) {
        var row=Map.<String,Object>of("message_id",message,"sender_kind","user","body",body,"created_at",created);
        when(jdbc.queryForMap(contains("public.support_add_message"),eq(actor),eq(UUID.fromString(key)),eq(thread),eq("Synthetic"))).thenReturn(row);
        when(jdbc.queryForMap(contains("public.support_my_message_receipt"),eq(actor),eq(thread),eq(message))).thenReturn(row);
    }
    @Test void memberReplyRequiresExactOwnerReceiptAndPreservesTheCallerKey() throws Exception {
        receipt("Synthetic");
        mvc.perform(post(path).header("X-CSRF-Token","synthetic-proof").contentType(MediaType.APPLICATION_JSON)
            .content(json(key,"Synthetic"))).andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(true)).andExpect(jsonPath("$.message.id").value(message.toString()))
            .andExpect(jsonPath("$.message.threadId").value(thread.toString()))
            .andExpect(jsonPath("$.message.senderUserId").value(actor.toString()))
            .andExpect(jsonPath("$.message.body").value("Synthetic"));
        verify(jdbc).queryForMap(contains("public.support_add_message"),eq(actor),eq(UUID.fromString(key)),eq(thread),eq("Synthetic"));
        verify(jdbc).queryForMap(contains("public.support_my_message_receipt"),eq(actor),eq(thread),eq(message));
    }
    @Test void missingOrMismatchedReceiptNeverConfirmsReply() throws Exception {
        receipt("Different");
        mvc.perform(post(path).header("X-CSRF-Token","synthetic-proof").contentType(MediaType.APPLICATION_JSON)
            .content(json(key,"Synthetic"))).andExpect(status().isServiceUnavailable());
    }
    @Test void anonymousReplyNeverUsesIdentityHeaders() throws Exception {
        when(auth.resolveSession(any())).thenReturn(Optional.empty());
        mvc.perform(post(path).header("X-User-Id",actor.toString()).contentType(MediaType.APPLICATION_JSON)
            .content(json(key,"Synthetic"))).andExpect(status().isUnauthorized());
        verifyNoInteractions(jdbc);
    }
    @Test void absentOrWrongProofCannotReply() throws Exception {
        mvc.perform(post(path).header("X-CSRF-Token","wrong").contentType(MediaType.APPLICATION_JSON)
            .content(json(key,"Synthetic"))).andExpect(status().isForbidden());
        verifyNoInteractions(jdbc);
    }
    @Test void missingKeyAndOversizeBodyFailBeforeSql() throws Exception {
        for(String value:new String[]{json("","Synthetic"),json(key,"x".repeat(1001))})
            mvc.perform(post(path).header("X-CSRF-Token","synthetic-proof").contentType(MediaType.APPLICATION_JSON)
                .content(value)).andExpect(status().isBadRequest());
        verifyNoInteractions(jdbc);
    }
    @Test void optionalHeaderCannotSilentlyOverrideBodyKey() throws Exception {
        mvc.perform(post(path).header("X-CSRF-Token","synthetic-proof").header("Idempotency-Key",message.toString())
            .contentType(MediaType.APPLICATION_JSON).content(json(key,"Synthetic"))).andExpect(status().isBadRequest());
        verifyNoInteractions(jdbc);
    }
}
