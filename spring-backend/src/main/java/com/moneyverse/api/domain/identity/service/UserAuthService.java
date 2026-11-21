package com.moneyverse.api.domain.identity.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class UserAuthService {

    private static final Logger log = LoggerFactory.getLogger(UserAuthService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    @org.springframework.beans.factory.annotation.Value("${moneyverse.app-base-url:${APP_BASE_URL:}}")
    private String appBaseUrl = "";

    private final JdbcTemplate jdbcTemplate;
    private final Argon2PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${moneyverse.internal-api-token:${INTERNAL_API_TOKEN:8e5f2a1b9c3d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f}}")
    private String internalToken = "8e5f2a1b9c3d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f";

    @Autowired
    public UserAuthService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        // Argon2id configuration matching NestJS: saltLength=16, hashLength=32, parallelism=1, memory=19456, iterations=2
        this.passwordEncoder = new Argon2PasswordEncoder(16, 32, 1, 19456, 2);
    }

    public static String sha256(String input) {
        if (input == null) return null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 digest failed", e);
        }
    }

    public static String generateRandomToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public static String normalizeEmail(String email) {
        if (email == null) return "";
        return email.trim().toLowerCase();
    }

    /** Member and administrator verification must resolve the same authoritative session. */
    public static String extractSessionToken(HttpServletRequest request) {
        if (request == null) return null;

        Map<String, List<String>> cookies = cookieValues(request, Set.of("__Host-mv_session", "mv_session"));
        List<String> tokens = cookies.containsKey("__Host-mv_session")
                ? cookies.get("__Host-mv_session") : cookies.get("mv_session");
        // A host cookie is authoritative even when invalid; falling back could select another account.
        String rawToken = tokens == null ? null
                : tokens.size() == 1 && tokens.get(0) != null ? tokens.get(0).trim() : "";

        if (rawToken == null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                rawToken = authHeader.substring(7).trim();
            }
        }

        if (rawToken == null || rawToken.isBlank()) {
            return null;
        }

        if (rawToken.length() > 1 && rawToken.charAt(0) == '"' && rawToken.charAt(rawToken.length() - 1) == '"') {
            rawToken = rawToken.substring(1, rawToken.length() - 1);
        }
        try {
            rawToken = java.net.URLDecoder.decode(rawToken, StandardCharsets.UTF_8);
        } catch (Exception ignored) {}

        return rawToken;
    }

    /**
     * Resolves the current session from request cookie or Authorization header.
     * Accurately supports both mv_session and __Host-mv_session, raw Cookie headers,
     * URL-decoding, and queries display_name from member_profile_view.
     */
    public Optional<SessionInfo> resolveSession(HttpServletRequest request) {
        String rawToken = extractSessionToken(request);
        if (rawToken == null) return Optional.empty();

        String tokenHash = sha256(rawToken);
        String sql = """
            SELECT s.id, s.user_id, s.csrf_hash, s.expires_at, s.reauthenticated_at
            FROM auth_sessions s
            WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > NOW()
            """;

        try {
            SessionInfo info = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                SessionInfo si = new SessionInfo();
                si.setSessionId(UUID.fromString(rs.getString("id")));
                String uid = rs.getString("user_id");
                if (uid != null) {
                    si.setUserId(UUID.fromString(uid));
                }
                si.setCsrfHash(rs.getString("csrf_hash"));
                Timestamp exp = rs.getTimestamp("expires_at");
                if (exp != null) si.setExpiresAt(exp.toInstant());
                Timestamp reauth = rs.getTimestamp("reauthenticated_at");
                if (reauth != null) si.setReauthenticatedAt(reauth.toInstant());
                return si;
            }, tokenHash);

            if (info != null && info.getUserId() != null) {
                UUID uid = info.getUserId();
                // 1) display_name from member_profile_view
                try {
                    String dname = jdbcTemplate.queryForObject(
                        "SELECT profile.display_name FROM public.member_profile_view(?::uuid, ?::uuid) AS profile",
                        String.class, uid, uid
                    );
                    info.setDisplayName(dname != null && !dname.isBlank() ? dname : "시민");
                } catch (Exception e) {
                    info.setDisplayName("시민");
                }

                // 2) email from auth_local_credentials
                try {
                    String em = jdbcTemplate.queryForObject(
                        "SELECT email FROM auth_local_credentials WHERE user_id = ? AND disabled_at IS NULL LIMIT 1",
                        String.class, uid
                    );
                    info.setEmail(em);
                } catch (Exception ignored) {}

                // 3) roles & admin roles
                List<String> roles = findUserRoles(uid);
                info.setRoles(roles);
            }
            return Optional.ofNullable(info);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        } catch (Exception e) {
            log.warn("[UserAuthService] resolveSession error: {}", e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * The stored digest cannot recover the raw proof. A host-only cookie preserves
     * it across navigation without making the cookie script-readable or rotating live sessions.
     */
    public String verifiedCsrfToken(HttpServletRequest request, SessionInfo session) {
        if (request == null || session == null || session.getCsrfHash() == null
                || !hasSameOriginBrowserContext(request)) return "";
        if (session.getExpiresAt() == null || !session.getExpiresAt().isAfter(Instant.now())) return "";

        Map<String, List<String>> proofs = cookieValues(request, Set.of("__Host-mv_csrf", "mv_csrf"));

        // An invalid host proof must not be rescued by a weaker legacy cookie.
        List<String> values = proofs.containsKey("__Host-mv_csrf")
                ? proofs.get("__Host-mv_csrf") : proofs.get("mv_csrf");
        if (values == null || values.size() != 1) return "";
        String raw = values.get(0);
        if (raw == null || !raw.matches("[A-Za-z0-9_-]{1,128}")) return "";
        return MessageDigest.isEqual(session.getCsrfHash().getBytes(StandardCharsets.UTF_8),
                sha256(raw).getBytes(StandardCharsets.UTF_8)) ? raw : "";
    }

    private static Map<String, List<String>> cookieValues(HttpServletRequest request, Set<String> names) {
        Map<String, List<String>> values = new HashMap<>();
        Enumeration<String> headers = request.getHeaders("Cookie");
        boolean hasCookieHeader = headers != null && headers.hasMoreElements();
        if (hasCookieHeader) {
            while (headers.hasMoreElements()) {
                for (String part : headers.nextElement().split(";")) {
                    int equals = part.indexOf('=');
                    String name = (equals < 0 ? part : part.substring(0, equals)).trim();
                    if (names.contains(name)) {
                        values.computeIfAbsent(name, ignored -> new ArrayList<>())
                                .add(equals < 0 ? "" : part.substring(equals + 1));
                    }
                }
            }
        } else if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (names.contains(cookie.getName())) {
                    values.computeIfAbsent(cookie.getName(), ignored -> new ArrayList<>()).add(cookie.getValue());
                }
            }
        }

        return values;
    }

    public boolean rejectsBootstrapContext(HttpServletRequest request) {
        if (request == null) return true;
        // Legacy service clients retain session status, but explicit untrusted browser context gets no private body.
        boolean explicitContext = request.getHeader("Origin") != null || request.getHeader("Sec-Fetch-Site") != null;
        return explicitContext && !hasSameOriginBrowserContext(request);
    }

    private boolean hasSameOriginBrowserContext(HttpServletRequest request) {
        List<String> sites = Collections.list(request.getHeaders("Sec-Fetch-Site"));
        if (sites.size() > 1 || (!sites.isEmpty() && !"same-origin".equals(sites.get(0)))) return false;
        List<String> origins = Collections.list(request.getHeaders("Origin"));
        if (origins.isEmpty()) return sites.size() == 1;
        if (origins.size() != 1 || appBaseUrl == null || appBaseUrl.isBlank()) return false;
        try {
            URI expected = browserOrigin(appBaseUrl);
            URI supplied = browserOrigin(origins.get(0));
            return expected != null && supplied != null
                    && expected.getScheme().equalsIgnoreCase(supplied.getScheme())
                    && expected.getHost().equalsIgnoreCase(supplied.getHost())
                    && originPort(expected) == originPort(supplied);
        } catch (IllegalArgumentException ignored) {
            return false;
        }
    }

    private static URI browserOrigin(String value) {
        URI uri = URI.create(value);
        if (uri.getHost() == null || uri.getUserInfo() != null || uri.getQuery() != null || uri.getFragment() != null
                || !List.of("http", "https").contains(uri.getScheme())
                || (uri.getRawPath() != null && !uri.getRawPath().isEmpty() && !"/".equals(uri.getRawPath()))) return null;
        return uri;
    }

    private static int originPort(URI uri) {
        return uri.getPort() >= 0 ? uri.getPort() : ("https".equals(uri.getScheme()) ? 443 : 80);
    }

    public static void setCsrfCookie(HttpServletResponse response, String rawProof, long maxAgeSeconds) {
        if (response == null) return;
        response.addHeader("Set-Cookie", ResponseCookie.from("__Host-mv_csrf", rawProof)
                .path("/").maxAge(maxAgeSeconds).httpOnly(true).secure(true).sameSite("Lax").build().toString());
    }

    public static void clearCsrfCookies(HttpServletResponse response) {
        if (response == null) return;
        setCsrfCookie(response, "", 0);
        response.addHeader("Set-Cookie", ResponseCookie.from("mv_csrf", "")
                .path("/").maxAge(0).httpOnly(true).secure(true).sameSite("Lax").build().toString());
    }

    public List<String> findUserRoles(UUID userId) {
        if (userId == null) return List.of("user");
        Set<String> roles = new LinkedHashSet<>();

        // 1. Check admin_current_roles(?::uuid)
        try {
            List<String> acr = jdbcTemplate.query(
                "SELECT role::text FROM public.admin_current_roles(?::uuid)",
                (rs, rowNum) -> rs.getString(1),
                userId
            );
            for (String r : acr) {
                roles.add(r.toLowerCase());
                roles.add(r.toUpperCase());
            }
        } catch (Exception ignored) {}

        // 2. Check user_roles table
        try {
            List<String> ur = jdbcTemplate.query(
                "SELECT role::text FROM user_roles WHERE user_id = ?",
                (rs, rowNum) -> rs.getString(1),
                userId
            );
            for (String r : ur) {
                roles.add(r.toLowerCase());
                roles.add(r.toUpperCase());
            }
        } catch (Exception ignored) {}

        // 3. Check admin_role_designations
        try {
            List<String> ar = jdbcTemplate.query(
                "SELECT role::text FROM admin_role_designations WHERE target_user_id = ? AND operation = 'GRANT'",
                (rs, rowNum) -> rs.getString(1),
                userId
            );
            for (String r : ar) {
                roles.add(r.toLowerCase());
                roles.add(r.toUpperCase());
            }
        } catch (Exception ignored) {}

        // Map superadmin / server_operator / approver / operator to ADMIN and SUPERADMIN
        if (roles.contains("superadmin") || roles.contains("SUPERADMIN")) {
            roles.add("ADMIN");
            roles.add("admin");
            roles.add("SUPERADMIN");
            roles.add("superadmin");
        }
        if (roles.contains("operator") || roles.contains("server_operator") || roles.contains("approver")) {
            roles.add("ADMIN");
            roles.add("admin");
        }

        if (roles.isEmpty()) {
            roles.add("user");
        }
        return new ArrayList<>(roles);
    }

    /**
     * Creates a prelogin session without an attached user.
     */
    @Transactional
    public PreloginSessionResult createPreloginSession(HttpServletResponse response) {
        UUID sessionId = UUID.randomUUID();
        String rawToken = generateRandomToken();
        String csrfToken = UUID.randomUUID().toString();
        String tokenHash = sha256(rawToken);
        String csrfHash = sha256(csrfToken);
        Instant now = Instant.now();
        Instant expiresAt = now.plus(30, ChronoUnit.DAYS);

        String sql = """
            INSERT INTO auth_sessions (id, token_hash, csrf_hash, user_id, expires_at, created_at, prelogin_age_confirmed)
            VALUES (?, ?, ?, NULL, ?, ?, true)
            """;
        jdbcTemplate.update(sql, sessionId, tokenHash, csrfHash, Timestamp.from(expiresAt), Timestamp.from(now));

        setSessionCookie(response, rawToken);
        setCsrfCookie(response, csrfToken, 30 * 24 * 60 * 60);
        return new PreloginSessionResult(sessionId, rawToken, csrfToken);
    }

    /**
     * Authenticates with email and password, creates an active session.
     */
    @Transactional
    public LoginResult login(String rawEmail, String rawPassword, HttpServletResponse response) {
        String email = normalizeEmail(rawEmail);
        String emailH = sha256(email);

        String credSql = "SELECT user_id, password_verifier FROM auth_local_credentials WHERE email_hash = ? AND disabled_at IS NULL";
        Map<String, Object> cred;
        try {
            cred = jdbcTemplate.queryForMap(credSql, emailH);
        } catch (EmptyResultDataAccessException e) {
            throw new IllegalArgumentException("invalid credentials");
        }

        UUID userId = (UUID) cred.get("user_id");
        String verifier = (String) cred.get("password_verifier");

        boolean matched = false;
        try {
            matched = passwordEncoder.matches(rawPassword, verifier);
        } catch (Exception e) {
            log.warn("[UserAuthService] password verification error: {}", e.getMessage());
            matched = false;
        }

        if (!matched) {
            throw new IllegalArgumentException("invalid credentials");
        }

        // Create new active session
        UUID sessionId = UUID.randomUUID();
        String rawToken = generateRandomToken();
        String csrfToken = UUID.randomUUID().toString();
        String tokenHash = sha256(rawToken);
        String csrfHash = sha256(csrfToken);
        Instant now = Instant.now();
        Instant expiresAt = now.plus(30, ChronoUnit.DAYS);

        String sessionSql = """
            INSERT INTO auth_sessions (id, token_hash, csrf_hash, user_id, expires_at, created_at, prelogin_age_confirmed, reauthenticated_at)
            VALUES (?, ?, ?, ?, ?, ?, true, ?)
            """;
        jdbcTemplate.update(sessionSql, sessionId, tokenHash, csrfHash, userId, Timestamp.from(expiresAt), Timestamp.from(now), Timestamp.from(now));

        setSessionCookie(response, rawToken);
        setCsrfCookie(response, csrfToken, 30 * 24 * 60 * 60);

        // Fetch user profile details
        String displayName = "시민";
        try {
            String dname = jdbcTemplate.queryForObject(
                "SELECT display_name FROM member_profiles WHERE user_id = ?",
                String.class, userId
            );
            if (dname != null && !dname.isBlank()) displayName = dname;
        } catch (Exception ignored) {}

        List<String> roles = findUserRoles(userId);

        return new LoginResult(userId, sessionId, rawToken, csrfToken, email, displayName, roles);
    }

    /**
     * Registers a new user with email and password.
     */
    public LoginResult register(String rawEmail, String rawPassword, String displayName, HttpServletResponse response) {
        // Consent/age persistence and canonical funded registration must precede account creation.
        throw new org.springframework.web.server.ResponseStatusException(
            org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
            "LOCAL_REGISTRATION_CONTRACT_UNAVAILABLE");
    }

    /**
     * Revokes the current session.
     */
    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        Optional<SessionInfo> session = resolveSession(request);
        session.ifPresent(s -> {
            jdbcTemplate.update("UPDATE auth_sessions SET revoked_at = NOW() WHERE id = ?", s.getSessionId());
        });
        clearSessionCookie(response);
    }

    /**
     * Re-authenticates the current user's password.
     */
    @Transactional
    public boolean reauthenticate(UUID userId, String password) {
        String credSql = "SELECT password_verifier FROM auth_local_credentials WHERE user_id = ? AND disabled_at IS NULL";
        try {
            String verifier = jdbcTemplate.queryForObject(credSql, String.class, userId);
            if (verifier == null) return false;
            boolean matched = passwordEncoder.matches(password, verifier);
            if (matched) {
                jdbcTemplate.update("UPDATE auth_sessions SET reauthenticated_at = NOW() WHERE user_id = ? AND revoked_at IS NULL", userId);
            }
            return matched;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Changes password.
     */
    @Transactional
    public void changePassword(UUID userId, String newPassword) {
        String encoded = passwordEncoder.encode(newPassword);
        Instant now = Instant.now();
        jdbcTemplate.update(
            "UPDATE auth_local_credentials SET password_verifier = ?, changed_at = ? WHERE user_id = ?",
            encoded, Timestamp.from(now), userId
        );
    }

    public void setSessionCookie(HttpServletResponse response, String rawToken) {
        if (response == null) return;
        Cookie cookie = new Cookie("mv_session", rawToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(30 * 24 * 60 * 60); // 30 days
        response.addCookie(cookie);

        response.addHeader("Set-Cookie",
            "__Host-mv_session=" + rawToken + "; Path=/; Max-Age=" + (30 * 24 * 60 * 60) + "; HttpOnly; Secure; SameSite=Lax");
    }

    public void clearSessionCookie(HttpServletResponse response) {
        if (response == null) return;
        clearCsrfCookies(response);
        Cookie cookie = new Cookie("mv_session", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        response.addHeader("Set-Cookie",
            "__Host-mv_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax");
    }

    public Long getUserCashBalance(UUID userId) {
        if (userId == null) return 0L;
        String sql = """
            SELECT COALESCE(ab.balance, 0)
            FROM accounts a
            JOIN account_balances ab ON ab.account_id = a.id
            WHERE a.owner_user_id = ? AND a.account_type = 'USER_CASH' AND a.currency = 'WLD'
            LIMIT 1
            """;
        try {
            Long b = jdbcTemplate.queryForObject(sql, Long.class, userId);
            return b != null ? b : 0L;
        } catch (Exception e) {
            return 0L;
        }
    }

    public static class SessionInfo {
        private UUID sessionId;
        private UUID userId;
        private String csrfHash;
        private Instant expiresAt;
        private Instant reauthenticatedAt;
        private String email;
        private String displayName;
        private List<String> roles = new ArrayList<>();

        public UUID getSessionId() { return sessionId; }
        public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public String getCsrfHash() { return csrfHash; }
        public void setCsrfHash(String csrfHash) { this.csrfHash = csrfHash; }
        public Instant getExpiresAt() { return expiresAt; }
        public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
        public Instant getReauthenticatedAt() { return reauthenticatedAt; }
        public void setReauthenticatedAt(Instant reauthenticatedAt) { this.reauthenticatedAt = reauthenticatedAt; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public List<String> getRoles() { return roles; }
        public void setRoles(List<String> roles) { this.roles = roles; }
        public boolean isSignedIn() { return userId != null; }
    }

    public record PreloginSessionResult(UUID sessionId, String token, String csrfToken) {}
    public record LoginResult(UUID userId, UUID sessionId, String token, String csrfToken, String email, String displayName, List<String> roles) {}

    /**
     * Completes an OAuth login using the database stored procedure auth_complete_oauth_login.
     * Generates a new secure session, sets session cookies, and returns the login result.
     */
    @Transactional
    public OAuthLoginResult completeOAuthLogin(
            UUID preAuthSessionId,
            String provider,
            String subject,
            String displayName,
            HttpServletResponse response) {

        String safeProvider = (provider != null) ? provider.trim().toLowerCase() : "discord";
        String safeSubject = (subject != null) ? subject.trim() : "";
        String safeName = (displayName != null && !displayName.isBlank()) ? displayName.trim() : "시민";
        if (safeName.length() > 120) safeName = safeName.substring(0, 120);

        String subjectHash = sha256(safeProvider + ":" + safeSubject);
        String rawToken = generateRandomToken();
        String csrfToken = UUID.randomUUID().toString();
        String tokenHash = sha256(rawToken);
        String csrfHash = sha256(csrfToken);

        // Ensure active pre-login session
        UUID effectivePreSessionId = preAuthSessionId;
        if (effectivePreSessionId == null) {
            effectivePreSessionId = UUID.randomUUID();
            String preTokenHash = sha256(generateRandomToken());
            String preCsrfHash = sha256(UUID.randomUUID().toString());
            jdbcTemplate.update(
                "INSERT INTO auth_sessions (id, token_hash, csrf_hash, user_id, expires_at, created_at, prelogin_age_confirmed) VALUES (?, ?, ?, NULL, NOW() + INTERVAL '1 day', NOW(), true)",
                effectivePreSessionId, preTokenHash, preCsrfHash
            );
        } else {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM auth_sessions WHERE id = ? AND user_id IS NULL AND revoked_at IS NULL AND expires_at > NOW()",
                Integer.class, effectivePreSessionId
            );
            if (count == null || count == 0) {
                jdbcTemplate.update(
                    "INSERT INTO auth_sessions (id, token_hash, csrf_hash, user_id, expires_at, created_at, prelogin_age_confirmed) VALUES (?, ?, ?, NULL, NOW() + INTERVAL '1 day', NOW(), true) ON CONFLICT (id) DO UPDATE SET revoked_at = NULL, expires_at = NOW() + INTERVAL '1 day', user_id = NULL",
                    effectivePreSessionId, sha256(generateRandomToken()), sha256(UUID.randomUUID().toString())
                );
            }
        }

        String sql = "SELECT user_id, session_id, is_new FROM auth_complete_oauth_login(?::uuid, ?::identity_provider, ?, ?, ?, ?, ?)";
        Map<String, Object> row = jdbcTemplate.queryForMap(
            sql,
            effectivePreSessionId,
            safeProvider,
            safeSubject,
            subjectHash,
            safeName,
            tokenHash,
            csrfHash
        );

        UUID userId = (UUID) row.get("user_id");
        UUID sessionId = (UUID) row.get("session_id");
        Boolean isNew = (Boolean) row.get("is_new");

        // Mark reauthenticated
        try {
            jdbcTemplate.update(
                "UPDATE auth_sessions SET reauthenticated_at = NOW() WHERE id = ?",
                sessionId
            );
        } catch (Exception e) {
            log.warn("[UserAuthService] Failed to update reauthenticated_at: {}", e.getMessage());
        }

        // Set session cookies
        setSessionCookie(response, rawToken);
        setCsrfCookie(response, csrfToken, 8 * 60 * 60);

        return new OAuthLoginResult(userId, sessionId, rawToken, csrfToken, safeName, isNew != null && isNew);
    }

    public record OAuthLoginResult(UUID userId, UUID sessionId, String token, String csrfToken, String displayName, boolean isNew) {}
}

