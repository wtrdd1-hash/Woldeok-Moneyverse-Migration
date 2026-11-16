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
        "/api/v1/economy/events/burn-draw",
        "/api/economy/events/burn-draw",
        "/economy/events/burn-draw"
})
public class BurnEventController {

    private final UserAuthService userAuthService;

    @Autowired
    public BurnEventController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    private String getUserIdOrThrow(HttpServletRequest request) {
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return sessionOpt.get().getUserId().toString();
    }

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentBurnEvent() {
        return ResponseEntity.ok(Map.of(
                "eventId", "burn-round-2026-11",
                "title", "제4회 국가 부채 감축 WLD 대량 소각 드로우",
                "totalBurnedWld", 1450000000L,
                "burnTargetWld", 2000000000L,
                "progressPercent", 72.5,
                "participantCount", 3840,
                "jackpotPoolWld", 500000000L,
                "drawDate", "2026-11-20T12:00:00Z"
        ));
    }

    @PostMapping("/participate")
    public ResponseEntity<Map<String, Object>> participateBurn(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        String userId = getUserIdOrThrow(request);
        if (body == null || !body.containsKey("burnAmountWld")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "burnAmountWld is required");
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("userId", userId);
        res.put("burnedAmountWld", body.get("burnAmountWld"));
        res.put("ticketCount", 10);
        res.put("burnedAt", new Date().toInstant().toString());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCumulativeStats() {
        return ResponseEntity.ok(Map.of(
                "cumulativeBurnedWld", 8500000000L,
                "totalEventsHeld", 4,
                "deflationContributionBps", 145
        ));
    }
}
