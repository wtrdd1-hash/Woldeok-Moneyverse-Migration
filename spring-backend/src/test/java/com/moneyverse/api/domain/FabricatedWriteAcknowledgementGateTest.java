package com.moneyverse.api.domain;

import com.moneyverse.api.domain.admin.controller.AbuseSecurityController;
import com.moneyverse.api.domain.admin.controller.AdminBackupController;
import com.moneyverse.api.domain.admin.controller.GameCatalogController;
import com.moneyverse.api.domain.admin.controller.OperationsController;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.club.controller.WarfareController;
import com.moneyverse.api.domain.economy.controller.BurnEventController;
import com.moneyverse.api.domain.economy.controller.HotTimeController;
import com.moneyverse.api.domain.editorial.controller.AiNewsController;
import com.moneyverse.api.domain.editorial.controller.BlogVerifiedAdminController;
import com.moneyverse.api.domain.help.controller.AdminHelpController;
import com.moneyverse.api.domain.help.controller.HelpReportController;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.media.service.ImageStorageService;
import com.moneyverse.api.domain.profile.controller.ProfileImageController;
import com.moneyverse.api.domain.safety.controller.SafetyController;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.function.Executable;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Security review 2026-11-28: these handlers acknowledged writes that were never made — a member
 * help report with a "verified" thread id, a WLD burn with draw tickets, a war declaration; and for
 * administrators a permanent suspension, an address block, a backup job, a scheduled-task run,
 * maintenance mode, a game registration, AI-news settings and editorial drafts. Nothing was stored.
 * A false acknowledgement is worse than an outage: an operator believes an abuser is blocked or a
 * backup exists. Each must answer 503 (after the existing session/role check) until it is backed by
 * a canonical source, the same rule FabricatedAnswerGateTest applies to services.
 */
class FabricatedWriteAcknowledgementGateTest {
    private final UserAuthService auth = mock(UserAuthService.class);
    private final MockHttpServletRequest request = new MockHttpServletRequest();

    private void signedInAs(String... roles) {
        UserAuthService.SessionInfo s = new UserAuthService.SessionInfo();
        s.setUserId(UUID.randomUUID());
        s.setRoles(List.of(roles));
        when(auth.resolveSession(any())).thenReturn(Optional.of(s));
    }

    /** 503 either thrown or returned (the 2026-11-26 source-truth gate returns a 503 entity). */
    private static void unavailable(org.junit.jupiter.api.function.ThrowingSupplier<?> call) {
        Object result;
        try {
            result = call.get();
        } catch (ResponseStatusException e) {
            assertEquals(503, e.getStatusCode().value());
            return;
        } catch (Throwable t) {
            throw new AssertionError(t);
        }
        assertTrue(result instanceof org.springframework.http.ResponseEntity<?> r && r.getStatusCode().value() == 503,
                "a write that stores nothing must not answer success");
    }

    @Test void memberHelpReportDoesNotInventAVerifiedThread() {
        signedInAs();
        HelpReportController c = new HelpReportController(auth);
        unavailable(() -> c.report(request, "ko", "wallet-basics", Map.of("reason", "outdated")));
    }

    @Test void memberBurnDoesNotClaimBurnedWldOrTickets() {
        signedInAs();
        BurnEventController c = new BurnEventController(auth);
        unavailable(() -> c.participateBurn(request, Map.of("burnAmountWld", "1000")));
    }

    @Test void memberWarfareWritesAreNotFaked() {
        signedInAs();
        WarfareController c = new WarfareController(auth);
        unavailable(() -> c.declareWar(request, Map.of("targetTerritoryId", "t1")));
        unavailable(() -> c.reportBattleResult(request, Map.of()));
    }

    @Test void anonymousCallersStillGet401BeforeAvailability() {
        when(auth.resolveSession(any())).thenReturn(Optional.empty());
        ResponseStatusException e = assertThrows(ResponseStatusException.class,
                () -> new BurnEventController(auth).participateBurn(request, Map.of("burnAmountWld", "1")));
        assertEquals(401, e.getStatusCode().value());
        e = assertThrows(ResponseStatusException.class,
                () -> new AbuseSecurityController(auth).blockAddress(request, Map.of("ipOrAddress", "x")));
        assertEquals(401, e.getStatusCode().value());
    }

    @Test void memberCannotTriggerHotTime() {
        // The 2026-11-26 gate refuses this route for everyone (503) before any role check; a member
        // must never receive a success either way.
        signedInAs();
        unavailable(() -> new HotTimeController(auth).triggerManualBuff(request, Map.of()));
    }

    @Test void adminHotTimeTriggerIsNotFaked() {
        signedInAs("SUPERADMIN");
        unavailable(() -> new HotTimeController(auth).triggerManualBuff(request, Map.of("name", "x")));
    }

    @Test void adminAbuseControlsDoNotClaimEnforcement() {
        signedInAs("SUPERADMIN");
        AbuseSecurityController c = new AbuseSecurityController(auth);
        unavailable(() -> c.suspendPermanent(request, Map.of("targetUserId", "u", "reason", "r")));
        unavailable(() -> c.blockAddress(request, Map.of("ipOrAddress", "203.0.113.9")));
        unavailable(() -> c.unblockAddress(request, "block-1"));
    }

    @Test void adminOperationsDoNotClaimRunsOrMaintenance() {
        signedInAs("SUPERADMIN");
        OperationsController c = new OperationsController(auth);
        unavailable(() -> c.listTasks(request));
        unavailable(() -> c.triggerTask(request, "BOND_MATURITY_DISPATCHER"));
        unavailable(() -> c.setMaintenanceMode(request, Map.of("enabled", true)));
    }

    @Test void adminBackupsDoNotInventInventoryOrJobs() {
        signedInAs("SUPERADMIN");
        AdminBackupController c = new AdminBackupController(auth);
        unavailable(() -> c.getBackupInventory(request));
        unavailable(() -> c.getBackupStatus(request));
        unavailable(() -> c.triggerManualBackup(request));
    }

    @Test void adminGameCatalogWritesAreNotFaked() {
        signedInAs("SUPERADMIN");
        GameCatalogController c = new GameCatalogController(auth);
        unavailable(() -> c.registerGame(request, Map.of("name", "n", "category", "CASINO")));
        unavailable(() -> c.updateGameConfig(request, "game-dice", Map.of()));
        unavailable(() -> c.toggleGameStatus(request, "game-dice"));
    }

    @Test void adminEditorialWritesAreNotFaked() {
        AiNewsController ai = new AiNewsController();
        unavailable(ai::getSettings);
        unavailable(() -> ai.updateSettings(Map.of()));
        unavailable(() -> ai.generateArticle(Map.of()));
        unavailable(() -> ai.publishArticle(Map.of()));
        unavailable(() -> new AdminHelpController().createDraft(Map.of()));
        unavailable(() -> new BlogVerifiedAdminController().createArticle(Map.of()));
    }

    @Test void adminChatReportActionIsNotFaked() {
        SafetyController c = new SafetyController(mock(JdbcClient.class), mock(AdminAuthService.class));
        unavailable(() -> c.adminGetChatReport("r1"));
        unavailable(() -> c.adminActionChatReport("r1", Map.of("action", "WARNED")));
    }

    @Test void memberProfileImageDeleteDoesNotClaimDeletion() {
        signedInAs();
        ProfileImageController c = new ProfileImageController(auth, mock(ImageStorageService.class));
        unavailable(() -> c.deleteProfileImage(request));
    }
}
