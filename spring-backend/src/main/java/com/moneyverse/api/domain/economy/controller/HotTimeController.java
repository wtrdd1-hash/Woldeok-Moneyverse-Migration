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
        // Security review 2026-11-28: this served invented live state (figures, standings, boosts,
        // "verified" content). Unavailable until read from its canonical source.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "HOT_TIME_SOURCE_UNAVAILABLE");
    }

    @GetMapping("/schedule")
    public ResponseEntity<Map<String, Object>> getWeeklySchedule() {
        // Security review 2026-11-28: this served invented live state (figures, standings, boosts,
        // "verified" content). Unavailable until read from its canonical source.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "HOT_TIME_SOURCE_UNAVAILABLE");
    }

    @PostMapping("/admin/trigger")
    public ResponseEntity<Map<String, Object>> triggerManualBuff(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        List<String> roles = sessionOpt.get().getRoles();
        boolean hasAdmin = roles != null && roles.stream().anyMatch(r -> "SUPERADMIN".equalsIgnoreCase(r) || "ADMIN".equalsIgnoreCase(r));
        if (!hasAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: Admin access required");
        }

        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "HOT_TIME_SOURCE_UNAVAILABLE");
    }
}
