package com.moneyverse.api.domain.identity.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** Security 2026-11-26: password change needs CSRF and a reauthentication within 15 minutes. */
class PasswordChangeGuardTest {
    private final UserAuthService auth = mock(UserAuthService.class);
    private final HttpServletRequest request = mock(HttpServletRequest.class);
    private final SessionInfo session = mock(SessionInfo.class);
    private final UUID sid = UUID.randomUUID(), uid = UUID.randomUUID();

    PasswordChangeGuardTest() {
        when(auth.resolveSession(request)).thenReturn(Optional.of(session));
        when(session.isSignedIn()).thenReturn(true);
        when(session.getUserId()).thenReturn(uid);
        when(session.getSessionId()).thenReturn(sid);
        when(session.getCsrfHash()).thenReturn(UserAuthService.sha256("csrf-ok"));
    }

    @Test void withoutCsrfNothingChanges() {
        var r = new LocalAuthController(auth).changePassword(Map.of("password", "Long-enough-pass-1"), request);
        assertEquals(403, r.getStatusCode().value());
        verify(auth, never()).changePasswordForSession(any(), any(), any());
    }

    @Test void withoutRecentReauthenticationNothingChanges() {
        when(request.getHeader("X-CSRF-Token")).thenReturn("csrf-ok");
        when(auth.hasRecentReauthentication(sid, uid, 900)).thenReturn(false);
        var r = new LocalAuthController(auth).changePassword(Map.of("password", "Long-enough-pass-1"), request);
        assertEquals(401, r.getStatusCode().value());
        verify(auth, never()).changePasswordForSession(any(), any(), any());
    }

    @Test void weakPasswordRefusedEvenAfterReauthentication() {
        when(request.getHeader("X-CSRF-Token")).thenReturn("csrf-ok");
        when(auth.hasRecentReauthentication(sid, uid, 900)).thenReturn(true);
        assertEquals(403, new LocalAuthController(auth).changePassword(Map.of("password", "1234"), request).getStatusCode().value());
        assertEquals(403, new LocalAuthController(auth).changePassword(Map.of("password", "password"), request).getStatusCode().value());
        verify(auth, never()).changePasswordForSession(any(), any(), any());
    }

    @Test void allChecksPassedChangesThisMembersPassword() {
        when(request.getHeader("X-CSRF-Token")).thenReturn("csrf-ok");
        when(auth.hasRecentReauthentication(sid, uid, 900)).thenReturn(true);
        when(auth.changePasswordForSession(sid, uid, "Long-enough-pass-1")).thenReturn(true);
        assertEquals(200, new LocalAuthController(auth).changePassword(Map.of("password", "Long-enough-pass-1"), request).getStatusCode().value());
    }

    @Test void reauthenticationNeedsCsrf() {
        var r = new LocalAuthController(auth).reauthenticate(Map.of("password", "whatever-123"), request);
        assertEquals(403, r.getStatusCode().value());
        verify(auth, never()).reauthenticateSession(any(), any(), any());
    }
}
