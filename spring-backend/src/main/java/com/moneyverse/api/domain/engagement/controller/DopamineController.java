package com.moneyverse.api.domain.engagement.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping(path = {
        "/api/v1/engagement/dopamine",
        "/api/engagement/dopamine",
        "/engagement/dopamine"
})
public class DopamineController {

    private final UserAuthService userAuthService;

    @Autowired
    public DopamineController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    private String getUserIdOrThrow(HttpServletRequest request) {
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return sessionOpt.get().getUserId().toString();
    }

    /**
     * Spring has no verified owner-scoped daily-spin/roulette receipt reader yet.
     * Never claim that a user can spin, has a streak, or received WLD without
     * the PostgreSQL-owned settlement and the canonical Nest contract.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getDopamineStatus(HttpServletRequest request) {
        getUserIdOrThrow(request);
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Dopamine status requires verified ledger receipts");
    }

    @PostMapping("/spin")
    public ResponseEntity<Map<String, Object>> spinDailyRoulette(HttpServletRequest request) {
        getUserIdOrThrow(request);
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "WLD spin rewards require canonical PostgreSQL settlement");
    }

    @GetMapping("/streak")
    public ResponseEntity<Map<String, Object>> getStreakBonus(HttpServletRequest request) {
        getUserIdOrThrow(request);
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Streak rewards require verified ledger receipts");
    }
}
