package com.moneyverse.api.domain.admin.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AdminAuthService {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthService.class);

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public AdminAuthService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Admin authorization requires an active, database-verified admin session.
     * A service credential proves the calling service, not the human actor's role.
     */
    public boolean isAuthorizedAdmin(HttpServletRequest request) {
        if (request == null) return false;

        // Verify the caller session against the canonical admin role.
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("mv_session".equals(c.getName()) || "__Host-mv_session".equals(c.getName())) {
                    String sessionToken = c.getValue();
                    if (sessionToken != null && !sessionToken.isBlank()) {
                        return verifyDatabaseSession(sessionToken);
                    }
                }
            }
        }

        return false;
    }

    private boolean verifyDatabaseSession(String sessionToken) {
        if (jdbcTemplate == null || sessionToken == null || sessionToken.isBlank()) {
            return false;
        }

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(sessionToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            String tokenHash = hexString.toString();

            String sql = "SELECT COUNT(*) FROM auth_sessions s " +
                    "JOIN admin_roles r ON s.user_id = r.user_id " +
                    "WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > NOW()";

            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, tokenHash);
            return count != null && count > 0;
        } catch (Exception e) {
            log.debug("[AdminAuth] Session verification error: {}", e.getMessage());
            return false;
        }
    }

    public ResponseEntity<?> unauthorizedResponse() {
        Map<String, Object> err = new LinkedHashMap<>();
        err.put("type", "about:blank");
        err.put("title", "Unauthorized");
        err.put("status", 401);
        err.put("detail", "admin session required");
        err.put("code", "login_required");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
    }
}
