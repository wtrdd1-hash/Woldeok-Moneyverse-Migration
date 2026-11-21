package com.moneyverse.api.domain.engagement.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

/** Session-only economic activity: never emit synthetic spin credits, receipts or progress. */
@RestController
@RequestMapping(path = {"/api/v1/engagement/dopamine", "/api/engagement/dopamine", "/engagement/dopamine"})
public class DopamineController {
    private final UserAuthService authService;

    public DopamineController(UserAuthService authService) {
        this.authService = authService;
    }

    private void requireVerifiedMember(HttpServletRequest request) {
        if (request == null || authService.resolveSession(request)
                .filter(UserAuthService.SessionInfo::isSignedIn).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "verified member session required");
        }
    }

    private ResponseStatusException noSourceReceipt() {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "canonical economy activity and reward receipts not verified");
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String,Object>> getDopamineStatus(HttpServletRequest request) {
        requireVerifiedMember(request);
        throw noSourceReceipt();
    }

    @PostMapping("/spin")
    public ResponseEntity<Map<String,Object>> spinDailyRoulette(HttpServletRequest request) {
        requireVerifiedMember(request);
        throw noSourceReceipt();
    }

    @GetMapping("/streak")
    public ResponseEntity<Map<String,Object>> getStreakBonus(HttpServletRequest request) {
        requireVerifiedMember(request);
        throw noSourceReceipt();
    }
}
