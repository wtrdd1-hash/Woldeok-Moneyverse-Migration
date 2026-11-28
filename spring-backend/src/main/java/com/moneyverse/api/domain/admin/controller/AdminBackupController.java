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
        "/api/v1/admin/backups",
        "/api/admin/backups",
        "/admin/backups"
})
public class AdminBackupController {

    private final UserAuthService userAuthService;

    @Autowired
    public AdminBackupController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    private void verifyAdmin(HttpServletRequest request) {
        // Security 2026-11-26: any non-empty x-internal-token header skipped this check (the value was
        // never compared). Only a verified administrator session passes.
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

    @GetMapping(path = { "", "/" })
    public ResponseEntity<Map<String, Object>> getBackupInventory(HttpServletRequest request) {
        verifyAdmin(request);
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BACKUP_INVENTORY_SOURCE_UNAVAILABLE");
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getBackupStatus(HttpServletRequest request) {
        return getBackupInventory(request);
    }

    @PostMapping("/trigger")
    public ResponseEntity<Map<String, Object>> triggerManualBackup(HttpServletRequest request) {
        verifyAdmin(request);
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BACKUP_JOB_SOURCE_UNAVAILABLE");
    }

    @GetMapping("/files")
    public ResponseEntity<Map<String, Object>> listBackupFiles(HttpServletRequest request) {
        return getBackupInventory(request);
    }
}
