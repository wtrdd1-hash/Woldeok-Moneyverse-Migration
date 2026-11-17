package com.moneyverse.api.domain.identity.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class AuthSessionContractTest {
    @Test
    void anonymousSessionMustNotReturnSuccessOrGeneratedCsrfToken() {
        UserAuthService auth = mock(UserAuthService.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(auth.resolveSession(request)).thenReturn(Optional.empty());

        ResponseEntity<Map<String, Object>> result = new AuthController(auth).session(request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(result.getBody()).doesNotContainKey("csrfToken");
    }

    @Test
    void signedInSessionRemainsSuccessfulAndNeverUsesRandomFallback() {
        UserAuthService auth = mock(UserAuthService.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        SessionInfo session = new SessionInfo();
        session.setUserId(UUID.randomUUID());
        session.setCsrfHash("existing-csrf-hash");
        when(auth.resolveSession(request)).thenReturn(Optional.of(session));

        ResponseEntity<Map<String, Object>> result = new AuthController(auth).session(request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).containsEntry("csrfToken", "existing-csrf-hash");
    }
}
