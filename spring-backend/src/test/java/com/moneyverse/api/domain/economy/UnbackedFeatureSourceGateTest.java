package com.moneyverse.api.domain.economy;

import com.moneyverse.api.domain.club.controller.WarfareController;
import com.moneyverse.api.domain.economy.controller.HotTimeController;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

/**
 * 2026-11-26: hot-time and club-warfare endpoints answered with fabricated data (a permanent
 * 1.5x buff, hard-coded seasons and territories) and claimed writes they never made
 * ("WAR_DECLARED", "RECORDED", a manual buff "success"). No table or function backs either
 * feature, so like the other source-truth gates they answer 503 until one does.
 */
class UnbackedFeatureSourceGateTest {
    private static void assertGate(ResponseEntity<?> r, String code) {
        assertEquals(503, r.getStatusCode().value());
        assertEquals(code, ((Map<?, ?>) r.getBody()).get("code"));
        assertNotEquals(Boolean.TRUE, ((Map<?, ?>) r.getBody()).get("success"));
    }

    // Write routes check the session (and, for the hot-time trigger, the administrator role) before
    // the gate (review 2026-11-28), so they are exercised with an authorised synthetic session.
    private static UserAuthService signedIn(String... roles) {
        UserAuthService auth = mock(UserAuthService.class);
        UserAuthService.SessionInfo s = new UserAuthService.SessionInfo();
        s.setUserId(java.util.UUID.randomUUID());
        s.setRoles(List.of(roles));
        org.mockito.Mockito.when(auth.resolveSession(org.mockito.ArgumentMatchers.any())).thenReturn(java.util.Optional.of(s));
        return auth;
    }

    @Test void hotTimeNeverFabricates() {
        var c = new HotTimeController(signedIn("SUPERADMIN"));
        var req = new MockHttpServletRequest();
        for (Supplier<ResponseEntity<?>> call : List.<Supplier<ResponseEntity<?>>>of(
                c::getActiveHotTime, c::getWeeklySchedule, () -> c.triggerManualBuff(req, Map.of("name", "x")))) {
            assertGate(call.get(), "HOT_TIME_SOURCE_UNAVAILABLE");
        }
    }

    @Test void clubWarfareNeverFabricates() {
        var c = new WarfareController(signedIn());
        var req = new MockHttpServletRequest();
        for (Supplier<ResponseEntity<?>> call : List.<Supplier<ResponseEntity<?>>>of(
                c::getCurrentSeason, c::listTerritories,
                () -> c.declareWar(req, Map.of("targetTerritoryId", "t")), () -> c.reportBattleResult(req, Map.of()))) {
            assertGate(call.get(), "CLUB_WARFARE_SOURCE_UNAVAILABLE");
        }
    }
}
