package com.moneyverse.api.domain.identity.service;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class MemberApiGuardTest {
    final UserAuthService auth = mock(UserAuthService.class);
    final MemberApiGuard guard = new MemberApiGuard(auth);

    @Test void arbitraryUserHeaderNeverCreatesOwner() {
        var req = new MockHttpServletRequest();
        req.addHeader("X-User-Id", UUID.randomUUID().toString());
        when(auth.resolveSession(any())).thenReturn(Optional.empty());
        assertEquals(401, assertThrows(ResponseStatusException.class, () -> guard.actor(req)).getStatusCode().value());
    }

    @Test void signedInOwnerIsTakenOnlyFromVerifiedSession() {
        UUID owner = UUID.randomUUID();
        var session = new UserAuthService.SessionInfo();
        session.setUserId(owner);
        when(auth.resolveSession(any())).thenReturn(Optional.of(session));
        var req = new MockHttpServletRequest();
        req.addHeader("X-User-Id", UUID.randomUUID().toString());
        assertEquals(owner, guard.actor(req));
    }

    @Test void correctCsrfHeaderBindsMutationToSession() {
        UUID owner = UUID.randomUUID();
        var session = new UserAuthService.SessionInfo();
        session.setUserId(owner);
        session.setCsrfHash(UserAuthService.sha256("synthetic-csrf"));
        when(auth.resolveSession(any())).thenReturn(Optional.of(session));
        var req = new MockHttpServletRequest();
        req.addHeader("X-CSRF-Token", "synthetic-csrf");
        assertEquals(owner, guard.verifiedMutationActor(req));
    }

    @Test void wrongCsrfHeaderBlocksMutation() {
        var session = new UserAuthService.SessionInfo();
        session.setUserId(UUID.randomUUID());
        session.setCsrfHash(UserAuthService.sha256("expected"));
        when(auth.resolveSession(any())).thenReturn(Optional.of(session));
        var req = new MockHttpServletRequest();
        req.addHeader("X-CSRF-Token", "forged");
        assertEquals(403, assertThrows(ResponseStatusException.class,
                () -> guard.verifiedMutationActor(req)).getStatusCode().value());
    }
}
