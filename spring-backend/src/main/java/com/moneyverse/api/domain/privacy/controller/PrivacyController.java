package com.moneyverse.api.domain.privacy.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/privacy/requests",
        "/api/privacy/requests",
        "/privacy/requests"
})
public class PrivacyController {

    private final UserAuthService userAuthService;

    @Autowired
    public PrivacyController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    private String getUserIdOrThrow(HttpServletRequest request) {
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return sessionOpt.get().getUserId().toString();
    }

    private HttpHeaders securityHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Cache-Control", "private, no-store");
        headers.set("X-Robots-Tag", "noindex");
        return headers;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            HttpServletRequest request,
            @RequestParam(name = "type", required = false) String type) {
        String userId = getUserIdOrThrow(request);
        return ResponseEntity.ok()
                .headers(securityHeaders())
                .body(Map.of("requests", Collections.emptyList()));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        String userId = getUserIdOrThrow(request);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("requestId", UUID.randomUUID().toString());
        res.put("userId", userId);
        res.put("requestType", body.getOrDefault("requestType", "export_data"));
        res.put("status", "SUBMITTED");
        res.put("createdAt", new Date().toInstant().toString());
        return ResponseEntity.ok()
                .headers(securityHeaders())
                .body(res);
    }
}
