package com.moneyverse.api.domain.identity.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.identity.dto.IdentityDtos.UserProfile;
import com.moneyverse.api.domain.identity.service.ProfileService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
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
    private final ObjectMapper objectMapper;

    public ProfileController(ProfileService profileService, UserAuthService authService, JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.profileService = profileService;
        this.authService = authService;
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
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
        settings.put("visibility", p.getVisibility() != null ? p.getVisibility().toLowerCase() : "members");
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

        String userId = resolveUserId(request, headerUserId);
        String sql = "SELECT t.code, t.name, ut.awarded_at " +
                     "FROM public.user_titles ut " +
                     "JOIN public.member_titles t ON ut.title_id = t.id " +
                     "WHERE ut.user_id = ?::uuid ORDER BY ut.awarded_at ASC";

        List<Map<String, Object>> titles = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("code", rs.getString("code"));
            item.put("name", rs.getString("name"));
            Timestamp ts = rs.getTimestamp("awarded_at");
            item.put("awardedAt", ts == null ? null : ts.toInstant().toString());
            return item;
        }, UUID.fromString(userId));

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("titles", titles);
        return ResponseEntity.ok(res);
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
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            HttpServletRequest request) {

        String userId = resolveUserId(request, headerUserId);
        if (body == null) body = Collections.emptyMap();

        String visibility = (String) body.getOrDefault("visibility", "members");
        if (visibility == null || visibility.isBlank()) visibility = "members";
        visibility = visibility.trim().toLowerCase();

        String displayName = (String) body.getOrDefault("display_name", body.get("displayName"));
        String imageUrl = (String) body.getOrDefault("image_url", body.get("imageUrl"));
        String featuredTitle = (String) body.getOrDefault("featured_title", body.get("featuredTitle"));

        Object fieldVisObj = body.getOrDefault("field_visibility", body.get("fieldVisibility"));
        String fieldVisJson = "{}";
        try {
            if (fieldVisObj != null) {
                fieldVisJson = objectMapper.writeValueAsString(fieldVisObj);
            }
        } catch (Exception ignored) {}

        String sql = "SELECT visibility::text, display_name, image_url, field_visibility::text, featured_title " +
                     "FROM public.member_update_profile(?::uuid, ?::text, ?::text, ?::text, ?::jsonb, ?::text)";

        try {
            Map<String, Object> updated = jdbcTemplate.queryForMap(
                    sql,
                    UUID.fromString(userId),
                    visibility,
                    displayName,
                    imageUrl,
                    fieldVisJson,
                    featuredTitle
            );

            Map<String, Object> settings = new LinkedHashMap<>();
            settings.put("visibility", updated.get("visibility"));
            settings.put("displayName", updated.get("display_name"));
            settings.put("display_name", updated.get("display_name"));
            settings.put("imageUrl", updated.get("image_url"));
            settings.put("image_url", updated.get("image_url"));
            settings.put("featuredTitle", updated.get("featured_title"));
            settings.put("featured_title", updated.get("featured_title"));

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("settings", settings);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            log.error("[ProfileController] Failed to update profile: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PROFILE_UPDATE_FAILED: " + e.getMessage());
        }
    }
}
