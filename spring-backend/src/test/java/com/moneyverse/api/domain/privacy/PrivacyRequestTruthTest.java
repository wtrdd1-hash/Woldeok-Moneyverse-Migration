package com.moneyverse.api.domain.privacy;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.privacy.controller.PrivacyController;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Audit P0 (2026-11-25): the privacy request list was always empty and create
 * returned a random id with SUBMITTED without storing anything. Requests now go
 * through privacy_create_my_request / privacy_list_my_requests; invalid input never
 * reaches the database and a failed write is never reported as received.
 */
class PrivacyRequestTruthTest {
    final UserAuthService auth = mock(UserAuthService.class);
    final JdbcClient jdbc = mock(JdbcClient.class, RETURNS_DEEP_STUBS);
    final HttpServletRequest request = mock(HttpServletRequest.class);
    final PrivacyController controller = new PrivacyController(auth, jdbc);
    static final String KEY = "6f1c1d36-8d0a-4a39-9d65-1a2b3c4d5e6f";

    private void signedIn() {
        var s = new UserAuthService.SessionInfo();
        s.setUserId(UUID.fromString("00000000-0000-4000-8000-000000000123"));
        when(auth.resolveSession(any())).thenReturn(Optional.of(s));
    }

    @Test void invalidRequestsNeverReachTheDatabase() {
        signedIn();
        assertEquals(HttpStatus.BAD_REQUEST, controller.create(request, Map.of("requestType", "export_data", "idempotencyKey", KEY)).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, controller.create(request, Map.of("requestType", "correction", "idempotencyKey", KEY)).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, controller.create(request, Map.of("requestType", "access", "detail", "x".repeat(1001), "idempotencyKey", KEY)).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, controller.create(request, Map.of("requestType", "access", "idempotencyKey", "nope")).getStatusCode());
        verifyNoInteractions(jdbc);
    }

    @Test void aDatabaseFailureIsNeverReportedAsReceived() {
        signedIn();
        reset(jdbc);
        when(jdbc.sql(anyString())).thenThrow(new IllegalStateException("offline"));
        var res = controller.create(request, Map.of("requestType", "access", "idempotencyKey", KEY));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, res.getStatusCode());
        assertNull(((Map<?, ?>) res.getBody()).get("requestId"));
    }

    @Test void listFailureIsUnavailableNotEmpty() {
        signedIn();
        reset(jdbc);
        when(jdbc.sql(anyString())).thenThrow(new IllegalStateException("offline"));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, controller.list(request, null).getStatusCode());
    }
}
