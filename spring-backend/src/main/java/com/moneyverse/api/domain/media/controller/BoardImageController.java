package com.moneyverse.api.domain.media.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo;
import com.moneyverse.api.domain.media.service.ImageStorageService;
import com.moneyverse.api.domain.media.service.ImageStorageService.StoredImage;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Tag(name = "Board Images", description = "자유게시판 게시글 첨부 이미지 업로드 및 스트리밍 API")
@RestController
public class BoardImageController {

    private final ImageStorageService storageService;
    private final UserAuthService authService;
    private final JdbcTemplate jdbcTemplate;

    public BoardImageController(ImageStorageService storageService, UserAuthService authService, JdbcTemplate jdbcTemplate) {
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
            "/api/v1/board/images/uploads",
            "/api/board/images/uploads"
    })
    @Operation(summary = "게시판 이미지 파일 업로드")
    public ResponseEntity<?> uploadBoardImage(
            HttpServletRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestBody(required = false) byte[] rawBytes) {

        Optional<UUID> userId = resolveUserId(request);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        byte[] payload = null;
        if (file != null && !file.isEmpty()) {
            try { payload = file.getBytes(); } catch (IOException e) {
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
            Instant now = Instant.now();
            jdbcTemplate.update(
                "INSERT INTO member_board_image_uploads (storage_key, owner_user_id, created_at) VALUES (?, ?, ?)",
                stored.getStorageKey(), userId.get(), Timestamp.from(now)
            );

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

    @GetMapping(path = {
            "/api/v1/board/images/{key}",
            "/api/board/images/{key}",
            "/api/v1/public/board/images/{key}",
            "/api/public/board/images/{key}"
    })
    @Operation(summary = "게시판 첨부 이미지 스트리밍")
    public ResponseEntity<byte[]> getBoardImage(@PathVariable("key") String key) {
        Optional<byte[]> bytes = storageService.read(key);
        if (bytes.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        String mimeType = storageService.getMimeTypeFor(key);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(mimeType));
        headers.setContentLength(bytes.get().length);
        headers.set("Cache-Control", "public, max-age=3600, immutable");
        headers.set("X-Content-Type-Options", "nosniff");

        return new ResponseEntity<>(bytes.get(), headers, HttpStatus.OK);
    }
}
