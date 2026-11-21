package com.moneyverse.api.domain.messaging;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.support.service.SupportService;
import com.moneyverse.api.domain.support.dto.SupportDtos.*;
import com.moneyverse.api.domain.chat.service.ChatService;
import com.moneyverse.api.domain.chat.dto.ChatDtos.ConversationListResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
// Exercise controller security independently; the production boundary filter is unchanged.
@AutoConfigureMockMvc(addFilters=false)
@ActiveProfiles("test")
class MessagingHttpBoundaryTest {
    @Autowired MockMvc mvc;
    @MockBean UserAuthService auth;
    @MockBean SupportService support;
    @MockBean ChatService chat;
    final UUID owner=UUID.fromString("00000000-0000-0000-0000-000000000101");
    final String id="00000000-0000-0000-0000-000000000202";
    final String key="00000000-0000-0000-0000-000000000303";
    final String forged="00000000-0000-0000-0000-000000000999";
    @BeforeEach void anonymous() { when(auth.resolveSession(any())).thenReturn(Optional.empty()); }
    void signIn() {
        var session=new UserAuthService.SessionInfo();session.setUserId(owner);
        session.setCsrfHash(UserAuthService.sha256("synthetic-messaging-proof"));
        when(auth.resolveSession(any())).thenReturn(Optional.of(session));
    }
    @Test void privateSupportReadsRejectForgedHeadersOnBothAliases() throws Exception {
        for(String prefix:List.of("/api/support","/api/v1/support"))
            for(String suffix:List.of("/threads","/threads/summary","/threads/"+id+"/messages"))
                mvc.perform(get(prefix+suffix).header("X-User-Id",forged).header("x-actor-user-id",forged))
                    .andExpect(status().isUnauthorized());
        verifyNoInteractions(support);
    }
    @Test void privateChatReadsRejectForgedHeadersOnBothAliases() throws Exception {
        for(String prefix:List.of("/api/chat","/api/v1/chat"))
            for(String suffix:List.of("/conversations","/unread-count","/conversations/"+id+"/messages"))
                mvc.perform(get(prefix+suffix).header("X-User-Id",forged)).andExpect(status().isUnauthorized());
        verifyNoInteractions(chat);
    }
    @Test void anonymousWritesCannotBecomeTheFixedFallbackActor() throws Exception {
        for(String prefix:List.of("/api/support","/api/v1/support"))
            mvc.perform(post(prefix+"/threads").header("X-User-Id",forged).contentType(MediaType.APPLICATION_JSON)
                .content("{\"idempotencyKey\":\""+key+"\",\"subject\":\"QA\",\"body\":\"Synthetic\"}"))
                .andExpect(status().isUnauthorized());
        for(String prefix:List.of("/api/chat","/api/v1/chat"))
            mvc.perform(post(prefix+"/conversations/"+id+"/messages").header("X-User-Id",forged)
                .contentType(MediaType.APPLICATION_JSON).content("{\"idempotencyKey\":\""+key+"\",\"body\":\"Synthetic\"}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(support,chat);
    }
    @Test void authenticatedReadsIgnoreCallerIdentityHeaders() throws Exception {
        signIn();
        when(support.listThreads(owner,null)).thenReturn(new ThreadListResponse(true,List.of(),0));
        when(chat.listConversations(owner,50)).thenReturn(new ConversationListResponse(true,List.of(),0));
        mvc.perform(get("/api/v1/support/threads").header("X-User-Id",forged))
            .andExpect(status().isOk()).andExpect(jsonPath("$.ok").value(true));
        mvc.perform(get("/api/v1/chat/conversations").header("x-actor-user-id",forged))
            .andExpect(status().isOk()).andExpect(jsonPath("$.ok").value(true));
        verify(support).listThreads(owner,null);verify(chat).listConversations(owner,50);
        verifyNoMoreInteractions(support,chat);
    }
    @Test void authenticatedWritesRequireMatchingSessionProof() throws Exception {
        signIn();
        for(String proof:List.of("","wrong-proof")) {
            mvc.perform(post("/api/v1/support/threads").header("X-CSRF-Token",proof)
                .contentType(MediaType.APPLICATION_JSON).content("{\"idempotencyKey\":\""+key+"\",\"subject\":\"QA\",\"body\":\"Synthetic\"}"))
                .andExpect(status().isForbidden());
            mvc.perform(post("/api/v1/chat/conversations/"+id+"/messages").header("X-CSRF-Token",proof)
                .contentType(MediaType.APPLICATION_JSON).content("{\"idempotencyKey\":\""+key+"\",\"body\":\"Synthetic\"}"))
                .andExpect(status().isForbidden());
        }
        verifyNoInteractions(support,chat);
    }
    @Test void validProofUsesVerifiedActorAndPreservesCallerRetryKey() throws Exception {
        signIn();
        mvc.perform(post("/api/v1/support/threads").header("X-User-Id",forged)
            .header("X-CSRF-Token","synthetic-messaging-proof").contentType(MediaType.APPLICATION_JSON)
            .content("{\"idempotencyKey\":\""+key+"\",\"subject\":\"QA\",\"body\":\"Synthetic\"}"))
            .andExpect(status().isOk());
        verify(support).createThread(eq(owner),argThat(r->key.equals(r.idempotencyKey())&&"Synthetic".equals(r.body())));
        mvc.perform(post("/api/v1/chat/conversations/"+id+"/messages").header("X-User-Id",forged)
            .header("X-CSRF-Token","synthetic-messaging-proof").contentType(MediaType.APPLICATION_JSON)
            .content("{\"idempotencyKey\":\""+key+"\",\"body\":\"Synthetic\"}"))
            .andExpect(status().isOk());
        verify(chat).sendMessage(eq(owner),eq(UUID.fromString(id)),argThat(r->key.equals(r.idempotencyKey())&&"Synthetic".equals(r.body())));
    }
}
