package com.moneyverse.api.domain.pension;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import com.moneyverse.api.domain.pension.controller.PensionLedgerController;
import com.moneyverse.api.domain.pension.service.PensionLedgerService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.server.ResponseStatusException;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * QA 2026-11-25: the pension page called funded/contribute, funded/withdraw,
 * my-contributions and my-payouts, which Spring never mapped (404), and the
 * funded position always answered 503. These go through the certified DB
 * functions (treasury_core_post, treasury_core_pension_position,
 * pension_owner_contributions, pension_owner_payout_logs) and nothing else.
 */
class PensionLedgerContractTest {
    static final UUID ACTOR = UUID.fromString("00000000-0000-4000-8000-000000000123");
    static final String KEY = "6f1c1d36-8d0a-4a39-9d65-1a2b3c4d5e6f";

    final MemberApiGuard guard = mock(MemberApiGuard.class);
    final PensionLedgerService ledger = mock(PensionLedgerService.class);
    final HttpServletRequest request = mock(HttpServletRequest.class);
    final PensionLedgerController controller = new PensionLedgerController(ledger, guard);

    @Test void contributionUsesTheVerifiedActorAndTheCertifiedFundCommand() {
        when(guard.verifiedMutationActor(request)).thenReturn(ACTOR);
        when(guard.idempotencyKey(KEY)).thenReturn(UUID.fromString(KEY));
        Map<String, Object> receipt = Map.of("ledger_transaction_id", "x", "principal_wld", "5000");
        when(ledger.post(ACTOR, UUID.fromString(KEY), "NPS_FUND", "5000")).thenReturn(receipt);
        var res = controller.contribute(request, Map.of("amountWld", "5000", "idempotencyKey", KEY));
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertSame(receipt, res.getBody());
    }

    @Test void contributionBelowMinimumOrMalformedNeverReachesTheLedger() {
        when(guard.verifiedMutationActor(request)).thenReturn(ACTOR);
        when(guard.idempotencyKey(KEY)).thenReturn(UUID.fromString(KEY));
        assertEquals(HttpStatus.BAD_REQUEST, controller.contribute(request, Map.of("amountWld", "999", "idempotencyKey", KEY)).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, controller.contribute(request, Map.of("amountWld", "1e5", "idempotencyKey", KEY)).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, controller.contribute(request, null).getStatusCode());
        verifyNoInteractions(ledger);
    }

    @Test void withdrawalUsesTheCertifiedWithdrawCommand() {
        when(guard.verifiedMutationActor(request)).thenReturn(ACTOR);
        when(guard.idempotencyKey(KEY)).thenReturn(UUID.fromString(KEY));
        when(ledger.post(ACTOR, UUID.fromString(KEY), "NPS_WITHDRAW", "1")).thenReturn(Map.of());
        assertEquals(HttpStatus.OK, controller.withdraw(request, Map.of("principalWld", "1", "idempotencyKey", KEY)).getStatusCode());
        verify(ledger).post(ACTOR, UUID.fromString(KEY), "NPS_WITHDRAW", "1");
    }

    @Test void writesWithoutCsrfNeverReachTheLedger() {
        when(guard.verifiedMutationActor(request)).thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "CSRF_REQUIRED"));
        assertThrows(ResponseStatusException.class, () -> controller.contribute(request, Map.of("amountWld", "5000", "idempotencyKey", KEY)));
        verifyNoInteractions(ledger);
    }

    @Test void historyReadsAreOwnerScoped() {
        when(guard.actor(request)).thenReturn(ACTOR);
        when(ledger.contributions(ACTOR)).thenReturn(List.of());
        when(ledger.payouts(ACTOR)).thenReturn(List.of());
        assertEquals(HttpStatus.OK, controller.myContributions(request).getStatusCode());
        assertEquals(HttpStatus.OK, controller.myPayouts(request).getStatusCode());
        verify(ledger).contributions(ACTOR);
        verify(ledger).payouts(ACTOR);
    }

    @Test void historyLimitStaysWithinTheDatabaseBound() {
        // pension_owner_contributions / pension_owner_payout_logs raise 22023 above 50 rows.
        assertTrue(PensionLedgerService.HISTORY_LIMIT >= 1 && PensionLedgerService.HISTORY_LIMIT <= 50);
    }

    @Test void databaseRefusalIsABadRequestAndOutageIsUnavailableNeverASuccess() {
        JdbcClient jdbc = mock(JdbcClient.class);
        var service = new PensionLedgerService(jdbc);
        when(jdbc.sql(anyString())).thenThrow(new DataIntegrityViolationException("rule", new SQLException("insufficient", "22023")));
        var refused = assertThrows(ResponseStatusException.class, () -> service.post(ACTOR, UUID.fromString(KEY), "NPS_FUND", "5000"));
        assertEquals(HttpStatus.BAD_REQUEST, refused.getStatusCode());

        reset(jdbc);
        when(jdbc.sql(anyString())).thenThrow(new IllegalStateException("offline"));
        var down = assertThrows(ResponseStatusException.class, () -> service.post(ACTOR, UUID.fromString(KEY), "NPS_FUND", "5000"));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, down.getStatusCode());
        assertThrows(ResponseStatusException.class, () -> service.contributions(ACTOR));
        assertThrows(ResponseStatusException.class, () -> service.position(ACTOR));
    }
}
