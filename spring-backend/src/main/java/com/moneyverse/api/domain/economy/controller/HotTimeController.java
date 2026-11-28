package com.moneyverse.api.domain.economy.controller;

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
        "/api/v1/economy/hot-time",
        "/api/economy/hot-time",
        "/economy/hot-time"
})
public class HotTimeController {

    private final UserAuthService userAuthService;

    @Autowired
    public HotTimeController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    @GetMapping("/active")
    public ResponseEntity<Map<String, Object>> getActiveHotTime() {
        return sourceUnavailable();
    }

    @GetMapping("/schedule")
    public ResponseEntity<Map<String, Object>> getWeeklySchedule() {
        return sourceUnavailable();
    }

    @PostMapping("/admin/trigger")
    public ResponseEntity<Map<String, Object>> triggerManualBuff(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        // Authorization before availability (review 2026-11-28): anonymous 401, non-administrator 403.
        Optional<UserAuthService.SessionInfo> session = userAuthService.resolveSession(request);
        if (session.isEmpty() || !session.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        List<String> roles = session.get().getRoles();
        boolean admin = roles != null && roles.stream().anyMatch(r -> "SUPERADMIN".equalsIgnoreCase(r) || "ADMIN".equalsIgnoreCase(r));
        if (!admin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: Admin access required");
        }
        return sourceUnavailable();
    }

    // Source-truth gate (2026-11-26): these answered a permanent 1.5x buff and a manual-trigger "success"
    // with nothing stored. No table or function backs hot time yet; 503 until one does.
    private static ResponseEntity<Map<String, Object>> sourceUnavailable() {
        return ResponseEntity.status(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE)
                .header("Cache-Control", "no-store")
                .body(Map.of("ok", false, "code", "HOT_TIME_SOURCE_UNAVAILABLE"));
    }
}
