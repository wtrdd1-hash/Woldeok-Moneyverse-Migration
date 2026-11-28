package com.moneyverse.api.domain.media.controller;

import com.moneyverse.api.domain.media.service.ImageStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.media.service.MediaAccessService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.UUID;

@Tag(name = "Media", description = "발행된 갤러리 사진 및 정적 미디어 바이너리 서빙 API")
@RestController
public class MediaController {

    private final ImageStorageService storageService;
    private final UserAuthService authService;
    private final MediaAccessService access;

    public MediaController(ImageStorageService storageService, UserAuthService authService, MediaAccessService access) {
        this.storageService = storageService;
        this.authService = authService;
        this.access = access;
    }

    private UUID viewer(HttpServletRequest request) {
        return authService.resolveSession(request)
                .filter(s -> s.isSignedIn() && s.getUserId() != null)
                .map(s -> s.getUserId()).orElse(null);
    }

    /**
     * A published gallery photo, or the caller's own submission. Security review 2026-11-28: this
     * served every stored key (chat attachments, unreviewed submissions) with public caching. Now,
     * as in the legacy gateway, publication is asked first; an owner's draft is served privately.
     */
    @GetMapping("/media/{key}")
    @Operation(summary = "발행된 사진 또는 본인 제출 사진 바이너리")
    public ResponseEntity<byte[]> getMedia(HttpServletRequest request, @PathVariable("key") String key) {
        if (access.publishedPhoto(key)) {
            return bytes(key, "public, max-age=86400, immutable");
        }
        if (access.ownSubmission(viewer(request), key)) {
            return bytes(key, "private, no-store");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping("/media/profile/{key}")
    @Operation(summary = "프로필 이미지 바이너리 (공개 범위 함수 판정)")
    public ResponseEntity<byte[]> getProfileMedia(HttpServletRequest request, @PathVariable("key") String key) {
        if (!access.profileImage(viewer(request), key)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return bytes(key, "private, max-age=300");
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
