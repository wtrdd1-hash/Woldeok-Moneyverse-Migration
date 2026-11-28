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
    @DisplayName("9. WarfareController - season is not fabricated without a data source (503)")
    void testWarfareCurrentSeason() throws Exception {
        // Was a hard-coded season; no table backs club warfare (source-truth gate 2026-11-26).
        mockMvc.perform(get("/clubs/warfare/season/current"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("CLUB_WARFARE_SOURCE_UNAVAILABLE"));
    }

    @Test
    @DisplayName("10. DiscordController - guild status is not invented (503)")
    void testDiscordGuildStatus() throws Exception {
        // Security review 2026-11-28: this asserted invented live state; it must answer 503 until real.
        mockMvc.perform(get("/integrations/discord/guilds/status"))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    @DisplayName("11. BurnEventController - burn figures are not invented (503)")
    void testBurnEventCurrent() throws Exception {
        // Security review 2026-11-28: this asserted invented live state; it must answer 503 until real.
        mockMvc.perform(get("/economy/events/burn-draw/current"))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    @DisplayName("12. HotTimeController - active buff is not fabricated without a data source (503)")
    void testHotTimeActive() throws Exception {
        // Was a permanent 1.5x buff; no table backs hot time (source-truth gate 2026-11-26).
        mockMvc.perform(get("/economy/hot-time/active"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("HOT_TIME_SOURCE_UNAVAILABLE"));
    }

    @Test
    @DisplayName("13. AuditController - 비인가 세션 차단 검증 (401)")
    void testAuditUnauthorized() throws Exception {
        mockMvc.perform(get("/admin/audit/logs"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("14. ControlsController - flags are not invented; canonical source is feature_switches (503)")
    void testControlsFlags() throws Exception {
        // Security review 2026-11-28: this asserted a hard-coded flag. Feature state lives in
        // feature_switches (fail closed); until this route reads it, it must not answer constants.
        mockMvc.perform(get("/controls/flags"))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    @DisplayName("15. ContentController - popups are not invented (503)")
    void testContentPopups() throws Exception {
        // Security review 2026-11-28: this asserted invented live state; it must answer 503 until real.
        mockMvc.perform(get("/content/popups"))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    @DisplayName("16. DopamineController - 비인가 세션 차단 검증 (401)")
    void testDopamineUnauthorized() throws Exception {
        mockMvc.perform(get("/engagement/dopamine/status"))
                .andExpect(status().isUnauthorized());
    }
}
