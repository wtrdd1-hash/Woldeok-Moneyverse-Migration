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

    private String resolveUserId(HttpServletRequest request, String fallbackHeader) {
        Optional<UserAuthService.SessionInfo> sess = authService.resolveSession(request);
        if (sess.isPresent() && sess.get().getUserId() != null) {
            return sess.get().getUserId().toString();
        }
        if (fallbackHeader != null && !fallbackHeader.isBlank()) {
            return fallbackHeader;
        }
        return "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
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
        map.put("jobLevel", p.getJobLevel() > 0 ? p.getJobLevel() : 1);
        map.put("job_level", p.getJobLevel() > 0 ? p.getJobLevel() : 1);
        map.put("workCompletions", "0");
        map.put("work_completions", "0");
        map.put("visibility", p.getVisibility() != null ? p.getVisibility().toLowerCase() : "public");
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
        settings.put("visibility", p.getVisibility() != null ? p.getVisibility().toLowerCase() : "public");
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

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("titles", Collections.emptyList());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id:[0-9a-fA-F-]{36}}")
    @Operation(summary = "특정 사용자 UUID 공개 프로필 조회")
    public ResponseEntity<Map<String, Object>> getUserProfileById(@PathVariable("id") String targetUserId) {
        UserProfile p = profileService.getProfile(targetUserId);
        Map<String, Object> contract = toProfileContract(p);
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

        String userId = resolveUserId(request, headerUserId);

        String displayName = (String) body.getOrDefault("displayName", body.get("display_name"));
        String imageUrl = (String) body.getOrDefault("imageUrl", body.get("image_url"));
        String visibility = (String) body.get("visibility");

        try {
            if (displayName != null) {
                jdbcTemplate.update("UPDATE profiles SET display_name = ? WHERE id = ?::uuid", displayName, userId);
            }
            if (imageUrl != null) {
                jdbcTemplate.update("UPDATE profiles SET image_url = ? WHERE id = ?::uuid", imageUrl, userId);
            }
            if (visibility != null) {
                jdbcTemplate.update("UPDATE profiles SET visibility = ? WHERE id = ?::uuid", visibility.toUpperCase(), userId);
            }
        } catch (Exception e) {
            log.warn("[ProfileController] update error: {}", e.getMessage());
        }

        return getProfileSettings(headerUserId, request);
    }
}
