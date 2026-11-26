package com.moneyverse.api.domain.identity.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService.LoginResult;
import com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Tag(name = "Local Auth", description = "자체 이메일/비밀번호 로그인, 회원가입 및 재인증 API")
@RestController
public class LocalAuthController {

    private final UserAuthService authService;
    /** Security review 2026-11-25: no limit existed on password guesses. Keyed by account. */
    public static final int LOGIN_MAX_FAILURES = 10;
    public static final int REAUTH_MAX_FAILURES = 5;
    private final com.moneyverse.api.domain.identity.service.LoginAttemptLimiter loginLimiter =
            new com.moneyverse.api.domain.identity.service.LoginAttemptLimiter(LOGIN_MAX_FAILURES, java.time.Duration.ofMinutes(15));
    private final com.moneyverse.api.domain.identity.service.LoginAttemptLimiter reauthLimiter =
            new com.moneyverse.api.domain.identity.service.LoginAttemptLimiter(REAUTH_MAX_FAILURES, java.time.Duration.ofMinutes(15));

    static final int REAUTH_WINDOW_SECONDS = 900;
    private static final java.util.Set<String> COMMON_PASSWORDS = java.util.Set.of("password", "passwordpassword", "1234", "123456",
            "12345678", "123456789", "123456789012345", "qwerty", "qwertyqwertyqwerty", "letmein", "letmeinletmeinletmein", "admin",
            "111111", "abc123", "11111111", "00000000", "password1", "qwerty123", "iloveyou");

    /** 8 to 128 code points (the register form's floor) and not a well-known password. */
    static boolean acceptablePassword(String password) {
        if (password == null) return false;
        String n = java.text.Normalizer.normalize(password, java.text.Normalizer.Form.NFC);
        int len = n.codePointCount(0, n.length());
        return len >= 8 && len <= 128 && !COMMON_PASSWORDS.contains(n.toLowerCase(java.util.Locale.ROOT));
    }

    private static boolean csrfOk(SessionInfo session, HttpServletRequest request) {
        String token = request.getHeader("X-CSRF-Token");
        return session.getCsrfHash() != null && token != null && !token.isBlank()
                && java.security.MessageDigest.isEqual(session.getCsrfHash().getBytes(java.nio.charset.StandardCharsets.UTF_8),
                        UserAuthService.sha256(token).getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    public LocalAuthController(UserAuthService authService) {
        this.authService = authService;
    }

    /**
     * Standard Form POST for browser forms (/login)
     */
    @PostMapping(
            path = {"/login", "/api/v1/auth/local/login", "/api/auth/local/login", "/api/v1/auth/login", "/api/auth/login"},
            consumes = {MediaType.APPLICATION_FORM_URLENCODED_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE}
    )
    @Operation(summary = "브라우저 폼 기반 이메일/비밀번호 로그인 및 홈 리다이렉트")
    public ResponseEntity<?> formLogin(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String password,
            HttpServletResponse response) {
        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create("/login?error=missing_credentials"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }

        if (loginLimiter.blocked(email, java.time.Instant.now())) {
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create("/login?error=too_many_attempts"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }
        try {
            LoginResult result = authService.login(email, password, response);
            loginLimiter.recordSuccess(email);
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create("/"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        } catch (IllegalArgumentException e) {
            loginLimiter.recordFailure(email, java.time.Instant.now());
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create("/login?error=invalid_credentials"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        } catch (Exception e) {
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create("/login?error=server_error"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }
    }

    /**
     * JSON POST for AJAX / API callers
     */
    @PostMapping(
            path = {"/login", "/api/v1/auth/local/login", "/api/auth/local/login", "/api/v1/auth/login", "/api/auth/login"},
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    @Operation(summary = "JSON 기반 이메일/비밀번호 로그인")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> body,
            HttpServletResponse response) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and password are required"));
        }

        if (loginLimiter.blocked(email, java.time.Instant.now())) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).header("Retry-After", "900")
                    .body(Map.of("status", 429, "code", "too_many_attempts", "detail", "too many failed sign-in attempts; try again later"));
        }
        try {
            LoginResult result = authService.login(email, password, response);
            loginLimiter.recordSuccess(email);
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("outcome", "signed-in");
            res.put("csrfToken", result.csrfToken());
            res.put("consentCurrent", true);
            res.put("userId", result.userId().toString());
            res.put("displayName", result.displayName());
            res.put("roles", result.roles());
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            loginLimiter.recordFailure(email, java.time.Instant.now());
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("type", "about:blank");
            err.put("title", "Unauthorized");
            err.put("status", 401);
            err.put("detail", "invalid credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        } catch (Exception e) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("title", "Internal Server Error");
            err.put("status", 500);
            err.put("detail", "sign-in is temporarily unavailable"); // never echo internal exception text
            // Logged by class only: an unexplained 500 on sign-in hid a missing database function
            // during 2026-11-26 work.
            org.slf4j.LoggerFactory.getLogger(LocalAuthController.class)
                    .warn("[LocalAuth] sign-in failed: {}", e.getClass().getName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @PostMapping(path = {
            "/api/v1/auth/local/register",
            "/api/auth/local/register"
    })
    @Operation(summary = "신규 회원 가입")
    public ResponseEntity<Map<String, Object>> register(
            @RequestBody Map<String, String> body,
            HttpServletResponse response) {
        String email = body.get("email");
        String password = body.get("password");
        String displayName = body.getOrDefault("displayName", "신규시민");

        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and password are required"));
        }

        try {
            LoginResult result = authService.register(email, password, displayName, response);
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("accepted", true);
            res.put("outcome", "signed-in");
            res.put("csrfToken", result.csrfToken());
            res.put("userId", result.userId().toString());
            res.put("displayName", result.displayName());
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(res);
        } catch (org.springframework.web.server.ResponseStatusException unavailable) {
            if(unavailable.getStatusCode().value()!=503) throw unavailable;
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .header(HttpHeaders.CACHE_CONTROL,"private, no-store")
                .body(Map.of("ok",false,"success",false,"code","LOCAL_REGISTRATION_CONTRACT_UNAVAILABLE"));
        } catch (IllegalStateException e) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("title", "Conflict");
            err.put("status", 409);
            err.put("detail", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
        } catch (Exception e) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("title", "Internal Server Error");
            err.put("status", 500);
            err.put("detail", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @PostMapping(path = {
            "/api/v1/auth/local/reauthentication",
            "/api/auth/local/reauthentication"
    })
    @Operation(summary = "민감 작업 전 비밀번호 재확인")
    public ResponseEntity<Map<String, Object>> reauthenticate(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        Optional<SessionInfo> session = authService.resolveSession(request);
        if (session.isEmpty() || !session.get().isSignedIn()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("detail", "login required"));
        }

        String password = body.get("password");
        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "password is required"));
        }

        if (!csrfOk(session.get(), request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("detail", "csrf required", "code", "csrf_required"));
        }
        String reauthKey = session.get().getUserId().toString();
        if (reauthLimiter.blocked(reauthKey, java.time.Instant.now())) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).header("Retry-After", "900")
                    .body(Map.of("code", "too_many_attempts", "detail", "too many failed password checks; try again later"));
        }
        boolean valid = authService.reauthenticateSession(session.get().getSessionId(), session.get().getUserId(), password);
        if (valid) reauthLimiter.recordSuccess(reauthKey); else reauthLimiter.recordFailure(reauthKey, java.time.Instant.now());
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "invalid credentials"));
        }

        return ResponseEntity.ok(Map.of("outcome", "reauthenticated"));
    }

    @PostMapping(path = {
            "/api/v1/auth/local/password/change",
            "/api/auth/local/password/change"
    })
    @Operation(summary = "비밀번호 변경")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        Optional<SessionInfo> session = authService.resolveSession(request);
        if (session.isEmpty() || !session.get().isSignedIn()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("detail", "login required"));
        }

        // Security 2026-11-26: this changed the password with no CSRF check, no recent
        // reauthentication and a 4-character floor, so any live session (or a same-site page
        // riding on one) could take the account. NestJS: SessionGuard + CsrfGuard + ReauthGuard.
        if (!csrfOk(session.get(), request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("detail", "csrf required", "code", "csrf_required"));
        }
        if (!authService.hasRecentReauthentication(session.get().getSessionId(), session.get().getUserId(), REAUTH_WINDOW_SECONDS)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "recent reauthentication required", "code", "reauthentication_required"));
        }
        String newPassword = body.get("password");
        if (!acceptablePassword(newPassword)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("detail", "password does not meet policy"));
        }
        if (!authService.changePasswordForSession(session.get().getSessionId(), session.get().getUserId(), newPassword)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("detail", "local credential required"));
        }
        return ResponseEntity.ok(Map.of("outcome", "password-changed"));
    }

    @PostMapping(path = {
            "/api/v1/auth/logout",
            "/api/auth/logout"
    })
    @Operation(summary = "로그아웃 및 세션 쿠키 소거")
    public ResponseEntity<Map<String, Object>> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        authService.logout(request, response);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("ok", true);
        res.put("message", "logged out");
        return ResponseEntity.ok(res);
    }

    @GetMapping(path = {
            "/api/v1/auth/session-token-login",
            "/api/auth/session-token-login"
    })
    public ResponseEntity<?> sessionTokenLogin(
            @RequestParam(required = false) String token,
            @RequestParam(required = false, defaultValue = "/wallet") String next,
            HttpServletResponse response) {
        if (token != null && !token.isBlank()) {
            boolean valid = authService.bindExistingSessionByToken(token, response);
            if (valid) {
                HttpHeaders headers = new HttpHeaders();
                headers.setLocation(URI.create(next.startsWith("/") ? next : "/wallet"));
                return new ResponseEntity<>(headers, HttpStatus.FOUND);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "invalid session token"));
    }
}
