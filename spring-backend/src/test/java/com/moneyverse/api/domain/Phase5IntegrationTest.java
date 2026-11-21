package com.moneyverse.api.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class Phase5IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("알림은 사용자 헤더만으로 조회/읽음 처리할 수 없다")
    void testNotificationEndpoints() throws Exception {
        mockMvc.perform(get("/api/notifications")
                        .header("X-User-Id", "00000000-0000-0000-0000-000000000101"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/notifications/unread-count"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/notifications/read-all"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("고객 지원 스레드 및 요약은 위조 사용자 헤더만으로 읽을 수 없다")
    void testSupportEndpoints() throws Exception {
        mockMvc.perform(get("/api/support/threads")
                        .header("X-User-Id", "00000000-0000-0000-0000-000000000101"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/support/threads/summary")
                        .header("x-actor-user-id", "00000000-0000-0000-0000-000000000101"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("성장 단계 및 신용 등급은 위조 사용자 헤더만으로 조회 불가")
    void testProgressionEndpoints() throws Exception {
        for (String path : new String[] {"/api/progression", "/api/progression/credits", "/api/progression/early-game"}) {
            mockMvc.perform(get(path).header("X-User-Id", "00000000-0000-0000-0000-000000000101"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Test
    @DisplayName("활동 텔레메트리 수집 및 관리자 트래픽 통계 조회 테스트")
    void testActivityEndpoints() throws Exception {
        String payload = """
                {
                    "events": [
                        {
                            "type": "PAGE_VIEW",
                            "path": "/dashboard",
                            "targetLabel": "홈 화면 진입",
                            "dwellMs": 3500
                        }
                    ]
                }
                """;

        mockMvc.perform(post("/api/activity/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        mockMvc.perform(get("/api/admin/activity/traffic"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/admin/activity/logs"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("1:1 채팅 목록/읽지 않은 수는 위조 회원 ID 헤더로 노출되지 않는다")
    void testChatEndpoints() throws Exception {
        mockMvc.perform(get("/api/chat/conversations")
                        .header("X-User-Id", "00000000-0000-0000-0000-000000000101"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/chat/unread-count")
                        .header("X-User-Id", "00000000-0000-0000-0000-000000000101"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("H2의 미구현 클럽 소스는 실제 목록/상세 대신 503")
    void testClubEndpoints() throws Exception {
        mockMvc.perform(get("/api/club/list"))
                .andExpect(status().isServiceUnavailable());
        mockMvc.perform(get("/api/club/a0000000-0000-0000-0000-000000000001"))
                .andExpect(status().isServiceUnavailable());
        mockMvc.perform(post("/api/club/a0000000-0000-0000-0000-000000000001/join")
                        .header("X-User-Id", "00000000-0000-0000-0000-000000000101"))
                .andExpect(status().isUnauthorized());
    }
}
