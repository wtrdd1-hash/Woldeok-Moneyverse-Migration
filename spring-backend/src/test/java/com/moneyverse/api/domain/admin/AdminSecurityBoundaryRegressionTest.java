package com.moneyverse.api.domain.admin;

import org.junit.jupiter.api.Test;
import jakarta.servlet.http.Cookie;
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
class AdminSecurityBoundaryRegressionTest {
    @Autowired MockMvc mockMvc;

    @Test
    void anonymousCannotReadAdminIdentity() throws Exception {
        mockMvc.perform(get("/api/v1/admin/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void arbitraryBearerCannotReadAdminSecurityOverview() throws Exception {
        mockMvc.perform(get("/api/v1/admin/security")
                        .header("Authorization", "Bearer arbitrary-unverified-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void internalServiceTokenAloneCannotImpersonateAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/admin/me")
                        .header("x-internal-token", "test-internal-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void bearerInternalServiceTokenAloneCannotImpersonateAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/admin/me")
                        .header("Authorization", "Bearer test-internal-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void arbitrarySessionCookieCannotReadAdminSecurityOverview() throws Exception {
        mockMvc.perform(get("/api/v1/admin/security")
                        .cookie(new Cookie("mv_session", "arbitrary-unverified-session")))
                .andExpect(status().isUnauthorized());
    }
}
