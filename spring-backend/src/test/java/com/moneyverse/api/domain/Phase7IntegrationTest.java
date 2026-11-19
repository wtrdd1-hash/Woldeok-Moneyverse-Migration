package com.moneyverse.api.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class Phase7IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("제작 시스템 레시피 목록 조회 테스트")
    void testCraftingEndpoints() throws Exception {
        mockMvc.perform(get("/api/crafting/recipes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true))
                .andExpect(jsonPath("$.recipes").isArray());
    }

    @Test
    @DisplayName("인게이지먼트 연속 출석 및 도파민 상태 조회 테스트")
    void testEngagementEndpoints() throws Exception {
        // Forged X-User-Id cannot impersonate an active member session.
        mockMvc.perform(get("/api/engagement/streak")
                        .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isUnauthorized());

        // The authenticated DopamineController owns this route; a forged
        // X-User-Id must never satisfy the real browser session guard.
        mockMvc.perform(get("/api/engagement/dopamine/status")
                        .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("금융 비서의 개인 진단은 임의 사용자 헤더만으로 조회 불가")
    void testAdvisorEndpoints() throws Exception {
        mockMvc.perform(get("/api/advisor/deoki/diagnose")
                        .header("X-User-Id", "00000000-0000-0000-0000-000000000101"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("커뮤니티 및 종목 토론 게시판 조회 테스트")
    void testBoardEndpoints() throws Exception {
        mockMvc.perform(get("/api/board"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true))
                .andExpect(jsonPath("$.posts").isArray());

        mockMvc.perform(get("/api/board/stock-posts?stockSymbol=WDX"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));
    }

    @Test
    @DisplayName("거시 경제 펄스 및 소각 이벤트 조회 테스트")
    void testMacroPulseEndpoints() throws Exception {
        mockMvc.perform(get("/api/economy/macro-pulse"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        mockMvc.perform(get("/api/economy/burn-events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        mockMvc.perform(get("/api/economy/hot-time"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));
    }
}
