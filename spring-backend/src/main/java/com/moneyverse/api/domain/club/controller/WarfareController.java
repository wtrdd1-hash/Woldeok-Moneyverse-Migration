package com.moneyverse.api.domain.club.controller;

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
        "/api/v1/clubs/warfare",
        "/api/clubs/warfare",
        "/clubs/warfare"
})
public class WarfareController {

    private final UserAuthService userAuthService;

    @Autowired
    public WarfareController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    private String getUserIdOrThrow(HttpServletRequest request) {
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return sessionOpt.get().getUserId().toString();
    }

    @GetMapping("/season/current")
    public ResponseEntity<Map<String, Object>> getCurrentSeason() {
        return sourceUnavailable();
    }

    @GetMapping("/territories")
    public ResponseEntity<Map<String, Object>> listTerritories() {
        return sourceUnavailable();
    }

    @PostMapping("/declare-war")
    public ResponseEntity<Map<String, Object>> declareWar(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        getUserIdOrThrow(request); // authorization before availability (review 2026-11-28)
        return sourceUnavailable();
    }

    @PostMapping("/battles/result")
    public ResponseEntity<Map<String, Object>> reportBattleResult(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        getUserIdOrThrow(request); // authorization before availability (review 2026-11-28)
        return sourceUnavailable();
    }

    // Source-truth gate (2026-11-26): seasons and territories were hard-coded and declarations/results
    // claimed writes that never happened. No table or function backs club warfare yet.
    private static ResponseEntity<Map<String, Object>> sourceUnavailable() {
        return ResponseEntity.status(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE)
                .header("Cache-Control", "no-store")
                .body(Map.of("ok", false, "code", "CLUB_WARFARE_SOURCE_UNAVAILABLE"));
    }
}
