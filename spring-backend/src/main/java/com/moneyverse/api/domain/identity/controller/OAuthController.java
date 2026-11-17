package com.moneyverse.api.domain.identity.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService.OAuthLoginResult;
import com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

@Tag(name = "OAuth2 Identity Provider", description = "Discord/Google OAuth2 인가 및 토큰 콜백 API")
@RestController
public class OAuthController {

    private static final Logger log = LoggerFactory.getLogger(OAuthController.class);

    private final UserAuthService authService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${moneyverse.discord.client-id:887278005179785218}")
    private String discordClientId;

    @Value("${moneyverse.discord.client-secret:vDEGshAzv9Rxh-ge9fCHZ82xTC9w-DzI}")
    private String discordClientSecret;

    @Value("${moneyverse.discord.redirect-uri:https://easy-scraping.com/auth/discord/callback}")
    private String discordRedirectUri;

    public OAuthController(UserAuthService authService, ObjectMapper objectMapper) {
        this.authService = authService;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @GetMapping(path = {
            "/auth/{provider}/authorize",
            "/api/v1/auth/{provider}/authorize"
    })
    @Operation(summary = "OAuth 인가 URL 생성 및 발급")
    public ResponseEntity<Map<String, Object>> authorize(
            @PathVariable String provider,
            @RequestParam(required = false) String client,
            HttpServletRequest request,
            HttpServletResponse response) {

        String p = provider.trim().toLowerCase();
        if (!"discord".equals(p) && !"google".equals(p)) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "unsupported_provider", "message", "지원되지 않는 OAuth 제공자입니다: " + provider));
        }

        // Resolve or create prelogin session
        Optional<SessionInfo> existing = authService.resolveSession(request);
        UUID sessionId = existing.map(SessionInfo::getSessionId).orElse(null);
        if (sessionId == null) {
            UserAuthService.PreloginSessionResult pre = authService.createPreloginSession(response);
            sessionId = pre.sessionId();
        }

        String state = sessionId.toString();
        String authorizationUrl;

        if ("discord".equals(p)) {
            authorizationUrl = String.format(
                    "https://discord.com/oauth2/authorize?client_id=%s&response_type=code&redirect_uri=%s&scope=identify%%20email&state=%s",
                    URLEncoder.encode(discordClientId, StandardCharsets.UTF_8),
                    URLEncoder.encode(discordRedirectUri, StandardCharsets.UTF_8),
                    URLEncoder.encode(state, StandardCharsets.UTF_8)
            );
        } else {
            // Google OAuth placeholder
            authorizationUrl = "https://accounts.google.com/o/oauth2/v2/auth";
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("authorizationUrl", authorizationUrl);
        return ResponseEntity.ok(res);
    }

    @GetMapping(path = {
            "/auth/{provider}/callback",
            "/api/v1/auth/{provider}/callback"
    })
    @Operation(summary = "OAuth 콜백 처리, 토큰 교환 및 세션 쿠키 발급")
    public ResponseEntity<Map<String, Object>> callback(
            @PathVariable String provider,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            HttpServletRequest request,
            HttpServletResponse response) {

        String p = provider.trim().toLowerCase();
        if (error != null && !error.isBlank()) {
            log.warn("[OAuth] Provider reported error: {}", error);
            return ResponseEntity.badRequest().body(Map.of("outcome", "error", "error", "oauth_cancelled"));
        }

        if (code == null || code.isBlank()) {
            log.warn("[OAuth] No authorization code received");
            return ResponseEntity.badRequest().body(Map.of("outcome", "error", "error", "oauth_response"));
        }

        if (!"discord".equals(p)) {
            return ResponseEntity.badRequest().body(Map.of("outcome", "error", "error", "unsupported_provider"));
        }

        try {
            // 1. Exchange authorization code for Discord access token
            String tokenBody = String.format(
                    "client_id=%s&client_secret=%s&grant_type=authorization_code&code=%s&redirect_uri=%s",
                    URLEncoder.encode(discordClientId, StandardCharsets.UTF_8),
                    URLEncoder.encode(discordClientSecret, StandardCharsets.UTF_8),
                    URLEncoder.encode(code, StandardCharsets.UTF_8),
                    URLEncoder.encode(discordRedirectUri, StandardCharsets.UTF_8)
            );

            HttpRequest tokenRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://discord.com/api/v10/oauth2/token"))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(tokenBody))
                    .build();

            HttpResponse<String> tokenResponse = httpClient.send(tokenRequest, HttpResponse.BodyHandlers.ofString());
            if (tokenResponse.statusCode() < 200 || tokenResponse.statusCode() >= 300) {
                log.error("[OAuth] Discord token exchange failed: status={}, body={}", tokenResponse.statusCode(), tokenResponse.body());
                return ResponseEntity.badRequest().body(Map.of("outcome", "error", "error", "oauth_verification"));
            }

            JsonNode tokenJson = objectMapper.readTree(tokenResponse.body());
            String accessToken = tokenJson.path("access_token").asText(null);
            if (accessToken == null || accessToken.isBlank()) {
                log.error("[OAuth] Invalid Discord access token in response: {}", tokenResponse.body());
                return ResponseEntity.badRequest().body(Map.of("outcome", "error", "error", "oauth_verification"));
            }

            // 2. Fetch user profile from Discord @me endpoint
            HttpRequest userRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://discord.com/api/v10/users/@me"))
                    .timeout(Duration.ofSeconds(10))
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> userResponse = httpClient.send(userRequest, HttpResponse.BodyHandlers.ofString());
            if (userResponse.statusCode() < 200 || userResponse.statusCode() >= 300) {
                log.error("[OAuth] Discord user profile fetch failed: status={}, body={}", userResponse.statusCode(), userResponse.body());
                return ResponseEntity.badRequest().body(Map.of("outcome", "error", "error", "oauth_verification"));
            }

            JsonNode userJson = objectMapper.readTree(userResponse.body());
            String discordId = userJson.path("id").asText(null);
            String username = userJson.path("username").asText("사용자");
            String globalName = userJson.path("global_name").asText(null);
            String displayName = (globalName != null && !globalName.isBlank()) ? globalName : username;

            if (discordId == null || discordId.isBlank()) {
                log.error("[OAuth] No discord user id in @me response: {}", userResponse.body());
                return ResponseEntity.badRequest().body(Map.of("outcome", "error", "error", "oauth_verification"));
            }

            // 3. Resolve preAuthSessionId from state or request
            UUID preAuthSessionId = null;
            if (state != null && !state.isBlank()) {
                try {
                    preAuthSessionId = UUID.fromString(state.trim());
                } catch (Exception ignored) {}
            }
            if (preAuthSessionId == null) {
                Optional<SessionInfo> sess = authService.resolveSession(request);
                preAuthSessionId = sess.map(SessionInfo::getSessionId).orElse(null);
            }

            // 4. Complete OAuth Login in Database (auth_complete_oauth_login) and issue cookies
            OAuthLoginResult result = authService.completeOAuthLogin(
                    preAuthSessionId,
                    "discord",
                    discordId,
                    displayName,
                    response
            );

            log.info("[OAuth] Successfully logged in user via Discord: userId={}, displayName={}, isNew={}",
                    result.userId(), result.displayName(), result.isNew());

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("outcome", "signed-in");
            res.put("provider", "discord");
            res.put("consentCurrent", true);
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            log.error("[OAuth] Unexpected callback error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("outcome", "error", "error", "oauth_login", "message", e.getMessage()));
        }
    }
}
