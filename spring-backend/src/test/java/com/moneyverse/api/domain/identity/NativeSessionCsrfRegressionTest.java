package com.moneyverse.api.domain.identity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.config.SecurityConfig;
import com.moneyverse.api.config.SensitiveApiBoundaryFilter;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.identity.controller.AdminSecurityController;
import com.moneyverse.api.domain.identity.controller.AuthController;
import com.moneyverse.api.domain.identity.controller.OAuthController;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.core.env.MapPropertySource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.server.ResponseStatusException;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class NativeSessionCsrfRegressionTest {
    private static final String SESSION = "ci_session_native_bootstrap";
    private static final String PROOF = "ci_csrf_native_bootstrap";
    private static final UUID SESSION_ID = UUID.fromString("00000000-0000-4000-8000-000000000101");
    private static final UUID OWNER = UUID.fromString("00000000-0000-4000-8000-000000000102");
    private static final String HOST_PROOF = "__Host-mv_csrf";
    private final ObjectMapper json = new ObjectMapper();
    private SingleConnectionDataSource dataSource;
    private JdbcTemplate jdbc;
    private UserAuthService auth;
    private MockMvc mvc;

    @BeforeEach void setUp() {
        dataSource = new SingleConnectionDataSource("jdbc:h2:mem:ci_csrf_" + UUID.randomUUID() + ";MODE=PostgreSQL", "sa", "", true);
        jdbc = new JdbcTemplate(dataSource);
        jdbc.execute("""
                CREATE TABLE auth_sessions (
                    id UUID PRIMARY KEY, token_hash TEXT, csrf_hash TEXT, user_id UUID,
                    expires_at TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP WITH TIME ZONE,
                    reauthenticated_at TIMESTAMP WITH TIME ZONE, revoked_at TIMESTAMP WITH TIME ZONE,
                    prelogin_age_confirmed BOOLEAN)
                """);
        jdbc.execute("""
                CREATE TABLE auth_local_credentials (
                    user_id UUID, email TEXT, email_hash TEXT, password_verifier TEXT, disabled_at TIMESTAMP)
                """);
        jdbc.update("INSERT INTO auth_sessions (id, token_hash, csrf_hash, user_id, expires_at) VALUES (?, ?, ?, ?, ?)",
                SESSION_ID, UserAuthService.sha256(SESSION), UserAuthService.sha256(PROOF), OWNER,
                Timestamp.from(Instant.now().plusSeconds(3600)));
        auth = new UserAuthService(jdbc);
        mvc = mvc(auth);
    }

    @AfterEach void tearDown() {
        dataSource.destroy();
    }

    private MockMvc mvc(UserAuthService service) {
        return MockMvcBuilders.standaloneSetup(new AuthController(service))
                .addFilters(new CorsFilter(new SecurityConfig().corsConfigurationSource())).build();
    }

    private MockHttpServletRequestBuilder bootstrap() {
        return get("/api/v1/auth/session").header("Sec-Fetch-Site", "same-origin")
                .cookie(new Cookie("mv_session", SESSION));
    }

    private JsonNode body(MvcResult result) throws Exception {
        return json.readTree(result.getResponse().getContentAsString());
    }

    private MvcResult perform(MockHttpServletRequestBuilder request) throws Exception {
        return mvc.perform(request).andExpect(status().isOk()).andReturn();
    }

    private void authenticatedWithoutProof(MvcResult result) throws Exception {
        var response = body(result);
        assertTrue(response.path("signedIn").asBoolean(), "Missing proof must preserve login");
        assertTrue(response.path("authenticated").asBoolean(), "Missing proof must preserve authentication");
        assertTrue(OWNER.toString().equals(response.path("user").path("id").asText()), "Session owner is preserved");
        assertTrue(response.path("csrfToken").asText("").isEmpty(), "No usable token or stored digest is disclosed");
        assertTrue(UserAuthService.sha256(PROOF).equals(
                jdbc.queryForObject("SELECT csrf_hash FROM auth_sessions WHERE id = ?", String.class, SESSION_ID)),
                "Bootstrap must not rotate an existing session hash");
    }

    @Test void matchingCookieReturnsRawProofAcceptedByBothExistingWriteGuards() throws Exception {
        var result = perform(bootstrap().cookie(new Cookie(HOST_PROOF, PROOF)));
        String raw = body(result).path("csrfToken").asText();
        assertTrue(PROOF.equals(raw), "Bootstrap must return the verified raw proof");
        assertFalse(UserAuthService.sha256(PROOF).equals(raw), "Bootstrap must never disclose the stored digest");
        var request = new MockHttpServletRequest("POST", "/api/v1/support/threads");
        request.setCookies(new Cookie("mv_session", SESSION));
        request.addHeader("X-CSRF-Token", raw);
        assertEquals(OWNER, new MemberApiGuard(auth).verifiedMutationActor(request));
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();
        new SensitiveApiBoundaryFilter(auth, mock(AdminAuthService.class)).doFilter(request, response, chain);
        assertNotNull(chain.getRequest(), "Existing boundary must accept verified raw proof");
        assertTrue(UserAuthService.sha256(PROOF).equals(
                jdbc.queryForObject("SELECT csrf_hash FROM auth_sessions WHERE id = ?", String.class, SESSION_ID)),
                "Reading proof must not change its stored digest");
    }

    @Test void legacySessionWithoutProofRemainsAuthenticated() throws Exception {
        authenticatedWithoutProof(perform(bootstrap()));
    }

    @ParameterizedTest
    @ValueSource(strings = {"ci_wrong_proof", "ci proof", "%63i_csrf_native_bootstrap", "\"ci_csrf_native_bootstrap\"", ""})
    void invalidProofNeverLeaksHashOrChangesLogin(String proof) throws Exception {
        authenticatedWithoutProof(perform(bootstrap().cookie(new Cookie(HOST_PROOF, proof))));
    }

    @Test void storedHashIsNotAcceptedAsRawProof() throws Exception {
        authenticatedWithoutProof(perform(bootstrap().cookie(new Cookie(HOST_PROOF, UserAuthService.sha256(PROOF)))));
    }

    @Test void oversizedProofFailsClosed() throws Exception {
        authenticatedWithoutProof(perform(bootstrap().cookie(new Cookie(HOST_PROOF, "ci_" + "a".repeat(256)))));
    }

    @Test void verifiedLegacyCookieWorksOnlyWhenHostCookieIsAbsent() throws Exception {
        var valid = perform(bootstrap().cookie(new Cookie("mv_csrf", PROOF)));
        assertTrue(PROOF.equals(body(valid).path("csrfToken").asText()), "Legacy proof must match the current session");
        authenticatedWithoutProof(perform(bootstrap().cookie(new Cookie(HOST_PROOF, "ci_invalid"), new Cookie("mv_csrf", PROOF))));
    }

    @Test void duplicateHostCookiesFailClosed() throws Exception {
        authenticatedWithoutProof(perform(bootstrap().cookie(new Cookie(HOST_PROOF, PROOF), new Cookie(HOST_PROOF, "ci_invalid"))));
    }

    @Test void rawCookieHeaderIsValidatedWithoutDecodingProof() throws Exception {
        var result = perform(get("/api/auth/session").header("Sec-Fetch-Site", "same-origin")
                .header("Cookie", "mv_session=" + SESSION + "; " + HOST_PROOF + "=" + PROOF));
        assertTrue(PROOF.equals(body(result).path("csrfToken").asText()), "Proxy Cookie header proof must match exactly");
    }

    @Test void anonymousCookieCannotCreateMutationProof() throws Exception {
        var result = perform(get("/api/v1/auth/session").header("Sec-Fetch-Site", "same-origin")
                .cookie(new Cookie(HOST_PROOF, PROOF)));
        assertFalse(body(result).path("signedIn").asBoolean());
        assertTrue(body(result).path("csrfToken").asText("").isEmpty(), "Anonymous bootstrap must not invent a token");
    }

    @ParameterizedTest @ValueSource(strings = {"expired", "revoked"})
    void inactiveSessionCannotReturnProof(String state) throws Exception {
        if (state.equals("expired")) {
            jdbc.update("UPDATE auth_sessions SET expires_at = ? WHERE id = ?", Timestamp.from(Instant.now().minusSeconds(60)), SESSION_ID);
        } else {
            jdbc.update("UPDATE auth_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?", SESSION_ID);
        }
        var result = perform(bootstrap().cookie(new Cookie(HOST_PROOF, PROOF)));
        assertFalse(body(result).path("signedIn").asBoolean());
        assertTrue(body(result).path("csrfToken").asText("").isEmpty(), "Inactive sessions must expose no proof");
    }

    @Test void preloginProofIsPreservedWithoutInventingSignedInUser() throws Exception {
        jdbc.update("UPDATE auth_sessions SET user_id = NULL WHERE id = ?", SESSION_ID);
        var result = perform(bootstrap().cookie(new Cookie(HOST_PROOF, PROOF)));
        assertFalse(body(result).path("signedIn").asBoolean());
        assertTrue(body(result).path("user").isNull());
        assertTrue(PROOF.equals(body(result).path("csrfToken").asText()), "Prelogin proof remains session-owned");
    }

    @Test void bothBootstrapAliasesArePrivateAndRetainCorsVaryHeaders() throws Exception {
        for (String path : List.of("/api/auth/session", "/api/v1/auth/session")) {
            var response = perform(get(path).header("Sec-Fetch-Site", "same-origin")).getResponse();
            assertTrue(response.getHeader("Cache-Control") != null
                    && response.getHeader("Cache-Control").contains("private")
                    && response.getHeader("Cache-Control").contains("no-store"), "Bootstrap must prevent caching");
            String vary = String.join(",", response.getHeaders("Vary"));
            assertTrue(vary.contains("Cookie"), "Response must vary by session cookie");
            assertTrue(vary.contains("Origin"), "Existing CORS Vary values must be preserved");
        }
    }

    @ParameterizedTest @ValueSource(strings = {"https://www.easy-scraping.com", "http://localhost:3000"})
    void CorsAllowedCrossOriginCannotReadRawProof(String origin) throws Exception {
        assertBootstrapDenied(bootstrap().header("Origin", origin).cookie(new Cookie(HOST_PROOF, PROOF)));
    }

    @ParameterizedTest @ValueSource(strings = {"same-site", "cross-site", "none", "ci_invalid"})
    void NonSameOriginFetchMetadataCannotReadProof(String site) throws Exception {
        var request = get("/api/v1/auth/session").header("Sec-Fetch-Site", site)
                .cookie(new Cookie("mv_session", SESSION), new Cookie(HOST_PROOF, PROOF));
        assertBootstrapDenied(request);
    }

    @Test void missingBrowserMetadataDoesNotDiscloseProof() throws Exception {
        authenticatedWithoutProof(perform(get("/api/v1/auth/session")
                .cookie(new Cookie("mv_session", SESSION), new Cookie(HOST_PROOF, PROOF))));
    }

    @Test void configuredHttpsOriginWorksBehindHttpTermination() throws Exception {
        try (var context = new AnnotationConfigApplicationContext()) {
            context.getEnvironment().getPropertySources().addFirst(new MapPropertySource(
                    "ci_public_origin", Map.of("moneyverse.app-base-url", "https://easy-scraping.com")));
            context.registerBean(UserAuthService.class, () -> auth);
            context.refresh();
        }
        var result = perform(bootstrap().header("Origin", "https://easy-scraping.com")
                .cookie(new Cookie(HOST_PROOF, PROOF)));
        assertEquals("http", result.getRequest().getScheme());
        assertTrue(PROOF.equals(body(result).path("csrfToken").asText()), "Configured public origin must survive TLS termination");
    }

    @Test void absentOriginConfigurationNeverTrustsHostOrForwardedHeaders() throws Exception {
        assertBootstrapDenied(bootstrap().header("Origin", "https://easy-scraping.com")
                .header("Host", "easy-scraping.com").header("X-Forwarded-Host", "easy-scraping.com")
                .header("X-Forwarded-Proto", "https").cookie(new Cookie(HOST_PROOF, PROOF)));
    }

    @Test void preloginCreationSetsProofWithSessionLifetimeAndLogoutClearsIt() {
        var response = new MockHttpServletResponse();
        var created = auth.createPreloginSession(response);
        assertProofCookie(response, created.csrfToken(), 30 * 24 * 60 * 60);
        assertTrue(UserAuthService.sha256(created.csrfToken()).equals(
                jdbc.queryForObject("SELECT csrf_hash FROM auth_sessions WHERE id = ?", String.class, created.sessionId())),
                "Proof cookie must correspond to the persisted session hash");
        var request = new MockHttpServletRequest();
        request.setCookies(new Cookie("mv_session", created.token()));
        var cleared = new MockHttpServletResponse();
        auth.logout(request, cleared);
        assertProofCookie(cleared, "", 0);
        assertNotNull(jdbc.queryForObject("SELECT revoked_at FROM auth_sessions WHERE id = ?", Timestamp.class, created.sessionId()));
    }

    @Test void localLoginSetsTheRawProofCookie() {
        var encoder = new Argon2PasswordEncoder(16, 32, 1, 19456, 2);
        jdbc.update("INSERT INTO auth_local_credentials (user_id, email, email_hash, password_verifier) VALUES (?, ?, ?, ?)",
                OWNER, "ci_member@example.invalid", UserAuthService.sha256("ci_member@example.invalid"), encoder.encode("ci_password"));
        var response = new MockHttpServletResponse();
        var result = auth.login("ci_member@example.invalid", "ci_password", response);
        assertProofCookie(response, result.csrfToken(), 30 * 24 * 60 * 60);
        assertTrue(UserAuthService.sha256(result.csrfToken()).equals(
                jdbc.queryForObject("SELECT csrf_hash FROM auth_sessions WHERE id = ?", String.class, result.sessionId())),
                "Local login proof must match its new session hash");
    }

    @Test void oauthCompletionSetsProofForItsExistingEightHourSession() {
        var database = mock(JdbcTemplate.class);
        when(database.queryForObject(anyString(), eq(Integer.class), any(UUID.class))).thenReturn(1);
        when(database.queryForMap(startsWith("SELECT user_id, session_id, is_new"), any(Object[].class)))
                .thenAnswer(invocation -> {
                    var args = invocation.getArguments();
                    String expectedHash = (String) args[7];
                    assertTrue(expectedHash != null && expectedHash.length() == 64, "OAuth receives a digest");
                    return Map.of("user_id", OWNER, "session_id", SESSION_ID, "is_new", false);
                });
        var service = new UserAuthService(database);
        var response = new MockHttpServletResponse();
        var result = service.completeOAuthLogin(SESSION_ID, "discord", "ci_subject", "ci_member", response);
        assertProofCookie(response, result.csrfToken(), 8 * 60 * 60);
        verify(database).queryForMap(startsWith("SELECT user_id, session_id, is_new"),
                eq(SESSION_ID), eq("discord"), eq("ci_subject"), anyString(), eq("ci_member"), anyString(),
                eq(UserAuthService.sha256(result.csrfToken())));
    }

    @Test void adminRotationAndEveryAdminCleanupPathKeepProofCookieLifecycle() {
        var admin = mock(AdminAuthService.class);
        when(admin.isAuthorizedAdmin(any())).thenReturn(true);
        when(admin.resolveAdminUserId(any())).thenReturn(java.util.Optional.of(OWNER));
        when(admin.extractSessionToken(any())).thenReturn(SESSION);
        var controller = new AdminSecurityController(admin, mock(JdbcTemplate.class));
        var response = new MockHttpServletResponse();
        var opened = controller.openConsoleSession(new MockHttpServletRequest(), response);
        var payload = (Map<?, ?>) opened.getBody();
        assertNotNull(payload);
        assertProofCookie(response, (String) payload.get("csrfToken"), 30 * 24 * 60 * 60);
        var closed = new MockHttpServletResponse();
        controller.closeConsoleSession(new MockHttpServletRequest(), closed);
        assertProofCookie(closed, "", 0);
        var forced = new MockHttpServletResponse();
        controller.forceLogout(forced);
        assertProofCookie(forced, "", 0);
    }

    @Test void storedDigestStillFailsBothWriteGuards() throws Exception {
        var request = new MockHttpServletRequest("POST", "/api/v1/support/threads");
        request.setCookies(new Cookie("mv_session", SESSION));
        request.addHeader("X-CSRF-Token", UserAuthService.sha256(PROOF));
        assertEquals(403, assertThrows(ResponseStatusException.class,
                () -> new MemberApiGuard(auth).verifiedMutationActor(request)).getStatusCode().value());
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();
        new SensitiveApiBoundaryFilter(auth, mock(AdminAuthService.class)).doFilter(request, response, chain);
        assertEquals(403, response.getStatus());
        assertNull(chain.getRequest());
    }

    @Test void rawHeaderWithPaddedProofIsMalformed() throws Exception {
        authenticatedWithoutProof(perform(get("/api/auth/session").header("Sec-Fetch-Site", "same-origin")
                .header("Cookie", "mv_session=" + SESSION + "; " + HOST_PROOF + "= " + PROOF)));
    }

    @Test void logoutClearsLegacyProofCookieAsWellAsHostProof() {
        var request = new MockHttpServletRequest();
        request.setCookies(new Cookie("mv_session", SESSION), new Cookie("mv_csrf", PROOF));
        var response = new MockHttpServletResponse();
        auth.logout(request, response);
        assertTrue(response.getHeaders("Set-Cookie").stream()
                .anyMatch(value -> value.startsWith("mv_csrf=;") && value.contains("Max-Age=0")),
                "Supported legacy proof must be cleared with its session");
        var admin = new AdminSecurityController(mock(AdminAuthService.class), mock(JdbcTemplate.class));
        var closed = new MockHttpServletResponse();
        admin.closeConsoleSession(request, closed);
        assertTrue(closed.getHeaders("Set-Cookie").stream()
                .anyMatch(value -> value.startsWith("mv_csrf=;") && value.contains("Max-Age=0")),
                "Admin session cleanup must also clear legacy proof");
    }

    @Test void oauthBrowserRedirectRetainsNewProofCookieWithoutCallingProvider() throws Exception {
        var database = mock(JdbcTemplate.class);
        when(database.queryForObject(anyString(), eq(Integer.class), any(UUID.class))).thenReturn(1);
        when(database.queryForMap(startsWith("SELECT user_id, session_id, is_new"), any(Object[].class)))
                .thenReturn(Map.of("user_id", OWNER, "session_id", SESSION_ID, "is_new", false));
        var service = new UserAuthService(database);
        var controller = new OAuthController(service, json);
        var client = mock(HttpClient.class);
        HttpResponse<String> exchange = mock(HttpResponse.class);
        when(exchange.statusCode()).thenReturn(200);
        when(exchange.body()).thenReturn("{\"access_token\":\"ci_provider_exchange\"}");
        HttpResponse<String> profile = mock(HttpResponse.class);
        when(profile.statusCode()).thenReturn(200);
        when(profile.body()).thenReturn("{\"id\":\"ci_subject\",\"username\":\"ci_member\"}");
        when(client.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(exchange, profile);
        ReflectionTestUtils.setField(controller, "httpClient", client);
        ReflectionTestUtils.setField(controller, "discordClientId", "ci_client");
        ReflectionTestUtils.setField(controller, "discordClientSecret", "ci_secret");
        ReflectionTestUtils.setField(controller, "discordRedirectUri", "https://easy-scraping.com/auth/discord/callback");
        var callbackMvc = MockMvcBuilders.standaloneSetup(controller).build();
        var result = callbackMvc.perform(get("/auth/discord/callback")
                .param("code", "ci_code").param("state", SESSION_ID.toString()))
                .andExpect(status().isFound()).andReturn();
        var response = result.getResponse();
        var proofs = response.getHeaders("Set-Cookie").stream()
                .filter(value -> value.startsWith(HOST_PROOF + "=")).toList();
        assertEquals(1, proofs.size(), "OAuth redirect must retain the proof set during completion");
        String cookie = proofs.get(0);
        String raw = cookie.substring(cookie.indexOf('=') + 1, cookie.indexOf(';'));
        assertProofCookie(response, raw, 8 * 60 * 60);
        verify(database).queryForMap(startsWith("SELECT user_id, session_id, is_new"),
                eq(SESSION_ID), eq("discord"), eq("ci_subject"), anyString(), eq("ci_member"), anyString(),
                eq(UserAuthService.sha256(raw)));
    }

    @ParameterizedTest @ValueSource(booleans = {true, false})
    void hostSessionWinsOverLegacySessionRegardlessOfServletCookieOrder(boolean hostFirst) {
        UUID other = UUID.fromString("00000000-0000-4000-8000-000000000103");
        jdbc.update("INSERT INTO auth_sessions (id, token_hash, csrf_hash, user_id, expires_at) VALUES (?, ?, ?, ?, ?)",
                UUID.randomUUID(), UserAuthService.sha256("ci_other_session"), UserAuthService.sha256("ci_other_proof"), other,
                Timestamp.from(Instant.now().plusSeconds(3600)));
        var request = new MockHttpServletRequest();
        Cookie host = new Cookie("__Host-mv_session", SESSION);
        Cookie legacy = new Cookie("mv_session", "ci_other_session");
        request.setCookies(hostFirst ? new Cookie[]{host, legacy} : new Cookie[]{legacy, host});
        assertEquals(OWNER, auth.resolveSession(request).orElseThrow().getUserId(), "Legacy identity must not shadow host session");
        assertEquals(OWNER, new AdminAuthService(jdbc).resolveAdminUserId(request).orElseThrow(), "Admin and member must select the same host identity");
    }

    @ParameterizedTest @ValueSource(booleans = {true, false})
    void hostSessionWinsOverRevokedLegacySessionInRawCookieHeaders(boolean hostFirst) {
        jdbc.update("INSERT INTO auth_sessions (id, token_hash, csrf_hash, user_id, expires_at, revoked_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
                UUID.randomUUID(), UserAuthService.sha256("ci_old_session"), UserAuthService.sha256("ci_old_proof"), OWNER,
                Timestamp.from(Instant.now().plusSeconds(3600)));
        var request = new MockHttpServletRequest();
        String host = "__Host-mv_session=" + SESSION;
        String legacy = "mv_session=ci_old_session";
        request.addHeader("Cookie", hostFirst ? host + "; " + legacy : legacy + "; " + host);
        assertEquals(OWNER, auth.resolveSession(request).orElseThrow().getUserId(), "Revoked legacy cookie must not hide valid host session");
        assertEquals(OWNER, new AdminAuthService(jdbc).resolveAdminUserId(request).orElseThrow(), "Admin must not select revoked legacy identity");
    }

    @ParameterizedTest @ValueSource(strings = {"", "ci_unknown_session"})
    void presentInvalidHostSessionNeverFallsBackToLegacyIdentity(String host) {
        var request = new MockHttpServletRequest();
        request.setCookies(new Cookie("mv_session", SESSION), new Cookie("__Host-mv_session", host));
        assertTrue(auth.resolveSession(request).isEmpty(), "Invalid host cookie must not select legacy identity");
        assertTrue(new AdminAuthService(jdbc).resolveAdminUserId(request).isEmpty(), "Admin must also reject invalid host identity");
        var raw = new MockHttpServletRequest();
        raw.addHeader("Cookie", "mv_session=" + SESSION + "; __Host-mv_session=" + host);
        assertTrue(auth.resolveSession(raw).isEmpty(), "Invalid raw host cookie must not select legacy identity");
        assertTrue(new AdminAuthService(jdbc).resolveAdminUserId(raw).isEmpty(), "Admin raw-header parsing must fail closed");
    }

    @Test void duplicateHostSessionCookiesNeverSelectAnIdentity() {
        var request = new MockHttpServletRequest();
        request.setCookies(new Cookie("__Host-mv_session", SESSION), new Cookie("__Host-mv_session", "ci_other_session"),
                new Cookie("mv_session", SESSION));
        assertTrue(auth.resolveSession(request).isEmpty(), "Ambiguous host sessions must fail closed");
        assertTrue(new AdminAuthService(jdbc).resolveAdminUserId(request).isEmpty(), "Admin must not select an ambiguous host session");
    }

    @Test void existingAdminRotationClearsStaleLegacySessionWithoutClearingNewHostSession() {
        var admin = mock(AdminAuthService.class);
        when(admin.isAuthorizedAdmin(any())).thenReturn(true);
        when(admin.resolveAdminUserId(any())).thenReturn(java.util.Optional.of(OWNER));
        var response = new MockHttpServletResponse();
        new AdminSecurityController(admin, mock(JdbcTemplate.class)).openConsoleSession(new MockHttpServletRequest(), response);
        assertTrue(response.getHeaders("Set-Cookie").stream()
                .anyMatch(value -> value.startsWith("mv_session=;") && value.contains("Max-Age=0")),
                "Admin rotation must remove the stale legacy session cookie");
        assertTrue(response.getHeaders("Set-Cookie").stream()
                .anyMatch(value -> value.startsWith("__Host-mv_session=") && !value.contains("Max-Age=0;")),
                "Admin rotation must retain the new host session");
    }

    @Test void bearerSessionStillWorksWhenNoSessionCookieIsPresent() {
        var request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + SESSION);
        assertEquals(OWNER, auth.resolveSession(request).orElseThrow().getUserId());
        assertEquals(OWNER, new AdminAuthService(jdbc).resolveAdminUserId(request).orElseThrow());
    }

    @Test void presentInvalidHostSessionCannotBeRescuedByBearerIdentity() {
        var request = new MockHttpServletRequest();
        request.setCookies(new Cookie("__Host-mv_session", ""));
        request.addHeader("Authorization", "Bearer " + SESSION);
        assertTrue(auth.resolveSession(request).isEmpty());
        assertTrue(new AdminAuthService(jdbc).resolveAdminUserId(request).isEmpty(),
                "An invalid host session must not select a different bearer identity");
    }

    private void assertBootstrapDenied(MockHttpServletRequestBuilder request) throws Exception {
        var result = mvc.perform(request).andExpect(status().isForbidden()).andReturn();
        var response = body(result);
        assertFalse(response.has("user"), "Untrusted bootstrap must not disclose private session data");
        assertTrue(response.path("csrfToken").asText("").isEmpty(), "Untrusted bootstrap must not disclose proof");
        authenticatedWithoutProof(perform(bootstrap()));
    }

    private void assertProofCookie(MockHttpServletResponse response, String raw, int lifetime) {
        var cookies = response.getHeaders("Set-Cookie").stream().filter(value -> value.startsWith(HOST_PROOF + "=")).toList();
        assertEquals(1, cookies.size(), "Exactly one host-only proof cookie must be emitted");
        String cookie = cookies.get(0);
        assertTrue(cookie.startsWith(HOST_PROOF + "=" + raw + ";"), "Cookie must carry the new raw proof");
        for (String flag : List.of("HttpOnly", "Secure", "SameSite=Lax", "Path=/", "Max-Age=" + lifetime)) {
            assertTrue(cookie.contains(flag), "Proof cookie must retain security flags and session lifetime");
        }
        assertFalse(cookie.toLowerCase().contains("domain="), "Host prefix must not permit a domain cookie");
    }
}
