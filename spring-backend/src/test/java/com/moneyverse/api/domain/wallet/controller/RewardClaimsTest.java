package com.moneyverse.api.domain.wallet.controller;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RewardClaimsTest {
    @Test void withoutCsrfTheLedgerIsNeverCalled() {
        MemberApiGuard guard = mock(MemberApiGuard.class);
        JdbcClient jdbc = mock(JdbcClient.class);
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(guard.verifiedMutationActor(req)).thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "CSRF_REQUIRED"));
        assertThrows(ResponseStatusException.class, () -> new RewardClaimsController(jdbc, guard).claimDaily(req, Map.of("idempotencyKey", "x")));
        verifyNoInteractions(jdbc);
    }

    @Test void receiptMustProveAPositiveJournaledAmount() {
        assertEquals("500", RewardClaimsController.receipt(Map.of("transaction_id", "11111111-1111-1111-1111-111111111111", "amount", "500", "replayed", false)).get("amount"));
        assertThrows(ResponseStatusException.class, () -> RewardClaimsController.receipt(Map.of("transaction_id", "x", "amount", "500", "replayed", false)));
        assertThrows(ResponseStatusException.class, () -> RewardClaimsController.receipt(Map.of("transaction_id", "11111111-1111-1111-1111-111111111111", "amount", "0", "replayed", false)));
    }

    @Test void legacyWorkFaucetIsGone() {
        assertEquals(410, new RewardClaimsController(mock(JdbcClient.class), mock(MemberApiGuard.class)).claimWork().getStatusCode().value());
    }
}
