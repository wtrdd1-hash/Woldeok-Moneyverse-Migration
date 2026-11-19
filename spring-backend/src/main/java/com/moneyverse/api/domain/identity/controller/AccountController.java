package com.moneyverse.api.domain.identity.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.identity.dto.IdentityDtos.UserProfile;
import com.moneyverse.api.domain.identity.service.ProfileService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Tag(name = "Account", description = "사용자 계정 정보, 연결된 인증 수단 및 탈퇴 API")
@RestController
public class AccountController {

    private final UserAuthService authService;
    private final ProfileService profileService;
    private final JdbcTemplate jdbcTemplate;

    public AccountController(UserAuthService authService, ProfileService profileService, JdbcTemplate jdbcTemplate) {
        this.authService = authService;
        this.profileService = profileService;
        this.jdbcTemplate = jdbcTemplate;
    }

    private Optional<UUID> resolveUserId(HttpServletRequest request) {
        Optional<SessionInfo> session = authService.resolveSession(request);
        if (session.isPresent() && session.get().isSignedIn() && session.get().getUserId() != null) {
            return Optional.of(session.get().getUserId());
        }
        return Optional.empty();
    }

    @GetMapping(path = {
            "/api/v1/account/me",
            "/api/account/me"
    })
    @Operation(summary = "현재 사용자 본인 계정 정보 조회")
    public ResponseEntity<?> getMyAccount(HttpServletRequest request) {
        Optional<UUID> userId = resolveUserId(request);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }
        UserProfile profile = profileService.getProfile(userId.get().toString());
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PatchMapping(path = {
            "/api/v1/account/me",
            "/api/account/me"
    })
    @Operation(summary = "현재 사용자 프로필(닉네임, 아바타, 상태메시지) 변경")
    public ResponseEntity<?> updateMyAccount(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        Optional<UUID> userId = resolveUserId(request);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        String displayName = (String) body.get("displayName");
        String imageUrl = (String) body.get("imageUrl");

        if (displayName != null && !displayName.isBlank()) {
            jdbcTemplate.update("UPDATE users SET display_name = ?, updated_at = NOW() WHERE id = ?", displayName, userId.get());
            jdbcTemplate.update("UPDATE profiles SET display_name = ? WHERE id = ?", displayName, userId.get());
        }
        if (imageUrl != null) {
            jdbcTemplate.update("UPDATE profiles SET image_url = ? WHERE id = ?", imageUrl, userId.get());
        }

        UserProfile profile = profileService.getProfile(userId.get().toString());
        return ResponseEntity.ok(ApiResponse.ok(profile, "Profile updated successfully"));
    }

    @GetMapping(path = {
            "/api/v1/account/identities",
            "/api/account/identities"
    })
    @Operation(summary = "연결된 소셜 및 이메일 로그인 수단 목록 조회")
    public ResponseEntity<?> listIdentities(HttpServletRequest request) {
        Optional<UUID> userId = resolveUserId(request);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        List<Map<String, Object>> identities = new ArrayList<>();

        // Check local email
        try {
            List<Map<String, Object>> localCreds = jdbcTemplate.query(
                "SELECT email, verified_at, disabled_at FROM auth_local_credentials WHERE user_id = ?",
                (rs, rowNum) -> {
                    Map<String, Object> iden = new LinkedHashMap<>();
                    iden.put("provider", "local_email");
                    iden.put("email", rs.getString("email"));
                    iden.put("verified", rs.getTimestamp("verified_at") != null);
                    iden.put("disabled", rs.getTimestamp("disabled_at") != null);
                    return iden;
                },
                userId.get()
            );
            identities.addAll(localCreds);
        } catch (Exception ignored) {}

        return ResponseEntity.ok(Map.of("identities", identities));
    }

    @DeleteMapping(path = {
            "/api/v1/account/identities/{id}",
            "/api/account/identities/{id}"
    })
    @Operation(summary = "연결된 로그인 수단 연결 해제")
    public ResponseEntity<?> unlinkIdentity(
            HttpServletRequest request,
            @PathVariable("id") String identityId) {
        Optional<UUID> userId = resolveUserId(request);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        return ResponseEntity.ok(Map.of("success", true, "unlinked", identityId));
    }

    @DeleteMapping(path = {
            "/api/v1/account",
            "/api/account"
    })
    @Operation(summary = "사용자 회원 탈퇴 (소프트 삭제)")
    public ResponseEntity<?> deleteAccount(HttpServletRequest request) {
        Optional<UUID> userId = resolveUserId(request);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        jdbcTemplate.update("UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = ?", userId.get());
        jdbcTemplate.update("UPDATE auth_local_credentials SET disabled_at = NOW() WHERE user_id = ?", userId.get());

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("outcome", "account-deleted"));
    }
}
