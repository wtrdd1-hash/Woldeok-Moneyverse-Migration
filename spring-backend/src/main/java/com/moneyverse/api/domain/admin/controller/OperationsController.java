package com.moneyverse.api.domain.admin.controller;

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
        "/api/v1/admin/operations",
        "/api/admin/operations",
        "/admin/operations",
        "/api/v1/admin/work",
        "/api/admin/work"
})
public class OperationsController {

    private final UserAuthService userAuthService;

    @Autowired
    public OperationsController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    private void verifyAdmin(HttpServletRequest request) {
        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        List<String> roles = sessionOpt.get().getRoles();
        boolean hasAdmin = roles != null && roles.stream().anyMatch(r -> "SUPERADMIN".equalsIgnoreCase(r) || "ADMIN".equalsIgnoreCase(r));
        if (!hasAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: Admin access required");
        }
    }

    @GetMapping("/tasks")
    public ResponseEntity<Map<String, Object>> listTasks(HttpServletRequest request) {
        verifyAdmin(request);
        List<Map<String, Object>> tasks = List.of(
                Map.of("name", "BOND_MATURITY_DISPATCHER", "schedule", "0 0 * * *", "lastRunAt", new Date().toInstant().toString(), "status", "IDLE"),
                Map.of("name", "PENSION_BENEFIT_ACCRUAL", "schedule", "0 6 * * *", "lastRunAt", new Date().toInstant().toString(), "status", "IDLE"),
                Map.of("name", "STOCK_MARKET_SETTLEMENT", "schedule", "0 18 * * 1-5", "lastRunAt", new Date().toInstant().toString(), "status", "IDLE"),
                Map.of("name", "SWF_PORTFOLIO_REBALANCE", "schedule", "0 3 * * 0", "lastRunAt", new Date().toInstant().toString(), "status", "IDLE")
        );
        return ResponseEntity.ok(Map.of("tasks", tasks));
    }

    @PostMapping("/tasks/{name}/run")
    public ResponseEntity<Map<String, Object>> triggerTask(
            HttpServletRequest request,
            @PathVariable("name") String name) {
        verifyAdmin(request);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("taskName", name);
        res.put("status", "TRIGGERED");
        res.put("executionId", "exec-" + UUID.randomUUID());
        res.put("triggeredAt", new Date().toInstant().toString());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/maintenance")
    public ResponseEntity<Map<String, Object>> setMaintenanceMode(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {
        verifyAdmin(request);
        boolean enabled = body != null && Boolean.TRUE.equals(body.get("enabled"));
        String reason = body != null ? (String) body.getOrDefault("reason", "정기 시스템 점검") : "정기 시스템 점검";

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("maintenanceMode", enabled);
        res.put("reason", reason);
        res.put("updatedAt", new Date().toInstant().toString());
        return ResponseEntity.ok(res);
    }
}
