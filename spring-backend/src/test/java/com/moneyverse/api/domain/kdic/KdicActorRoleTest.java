package com.moneyverse.api.domain.kdic;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.kdic.controller.KdicController;
import com.moneyverse.api.domain.kdic.service.KdicService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class KdicActorRoleTest {
    private final UserAuthService auth = mock(UserAuthService.class);
    private final KdicService money = mock(KdicService.class);
    private final KdicController controller = new KdicController(money, auth);
    private final HttpServletRequest request = mock(HttpServletRequest.class);

    @Test
    void authenticatedNormalMemberIsNotSuperadmin() {
        UserAuthService.SessionInfo session = new UserAuthService.SessionInfo();
        session.setUserId(UUID.randomUUID());
        session.setRoles(List.of("user"));
        when(auth.resolveSession(any(HttpServletRequest.class))).thenReturn(Optional.of(session));

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> controller.getOverview(request));
        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
        verifyNoInteractions(money);
    }

    @Test
    void headerOnlyDoesNotMakeSuperadmin() {
        when(auth.resolveSession(any(HttpServletRequest.class))).thenReturn(Optional.empty());
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> controller.getLedgerIntegrity(request));
        assertEquals(HttpStatus.UNAUTHORIZED, error.getStatusCode());
        verifyNoInteractions(money);
    }

    @Test
    void actualSignedInSuperadminIdentityNotCallerHeaderIsPassedToFinanceService() {
        UUID actor = UUID.randomUUID();
        UserAuthService.SessionInfo session = new UserAuthService.SessionInfo();
        session.setUserId(actor);
        session.setRoles(List.of("superadmin"));
        when(auth.resolveSession(any(HttpServletRequest.class))).thenReturn(Optional.of(session));
        when(money.assessPremiums(actor.toString())).thenReturn(java.util.Map.of("testOnly", true));
        controller.assessPremiums(request);
        verify(money).assessPremiums(actor.toString());
    }
}
