package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/admin/storage/headroom",
        "/api/admin/storage/headroom",
        "/admin/storage/headroom",
        "/api/v1/admin/operations/storage-headroom",
        "/api/admin/operations/storage-headroom"
})
public class StorageHeadroomController {

    private final UserAuthService userAuthService;

    @Autowired
    public StorageHeadroomController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    private void verifyAdmin(HttpServletRequest request) {
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        List<String> roles = sessionOpt.get().getRoles();
        boolean hasAdmin = roles != null && roles.stream().anyMatch(r -> "SUPERADMIN".equalsIgnoreCase(r) || "ADMIN".equalsIgnoreCase(r));
        if (!hasAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: Admin access required");
        }
    }

    @GetMapping({ "", "/status" })
    public ResponseEntity<Map<String, Object>> getStorageStatus(HttpServletRequest request) {
        verifyAdmin(request);
        // Security review 2026-11-28: this answered with constants an operator would act on.
        // Unavailable until read from its canonical source; never invented evidence.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "STORAGE_HEADROOM_SOURCE_UNAVAILABLE");
    }

    @GetMapping("/tables")
    public ResponseEntity<Map<String, Object>> getTopTables(HttpServletRequest request) {
        verifyAdmin(request);
        // Security review 2026-11-28: this answered with constants an operator would act on.
        // Unavailable until read from its canonical source; never invented evidence.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "STORAGE_HEADROOM_SOURCE_UNAVAILABLE");
    }

    @GetMapping("/recommendations")
    public ResponseEntity<Map<String, Object>> getRecommendations(HttpServletRequest request) {
        verifyAdmin(request);
        // Security review 2026-11-28: this answered with constants an operator would act on.
        // Unavailable until read from its canonical source; never invented evidence.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "STORAGE_HEADROOM_SOURCE_UNAVAILABLE");
    }
}
