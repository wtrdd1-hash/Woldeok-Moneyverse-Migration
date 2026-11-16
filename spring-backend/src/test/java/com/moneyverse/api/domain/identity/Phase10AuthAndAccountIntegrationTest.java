package com.moneyverse.api.domain.identity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class Phase10AuthAndAccountIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/v1/auth/providers: 인증 제공자 목록 조회 성공")
    void testAuthProviders() throws Exception {
        mockMvc.perform(get("/api/v1/auth/providers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.providers", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.providers[0].id", is("local_email")));
    }

    @Test
    @DisplayName("GET /api/v1/auth/policy: 법적 약관 및 개인정보 동의 버전 조회 성공")
    void testAuthPolicy() throws Exception {
        mockMvc.perform(get("/api/v1/auth/policy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.termsVersion", notNullValue()))
                .andExpect(jsonPath("$.privacyVersion", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/v1/auth/prelogin-session: 사전 로그인 세션 생성 및 토큰 발급")
    void testPreloginSession() throws Exception {
        mockMvc.perform(post("/api/v1/auth/prelogin-session"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.signedIn", is(false)))
                .andExpect(jsonPath("$.csrfToken", notNullValue()))
                .andExpect(cookie().exists("mv_session"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/local/login: 잘못된 자격증명 로그인 시 401 Unauthorized 반환")
    void testLoginInvalidCredentials() throws Exception {
        String invalidPayload = "{\"email\":\"nonexistent_user_xyz@moneyverse.local\",\"password\":\"wrongpassword123\"}";
        mockMvc.perform(post("/api/v1/auth/local/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidPayload))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("GET /api/v1/account/me: 익명 접속 시 401 Unauthorized 차단")
    void testAccountMeUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/account/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/account/security/sessions: 익명 접속 시 401 Unauthorized 차단")
    void testSecuritySessionsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/account/security/sessions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/banking/pockets: 익명 접속 시 401 Unauthorized 차단")
    void testBankingPocketsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/banking/pockets"))
                .andExpect(status().isUnauthorized());
    }
}
