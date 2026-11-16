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

    @GetMapping("/today")
    public ResponseEntity<Map<String, Object>> today(HttpServletRequest request) {
        String userId = getUserIdOrThrow(request);
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("id", "early-event-" + UUID.randomUUID());
        event.put("name", "첫 날의 출석 보너스");
        event.put("rewardWld", 50000);
        event.put("isClaimed", false);
        return ResponseEntity.ok(Map.of("event", event));
    }

    @GetMapping("/first-day")
    public ResponseEntity<Map<String, Object>> firstDay(HttpServletRequest request) {
        String userId = getUserIdOrThrow(request);
        List<Map<String, Object>> steps = List.of(
                Map.of("step", 1, "title", "계정 생성 및 프로필 설정", "completed", true),
                Map.of("step", 2, "title", "첫 가상 주식 매수 체결", "completed", false),
                Map.of("step", 3, "title", "상업은행 목표 저축 포켓 개설", "completed", false),
                Map.of("step", 4, "title", "커뮤니티 첫 글 작성", "completed", false)
        );
        return ResponseEntity.ok(Map.of("steps", steps));
    }

    @PostMapping("/claims")
    public ResponseEntity<Map<String, Object>> claim(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        String userId = getUserIdOrThrow(request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "claimedWld", 50000,
                "claimedAt", new Date().toInstant().toString()
        ));
    }
}
