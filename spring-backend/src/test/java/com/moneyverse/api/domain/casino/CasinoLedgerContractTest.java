package com.moneyverse.api.domain.casino;

import com.moneyverse.api.domain.casino.controller.CasinoController;
import com.moneyverse.api.domain.casino.controller.CasinoLedgerController;
import com.moneyverse.api.domain.casino.service.CasinoLedgerService;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * QA 2026-11-25: the casino page posts to coin/dice/theme plays and reads
 * history, self-limit and clock, none of which Spring mapped (404). The old
 * /play routes took the member id from an X-User-Id header with a fixed
 * default member (audit P0). Plays now go only through casino_play_* with the
 * verified session owner.
 */
class CasinoLedgerContractTest {
    static final UUID ACTOR = UUID.fromString("00000000-0000-4000-8000-000000000123");
    static final String KEY = "6f1c1d36-8d0a-4a39-9d65-1a2b3c4d5e6f";

    final MemberApiGuard guard = mock(MemberApiGuard.class);
    final CasinoLedgerService casino = mock(CasinoLedgerService.class);
    final HttpServletRequest request = mock(HttpServletRequest.class);
    final CasinoLedgerController controller = new CasinoLedgerController(casino, guard);

    private void mutation() {
        when(guard.verifiedMutationActor(request)).thenReturn(ACTOR);
        when(guard.idempotencyKey(KEY)).thenReturn(UUID.fromString(KEY));
    }

    @Test void coinPlayUsesTheVerifiedActor() {
        mutation();
        when(casino.playCoin(UUID.fromString(KEY), ACTOR, "heads", 100L)).thenReturn(Map.of("play_id", "p"));
        assertEquals(HttpStatus.OK, controller.coin(request, Map.of("idempotencyKey", KEY, "choice", "heads", "stake", 100)).getStatusCode());
    }

    @Test void choicesMustBelongToTheGame() {
        mutation();
        assertEquals(HttpStatus.BAD_REQUEST, controller.coin(request, Map.of("idempotencyKey", KEY, "choice", "edge", "stake", 100)).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, controller.dice(request, Map.of("idempotencyKey", KEY, "game", "dice_number", "choice", "odd", "stake", 1)).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, controller.theme(request, Map.of("idempotencyKey", KEY, "game", "gem_5", "choice", "gold", "stake", 1)).getStatusCode());
        verifyNoInteractions(casino);
    }

    @Test void stakeMustBeAPositiveWholeNumber() {
        mutation();
        for (Object stake : new Object[]{0, -5, 1.5, "100", 9_007_199_254_740_993L}) {
            assertEquals(HttpStatus.BAD_REQUEST, controller.coin(request, Map.of("idempotencyKey", KEY, "choice", "heads", "stake", stake)).getStatusCode(), String.valueOf(stake));
        }
        verifyNoInteractions(casino);
    }

    @Test void selfLimitAcceptsZeroAsUnboundAndRejectsNegatives() {
        when(guard.verifiedMutationActor(request)).thenReturn(ACTOR);
        assertEquals(HttpStatus.BAD_REQUEST, controller.setSelfLimit(request, Map.of("dailyBetLimit", -1, "dailyLossLimit", 0)).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, controller.setSelfLimit(request, Map.of("dailyBetLimit", 0, "dailyLossLimit", 0, "lockedUntil", "tomorrow")).getStatusCode());
        verifyNoInteractions(casino);
        var ok = controller.setSelfLimit(request, Map.of("dailyBetLimit", 0, "dailyLossLimit", 5000));
        assertEquals(HttpStatus.OK, ok.getStatusCode());
        verify(casino).setSelfLimit(ACTOR, 0L, 5000L, null);
    }

    @Test void writesWithoutCsrfNeverReachTheDatabase() {
        when(guard.verifiedMutationActor(request)).thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "CSRF_REQUIRED"));
        assertThrows(ResponseStatusException.class, () -> controller.coin(request, Map.of("idempotencyKey", KEY, "choice", "heads", "stake", 1)));
        verifyNoInteractions(casino);
    }

    @Test void legacyRoutesNoLongerReadAMemberIdFromAHeader() {
        for (Method m : CasinoController.class.getDeclaredMethods()) {
            for (Parameter p : m.getParameters()) {
                RequestHeader h = p.getAnnotation(RequestHeader.class);
                assertTrue(h == null || !"X-User-Id".equalsIgnoreCase(h.value()), m.getName() + " still reads X-User-Id");
            }
        }
    }
}
