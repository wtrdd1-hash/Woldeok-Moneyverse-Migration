package com.moneyverse.api.domain.stock;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class Phase12TradingAndDerivativesIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("1. 파생상품 시장 및 포지션 조회 시 미검증 데이터 차단 503 반환")
    void testDerivativesUnverifiedData() throws Exception {
        mockMvc.perform(get("/api/v1/stocks/derivatives/markets"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("DERIVATIVES_DATA_UNVERIFIED"));

        mockMvc.perform(get("/stocks/derivatives/positions"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("DERIVATIVES_DATA_UNVERIFIED"));
    }

    @Test
    @DisplayName("2. 퀀트 전략 및 백테스트 조회 시 미검증 근거 차단 503 반환")
    void testQuantEvidenceUnavailable() throws Exception {
        mockMvc.perform(get("/api/v1/quant/strategies"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("QUANT_EVIDENCE_UNAVAILABLE"));

        mockMvc.perform(post("/quant/backtest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"targetTicker\":\"KRX_005930\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("QUANT_EVIDENCE_UNAVAILABLE"));
    }

    @Test
    @DisplayName("3. 외환(FX) 보유액 상태 조회 200 OK 및 미검증 포털 503 가드")
    void testFxControllers() throws Exception {
        mockMvc.perform(get("/api/v1/admin/fx/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.reserves.totalReservesUsd").isNumber());

        mockMvc.perform(get("/fx/portal"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.message").value("fx_source_unverified"));
    }

    @Test
    @DisplayName("4. 벤처 스타트업 피치 및 투자 목록 조회 시 미검증 차단 503 반환")
    void testVenturesEvidenceUnavailable() throws Exception {
        mockMvc.perform(get("/api/v1/businesses/ventures/pitches"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("VENTURE_EVIDENCE_UNAVAILABLE"));
    }

    @Test
    @DisplayName("5. 주식 알림 규칙 조회 시 비인가 세션 401 Unauthorized 차단")
    void testStockAlertsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/stocks/alerts"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("6. 주식 챔피언십 리그 현황 200 OK 및 카피트레이딩 503 원장 가드")
    void testStockLeagueController() throws Exception {
        mockMvc.perform(get("/stocks/league/current"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(post("/stocks/league/copy-trade/subscribe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"whaleId\":\"whale-01\"}"))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    @DisplayName("7. 종목 토론방 공개 목록 조회 200 OK 및 비인가 작성 401 차단")
    void testStockCommunityController() throws Exception {
        mockMvc.perform(get("/board/public/stock-posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.posts").isArray());

        mockMvc.perform(post("/board/stock-posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"테스트 글\",\"body\":\"내용\"}"))
                .andExpect(status().isUnauthorized());
    }
}
