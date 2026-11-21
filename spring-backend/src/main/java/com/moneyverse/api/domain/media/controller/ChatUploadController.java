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

@Tag(name = "Chat Upload", description = "실시간 채팅 및 고객지원 첨부 이미지 업로드 및 조회 API")
@RestController
public class ChatUploadController {

    private final ImageStorageService storageService;
    private final UserAuthService authService;
    private final JdbcTemplate jdbcTemplate;

    public ChatUploadController(ImageStorageService storageService, UserAuthService authService, JdbcTemplate jdbcTemplate) {
        this.storageService = storageService;
        this.authService = authService;
        this.jdbcTemplate = jdbcTemplate;
    }

    private Optional<UUID> resolveUserId(HttpServletRequest request) {
        Optional<SessionInfo> session = authService.resolveSession(request);
        if (session.isPresent() && session.get().isSignedIn() && session.get().getUserId() != null) {
            return Optional.of(session.get().getUserId());
        }
        return Optional.empty();
    }

    @PostMapping(path = {
            "/api/v1/content/chat/upload",
            "/api/content/chat/upload",
            "/content/chat/upload"
    })
    @Operation(summary = "채팅 첨부 이미지 업로드")
    public ResponseEntity<?> uploadChatImage(
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
            return ResponseEntity.badRequest().body(Map.of("error", "업로드할 이미지 파일이 필요합니다."));
        }

        try {
            StoredImage stored = storageService.save(payload);
            Instant now = Instant.now();
            jdbcTemplate.update(
                "INSERT INTO chat_media_registry (storage_key, owner_user_id, created_at) VALUES (?, ?, ?)",
                stored.getStorageKey(), userId.get(), Timestamp.from(now)
            );

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("url", stored.getUrl());
            res.put("mimeType", stored.getMimeType());
            res.put("size", stored.getSize());
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping(path = {
            "/api/v1/content/chat/media/{key}",
            "/api/content/chat/media/{key}",
            "/content/chat/media/{key}"
    })
    @Operation(summary = "채팅 첨부 이미지 바이트 조회")
    public ResponseEntity<byte[]> getChatMedia(
            HttpServletRequest request,
            @PathVariable("key") String key) {

        Optional<byte[]> bytes = storageService.read(key);
        if (bytes.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        String mimeType = storageService.getMimeTypeFor(key);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(mimeType));
        headers.setContentLength(bytes.get().length);
        headers.set("Cache-Control", "private, no-store");
        headers.set("X-Robots-Tag", "noindex");
        headers.set("X-Content-Type-Options", "nosniff");

        return new ResponseEntity<>(bytes.get(), headers, HttpStatus.OK);
    }
}
