package com.moneyverse.api.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.admin.controller.AbuseSecurityController;
import com.moneyverse.api.domain.admin.controller.AdminApiHealthController;
import com.moneyverse.api.domain.admin.controller.AuditController;
import com.moneyverse.api.domain.admin.controller.ControlsController;
import com.moneyverse.api.domain.admin.controller.GameCatalogController;
import com.moneyverse.api.domain.admin.controller.StorageHeadroomController;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.safety.controller.SafetyController;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.function.Executable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Security review 2026-11-28: administrator evidence screens were fed constants. The API health
 * probe reported the database OPERATIONAL even when its probe query failed, with invented
 * per-domain latencies and success rates labelled ROUTE_METRICS; backup inventory listed fixed
 * "VERIFIED" files; storage headroom reported a fixed HEALTHY disk; the audit chain verification,
 * retention and disposition lists were always empty (hiding a failed verification); the chat-report
 * queue was always empty; financial events showed an invented mint and burn. An operator acts on
 * these. Measured values stay; anything not measured is null/UNKNOWN or the route answers 503.
 */
class FabricatedOperationalEvidenceGateTest {
    private final UserAuthService auth = mock(UserAuthService.class);
    private final MockHttpServletRequest request = new MockHttpServletRequest();

    private void admin() {
        UserAuthService.SessionInfo s = new UserAuthService.SessionInfo();
        s.setUserId(UUID.randomUUID());
        s.setRoles(List.of("SUPERADMIN"));
        when(auth.resolveSession(any())).thenReturn(Optional.of(s));
    }

    private static void unavailable(Executable call) {
        ResponseStatusException e = assertThrows(ResponseStatusException.class, call,
                "unmeasured evidence must not be answered with constants");
        assertEquals(503, e.getStatusCode().value());
    }

    @SuppressWarnings("unchecked")
    @Test void apiHealthReportsAFailedDatabaseProbeAsDegraded() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForObject(anyString(), eq(Integer.class))).thenThrow(new RuntimeException("down"));
        Map<String, Object> body = new AdminApiHealthController(jdbc).getStatus().getBody();
        assertNotNull(body);
        assertEquals("DEGRADED", body.get("status"));
        assertEquals("DEGRADED", ((Map<String, Object>) body.get("dbProbe")).get("status"));
        assertNull(body.get("dbLatencyMs"));
    }

    @SuppressWarnings("unchecked")
    @Test void apiHealthDoesNotInventRouteMetrics() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForObject(anyString(), eq(Integer.class))).thenReturn(1);
        Map<String, Object> body = new AdminApiHealthController(jdbc).getStatus().getBody();
        assertNotNull(body);
        assertEquals("OPERATIONAL", ((Map<String, Object>) body.get("dbProbe")).get("status"));
        assertNotEquals(Boolean.TRUE, body.get("isLiveTelemetry"));
        assertNull(body.get("globalSuccessRate"));
        assertNull(body.get("averageLatencyMs"));
        for (Map<String, Object> d : (List<Map<String, Object>>) body.get("domains")) {
            assertEquals("NOT_MEASURED", d.get("measurementSource"), String.valueOf(d.get("id")));
            assertEquals("UNKNOWN", d.get("status"));
            assertNull(d.get("latencyMs"));
            assertNull(d.get("successRate"));
            assertNull(d.get("measuredAt"));
        }
        Map<String, Object> t = (Map<String, Object>) body.get("systemTelemetry");
        assertNull(t.get("activeDbConnections"));
        assertNull(t.get("dbCacheHitRatio"));
    }

    @Test void apiHealthBackupInventoryIsNotInvented() {
        unavailable(() -> new AdminApiHealthController(mock(JdbcTemplate.class)).getBackupInventory());
    }

    @Test void storageHeadroomIsNotInvented() {
        admin();
        StorageHeadroomController c = new StorageHeadroomController(auth);
        unavailable(() -> c.getStorageStatus(request));
        unavailable(() -> c.getTopTables(request));
        unavailable(() -> c.getRecommendations(request));
    }

    @Test void auditIntegrityListsAreNotAlwaysEmpty() {
        admin();
        AuditController c = new AuditController(auth, mock(JdbcTemplate.class), new ObjectMapper());
        unavailable(c::getVerifications);
        unavailable(c::getRetention);
        unavailable(c::getDispositions);
        unavailable(() -> c.getFinancialEvents(request));
    }

    @Test void chatReportQueueIsNotAlwaysEmpty() {
        SafetyController c = new SafetyController(mock(JdbcClient.class), mock(AdminAuthService.class));
        unavailable(() -> c.adminListChatReports(null, 50, 0));
    }

    @Test void controlFlagsAndRulesAreNotInvented() {
        admin();
        ControlsController controls = new ControlsController();
        unavailable(controls::getPublicFlags);
        unavailable(controls::getKillSwitches);
        unavailable(() -> new AbuseSecurityController(auth).getRules(request));
        unavailable(() -> new GameCatalogController(auth).listGames(request));
    }
}
