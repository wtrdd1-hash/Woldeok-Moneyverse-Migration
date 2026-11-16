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
        return ResponseEntity.ok(Map.of(
                "seasonId", "warfare-season-12",
                "seasonName", "2026 영지 쟁탈 대전",
                "phase", "BATTLE_PHASE",
                "startedAt", "2026-11-01T00:00:00Z",
                "endsAt", "2026-11-30T23:59:59Z",
                "topClubs", List.of(
                        Map.of("clubName", "월스트리트 연합", "points", 125000),
                        Map.of("clubName", "실리콘 벨리", "points", 112000)
                )
        ));
    }

    @GetMapping("/territories")
    public ResponseEntity<Map<String, Object>> listTerritories() {
        List<Map<String, Object>> territories = List.of(
                Map.of("id", "ter-gangnam", "name", "강남 금융 센터", "occupyingClub", "월스트리트 연합", "dailyTaxWld", 500000),
                Map.of("id", "ter-yeouido", "name", "여의도 증권 지구", "occupyingClub", "실리콘 벨리", "dailyTaxWld", 450000),
                Map.of("id", "ter-pangyo", "name", "판교 테크노 밸리", "occupyingClub", "네오 퀀트", "dailyTaxWld", 380000)
        );
        return ResponseEntity.ok(Map.of("territories", territories));
    }

    @PostMapping("/declare-war")
    public ResponseEntity<Map<String, Object>> declareWar(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        String userId = getUserIdOrThrow(request);
        if (body == null || !body.containsKey("targetTerritoryId")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "targetTerritoryId is required");
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("warId", "war-" + UUID.randomUUID());
        res.put("attackerUserId", userId);
        res.put("targetTerritoryId", body.get("targetTerritoryId"));
        res.put("status", "WAR_DECLARED");
        res.put("battleScheduledAt", new Date(System.currentTimeMillis() + 3600000L).toInstant().toString());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/battles/result")
    public ResponseEntity<Map<String, Object>> reportBattleResult(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        getUserIdOrThrow(request);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("status", "RECORDED");
        res.put("timestamp", new Date().toInstant().toString());
        return ResponseEntity.ok(res);
    }
}
