package com.moneyverse.api.domain.engagement.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping(path = {
        "/api/v1/engagement/dopamine",
        "/api/engagement/dopamine",
        "/engagement/dopamine"
})
public class DopamineController {

    private final UserAuthService authService;

    @Autowired
    public DopamineController(UserAuthService authService) {
        this.authService = authService;
    }

    private UserAuthService.SessionInfo requireSession(HttpServletRequest request) {
        if (authService == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication service unavailable");
        }
        return authService.resolveSession(request)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session required"));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getDopamineStatus(HttpServletRequest request) {
        requireSession(request);
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Dopamine status requires verified ledger outbox pipeline");
    }

    @PostMapping("/spin")
    public ResponseEntity<Map<String, Object>> spinDailyRoulette(HttpServletRequest request) {
        requireSession(request);
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Dopamine roulette settlement requires verified ledger outbox pipeline");
    }

    @GetMapping("/streak")
    public ResponseEntity<Map<String, Object>> getStreakBonus(HttpServletRequest request) {
        requireSession(request);
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Dopamine streak rewards require verified ledger outbox pipeline");
    }
}
