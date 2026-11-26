package com.moneyverse.api.domain.bank;

import com.moneyverse.api.domain.bank.controller.BankController;
import com.moneyverse.api.domain.bank.service.BankService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Critical (security review 2026-11-25): with no session, BankController used the
 * X-User-Id header as the member. On Test an anonymous GET /api/v1/banking/standing
 * with a forged header returned another member's standing (200); deposit, withdraw,
 * borrow, repay and claim-interest took the same path.
 */
class BankIdentityRegressionTest {
    final BankService bank = mock(BankService.class);
    final UserAuthService auth = mock(UserAuthService.class);
    final HttpServletRequest request = mock(HttpServletRequest.class);
    final BankController controller = new BankController(bank, auth);
    static final String VICTIM = "00000000-0000-4000-8000-000000000999";

    @Test void anonymousRequestWithAForgedHeaderIsRefused() {
        when(auth.resolveSession(any())).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> controller.getStanding(request, VICTIM));
        verifyNoInteractions(bank);
    }

    @Test void aHeaderThatDisagreesWithTheSessionIsRefused() {
        var s = new UserAuthService.SessionInfo();
        s.setUserId(UUID.fromString("00000000-0000-4000-8000-000000000123"));
        when(auth.resolveSession(any())).thenReturn(Optional.of(s));
        var e = assertThrows(ResponseStatusException.class, () -> controller.getStanding(request, VICTIM));
        assertEquals(403, e.getStatusCode().value());
        verifyNoInteractions(bank);
    }

    @Test void theSessionOwnerIsUsed() {
        var s = new UserAuthService.SessionInfo();
        s.setUserId(UUID.fromString("00000000-0000-4000-8000-000000000123"));
        when(auth.resolveSession(any())).thenReturn(Optional.of(s));
        controller.getStanding(request, null);
        verify(bank).getStanding("00000000-0000-4000-8000-000000000123");
    }
}
