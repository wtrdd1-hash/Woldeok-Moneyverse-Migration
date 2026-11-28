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
        // Security review 2026-11-28: this served invented live state (figures, standings, boosts,
        // "verified" content). Unavailable until read from its canonical source.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "WARFARE_SOURCE_UNAVAILABLE");
    }

    @GetMapping("/territories")
    public ResponseEntity<Map<String, Object>> listTerritories() {
        // Security review 2026-11-28: this served invented live state (figures, standings, boosts,
        // "verified" content). Unavailable until read from its canonical source.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "WARFARE_SOURCE_UNAVAILABLE");
    }

    @PostMapping("/declare-war")
    public ResponseEntity<Map<String, Object>> declareWar(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        getUserIdOrThrow(request);
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "WARFARE_SOURCE_UNAVAILABLE");
    }

    @PostMapping("/battles/result")
    public ResponseEntity<Map<String, Object>> reportBattleResult(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        getUserIdOrThrow(request);
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "WARFARE_SOURCE_UNAVAILABLE");
    }
}
