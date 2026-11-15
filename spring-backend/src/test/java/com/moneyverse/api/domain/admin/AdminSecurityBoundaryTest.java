package com.moneyverse.api.domain.admin;

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
@org.springframework.test.context.TestPropertySource(properties = "moneyverse.security.internal-token=unit-test-internal-secret")
class AdminSecurityBoundaryTest {
    @Autowired MockMvc mvc;

    @Test void configuredInternalServiceTokenCanReadAdminOverview() throws Exception {
        mvc.perform(get("/api/v1/admin/security").header("x-internal-token", "unit-test-internal-secret"))
                .andExpect(status().isOk());
    }

    @Test void adminMeMustRejectUnauthenticatedCaller() throws Exception {
        mvc.perform(get("/api/v1/admin/me")).andExpect(status().isUnauthorized());
    }

    @Test void adminMutationAndLegacyAliasRequireServiceIdentity() throws Exception {
        mvc.perform(post("/api/v1/admin/security/sessions")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/security/ip-blocks")).andExpect(status().isUnauthorized());
    }

    @Test void adminOverviewMustRejectForgedBearerAndCookie() throws Exception {
        mvc.perform(get("/api/v1/admin/security").header("Authorization", "Bearer forged"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/admin/security").cookie(new jakarta.servlet.http.Cookie("mv_session", "forged")))
                .andExpect(status().isUnauthorized());
    }
}
