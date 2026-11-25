package com.moneyverse.api.domain.safety;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.safety.controller.SafetyController;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Audit P0 (2026-11-25): emergency takedown submissions returned a random case id
 * without storing anything, status always said IN_REVIEW, and the admin queue was
 * always empty, so a victim's report could never reach an administrator.
 */
class TakedownTruthTest {
    final JdbcClient jdbc = mock(JdbcClient.class, RETURNS_DEEP_STUBS);
    final AdminAuthService admin = mock(AdminAuthService.class);
    final HttpServletRequest request = mock(HttpServletRequest.class);
    final SafetyController controller = new SafetyController(jdbc, admin);

    private static Map<String, Object> valid() {
        Map<String, Object> b = new HashMap<>();
        b.put("requesterEmail", "victim@example.com");
        b.put("requesterType", "victim_self");
        b.put("reasonCategory", "doxxing_credible_threat");
        b.put("targetContentUrl", "https://easy-scraping.com/board/1");
        b.put("targetContentType", "board_post");
        b.put("description", "my address was posted publicly");
        b.put("passcode", "secret12");
        return b;
    }

    @Test void invalidSubmissionNeverReachesTheDatabase() {
        var b = valid(); b.put("reasonCategory", "spam");
        assertEquals(HttpStatus.BAD_REQUEST, controller.submitEmergencyTakedown(b).getStatusCode());
        var c = valid(); c.put("description", "short");
        assertEquals(HttpStatus.BAD_REQUEST, controller.submitEmergencyTakedown(c).getStatusCode());
        var d = valid(); d.put("requesterEmail", "not-an-email");
        assertEquals(HttpStatus.BAD_REQUEST, controller.submitEmergencyTakedown(d).getStatusCode());
        verifyNoInteractions(jdbc);
    }

    @Test void aStorageFailureIsNeverReportedAsReceived() {
        reset(jdbc);
        when(jdbc.sql(anyString())).thenThrow(new IllegalStateException("offline"));
        var res = controller.submitEmergencyTakedown(valid());
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, res.getStatusCode());
        assertNull(((Map<?, ?>) res.getBody()).get("caseId"));
    }

    @Test void theAdminQueueRequiresAVerifiedAdministrator() {
        when(admin.resolveVerifiedAdminActor(any())).thenReturn(Optional.empty());
        assertEquals(HttpStatus.UNAUTHORIZED, controller.adminListTakedowns(request, null, 50, 0).getStatusCode());
        assertEquals(HttpStatus.UNAUTHORIZED, controller.adminActionTakedown(request, "MV-1", Map.of("newStatus", "TRIAGED")).getStatusCode());
        verifyNoInteractions(jdbc);
    }

    @Test void adminActionsOnlyAcceptKnownStatuses() {
        when(admin.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(java.util.UUID.randomUUID()));
        when(admin.hasVerifiedSessionCsrf(any())).thenReturn(true);
        assertEquals(HttpStatus.BAD_REQUEST, controller.adminActionTakedown(request, "MV-1", Map.of("newStatus", "DELETED")).getStatusCode());
        verifyNoInteractions(jdbc);
    }
}
