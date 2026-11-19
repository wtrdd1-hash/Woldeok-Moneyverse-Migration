package com.moneyverse.api.domain.identity.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.UUID;

/** An actor must come from a verified database session, never a caller-supplied user ID. */
@Component
public class MemberApiGuard {
    private final UserAuthService auth;

    public MemberApiGuard(UserAuthService auth) { this.auth = auth; }

    public UserAuthService.SessionInfo session(HttpServletRequest request) {
        return auth.resolveSession(request)
                .filter(UserAuthService.SessionInfo::isSignedIn)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "SESSION_REQUIRED"));
    }

    public UUID actor(HttpServletRequest request) { return session(request).getUserId(); }

    public UUID verifiedMutationActor(HttpServletRequest request) {
        var current = session(request);
        String token = request.getHeader("X-CSRF-Token");
        if (current.getCsrfHash() == null || token == null || token.isBlank()
                || !MessageDigest.isEqual(current.getCsrfHash().getBytes(StandardCharsets.UTF_8),
                        UserAuthService.sha256(token).getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "CSRF_REQUIRED");
        }
        return current.getUserId();
    }

    public UUID idempotencyKey(String headerValue) {
        if (headerValue == null || headerValue.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "IDEMPOTENCY_KEY_REQUIRED");
        }
        try { return UUID.fromString(headerValue); }
        catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "INVALID_IDEMPOTENCY_KEY");
        }
    }
}
