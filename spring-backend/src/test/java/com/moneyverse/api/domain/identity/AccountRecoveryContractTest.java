package com.moneyverse.api.domain.identity;

import com.moneyverse.api.domain.identity.controller.AccountRecoveryController;
import com.moneyverse.api.domain.identity.service.AccountRecoveryService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.VerificationMailer;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * QA 2026-11-25: /forgot-password, /reset-password, email change and
 * /verify-email-change called Spring paths that did not exist (404).
 * Contract ported from the NestJS LocalAuthController.
 */
class AccountRecoveryContractTest {
    static final UUID SESSION = UUID.fromString("22222222-2222-4222-8222-222222222222");
    static final UUID USER = UUID.fromString("00000000-0000-4000-8000-000000000123");
    static final String CSRF = "csrf";

    final UserAuthService auth = mock(UserAuthService.class);
    final AccountRecoveryService recovery = mock(AccountRecoveryService.class);
    final VerificationMailer mailer = mock(VerificationMailer.class);
    final HttpServletRequest request = mock(HttpServletRequest.class);
    final AccountRecoveryController controller = new AccountRecoveryController(auth, recovery, mailer);

    private void signedIn(Instant reauthenticatedAt) {
        var s = new UserAuthService.SessionInfo();
        s.setSessionId(SESSION);
        s.setUserId(USER);
        s.setCsrfHash(UserAuthService.sha256(CSRF));
        s.setReauthenticatedAt(reauthenticatedAt);
        when(auth.resolveSession(request)).thenReturn(Optional.of(s));
        when(request.getHeader("X-CSRF-Token")).thenReturn(CSRF);
    }

    @Test void resetRequestAnswersTheSameForKnownAndUnknownAddresses() {
        when(recovery.startPasswordReset(eq("known@example.com"), anyString())).thenReturn(true);
        when(recovery.startPasswordReset(eq("unknown@example.com"), anyString())).thenReturn(false);
        var known = controller.requestPasswordReset(Map.of("email", " Known@Example.com "));
        var unknown = controller.requestPasswordReset(Map.of("email", "unknown@example.com"));
        assertEquals(HttpStatus.ACCEPTED, known.getStatusCode());
        assertEquals(known.getStatusCode(), unknown.getStatusCode());
        assertEquals(known.getBody(), unknown.getBody());
        verify(mailer, times(1)).send(eq("known@example.com"), anyString(), eq(VerificationMailer.Purpose.PASSWORD_RESET));
    }

    @Test void resetTokenIsStoredOnlyAsAHashAndMailedRaw() {
        when(recovery.startPasswordReset(anyString(), anyString())).thenReturn(true);
        controller.requestPasswordReset(Map.of("email", "a@b.co"));
        var hash = org.mockito.ArgumentCaptor.forClass(String.class);
        var raw = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(recovery).startPasswordReset(eq("a@b.co"), hash.capture());
        verify(mailer).send(eq("a@b.co"), raw.capture(), any());
        assertEquals(UserAuthService.sha256(raw.getValue()), hash.getValue());
        assertNotEquals(raw.getValue(), hash.getValue());
    }

    @Test void resetCompletionRejectsAWeakPasswordAndAnUnknownToken() {
        assertEquals(HttpStatus.FORBIDDEN, controller.completePasswordReset(Map.of("token", "t", "password", "password")).getStatusCode());
        when(recovery.completePasswordReset("t", "a-long-good-passphrase")).thenReturn(false);
        assertEquals(HttpStatus.UNAUTHORIZED, controller.completePasswordReset(Map.of("token", "t", "password", "a-long-good-passphrase")).getStatusCode());
        when(recovery.completePasswordReset("t2", "a-long-good-passphrase")).thenReturn(true);
        assertEquals(Map.of("outcome", "password-reset"), controller.completePasswordReset(Map.of("token", "t2", "password", "a-long-good-passphrase")).getBody());
    }

    @Test void emailChangeNeedsRecentReauthentication() {
        signedIn(Instant.now().minusSeconds(3600));
        var res = controller.requestEmailChange(request, Map.of("email", "new@example.com"));
        assertEquals(HttpStatus.UNAUTHORIZED, res.getStatusCode());
        assertEquals(Map.of("code", "reauthentication_required"), res.getBody());
        verifyNoInteractions(recovery, mailer);
    }

    @Test void emailChangeAfterReauthenticationMailsTheNewAddress() {
        signedIn(Instant.now().minusSeconds(60));
        when(recovery.startEmailChange(eq(SESSION), eq(USER), eq("new@example.com"), anyString())).thenReturn(true);
        when(mailer.send(anyString(), anyString(), any())).thenReturn(true);
        var res = controller.requestEmailChange(request, Map.of("email", "New@Example.com"));
        assertEquals(HttpStatus.ACCEPTED, res.getStatusCode());
        verify(mailer).send(eq("new@example.com"), anyString(), eq(VerificationMailer.Purpose.EMAIL_CHANGE));
    }

    @Test void emailChangeWhoseMailWasNotSentIsUnavailableNotAccepted() {
        signedIn(Instant.now().minusSeconds(60));
        when(recovery.startEmailChange(any(), any(), anyString(), anyString())).thenReturn(true);
        when(mailer.send(anyString(), anyString(), any())).thenReturn(false);
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, controller.requestEmailChange(request, Map.of("email", "n@e.co")).getStatusCode());
    }

    @Test void emailChangeWithoutCsrfIsForbidden() {
        signedIn(Instant.now());
        when(request.getHeader("X-CSRF-Token")).thenReturn("wrong");
        assertEquals(HttpStatus.FORBIDDEN, controller.requestEmailChange(request, Map.of("email", "n@e.co")).getStatusCode());
        verifyNoInteractions(recovery);
    }

    @Test void emailChangeCompletionRevokesSessions() {
        when(recovery.completeEmailChange("tok")).thenReturn(true);
        assertEquals(Map.of("outcome", "email-changed", "sessionsRevoked", true), controller.completeEmailChange(Map.of("token", "tok")).getBody());
        when(recovery.completeEmailChange("bad")).thenReturn(false);
        assertEquals(HttpStatus.UNAUTHORIZED, controller.completeEmailChange(Map.of("token", "bad")).getStatusCode());
    }

    @Test void malformedEmailIsRejectedBeforeTheDatabase() {
        assertEquals(HttpStatus.BAD_REQUEST, controller.requestPasswordReset(Map.of("email", "not-an-email")).getStatusCode());
        verifyNoInteractions(recovery);
    }
}
