package com.moneyverse.api.domain.identity.controller;

import com.moneyverse.api.domain.identity.service.ConsentService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

/**
 * PUT /auth/consent (QA 2026-11-25: 404 in Spring, so an updated policy could
 * not be accepted). Contract from the NestJS AuthController: full acknowledgement
 * plus age, session CSRF, 409 when the version is stale or the session expired.
 */
@Tag(name = "Auth consent", description = "Record the policy acknowledgement for the current session")
@RestController
public class ConsentController {
    private final UserAuthService auth;
    private final ConsentService consent;

    public ConsentController(UserAuthService auth, ConsentService consent) {
        this.auth = auth;
        this.consent = consent;
    }

    @PutMapping({"/api/v1/auth/consent", "/api/auth/consent"})
    @Operation(summary = "Record the full policy acknowledgement and age confirmation")
    public ResponseEntity<?> consent(HttpServletRequest request, @RequestBody(required = false) Map<String, Object> body) {
        var session = auth.resolveSession(request).orElse(null);
        if (session == null) return status(HttpStatus.UNAUTHORIZED, "SESSION_REQUIRED");
        String token = request.getHeader("X-CSRF-Token");
        if (session.getCsrfHash() == null || token == null || token.isBlank()
                || !MessageDigest.isEqual(session.getCsrfHash().getBytes(StandardCharsets.UTF_8),
                        UserAuthService.sha256(token).getBytes(StandardCharsets.UTF_8))) {
            return status(HttpStatus.FORBIDDEN, "CSRF_REQUIRED");
        }
        if (body == null || !Boolean.TRUE.equals(body.get("termsCompleted")) || !Boolean.TRUE.equals(body.get("privacyCompleted"))
                || !Boolean.TRUE.equals(body.get("ageConfirmed"))
                || !(body.get("termsVersion") instanceof String terms) || terms.isBlank() || terms.length() > 64
                || !(body.get("privacyVersion") instanceof String privacy) || privacy.isBlank() || privacy.length() > 64) {
            return status(HttpStatus.BAD_REQUEST, "FULL_ACKNOWLEDGEMENT_REQUIRED");
        }
        boolean accepted;
        try {
            accepted = session.isSignedIn()
                    ? consent.grantMember(session.getSessionId(), terms, privacy)
                    : consent.grantPrelogin(session.getSessionId(), terms, privacy);
        } catch (RuntimeException e) {
            accepted = false;
        }
        if (!accepted) return status(HttpStatus.CONFLICT, "POLICY_CHANGED_OR_SESSION_EXPIRED");
        return ResponseEntity.ok(Map.of("next", session.isSignedIn() ? "/" : "/login/providers"));
    }

    private static ResponseEntity<?> status(HttpStatus status, String code) {
        return ResponseEntity.status(status).body(Map.of("code", code));
    }
}
