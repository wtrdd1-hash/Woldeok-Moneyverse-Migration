package com.moneyverse.api.domain.stock.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.stock.service.StockAlertService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping(path = {
        "/api/v1/stocks/alerts",
        "/api/stocks/alerts",
        "/stocks/alerts"
})
public class StockAlertController {

    private final StockAlertService stockAlertService;
    private final UserAuthService userAuthService;

    @Autowired
    public StockAlertController(StockAlertService stockAlertService, UserAuthService userAuthService) {
        this.stockAlertService = stockAlertService;
        this.userAuthService = userAuthService;
    }

    private String getUserIdOrThrow(HttpServletRequest request) {
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return sessionOpt.get().getUserId().toString();
    }

    private HttpHeaders securityHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Cache-Control", "private, no-store");
        headers.set("X-Robots-Tag", "noindex");
        return headers;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(HttpServletRequest request) {
        String userId = getUserIdOrThrow(request);
        return ResponseEntity.ok()
                .headers(securityHeaders())
                .body(Map.of("alerts", stockAlertService.listAlerts(userId)));
    }

    @GetMapping("/events")
    public ResponseEntity<Map<String, Object>> events(
            HttpServletRequest request,
            @RequestParam(name = "limit", required = false, defaultValue = "20") int limit) {
        String userId = getUserIdOrThrow(request);
        return ResponseEntity.ok()
                .headers(securityHeaders())
                .body(Map.of("events", stockAlertService.listEvents(userId, Math.min(100, Math.max(1, limit)))));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        String userId = getUserIdOrThrow(request);
        return ResponseEntity.ok()
                .headers(securityHeaders())
                .body(stockAlertService.createAlert(userId, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> remove(
            HttpServletRequest request,
            @PathVariable("id") String alertId) {
        String userId = getUserIdOrThrow(request);
        return ResponseEntity.ok()
                .headers(securityHeaders())
                .body(stockAlertService.removeAlert(userId, alertId));
    }
}
