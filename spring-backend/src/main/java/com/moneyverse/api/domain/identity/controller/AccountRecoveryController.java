package com.moneyverse.api.domain.identity.controller;

import com.moneyverse.api.domain.identity.service.AccountRecoveryService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.VerificationMailer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.Normalizer;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Local password reset and login-email change (QA 2026-11-25: 404 in Spring).
 * Contract from the NestJS LocalAuthController: the reset request answers the
 * same for known and unknown addresses, tokens are stored only as SHA-256, the
 * email change needs CSRF plus reauthentication within 15 minutes.
 */
@Tag(name = "Local account recovery", description = "Password reset and login email change via auth_* DB functions")
@RestController
public class AccountRecoveryController {
    static final Duration REAUTH_WINDOW = Duration.ofMinutes(15);
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]{1,64}@[^\\s@]{1,255}\\.[^\\s@]{2,}$");
    private static final Set<String> COMMON = Set.of("password", "password1", "12345678", "123456789", "1234567890",
            "qwerty123", "qwertyuiop", "11111111", "iloveyou", "admin123", "letmein1", "00000000");

    private final UserAuthService auth;
    private final AccountRecoveryService recovery;
    private final VerificationMailer mailer;

    public AccountRecoveryController(UserAuthService auth, AccountRecoveryService recovery, VerificationMailer mailer) {
        this.auth = auth;
        this.recovery = recovery;
        this.mailer = mailer;
    }

    @PostMapping({"/api/v1/auth/local/password-reset/request", "/api/auth/local/password-reset/request"})
    @Operation(summary = "Request a one-time password reset link (same answer for every address)")
    public ResponseEntity<?> requestPasswordReset(@RequestBody(required = false) Map<String, Object> body) {
        String email = email(body);
        if (email == null) return code(HttpStatus.BAD_REQUEST, "EMAIL_INVALID");
        String token = UserAuthService.generateRandomToken();
        boolean accepted;
        try {
            accepted = recovery.startPasswordReset(email, UserAuthService.sha256(token));
        } catch (RuntimeException e) {
            accepted = false;
        }
        if (accepted) mailer.send(email, token, VerificationMailer.Purpose.PASSWORD_RESET);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("accepted", true));
    }

    @PostMapping({"/api/v1/auth/local/password-reset/complete", "/api/auth/local/password-reset/complete"})
    @Operation(summary = "Consume a reset token and replace the local password")
    public ResponseEntity<?> completePasswordReset(@RequestBody(required = false) Map<String, Object> body) {
        String token = text(body, "token");
        String password = text(body, "password");
        if (password == null || !acceptablePassword(password)) return code(HttpStatus.FORBIDDEN, "PASSWORD_POLICY");
        if (token == null || token.length() > 512) return code(HttpStatus.UNAUTHORIZED, "PASSWORD_RESET_FAILED");
        boolean done;
        try {
            done = recovery.completePasswordReset(token, password);
        } catch (RuntimeException e) {
            done = false;
        }
        return done ? ResponseEntity.ok(Map.of("outcome", "password-reset")) : code(HttpStatus.UNAUTHORIZED, "PASSWORD_RESET_FAILED");
    }

    @PostMapping({"/api/v1/auth/local/email-change/request", "/api/auth/local/email-change/request"})
    @Operation(summary = "Send a verification link to a new login email (CSRF + recent reauthentication)")
    public ResponseEntity<?> requestEmailChange(HttpServletRequest request, @RequestBody(required = false) Map<String, Object> body) {
        var session = auth.resolveSession(request).filter(UserAuthService.SessionInfo::isSignedIn).orElse(null);
        if (session == null) return code(HttpStatus.UNAUTHORIZED, "SESSION_REQUIRED");
        String csrf = request.getHeader("X-CSRF-Token");
        if (session.getCsrfHash() == null || csrf == null || csrf.isBlank()
                || !MessageDigest.isEqual(session.getCsrfHash().getBytes(StandardCharsets.UTF_8),
                        UserAuthService.sha256(csrf).getBytes(StandardCharsets.UTF_8))) {
            return code(HttpStatus.FORBIDDEN, "CSRF_REQUIRED");
        }
        Instant reauth = session.getReauthenticatedAt();
        if (reauth == null || reauth.isBefore(Instant.now().minus(REAUTH_WINDOW))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("code", "reauthentication_required"));
        }
        String email = email(body);
        if (email == null) return code(HttpStatus.BAD_REQUEST, "EMAIL_INVALID");
        String token = UserAuthService.generateRandomToken();
        boolean accepted;
        try {
            accepted = recovery.startEmailChange(session.getSessionId(), session.getUserId(), email, UserAuthService.sha256(token));
        } catch (RuntimeException e) {
            accepted = false;
        }
        if (!accepted) return code(HttpStatus.BAD_REQUEST, "EMAIL_CHANGE_UNAVAILABLE");
        if (!mailer.send(email, token, VerificationMailer.Purpose.EMAIL_CHANGE)) {
            return code(HttpStatus.SERVICE_UNAVAILABLE, "VERIFICATION_EMAIL_NOT_SENT");
        }
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("accepted", true, "verificationRequired", true));
    }

    @PostMapping({"/api/v1/auth/local/email-change/complete", "/api/auth/local/email-change/complete"})
    @Operation(summary = "Verify and activate a new login email; revokes other sessions")
    public ResponseEntity<?> completeEmailChange(@RequestBody(required = false) Map<String, Object> body) {
        String token = text(body, "token");
        if (token == null || token.length() > 512) return code(HttpStatus.UNAUTHORIZED, "EMAIL_CHANGE_FAILED");
        boolean done;
        try {
            done = recovery.completeEmailChange(token);
        } catch (RuntimeException e) {
            done = false;
        }
        return done ? ResponseEntity.ok(Map.of("outcome", "email-changed", "sessionsRevoked", true))
                : code(HttpStatus.UNAUTHORIZED, "EMAIL_CHANGE_FAILED");
    }

    static boolean acceptablePassword(String password) {
        String normalized = Normalizer.normalize(password, Normalizer.Form.NFC);
        int length = normalized.codePointCount(0, normalized.length());
        return length >= 8 && length <= 128 && !COMMON.contains(normalized.toLowerCase(Locale.ROOT));
    }

    private static String email(Map<String, Object> body) {
        String raw = text(body, "email");
        if (raw == null) return null;
        String email = Normalizer.normalize(raw.trim(), Normalizer.Form.NFC).toLowerCase(Locale.ROOT);
        return email.length() <= 320 && EMAIL.matcher(email).matches() ? email : null;
    }

    private static String text(Map<String, Object> body, String name) {
        return body != null && body.get(name) instanceof String s && !s.isEmpty() ? s : null;
    }

    private static ResponseEntity<?> code(HttpStatus status, String code) {
        return ResponseEntity.status(status).body(Map.of("code", code));
    }
}
