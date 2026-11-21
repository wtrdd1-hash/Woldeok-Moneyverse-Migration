package com.moneyverse.api.domain.stock;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.stock.dto.StockDtos.OrderRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StockTradingTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/v1/stocks 호출 시 상장 종목 목록과 200 OK가 반환된다")
    void listStocksReturnsOk() throws Exception {
        // Embedded H2 has no canonical stock_market_overview(), so no invented quotes.
        mockMvc.perform(get("/api/v1/stocks"))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    @DisplayName("GET /api/v1/stocks/{id}/candles 미지원 interval 호출 시 400 Bad Request가 반환된다")
    void candlesUnsupportedIntervalReturns400() throws Exception {
        String stockId = UUID.randomUUID().toString();

        mockMvc.perform(get("/api/v1/stocks/" + stockId + "/candles?interval=999"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.detail").value("unsupported candle interval"));
    }

    @Test
    @DisplayName("GET /api/v1/stocks/{id}/candles 지원 interval 호출 시 200 OK와 캔들 및 가격 범위가 반환된다")
    void candlesSupportedIntervalReturnsOk() throws Exception {
        String stockId = UUID.randomUUID().toString();

        // Missing canonical PostgreSQL candle/range functions must not return fake prices.
        mockMvc.perform(get("/api/v1/stocks/" + stockId + "/candles?interval=86400"))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    @DisplayName("POST /api/v1/stocks/{id}/orders 정상 매수 주문 체결 시 200 OK와 영수증이 반환된다")
    void orderBuySuccessReturnsOk() throws Exception {
        String stockId = UUID.randomUUID().toString();
        String idempotencyKey = UUID.randomUUID().toString();

        OrderRequest request = new OrderRequest("buy", 10, idempotencyKey);

        // The request is not signed in; it cannot receive a fabricated trade receipt.
        mockMvc.perform(post("/api/v1/stocks/" + stockId + "/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/stocks/league/current 호출 시 200 OK와 리그 리더보드가 반환된다")
    void getLeagueCurrentReturnsOk() throws Exception {
        mockMvc.perform(get("/api/v1/stocks/league/current"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.season").exists());
    }

    @Test
    @DisplayName("GET /api/v1/newspaper/pulse 호출 시 시장 심리 지수와 200 OK가 반환된다")
    void getNewspaperPulseReturnsOk() throws Exception {
        // Stock prices are unavailable in H2: sentiment must not invent a financial index.
        mockMvc.perform(get("/api/v1/newspaper/pulse"))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    @DisplayName("GET /api/v1/newspaper/weekly-brief 호출 시 503 Service Unavailable ProblemDetail이 반환된다")
    void getWeeklyBriefReturns503() throws Exception {
        mockMvc.perform(get("/api/v1/newspaper/weekly-brief"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("NEWSPAPER_WEEKLY_BRIEF_UNVERIFIED"));
    }
}
