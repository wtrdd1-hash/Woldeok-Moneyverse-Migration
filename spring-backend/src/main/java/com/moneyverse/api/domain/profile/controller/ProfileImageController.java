package com.moneyverse.api.domain.profile.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.media.service.ImageStorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/profile/image",
        "/api/profile/image",
        "/profile/image"
})
public class ProfileImageController {

    private final UserAuthService userAuthService;
    private final ImageStorageService imageStorageService;

    @Autowired
    public ProfileImageController(UserAuthService userAuthService, ImageStorageService imageStorageService) {
        this.userAuthService = userAuthService;
        this.imageStorageService = imageStorageService;
    }

    private String getUserIdOrThrow(HttpServletRequest request) {
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return sessionOpt.get().getUserId().toString();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadProfileImage(
            HttpServletRequest request,
            @RequestParam("file") MultipartFile file) {
        String userId = getUserIdOrThrow(request);
        try {
            ImageStorageService.StoredImage stored = imageStorageService.save(file.getBytes());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "imageUrl", stored.getUrl(),
                    "storageKey", stored.getStorageKey()
            ));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "failed to save image");
        }
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> deleteProfileImage(HttpServletRequest request) {
        String userId = getUserIdOrThrow(request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "deleted", true
        ));
    }
}
