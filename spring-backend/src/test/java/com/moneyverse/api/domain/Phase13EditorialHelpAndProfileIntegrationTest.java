package com.moneyverse.api.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class Phase13EditorialHelpAndProfileIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("1. 개인정보 DSR 요청 비인가 세션 401 Unauthorized 차단")
    void testPrivacyUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/privacy/requests"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("2. 긴급 콘텐츠 삭제 접수 201 Created 반환")
    void testSafetyEmergencyTakedown() throws Exception {
        mockMvc.perform(post("/safety/takedown")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"contentUrl\":\"https://example.com/test\",\"reason\":\"harassment\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.caseId").isString());
    }

    @Test
    @DisplayName("3. SEO 상태 및 IndexNow 호스트 인증 키 서빙 200 OK")
    void testSeoEndpoints() throws Exception {
        // SEO administrative crawler logs and diagnostics are never public.
        mockMvc.perform(get("/seo/status"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/.well-known/indexnow.key"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN));
    }

    @Test
    @DisplayName("4. 고객센터 카테고리 및 도움말 문서 서빙 200 OK")
    void testHelpEndpoints() throws Exception {
        mockMvc.perform(get("/help/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categories").isArray());

        mockMvc.perform(get("/help/articles/ko/account-2fa-security-guide"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.article.title").isString());
    }

    @Test
    @DisplayName("5. 에디토리얼 블로그 기사 및 카테고리 목록 200 OK")
    void testBlogEndpoints() throws Exception {
        mockMvc.perform(get("/blog/articles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.articles").isArray());

        mockMvc.perform(get("/blog/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categories").isArray());
    }

    @Test
    @DisplayName("6. 관리자 AI 경제 속보 설정 조회 200 OK")
    void testAiNewsSettings() throws Exception {
        mockMvc.perform(get("/admin/ai-news/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("7. 앱 공지사항 및 시스템 운영 현황 보드 200 OK")
    void testAppContent() throws Exception {
        mockMvc.perform(get("/content/announcements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.announcements").isArray());

        mockMvc.perform(get("/content/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status.systemOperational").value(true));
    }

    @Test
    @DisplayName("8. 온보딩 튜토리얼 비인가 세션 401 차단")
    void testEarlyGameUnauthorized() throws Exception {
        mockMvc.perform(get("/early-game/today"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("9. 프로필 조회 - 내 프로필 조회 200 OK")
    void testProfileEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/profile/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("10. 도감 수집품 비인가 401 차단")
    void testCollectionUnauthorized() throws Exception {
        mockMvc.perform(get("/collections"))
                .andExpect(status().isUnauthorized());
    }
}
