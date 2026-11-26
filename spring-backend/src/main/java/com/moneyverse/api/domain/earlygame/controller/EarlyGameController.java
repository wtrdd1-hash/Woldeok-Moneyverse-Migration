package com.moneyverse.api.domain.earlygame.controller;

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
        "/api/v1/early-game",
        "/api/early-game",
        "/early-game"
})
/** Reads moved to EarlyGameReadsController (2026-11-25); the claim stays refused until it is ported with its ledger receipt. */
public class EarlyGameController {

    private final UserAuthService userAuthService;

    @Autowired
    public EarlyGameController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    private String getUserIdOrThrow(HttpServletRequest request) {
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return sessionOpt.get().getUserId().toString();
    }

    @PostMapping("/claims")
    public ResponseEntity<Map<String, Object>> claim(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        getUserIdOrThrow(request);
        // Source-truth gate (QA 2026-11-25): hard-coded steps/events and a
        // claim that reported 50,000 WLD without any ledger posting.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "EARLYGAME_CANONICAL_SOURCE_UNAVAILABLE");
    }
}
