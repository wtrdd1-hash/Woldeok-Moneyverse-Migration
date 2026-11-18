package com.moneyverse.api.domain.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StatusSourceTruthIntegrationTest {
    @Autowired MockMvc mvc;

    @Test void missingPostgresqlSourceInH2Returns503NotInventedGreen() throws Exception {
        mvc.perform(get("/api/v1/status")).andExpect(status().isServiceUnavailable());
        mvc.perform(get("/status")).andExpect(status().isServiceUnavailable());
    }

    @Test void nonSupportedNextFlightNeverClaimsSuccessfulHtml() throws Exception {
        mvc.perform(get("/status").header("RSC","1").header("Accept","text/x-component"))
                .andExpect(status().isNotAcceptable());
    }
}
