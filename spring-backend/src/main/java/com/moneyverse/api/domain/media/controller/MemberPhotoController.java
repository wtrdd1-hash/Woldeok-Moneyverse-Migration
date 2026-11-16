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

    private final ImageStorageService storageService;
    private final UserAuthService authService;
    private final JdbcTemplate jdbcTemplate;

    public MemberPhotoController(ImageStorageService storageService, UserAuthService authService, JdbcTemplate jdbcTemplate) {
        this.storageService = storageService;
        this.authService = authService;
        this.jdbcTemplate = jdbcTemplate;
    }

    private Optional<UUID> resolveUserId(HttpServletRequest request) {
        Optional<SessionInfo> session = authService.resolveSession(request);
        if (session.isPresent() && session.get().isSignedIn()) {
            return Optional.of(session.get().getUserId());
        }
        String headerUid = request.getHeader("X-User-Id");
        if (headerUid != null && !headerUid.isBlank()) {
            try { return Optional.of(UUID.fromString(headerUid)); } catch (Exception ignored) {}
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping(path = {
            "/api/v1/photos",
            "/api/photos"
    })
    @Operation(summary = "업로드한 사진을 갤러리 심사 요청으로 제출")
    public ResponseEntity<?> submitPhoto(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {

        Optional<UUID> userId = resolveUserId(request);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        String storageKey = (String) body.get("storageKey");
        String altText = (String) body.getOrDefault("altText", "회원 사진");
        if (storageKey == null || storageKey.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "storageKey is required"));
        }

        UUID photoId = UUID.randomUUID();
        Instant now = Instant.now();
        String imageUrl = "/media/" + storageKey;

        String sql = """
            INSERT INTO photos (id, storage_key, alt_text, visibility, uploaded_by, content_state, image_url, created_at, updated_at)
            VALUES (?, ?, ?, 'PRIVATE', ?, 'DRAFT', ?, ?, ?)
            """;
        try {
            jdbcTemplate.update(sql, photoId, storageKey, altText, userId.get(), imageUrl, Timestamp.from(now), Timestamp.from(now));
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("photoId", photoId.toString());
            res.put("storageKey", storageKey);
            res.put("status", "SUBMITTED");
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(res, "Photo submitted for review"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Failed to submit photo: " + e.getMessage()));
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

        Optional<UUID> userId = resolveUserId(request);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        String photoIdStr = (String) body.get("photoId");
        if (photoIdStr == null || photoIdStr.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "photoId is required"));
        }

        UUID photoId = UUID.fromString(photoIdStr);
        int rows = jdbcTemplate.update(
            "DELETE FROM photos WHERE id = ? AND uploaded_by = ? AND content_state = 'DRAFT'",
            photoId, userId.get()
        );

        if (rows > 0) {
            return ResponseEntity.ok(ApiResponse.ok(Map.of("withdrawn", true, "photoId", photoIdStr)));
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "게시된 사진은 직접 철회할 수 없습니다."));
        }
    }

    @GetMapping(path = {
            "/api/v1/photos/mine",
            "/api/photos/mine"
    })
    @Operation(summary = "내 제출 사진 목록 조회")
    public ResponseEntity<?> mine(HttpServletRequest request) {
        Optional<UUID> userId = resolveUserId(request);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        String sql = "SELECT id, storage_key, alt_text, content_state, image_url, created_at FROM photos WHERE uploaded_by = ? ORDER BY created_at DESC";
        List<Map<String, Object>> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", rs.getString("id"));
            m.put("storageKey", rs.getString("storage_key"));
            m.put("altText", rs.getString("alt_text"));
            m.put("state", rs.getString("content_state"));
            m.put("imageUrl", rs.getString("image_url"));
            Timestamp cat = rs.getTimestamp("created_at");
            m.put("createdAt", cat != null ? cat.toInstant().toString() : null);
            return m;
        }, userId.get());

        return ResponseEntity.ok(Map.of("submissions", list));
    }
}
