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
    @DisplayName("인앱 알림 목록 및 미확인 건수 조회 테스트")
    void testNotificationEndpoints() throws Exception {
        mockMvc.perform(get("/api/notifications")
                        .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        mockMvc.perform(post("/api/notifications/read-all")
                        .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));
    }

    @Test
    @DisplayName("고객 지원 스레드 및 요약 조회 테스트")
    void testSupportEndpoints() throws Exception {
        mockMvc.perform(get("/api/support/threads")
                        .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        mockMvc.perform(get("/api/support/threads/summary")
                        .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));
    }

    @Test
    @DisplayName("성장 단계 및 신용 등급, 초반 퀘스트 조회 테스트")
    void testProgressionEndpoints() throws Exception {
        mockMvc.perform(get("/api/progression")
                        .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        mockMvc.perform(get("/api/progression/credits")
                        .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        mockMvc.perform(get("/api/progression/early-game")
                        .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));
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
    @DisplayName("1:1 대화방 및 미확인 쪽지 건수 조회 테스트")
    void testChatEndpoints() throws Exception {
        mockMvc.perform(get("/api/chat/conversations")
                        .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        mockMvc.perform(get("/api/chat/unread-count")
                        .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));
    }

    @Test
    @DisplayName("클럽 목록 및 특정 클럽 상세 조회 테스트")
    void testClubEndpoints() throws Exception {
        mockMvc.perform(get("/api/club/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        mockMvc.perform(get("/api/club/a0000000-0000-0000-0000-000000000001")
                        .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));
    }
}
