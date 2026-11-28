package com.moneyverse.api.domain.media.controller;

import com.moneyverse.api.common.response.ApiResponse;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo;
import com.moneyverse.api.domain.media.service.ImageStorageService;
import com.moneyverse.api.domain.media.service.ImageStorageService.StoredImage;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Tag(name = "Member Photo Submissions", description = "일반 회원의 갤러리 사진 제출, 철회 및 내 제출 목록 API")
@RestController
public class MemberPhotoController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MemberPhotoController.class);

    private final ImageStorageService storageService;
    private final UserAuthService authService;
    private final JdbcTemplate jdbcTemplate;
    private final com.moneyverse.api.domain.identity.service.MemberApiGuard memberApiGuard;

    public MemberPhotoController(ImageStorageService storageService, UserAuthService authService, JdbcTemplate jdbcTemplate) {
        this.storageService = storageService;
        this.authService = authService;
        this.jdbcTemplate = jdbcTemplate;
        this.memberApiGuard = new com.moneyverse.api.domain.identity.service.MemberApiGuard(authService);
    }

    private Optional<UUID> resolveUserId(HttpServletRequest request) {
        Optional<SessionInfo> session = authService.resolveSession(request);
        if (session.isPresent() && session.get().isSignedIn() && session.get().getUserId() != null) {
            return Optional.of(session.get().getUserId());
        }
        return Optional.empty();
    }

    @PostMapping(path = {
            "/api/v1/photos/uploads",
            "/api/photos/uploads"
    })
    @Operation(summary = "사진 파일 업로드 및 스토리지 키 발급")
    public ResponseEntity<?> upload(
            HttpServletRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestBody(required = false) byte[] rawBytes) {

        Optional<UUID> userId = resolveUserId(request);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        byte[] payload = null;
        if (file != null && !file.isEmpty()) {
            try {
                payload = file.getBytes();
            } catch (IOException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to read file"));
            }
        } else if (rawBytes != null && rawBytes.length > 0) {
            payload = rawBytes;
        }

        if (payload == null || payload.length == 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "No image bytes provided"));
        }

        try {
            StoredImage stored = storageService.save(payload);
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("storageKey", stored.getStorageKey());
            res.put("mimeType", stored.getMimeType());
            res.put("size", stored.getSize());
            res.put("url", stored.getUrl());
            return ResponseEntity.status(HttpStatus.CREATED).body(res);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // Internal exception text (paths, storage detail) is logged by class only, never returned.
            log.warn("[MemberPhoto] upload failed: {}", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "PHOTO_UPLOAD_FAILED"));
        }
    }

    // Migrations 098/297 own submission, withdrawal and the owner list (idempotent, owner-scoped,
    // schema-valid). The controller used to write and read the photos table itself with values
    // the schema rejects and a response shape the web client does not accept (2026-11-26).
    @PostMapping(path = {
            "/api/v1/photos",
            "/api/photos"
    })
    @Operation(summary = "업로드한 사진을 갤러리 심사 요청으로 제출")
    public ResponseEntity<?> submitPhoto(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        UUID actor = memberApiGuard.verifiedMutationActor(request);
        String storageKey = body.get("storageKey") instanceof String s ? s.trim() : null;
        String altText = body.get("altText") instanceof String s ? s : null;
        UUID key = memberApiGuard.idempotencyKey(body.get("idempotencyKey") instanceof String s ? s : null);
        if (storageKey == null || storageKey.isEmpty() || altText == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "storageKey and altText are required"));
        }
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                    "SELECT photo_id, submitted_at, replayed FROM public.member_submit_photo(?::uuid, ?::uuid, ?, ?)",
                    actor, key, storageKey, altText);
            if (rows.isEmpty()) return refused("PHOTO_SUBMISSION_NOT_RECORDED", null);
            return ResponseEntity.status(HttpStatus.CREATED).body(rows.get(0));
        } catch (org.springframework.dao.DataAccessException e) {
            return refused("PHOTO_SUBMISSION_REFUSED", e);
        }
    }

    @PostMapping(path = {
            "/api/v1/photos/withdraw",
            "/api/photos/withdraw"
    })
    @Operation(summary = "심사 대기 중인 사진 제출 철회")
    public ResponseEntity<?> withdrawPhoto(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        UUID actor = memberApiGuard.verifiedMutationActor(request);
        UUID key = memberApiGuard.idempotencyKey(body.get("idempotencyKey") instanceof String s ? s : null);
        UUID photoId;
        try {
            photoId = UUID.fromString(String.valueOf(body.get("photoId")));
        } catch (IllegalArgumentException invalid) {
            return ResponseEntity.badRequest().body(Map.of("error", "photoId is required"));
        }
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                    "SELECT photo_id, withdrawn_at, replayed FROM public.member_withdraw_pending_photo(?::uuid, ?::uuid, ?::uuid)",
                    actor, photoId, key);
            if (rows.isEmpty()) return refused("PHOTO_WITHDRAWAL_NOT_RECORDED", null);
            return ResponseEntity.ok(rows.get(0));
        } catch (org.springframework.dao.DataAccessException e) {
            return refused("PHOTO_WITHDRAWAL_REFUSED", e);
        }
    }

    @GetMapping(path = {
            "/api/v1/photos/mine",
            "/api/photos/mine"
    })
    @Operation(summary = "내 제출 사진 목록 조회")
    public ResponseEntity<?> mine(HttpServletRequest request) {
        UUID actor = memberApiGuard.actor(request);
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT photo_id, image_url, alt_text, published, submitted_at, published_at "
                        + "FROM public.member_my_photo_submissions(?::uuid)", actor);
        return ResponseEntity.ok(Map.of("submissions", rows));
    }

    // The database message names constraints and columns; return a code, log the class only.
    private ResponseEntity<?> refused(String code, Exception cause) {
        if (cause != null) log.warn("[MemberPhoto] {}: {}", code, cause.getClass().getSimpleName());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", code));
    }
}
