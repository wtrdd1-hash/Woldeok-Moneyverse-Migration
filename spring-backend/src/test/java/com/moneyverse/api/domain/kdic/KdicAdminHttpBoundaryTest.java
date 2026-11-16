package com.moneyverse.api.domain.kdic;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class KdicAdminHttpBoundaryTest {

    @Autowired MockMvc mockMvc;

    @Test
    void anonymousCannotReadAdminKdicFinancialOverview() throws Exception {
        mockMvc.perform(get("/api/v1/admin/kdic/overview")
                        .header("x-user-id", "admin")
                        .header("x-internal-token", "forged"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void anonymousCannotReadKdicLedgerIntegrityEvenWhenUnavailable() throws Exception {
        mockMvc.perform(get("/api/v1/admin/kdic/ledger-integrity"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void anonymousCannotAttemptPremiumsOrLiquidityOrPayout() throws Exception {
        for (String path : new String[] {
                "/api/v1/admin/kdic/assess-premiums",
                "/api/v1/admin/kdic/liquidity-loan",
                "/api/v1/admin/kdic/payout"
        }) {
            mockMvc.perform(post(path).header("x-user-id", "admin"))
                    .andExpect(status().isUnauthorized());
        }
    }
}
