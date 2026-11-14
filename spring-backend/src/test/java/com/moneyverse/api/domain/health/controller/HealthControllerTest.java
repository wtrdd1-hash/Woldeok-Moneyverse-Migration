package com.moneyverse.api.domain.health.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /health 호출 시 200 OK와 서비스 상태를 정상 반환한다")
    void healthReturnsOk() throws Exception {
        mockMvc.perform(get("/health").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("UP"))
                .andExpect(jsonPath("$.data.service").value("moneyverse-spring-backend"));
    }

    @Test
    @DisplayName("GET /api/version 호출 시 200 OK와 스프링 엔진 버전을 반환한다")
    void versionReturnsOk() throws Exception {
        mockMvc.perform(get("/api/version").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.version").value("v2026.11.14-spring"))
                .andExpect(jsonPath("$.data.activeEngine").value("Java Spring Boot"));
    }
}
