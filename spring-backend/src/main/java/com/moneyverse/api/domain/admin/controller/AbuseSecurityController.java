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
        "/api/v1/admin/security/abuse",
        "/api/admin/security/abuse",
        "/admin/security/abuse"
})
public class AbuseSecurityController {

    private final UserAuthService userAuthService;

    @Autowired
    public AbuseSecurityController(UserAuthService userAuthService) {
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

    @PostMapping("/suspend-permanent")
    public ResponseEntity<Map<String, Object>> suspendPermanent(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        verifyAdmin(request);
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ABUSE_ENFORCEMENT_SOURCE_UNAVAILABLE");
    }

    @PostMapping("/block-address")
    public ResponseEntity<Map<String, Object>> blockAddress(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        verifyAdmin(request);
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ABUSE_ENFORCEMENT_SOURCE_UNAVAILABLE");
    }

    @DeleteMapping("/unblock/{blockId}")
    public ResponseEntity<Map<String, Object>> unblockAddress(
            HttpServletRequest request,
            @PathVariable("blockId") String blockId) {
        verifyAdmin(request);
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ABUSE_ENFORCEMENT_SOURCE_UNAVAILABLE");
    }

    @GetMapping("/rules")
    public ResponseEntity<Map<String, Object>> getRules(HttpServletRequest request) {
        verifyAdmin(request);
        List<Map<String, Object>> rules = List.of(
                Map.of("id", "rule-rapid-tx", "name", "단시간 초과 거래 탐지", "enabled", true, "thresholdRps", 20),
                Map.of("id", "rule-multi-ip", "name", "동시 다중 IP 세션 탐지", "enabled", true, "maxIpsPerUser", 3)
        );
        return ResponseEntity.ok(Map.of("rules", rules));
    }
}
