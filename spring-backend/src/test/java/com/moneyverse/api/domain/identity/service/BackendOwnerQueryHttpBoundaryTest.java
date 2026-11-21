package com.moneyverse.api.domain.identity.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BackendOwnerQueryHttpBoundaryTest {
    @Autowired MockMvc mockMvc;

    @Test void privateReadsRejectAnonymousAndForgedHeaders() throws Exception {
        for (String path : new String[] {
                "/api/v1/work", "/api/v1/work/tasks", "/api/v1/work/assignments",
                "/api/v1/business/my", "/api/v1/stocks/portfolio",
                "/api/v1/stocks/watchlist", "/api/v1/stocks/history",
                "/api/v1/notifications", "/api/v1/notifications/unread-count" }) {
            mockMvc.perform(get(path).header("X-User-Id", "00000000-0000-0000-0000-000000000101"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Test void financialActionsRejectAnonymousActorHeader() throws Exception {
        mockMvc.perform(post("/api/v1/work/assignments")
                        .header("X-User-Id", "00000000-0000-0000-0000-000000000101")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"task_id\":\"00000000-0000-0000-0000-000000000202\"}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/v1/business/purchase")
                        .header("X-User-Id", "00000000-0000-0000-0000-000000000101")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type_id\":\"00000000-0000-0000-0000-000000000202\"}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/v1/notifications/read-all")
                        .header("X-User-Id", "00000000-0000-0000-0000-000000000101"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/v1/club/00000000-0000-0000-0000-000000000303/join")
                        .header("X-User-Id", "00000000-0000-0000-0000-000000000101"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/v1/stocks/00000000-0000-0000-0000-000000000303/orders")
                        .header("X-User-Id", "00000000-0000-0000-0000-000000000101")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"side\":\"buy\",\"quantity\":1,\"idempotency_key\":\"00000000-0000-0000-0000-000000000404\"}"))
                .andExpect(status().isUnauthorized());
    }
}
