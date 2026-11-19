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

        try {
            LoginResult result = authService.login(email, password, response);
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create("/"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        } catch (IllegalArgumentException e) {
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

        try {
            LoginResult result = authService.login(email, password, response);
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("outcome", "signed-in");
            res.put("csrfToken", result.csrfToken());
            res.put("consentCurrent", true);
            res.put("userId", result.userId().toString());
            res.put("displayName", result.displayName());
            res.put("roles", result.roles());
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
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
            err.put("detail", e.getMessage());
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

        boolean valid = authService.reauthenticate(session.get().getUserId(), password);
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

        String newPassword = body.get("password");
        if (newPassword == null || newPassword.length() < 4) {
            return ResponseEntity.badRequest().body(Map.of("error", "password must be at least 4 characters"));
        }

        authService.changePassword(session.get().getUserId(), newPassword);
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
}
