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
        "/api/v1/admin/operations",
        "/api/admin/operations",
        "/admin/operations",
        "/api/v1/admin/work",
        "/api/admin/work"
})
public class OperationsController {

    private final UserAuthService userAuthService;

    @Autowired
    public OperationsController(UserAuthService userAuthService) {
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

    @GetMapping("/tasks")
    public ResponseEntity<Map<String, Object>> listTasks(HttpServletRequest request) {
        verifyAdmin(request);
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "OPERATIONS_SOURCE_UNAVAILABLE");
    }

    @PostMapping("/tasks/{name}/run")
    public ResponseEntity<Map<String, Object>> triggerTask(
            HttpServletRequest request,
            @PathVariable("name") String name) {
        verifyAdmin(request);
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "OPERATIONS_SOURCE_UNAVAILABLE");
    }

    @PostMapping("/maintenance")
    public ResponseEntity<Map<String, Object>> setMaintenanceMode(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        verifyAdmin(request);
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "OPERATIONS_SOURCE_UNAVAILABLE");
    }
}
