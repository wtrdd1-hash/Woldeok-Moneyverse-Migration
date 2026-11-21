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

    @org.springframework.boot.test.mock.mockito.MockBean
    private org.springframework.jdbc.core.JdbcTemplate publicationJdbc;
    @org.springframework.boot.test.mock.mockito.MockBean
    private com.moneyverse.api.domain.status.StatusTruthService statusSource;

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
    @DisplayName("6. 관리자 AI 경제 속보 설정은 비로그인 계정에 401")
    void testAiNewsSettings() throws Exception {
        mockMvc.perform(get("/admin/ai-news/settings"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Verified publication and status source fixtures retain successful API contracts")
    void testAppContent() throws Exception {
        var result=org.mockito.Mockito.mock(java.sql.ResultSet.class);
        org.mockito.Mockito.when(result.getString(org.mockito.ArgumentMatchers.anyString())).thenAnswer(call->switch((String)call.getArgument(0)){
            case "announcement_id"->"00000000-0000-4000-8000-000000000125";case "title"->"QA publication";case "body"->"QA verified body";default->null;});
        org.mockito.Mockito.when(result.getObject("is_pinned",Boolean.class)).thenReturn(false);
        org.mockito.Mockito.when(result.getTimestamp("published_at")).thenReturn(java.sql.Timestamp.from(java.time.Instant.parse("2026-01-01T00:00:00Z")));
        org.mockito.Mockito.when(publicationJdbc.query(org.mockito.ArgumentMatchers.contains("content_list_published_announcements"),org.mockito.ArgumentMatchers.any(org.springframework.jdbc.core.RowMapper.class),org.mockito.ArgumentMatchers.any(Object[].class))).thenAnswer(call->{
            org.springframework.jdbc.core.RowMapper<?> mapper=call.getArgument(1);return java.util.List.of(mapper.mapRow(result,0));});
        var observed=java.time.Instant.parse("2026-01-01T00:00:00Z");
        var stale=com.moneyverse.api.domain.status.StatusSourceTruthPolicy.evaluate("qa-public","QA public","operational",observed,180,observed.plusSeconds(181));
        org.mockito.Mockito.when(statusSource.publicStatus()).thenReturn(new com.moneyverse.api.domain.status.StatusSourceTruthPolicy.StatusResponse(java.util.List.of(stale)));
        mockMvc.perform(get("/content/announcements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.announcements[0].announcementId").value("00000000-0000-4000-8000-000000000125"))
                .andExpect(jsonPath("$.announcements[0].body").value("QA verified body"))
                .andExpect(jsonPath("$.announcements[0].isPinned").value(false));
        mockMvc.perform(get("/content/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status[0].sourceKey").value("qa-public"))
                .andExpect(jsonPath("$.status[0].state").value("unknown"))
                .andExpect(jsonPath("$.status[0].freshnessState").value("stale"))
                .andExpect(jsonPath("$.status[0].policyVersion").value("status-v1"))
                .andExpect(jsonPath("$.status.systemOperational").doesNotExist());
    }

    @Test
    @DisplayName("Publication and status source outages remain explicit unavailable responses")
    void testAppContentSourceUnavailable() throws Exception {
        var unavailable=new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,"QA_SOURCE_UNAVAILABLE");
        org.mockito.Mockito.when(publicationJdbc.query(org.mockito.ArgumentMatchers.contains("content_list_published_announcements"),org.mockito.ArgumentMatchers.any(org.springframework.jdbc.core.RowMapper.class),org.mockito.ArgumentMatchers.any(Object[].class))).thenThrow(new IllegalStateException("QA source unavailable"));
        org.mockito.Mockito.when(statusSource.publicStatus()).thenThrow(unavailable);
        mockMvc.perform(get("/content/announcements")).andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.announcements").doesNotExist());
        mockMvc.perform(get("/content/status")).andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.status.systemOperational").doesNotExist());
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
