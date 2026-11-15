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
class Phase6IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("가상 세계 일/주차 시계 동기화 조회 테스트")
    void testGameClockEndpoints() throws Exception {
        mockMvc.perform(get("/api/game-clock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));
    }

    @Test
    @DisplayName("마이 스페이스 목록 및 부동산 구역 조회 테스트")
    void testSpaceEndpoints() throws Exception {
        mockMvc.perform(get("/api/space")
                        .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        mockMvc.perform(get("/api/space/my")
                        .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        mockMvc.perform(get("/api/spaces/real-estate/districts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.districts").isArray());
    }

    @Test
    @DisplayName("조폐국 주조 배치 및 시뇨리지 대시보드 조회 테스트")
    void testMintEndpoints() throws Exception {
        mockMvc.perform(get("/api/mint"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        mockMvc.perform(get("/api/mint/batches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        mockMvc.perform(get("/api/mint/seigniorage"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));
    }
}
