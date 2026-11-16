package com.moneyverse.api.domain.economy.controller;

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
        "/api/v1/economy/hot-time",
        "/api/economy/hot-time",
        "/economy/hot-time"
})
public class HotTimeController {

    private final UserAuthService userAuthService;

    @Autowired
    public HotTimeController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    @GetMapping("/active")
    public ResponseEntity<Map<String, Object>> getActiveHotTime() {
        return ResponseEntity.ok(Map.of(
                "isActive", true,
                "currentBuff", Map.of(
                        "name", "주말 골든타임 노동 보상 1.5배",
                        "multiplier", 1.5,
                        "type", "WORK_REWARD_BOOST",
                        "expiresAt", new Date(System.currentTimeMillis() + 7200000L).toInstant().toString()
                )
        ));
    }

    @GetMapping("/schedule")
    public ResponseEntity<Map<String, Object>> getWeeklySchedule() {
        List<Map<String, Object>> schedule = List.of(
                Map.of("dayOfWeek", "SATURDAY", "startTime", "19:00", "endTime", "23:00", "buffType", "WORK_BOOST", "multiplier", 1.5),
                Map.of("dayOfWeek", "SUNDAY", "startTime", "14:00", "endTime", "18:00", "buffType", "CASINO_EXP_BOOST", "multiplier", 2.0)
        );
        return ResponseEntity.ok(Map.of("schedule", schedule));
    }

    @PostMapping("/admin/trigger")
    public ResponseEntity<Map<String, Object>> triggerManualBuff(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        List<String> roles = sessionOpt.get().getRoles();
        boolean hasAdmin = roles != null && roles.stream().anyMatch(r -> "SUPERADMIN".equalsIgnoreCase(r) || "ADMIN".equalsIgnoreCase(r));
        if (!hasAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: Admin access required");
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("buffName", body != null ? body.get("name") : "관리자 수동 핫타임");
        res.put("startedAt", new Date().toInstant().toString());
        return ResponseEntity.ok(res);
    }
}
