package com.moneyverse.api.domain.board;

import com.moneyverse.api.domain.board.controller.BoardPostsController;
import com.moneyverse.api.domain.board.service.BoardPostsService;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Independent review (Gemini, 2026-11-25) claimed Spring MVC does not read a
 * DELETE body, so the idempotency key the Next BFF sends there would be lost.
 * This drives the real MVC stack to prove the key arrives.
 */
class BoardDeleteBodyHttpTest {
    @Test void deleteBodyCarriesTheIdempotencyKey() throws Exception {
        UUID actor = UUID.fromString("00000000-0000-4000-8000-000000000123");
        UUID post = UUID.fromString("11111111-1111-4111-8111-111111111111");
        String key = "6f1c1d36-8d0a-4a39-9d65-1a2b3c4d5e6f";
        MemberApiGuard guard = mock(MemberApiGuard.class);
        BoardPostsService board = mock(BoardPostsService.class);
        when(guard.verifiedMutationActor(any())).thenReturn(actor);
        when(guard.idempotencyKey(key)).thenReturn(UUID.fromString(key));
        when(board.delete(actor, post, UUID.fromString(key))).thenReturn(true);
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new BoardPostsController(board, guard)).build();
        mvc.perform(delete("/api/v1/board/posts/" + post).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"idempotencyKey\":\"" + key + "\"}"))
                .andExpect(status().isNoContent());
        verify(guard).idempotencyKey(key);
        verify(board).delete(actor, post, UUID.fromString(key));
    }
}
