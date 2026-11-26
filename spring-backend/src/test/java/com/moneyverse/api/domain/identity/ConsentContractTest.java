package com.moneyverse.api.domain.identity;

import com.moneyverse.api.domain.identity.controller.ConsentController;
import com.moneyverse.api.domain.identity.service.ConsentService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * QA 2026-11-25: /login and /register PUT /api/v1/auth/consent, which Spring
 * never mapped (404), so a member asked to accept an updated policy could not.
 */
class ConsentContractTest {
    static final UUID SESSION = UUID.fromString("22222222-2222-4222-8222-222222222222");
    static final UUID USER = UUID.fromString("00000000-0000-4000-8000-000000000123");
    static final String CSRF = "csrf-token-value";

    final UserAuthService auth = mock(UserAuthService.class);
    final ConsentService consent = mock(ConsentService.class);
    final HttpServletRequest request = mock(HttpServletRequest.class);
    final ConsentController controller = new ConsentController(auth, consent);
    final Map<String, Object> full = Map.of("termsCompleted", true, "privacyCompleted", true, "ageConfirmed", true,
            "termsVersion", "2026-09-02", "privacyVersion", "2026-09-02");

    private void session(UUID user) {
        var s = new UserAuthService.SessionInfo();
        s.setSessionId(SESSION);
        s.setUserId(user);
        s.setCsrfHash(UserAuthService.sha256(CSRF));
        when(auth.resolveSession(request)).thenReturn(Optional.of(s));
        when(request.getHeader("X-CSRF-Token")).thenReturn(CSRF);
    }

    @Test void signedInMemberConsentUsesTheDatabaseFunctionAndReturnsHome() {
        session(USER);
        when(consent.grantMember(SESSION, "2026-09-02", "2026-09-02")).thenReturn(true);
        var res = controller.consent(request, full);
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals(Map.of("next", "/"), res.getBody());
    }

    @Test void preloginConsentReturnsTheProviderStep() {
        session(null);
        when(consent.grantPrelogin(SESSION, "2026-09-02", "2026-09-02")).thenReturn(true);
        assertEquals(Map.of("next", "/login/providers"), controller.consent(request, full).getBody());
    }

    @Test void staleVersionOrExpiredSessionIsAConflict() {
        session(USER);
        when(consent.grantMember(any(), anyString(), anyString())).thenReturn(false);
        assertEquals(HttpStatus.CONFLICT, controller.consent(request, full).getStatusCode());
    }

    @Test void partialAcknowledgementNeverReachesTheDatabase() {
        session(USER);
        var partial = new java.util.HashMap<>(full);
        partial.put("ageConfirmed", false);
        assertEquals(HttpStatus.BAD_REQUEST, controller.consent(request, partial).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, controller.consent(request, null).getStatusCode());
        verifyNoInteractions(consent);
    }

    @Test void missingOrWrongCsrfIsForbidden() {
        session(USER);
        when(request.getHeader("X-CSRF-Token")).thenReturn("wrong");
        assertEquals(HttpStatus.FORBIDDEN, controller.consent(request, full).getStatusCode());
        when(auth.resolveSession(request)).thenReturn(Optional.empty());
        assertEquals(HttpStatus.UNAUTHORIZED, controller.consent(request, full).getStatusCode());
        verifyNoInteractions(consent);
    }
}
