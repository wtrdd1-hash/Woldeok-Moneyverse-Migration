package com.moneyverse.api.domain.identity.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.admin.service.EncryptionService;
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
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Tag(name = "Account", description = "사용자 계정 정보, 연결된 인증 수단 및 탈퇴 API")
@RestController
public class AccountController {

    private final UserAuthService authService;
    private final ProfileService profileService;
    private final JdbcTemplate jdbcTemplate;
    private final EncryptionService encryptionService;

    public AccountController(UserAuthService authService, ProfileService profileService, JdbcTemplate jdbcTemplate,
                             EncryptionService encryptionService) {
        this.encryptionService = encryptionService;
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

        // Parity with the NestJS contract (account.repository.linkedIdentities):
        // every linked identity — Discord, Google and local e-mail — comes from
        // public.account_list_my_identities. The former local-credentials-only
        // query reported 0 identities for every OAuth member (QA 2026-11-25).
        List<Map<String, Object>> identities;
        try {
            identities = jdbcTemplate.query(
                "SELECT identity_id::text AS identity_id, provider::text AS provider, display_name, linked_at "
                    + "FROM public.account_list_my_identities(?)",
                (rs, rowNum) -> {
                    Map<String, Object> iden = new LinkedHashMap<>();
                    iden.put("identityId", rs.getString("identity_id"));
                    iden.put("provider", rs.getString("provider"));
                    String name = rs.getString("display_name");
                    String plain = encryptionService.decrypt(name);
                    iden.put("displayName", plain == null ? "" : plain);
                    java.sql.Timestamp linked = rs.getTimestamp("linked_at");
                    iden.put("linkedAt", linked == null ? null : com.moneyverse.api.common.time.JsTime.iso(linked.toInstant()));
                    return iden;
                },
                userId.get()
            );
        } catch (Exception e) {
            // Unknown is not "no identities": answer unavailable, never an empty list.
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("detail", "identity source unavailable"));
        }

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

        // Security review 2026-11-28: this answered success without unlinking anything, so a member
        // believed a provider was removed while it could still sign in. No unlink function is wired.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "IDENTITY_UNLINK_SOURCE_UNAVAILABLE");
    }

    @DeleteMapping(path = {
            "/api/v1/account",
            "/api/account"
    })
    @Operation(summary = "사용자 회원 탈퇴 (개인정보 안전 파기 및 세션 즉시 만료)")
    public ResponseEntity<?> deleteAccount(HttpServletRequest request) {
        Optional<UUID> userId = resolveUserId(request);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        UUID uid = userId.get();
        // 1. Revoke all active authentication sessions immediately
        jdbcTemplate.update("UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = ?", uid);
        // 2. Disable local email login credentials
        jdbcTemplate.update("UPDATE auth_local_credentials SET disabled_at = NOW() WHERE user_id = ?", uid);
        // 3. Anonymize user personal data and profiles (GDPR / Privacy Compliance)
        try {
            jdbcTemplate.update("UPDATE profiles SET display_name = '탈퇴한 회원', bio = NULL, image_url = NULL, updated_at = NOW() WHERE id = ?", uid);
        } catch (Exception ignored) {}
        try {
            jdbcTemplate.update("UPDATE users SET display_name = '탈퇴한 회원', status = 'suspended'::public.user_status, updated_at = NOW() WHERE id = ?", uid);
        } catch (Exception ignored) {}
        // 4. Close active cash/bank accounts to prevent further mutations
        try {
            jdbcTemplate.update("UPDATE accounts SET status = 'closed'::public.account_status WHERE owner_user_id = ?", uid);
        } catch (Exception ignored) {}

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("outcome", "account-deleted"));
    }
}
