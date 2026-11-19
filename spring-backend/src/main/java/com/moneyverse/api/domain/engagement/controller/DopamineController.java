package com.moneyverse.api.domain.engagement.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/engagement/dopamine",
        "/api/engagement/dopamine",
        "/engagement/dopamine"
})
public class DopamineController {

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getDopamineStatus(HttpServletRequest request) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "canSpin", true,
                "streakDays", 5,
                "streakBonusMultiplier", 1.5,
                "dailyQuestProgress", 6,
                "dailyQuestTotal", 7,
                "rewardPointsAvailable", 1500
        ));
    }

    @PostMapping("/spin")
    public ResponseEntity<Map<String, Object>> spinDailyRoulette(HttpServletRequest request) {
        int[] rewards = { 100, 250, 500, 1000, 2500, 5000 };
        int chosen = rewards[new Random().nextInt(rewards.length)];
        return ResponseEntity.ok(Map.of(
                "success", true,
                "wonRewardWld", chosen,
                "spinReceiptId", "spin-rcpt-" + UUID.randomUUID().toString().substring(0, 8),
                "message", "행운의 룰렛 당첨! " + chosen + " WLD가 지갑에 즉시 지급되었습니다."
        ));
    }

    @GetMapping("/streak")
    public ResponseEntity<Map<String, Object>> getStreakBonus(HttpServletRequest request) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "streakDays", 5,
                "bonusAmountWld", 1250,
                "isClaimedToday", true,
                "nextBonusAtDay7", 5000
        ));
    }
}
