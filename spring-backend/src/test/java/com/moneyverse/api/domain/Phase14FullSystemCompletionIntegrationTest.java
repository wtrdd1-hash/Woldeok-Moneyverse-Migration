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
public class Phase14FullSystemCompletionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("1. AbuseSecurityController - 비인가 세션 차단 검증 (401)")
    void testAbuseSecurityUnauthorized() throws Exception {
        mockMvc.perform(get("/admin/security/abuse/rules"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("2. AdminBackupController - 비인가 세션 차단 검증 (401)")
    void testAdminBackupUnauthorized() throws Exception {
        mockMvc.perform(get("/admin/backups/status"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("3. AdminShopController - 비인가 세션 차단 검증 (401)")
    void testAdminShopUnauthorized() throws Exception {
        mockMvc.perform(get("/admin/shop/items"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("4. GameCatalogController - 비인가 세션 차단 검증 (401)")
    void testGameCatalogUnauthorized() throws Exception {
        mockMvc.perform(get("/admin/games/catalog"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("5. OperationsController - 비인가 세션 차단 검증 (401)")
    void testOperationsUnauthorized() throws Exception {
        mockMvc.perform(get("/admin/operations/tasks"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("6. StorageHeadroomController - 비인가 세션 차단 검증 (401)")
    void testStorageHeadroomUnauthorized() throws Exception {
        mockMvc.perform(get("/admin/storage/headroom/status"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("7. EnterpriseController - 비인가 세션 차단 검증 (401)")
    void testEnterpriseUnauthorized() throws Exception {
        // Admin browser pages redirect to login; no data is returned to anonymous callers.
        mockMvc.perform(get("/admin/enterprises"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    @DisplayName("8. BootstrapController - 부트스트랩 완료 상태 조회 (200 OK)")
    void testBootstrapStatus() throws Exception {
        mockMvc.perform(get("/auth/bootstrap/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canBootstrap").value(false))
                .andExpect(jsonPath("$.initialized").value(true));
    }

    @Test
    @DisplayName("9. WarfareController - 클럽 대항전 시즌 현황 조회 (200 OK)")
    void testWarfareCurrentSeason() throws Exception {
        mockMvc.perform(get("/clubs/warfare/season/current"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.seasonName").value("2026 영지 쟁탈 대전"));
    }

    @Test
    @DisplayName("10. DiscordController - 길드 상태 조회 (200 OK)")
    void testDiscordGuildStatus() throws Exception {
        mockMvc.perform(get("/integrations/discord/guilds/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.connected").value(true))
                .andExpect(jsonPath("$.botUsername").value("월덕봇#7601"));
    }

    @Test
    @DisplayName("11. BurnEventController - 통화 소각 드로우 현황 조회 (200 OK)")
    void testBurnEventCurrent() throws Exception {
        mockMvc.perform(get("/economy/events/burn-draw/current"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.progressPercent").value(72.5));
    }

    @Test
    @DisplayName("12. HotTimeController - 활성 핫타임 버프 현황 조회 (200 OK)")
    void testHotTimeActive() throws Exception {
        mockMvc.perform(get("/economy/hot-time/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @DisplayName("13. AuditController - 비인가 세션 차단 검증 (401)")
    void testAuditUnauthorized() throws Exception {
        mockMvc.perform(get("/admin/audit/logs"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("14. ControlsController - 퍼블릭 피처 플래그 조회 (200 OK)")
    void testControlsFlags() throws Exception {
        mockMvc.perform(get("/controls/flags"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.flags.PVP_ARENA_ENABLED").value(true));
    }

    @Test
    @DisplayName("15. ContentController - 활성 팝업 배너 조회 (200 OK)")
    void testContentPopups() throws Exception {
        mockMvc.perform(get("/content/popups"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.popups[0].id").value("popup-season-12"));
    }

    @Test
    @DisplayName("16. DopamineController - 비인가 세션 차단 검증 (401)")
    void testDopamineUnauthorized() throws Exception {
        mockMvc.perform(get("/engagement/dopamine/status"))
                .andExpect(status().isUnauthorized());
    }
}
