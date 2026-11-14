package com.moneyverse.api.domain.admin;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
class AdminGovernanceTest {

    @Value("${moneyverse.security.internal-token:test-internal-token}")
    private String internalToken;

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("인증 헤더 없이 /api/v1/admin/controls 호출 시 401 Unauthorized ProblemDetail이 반환된다")
    void getControlsWithoutAuthReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/controls"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.code").value("login_required"));
    }

    @Test
    @DisplayName("x-internal-token 포함하여 /api/v1/admin/controls 호출 시 200 OK와 피처 스위치 목록이 반환된다")
    void getControlsWithInternalTokenSucceeds() throws Exception {
        mockMvc.perform(get("/api/v1/admin/controls")
                        .header("x-internal-token", internalToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.featureSwitches").isArray());
    }

    @Test
    @DisplayName("x-internal-token 포함하여 /api/v1/admin/users 호출 시 200 OK와 사용자 디렉토리가 반환된다")
    void getUsersWithInternalTokenSucceeds() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("x-internal-token", internalToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.users").isArray());
    }

    @Test
    @DisplayName("x-internal-token 포함하여 /api/v1/admin/stocks 호출 시 200 OK와 주식 목록이 반환된다")
    void getStocksWithInternalTokenSucceeds() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stocks")
                        .header("x-internal-token", internalToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stocks").isArray());
    }

    @Test
    @DisplayName("x-internal-token 포함하여 /api/v1/admin/economy/reconciliations/latest 호출 시 200 OK와 건전성 스냅샷이 반환된다")
    void getReconciliationHealthWithInternalTokenSucceeds() throws Exception {
        mockMvc.perform(get("/api/v1/admin/economy/reconciliations/latest")
                        .header("x-internal-token", internalToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true))
                .andExpect(jsonPath("$.integrity.ok").value(true));
    }

    @Test
    @DisplayName("x-internal-token 포함하여 /api/admin/auth/channel-otp/status 호출 시 200 OK와 승격 상태가 반환된다")
    void getChannelOtpStatusWithInternalTokenSucceeds() throws Exception {
        mockMvc.perform(get("/api/admin/auth/channel-otp/status")
                        .header("x-internal-token", internalToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));
    }
}
