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
import com.moneyverse.api.domain.media.service.MediaAccessService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Tag(name = "Board Images", description = "자유게시판 게시글 첨부 이미지 업로드 및 스트리밍 API")
@RestController
public class BoardImageController {

    private final ImageStorageService storageService;
    private final UserAuthService authService;
    private final MediaAccessService access;

    public BoardImageController(ImageStorageService storageService, UserAuthService authService, MediaAccessService access) {
        this.storageService = storageService;
        this.authService = authService;
        this.access = access;
    }

    private Optional<UUID> resolveUserId(HttpServletRequest request) {
        Optional<SessionInfo> session = authService.resolveSession(request);
        if (session.isPresent() && session.get().isSignedIn() && session.get().getUserId() != null) {
            return Optional.of(session.get().getUserId());
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

        StoredImage stored;
        try {
            stored = storageService.save(payload);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("code", "BOARD_IMAGE_STORAGE_UNAVAILABLE"));
        }
        // Ownership goes through member_board_register_image_upload (176); the upload table is not
        // writable by the application role, so the former direct INSERT always failed and echoed
        // the database error (security review 2026-11-28).
        boolean registered;
        try {
            registered = access.registerBoardImage(userId.get(), stored.getStorageKey());
        } catch (RuntimeException e) {
            registered = false;
        }
        if (!registered) {
            storageService.remove(stored.getStorageKey());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("code", "BOARD_IMAGE_REGISTRY_UNAVAILABLE"));
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("storageKey", stored.getStorageKey());
        res.put("mimeType", stored.getMimeType());
        res.put("size", stored.getSize());
        // The storage default (/media/...) is the gallery route, which does not serve board images.
        res.put("url", "/api/v1/board/images/" + stored.getStorageKey());
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping(path = {
            "/api/v1/board/images/{key}",
            "/api/board/images/{key}"
    })
    @Operation(summary = "게시판 첨부 이미지 스트리밍 (회원)")
    public ResponseEntity<byte[]> getBoardImage(HttpServletRequest request, @PathVariable("key") String key) {
        Optional<UUID> userId = resolveUserId(request);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        // An image of a hidden or deleted post is not served (member_board_image_visible, 173).
        if (!access.boardImageForMember(userId.get(), key)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return bytes(key, "private, max-age=300");
    }

    @GetMapping(path = {
            "/api/v1/board/public/images/{key}",
            "/api/board/public/images/{key}",
            "/api/v1/public/board/images/{key}",
            "/api/public/board/images/{key}"
    })
    @Operation(summary = "게시판 첨부 이미지 스트리밍 (공개 게시글)")
    public ResponseEntity<byte[]> getPublicBoardImage(@PathVariable("key") String key) {
        if (!access.boardImageForPublic(key)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        // Legacy gateway lifetime: a deleted post's image leaves shared caches within five minutes.
        return bytes(key, "public, max-age=300");
    }

    private ResponseEntity<byte[]> bytes(String key, String cacheControl) {
        Optional<byte[]> bytes = storageService.read(key);
        if (bytes.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(storageService.getMimeTypeFor(key)));
        headers.setContentLength(bytes.get().length);
        headers.set("Cache-Control", cacheControl);
        headers.set("X-Content-Type-Options", "nosniff");
        return new ResponseEntity<>(bytes.get(), headers, HttpStatus.OK);
    }
}
