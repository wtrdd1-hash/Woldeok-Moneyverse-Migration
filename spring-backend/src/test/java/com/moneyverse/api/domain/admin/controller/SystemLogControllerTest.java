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
    @DisplayName("내부 게이트웨이 토큰(x-internal-token) 보유 시 200 OK 및 로그 DTO 응답 통과")
    void rawHeaderCannotReadNginxLogs() throws Exception {
        mockMvc.perform(get("/api/v1/admin/logs/system")
                        .param("source", "NGINX_ERROR")
                        .param("lines", "50")
                        .header("x-internal-token", "gateway-internal-secret-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Spring Boot 백엔드 소스 로그 조회 검증 (200 OK)")
    void rawHeaderCannotReadSpringLogs() throws Exception {
        mockMvc.perform(get("/api/v1/admin/logs/system")
                        .param("source", "SPRING_BACKEND")
                        .param("lines", "30")
                        .header("x-internal-token", "gateway-internal-secret-token"))
                .andExpect(status().isUnauthorized());
    }
}
