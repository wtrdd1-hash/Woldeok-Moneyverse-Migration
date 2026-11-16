package com.moneyverse.api.domain.admin.controller;

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
public class SystemLogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("비인가 세션 차단 검증 (401 Unauthorized)")
    void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/v1/admin/logs/system"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Forged nonempty internal header never grants log access")
    void forgedInternalHeaderIsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/logs/system")
                        .param("source", "NGINX_ERROR")
                        .header("x-internal-token", "forged-not-a-valid-service-credential"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Anonymous callers cannot select alternate log sources")
    void anonymousCannotReadSpringLogs() throws Exception {
        mockMvc.perform(get("/api/v1/admin/logs/system")
                        .param("source", "SPRING_BACKEND")
                        .header("x-internal-token", "forged-not-a-valid-service-credential"))
                .andExpect(status().isUnauthorized());
    }
}
