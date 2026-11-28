package com.moneyverse.api.domain.wallet.controller;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.wallet.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** POST /api/v1/wallet/transfers: session + CSRF, validated recipient and amount, one journaled call. */
class WalletTransfersTest {
    private final WalletService service = mock(WalletService.class);
    private final MemberApiGuard guard = mock(MemberApiGuard.class);
    private final HttpServletRequest req = mock(HttpServletRequest.class);
    private final WalletController c = new WalletController(service, mock(UserAuthService.class), guard);
    private final UUID me = UUID.randomUUID(), other = UUID.randomUUID(), key = UUID.randomUUID();

    WalletTransfersTest() {
        when(guard.verifiedMutationActor(req)).thenReturn(me);
        when(guard.idempotencyKey(key.toString())).thenReturn(key);
    }

    private Map<String, Object> body(Object recipient, Object amount) {
        return Map.of("recipientUserId", recipient, "amount", amount, "idempotencyKey", key.toString());
    }

    @Test void withoutCsrfNothingMoves() {
        when(guard.verifiedMutationActor(req)).thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN));
        assertThrows(ResponseStatusException.class, () -> c.transfers(req, body(other.toString(), "10")));
        verifyNoInteractions(service);
    }

    @Test void refusesBadAmountsSelfAndInactiveRecipients() {
        for (Object amount : new Object[]{"0", "-5", "1.5", "abc", "1e9"}) {
            assertThrows(ResponseStatusException.class, () -> c.transfers(req, body(other.toString(), amount)), String.valueOf(amount));
        }
        assertThrows(ResponseStatusException.class, () -> c.transfers(req, body(me.toString(), "10")));
        when(service.isActiveRecipient(other)).thenReturn(false);
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException.class, () -> c.transfers(req, body(other.toString(), "10"))).getStatusCode());
        verify(service, never()).transferCanonicalWithIdempotencyKey(any(), any(), any(), any(), any());
    }

    @Test void validTransferMovesOnceThroughTheLedger() {
        when(service.isActiveRecipient(other)).thenReturn(true);
        when(service.transferCanonicalWithIdempotencyKey(me.toString(), other.toString(), "10", null, key)).thenReturn(Map.of("txId", "t", "message", "ok"));
        assertNotNull(c.transfers(req, body(other.toString(), "10")));
        verify(service).transferCanonicalWithIdempotencyKey(me.toString(), other.toString(), "10", null, key);
    }
}
