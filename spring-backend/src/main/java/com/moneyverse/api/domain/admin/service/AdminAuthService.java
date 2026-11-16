package com.moneyverse.api.domain.admin.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${moneyverse.security.internal-token:8e5f2a1b9c3d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f}")
    private String internalToken;

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public AdminAuthService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * 관리자 권한 및 신원 검증
     * 1. Next.js 서버 컴포넌트의 신뢰된 x-internal-token 헤더
     * 2. 내부 시크릿과 일치하는 Bearer 토큰
     * 3. auth_sessions 및 admin_roles 테이블에서 암호학적 해시(SHA-256) 검증된 활성 세션 쿠키
     * 위 조건 외의 임의의 Bearer나 위조 세션 쿠키, 익명 접속은 100% 차단 (Fail-Closed)
     */
    public boolean isAuthorizedAdmin(HttpServletRequest request) {
        if (request == null) return false;

        // 1. x-internal-token 검증
        String internalHeader = request.getHeader("x-internal-token");
        if (internalHeader != null && !internalHeader.isBlank() && internalHeader.equals(internalToken)) {
            return true;
        }

        // 2. Authorization: Bearer 검증
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (!token.isBlank() && token.equals(internalToken)) {
                return true;
            }
            // 임의의 검증되지 않은 Bearer 토큰은 인가 거부
            return false;
        }

        // 3. mv_session 쿠키 DB 암호학적 해시 검증
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
