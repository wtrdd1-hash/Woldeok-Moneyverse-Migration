package com.moneyverse.api.domain.pension.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.pension.service.PensionService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class PensionReadSafetyTest {
    private final PensionService pension = mock(PensionService.class);
    private final UserAuthService auth = mock(UserAuthService.class);
    private final HttpServletRequest request = mock(HttpServletRequest.class);

    @Test
    void anonymousPensionAccountReadMustNotAccessDatabaseOrCreateAnAccount() {
        when(auth.resolveSession(any(HttpServletRequest.class))).thenReturn(Optional.empty());
        var response = new PensionController(pension, auth).getMyAccount(request);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verifyNoInteractions(pension);
    }

    @Test
    void verifiedMemberAccountReadMustBeReadOnlyAndOwnerScoped() {
        var session = new UserAuthService.SessionInfo();
        UUID id = UUID.fromString("00000000-0000-4000-8000-000000000123");
        session.setUserId(id);
        when(auth.resolveSession(request)).thenReturn(Optional.of(session));
        when(pension.readExistingAccount(anyString())).thenReturn(Optional.empty());
        var response = new PensionController(pension, auth).getMyAccount(request);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(pension).readExistingAccount(id.toString());
        verify(pension, never()).getOrCreateAccount(anyString());
    }

    @Test
    void unauthenticatedPensionWritesMustNotReachFinanceService() {
        when(auth.resolveSession(any(HttpServletRequest.class))).thenReturn(Optional.empty());
        var controller = new PensionController(pension, auth);
        assertEquals(HttpStatus.UNAUTHORIZED, controller.contribute(request, null).getStatusCode());
        assertEquals(HttpStatus.UNAUTHORIZED, controller.toggleRetirement(request).getStatusCode());
        verifyNoInteractions(pension);
    }

    @Test
    void fundedPositionMustNotClaimFakeZeroLedgerBalances() {
        when(auth.resolveSession(any(HttpServletRequest.class))).thenReturn(Optional.empty());
        assertEquals(HttpStatus.UNAUTHORIZED, new PensionController(pension, auth).getFundedPosition(request).getStatusCode());
        verifyNoInteractions(pension);
    }
}
