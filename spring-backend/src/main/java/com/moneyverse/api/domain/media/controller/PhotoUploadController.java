package com.moneyverse.api.domain.media.controller;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.media.service.ImageStorageService;
import com.moneyverse.api.domain.media.service.ImageStorageService.StoredImage;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@Tag(name = "Admin Photo Upload", description = "운영자 전용 갤러리 사진 원시 바이트/멀티파트 업로드 API")
@RestController
public class PhotoUploadController {

    private final ImageStorageService storageService;
    private final AdminAuthService adminAuthService;

    public PhotoUploadController(ImageStorageService storageService, AdminAuthService adminAuthService) {
        this.storageService = storageService;
        this.adminAuthService = adminAuthService;
    }

    @PostMapping(path = {
            "/api/v1/admin/photos",
            "/api/admin/photos"
    })
    @Operation(summary = "운영자 사진 업로드")
    public ResponseEntity<?> uploadPhoto(
            HttpServletRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestBody(required = false) byte[] rawBytes) {

        if (!adminAuthService.isAuthorizedAdmin(request)) {
            return adminAuthService.unauthorizedResponse();
        }

        byte[] payload = null;
        if (file != null && !file.isEmpty()) {
            try {
                payload = file.getBytes();
            } catch (IOException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to read uploaded file"));
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
}
