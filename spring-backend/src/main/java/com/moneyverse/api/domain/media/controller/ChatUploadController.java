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

@Tag(name = "Chat Upload", description = "실시간 채팅 및 고객지원 첨부 이미지 업로드 및 조회 API")
@RestController
public class ChatUploadController {

    private final ImageStorageService storageService;
    private final UserAuthService authService;
    private final MediaAccessService access;

    public ChatUploadController(ImageStorageService storageService, UserAuthService authService, MediaAccessService access) {
        this.storageService = storageService;
        this.authService = authService;
        this.access = access;
    }

    private Optional<SessionInfo> signedIn(HttpServletRequest request) {
        return authService.resolveSession(request)
                .filter(s -> s.isSignedIn() && s.getUserId() != null);
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

        Optional<SessionInfo> session = signedIn(request);
        if (session.isEmpty()) {
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

        StoredImage stored;
        try {
            stored = storageService.save(payload, "chat_");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("code", "CHAT_MEDIA_STORAGE_UNAVAILABLE"));
        }
        // Ownership goes through chat_media_register (295): the registry table is revoked from the
        // application role, so the former direct INSERT always failed and echoed the database error.
        boolean registered;
        try {
            registered = access.registerChatMedia(session.get().getUserId(), stored.getStorageKey());
        } catch (RuntimeException e) {
            registered = false;
        }
        if (!registered) {
            storageService.remove(stored.getStorageKey());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("code", "CHAT_MEDIA_REGISTRY_UNAVAILABLE"));
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        // The visibility function recognises a shared attachment by this exact path in a message.
        res.put("url", "/api/v1/content/chat/media/" + stored.getStorageKey());
        res.put("mimeType", stored.getMimeType());
        res.put("size", stored.getSize());
        return ResponseEntity.ok(res);
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
        Optional<SessionInfo> session = signedIn(request);
        if (session.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        // Owner, conversation participant, support thread owner, or an operator with an open console
        // session (chat_media_visible, 295). One answer for "absent" and "not yours".
        if (!access.chatMedia(session.get().getUserId(), key, session.get().getSessionId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

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
