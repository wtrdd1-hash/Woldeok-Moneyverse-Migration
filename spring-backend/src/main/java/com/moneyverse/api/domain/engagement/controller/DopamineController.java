package com.moneyverse.api.domain.engagement.controller;

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

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getDopamineStatus(HttpServletRequest request) {
        String userId = getUserIdOrThrow(request);
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "canSpinToday", true,
                "spinsRemaining", 1,
                "currentStreakDays", 5,
                "maxStreakBonusPercent", 25
        ));
    }

    @PostMapping("/spin")
    public ResponseEntity<Map<String, Object>> spinDailyRoulette(HttpServletRequest request) {
        String userId = getUserIdOrThrow(request);
        Random random = new Random();
        int rewardAmount = (random.nextInt(10) + 1) * 5000; // 5,000 ~ 50,000 WLD

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("userId", userId);
        res.put("rewardWld", rewardAmount);
        res.put("rewardType", "WLD_CURRENCY");
        res.put("spinsRemaining", 0);
        res.put("spunAt", new Date().toInstant().toString());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/streak")
    public ResponseEntity<Map<String, Object>> getStreakBonus(HttpServletRequest request) {
        String userId = getUserIdOrThrow(request);
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "streakDays", 5,
                "nextMilestoneDays", 7,
                "milestoneRewardWld", 100000
        ));
    }
}
