package com.moneyverse.api.domain.identity.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.identity.dto.IdentityDtos.UserProfile;
import com.moneyverse.api.domain.identity.service.ProfileService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@Tag(name = "Profile", description = "유저 프로필 및 계정 정보 API")
@RestController
@RequestMapping(path = {
        "/api/v1/profile",
        "/api/profile"
})
public class ProfileController {

    private static final Logger log = LoggerFactory.getLogger(ProfileController.class);

    private final ProfileService profileService;
    private final UserAuthService authService;
    private final JdbcTemplate jdbcTemplate;

    public ProfileController(ProfileService profileService, UserAuthService authService, JdbcTemplate jdbcTemplate) {
        this.profileService = profileService;
        this.authService = authService;
        this.jdbcTemplate = jdbcTemplate;
    }

    private String resolveUserId(HttpServletRequest request, String ignoredUntrustedHeader) {
        return authService.resolveSession(request)
                .filter(UserAuthService.SessionInfo::isSignedIn)
                .map(session -> session.getUserId().toString())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "SESSION_REQUIRED"));
    }

    private Map<String, Object> toProfileContract(UserProfile p) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getId());
        map.put("displayName", p.getDisplayName());
        map.put("display_name", p.getDisplayName());
        map.put("imageUrl", p.getImageUrl());
        map.put("image_url", p.getImageUrl());
        map.put("email", p.getEmail());
        map.put("joinedAt", p.getJoinedAt());
        map.put("joined_at", p.getJoinedAt());
        map.put("jobType", p.getJobType());
        map.put("job_type", p.getJobType());
        map.put("jobLevel", p.getJobLevel());
        map.put("job_level", p.getJobLevel());
        map.put("workCompletions", p.getWorkCompletions());
        map.put("work_completions", p.getWorkCompletions());
        map.put("visibility", p.getVisibility() == null ? null : p.getVisibility().toLowerCase());
        map.put("featuredTitle", p.getFeaturedTitle());
        map.put("featured_title", p.getFeaturedTitle());
        return map;
    }

    @GetMapping(path = {"", "/"})
    @Operation(summary = "내 프로필 상세 정보 조회 (프론트엔드 표준 계약)")
    public ResponseEntity<Map<String, Object>> getProfileRoot(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            HttpServletRequest request) {

        String userId = resolveUserId(request, headerUserId);
        UserProfile p = profileService.getProfile(userId);

        Map<String, Object> contract = toProfileContract(p);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("profile", contract);
        res.putAll(contract);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/me")
    @Operation(summary = "내 프로필 조회 (/me 호환)")
    public ResponseEntity<Map<String, Object>> getMyProfile(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            HttpServletRequest request) {
        return getProfileRoot(headerUserId, request);
    }

    @GetMapping("/settings")
    @Operation(summary = "프로필 공개 범위 및 설정 조회")
    public ResponseEntity<Map<String, Object>> getProfileSettings(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            HttpServletRequest request) {

        String userId = resolveUserId(request, headerUserId);
        UserProfile p = profileService.getProfile(userId);

        Map<String, Object> settings = new LinkedHashMap<>();
        settings.put("visibility", p.getVisibility() != null ? p.getVisibility().toLowerCase() : null);
        settings.put("displayName", p.getDisplayName());
        settings.put("display_name", p.getDisplayName());
        settings.put("imageUrl", p.getImageUrl());
        settings.put("image_url", p.getImageUrl());
        settings.put("featuredTitle", p.getFeaturedTitle());
        settings.put("featured_title", p.getFeaturedTitle());
        settings.put("fieldVisibility", Collections.emptyMap());
        settings.put("field_visibility", Collections.emptyMap());

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("settings", settings);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/titles")
    @Operation(summary = "유저 획득 칭호 목록 조회")
    public ResponseEntity<Map<String, Object>> getProfileTitles(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            HttpServletRequest request) {

        resolveUserId(request, headerUserId);
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "TITLES_SOURCE_NOT_VERIFIED");
    }

    @GetMapping("/{id:[0-9a-fA-F-]{36}}")
    @Operation(summary = "특정 사용자 UUID 공개 프로필 조회")
    public ResponseEntity<Map<String, Object>> getUserProfileById(@PathVariable("id") String targetUserId,
            HttpServletRequest request) {
        UUID viewer = authService.resolveSession(request)
                .filter(UserAuthService.SessionInfo::isSignedIn)
                .map(UserAuthService.SessionInfo::getUserId)
                .orElse(null);
        UserProfile p = profileService.getProfile(targetUserId, viewer);
        if (!"PUBLIC".equalsIgnoreCase(p.getVisibility())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "PROFILE_NOT_PUBLIC");
        }
        Map<String, Object> contract = toProfileContract(p);
        contract.remove("email"); // email must not be exposed in public profiles
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("profile", contract);
        return ResponseEntity.ok(res);
    }

    @PutMapping(path = {"", "/"})
    @Operation(summary = "프로필 정보 수정")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            HttpServletRequest request) {

        resolveUserId(request, headerUserId);
        // No verified owner-scoped stored-procedure and CSRF receipt contract is available.
        // Never execute direct app-table DML or report a fabricated successful profile update.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "PROFILE_UPDATE_SOURCE_NOT_VERIFIED");
    }
}
