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
        if (body == null || !body.containsKey("targetUserId") || !body.containsKey("reason")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "targetUserId and reason are required");
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("targetUserId", body.get("targetUserId"));
        res.put("action", "PERMANENT_SUSPENDED");
        res.put("reason", body.get("reason"));
        res.put("processedAt", new Date().toInstant().toString());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/block-address")
    public ResponseEntity<Map<String, Object>> blockAddress(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        verifyAdmin(request);
        if (body == null || !body.containsKey("ipOrAddress")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ipOrAddress is required");
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("blockedAddress", body.get("ipOrAddress"));
        res.put("blockId", "block-" + UUID.randomUUID());
        res.put("createdAt", new Date().toInstant().toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @DeleteMapping("/unblock/{blockId}")
    public ResponseEntity<Map<String, Object>> unblockAddress(
            HttpServletRequest request,
            @PathVariable("blockId") String blockId) {
        verifyAdmin(request);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("unblockedId", blockId);
        res.put("unblockedAt", new Date().toInstant().toString());
        return ResponseEntity.ok(res);
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
