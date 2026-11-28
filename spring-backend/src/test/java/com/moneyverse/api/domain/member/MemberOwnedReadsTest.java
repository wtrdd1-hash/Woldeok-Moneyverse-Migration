package com.moneyverse.api.domain.member;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import com.moneyverse.api.domain.member.MemberOwnedReadsController;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * QA 2026-11-25: /businesses and /wallet read business-equity, businesses/my-v2 and
 * rewards/availability, which Spring never mapped (404). Owner-scoped DB functions only.
 */
class MemberOwnedReadsTest {
    final MemberApiGuard guard = mock(MemberApiGuard.class);
    final JdbcClient jdbc = mock(JdbcClient.class, RETURNS_DEEP_STUBS);
    final HttpServletRequest request = mock(HttpServletRequest.class);
    final MemberOwnedReadsController controller = new MemberOwnedReadsController(jdbc, guard);

    @Test void anonymousReadsNeverReachTheDatabase() {
        when(guard.actor(request)).thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "SESSION_REQUIRED"));
        assertThrows(ResponseStatusException.class, () -> controller.equity(request));
        assertThrows(ResponseStatusException.class, () -> controller.ownerships(request));
        assertThrows(ResponseStatusException.class, () -> controller.rewardAvailability(request));
        verifyNoInteractions(jdbc);
    }

    @Test void rowsAreMappedToTheFrontendShape() {
        Map<String, Object> row = new HashMap<>();
        row.put("holdings_amount", "1000"); row.put("debt_amount", "0"); row.put("equity_amount", "1000"); row.put("minimum_ratio_bps", 3000);
        assertEquals(Map.of("holdingsAmount", "1000", "debtAmount", "0", "equityAmount", "1000", "minimumRatioBps", 3000), MemberOwnedReadsController.equityShape(row));
    }

    @Test void outageIsUnavailableNotEmpty() {
        when(guard.actor(request)).thenReturn(UUID.randomUUID());
        reset(jdbc);
        when(jdbc.sql(anyString())).thenThrow(new IllegalStateException("offline"));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, assertThrows(ResponseStatusException.class, () -> controller.ownerships(request)).getStatusCode());
    }
}
