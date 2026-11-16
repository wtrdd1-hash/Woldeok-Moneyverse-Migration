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
        "/api/v1/admin/audit",
        "/api/admin/audit",
        "/admin/audit"
})
public class AuditController {

    private final UserAuthService userAuthService;

    @Autowired
    public AuditController(UserAuthService userAuthService) {
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

    @GetMapping({ "", "/logs" })
    public ResponseEntity<Map<String, Object>> getAuditLogs(
            HttpServletRequest request,
            @RequestParam(name = "limit", required = false, defaultValue = "50") int limit,
            @RequestParam(name = "offset", required = false, defaultValue = "0") int offset) {
        verifyAdmin(request);
        List<Map<String, Object>> logs = List.of(
                Map.of(
                        "id", "audit-log-01",
                        "operatorUserId", "00000000-0000-0000-0000-000000000001",
                        "action", "BOND_ISSUANCE_APPROVED",
                        "targetEntity", "GOV_BOND_3YR",
                        "ipAddress", "127.0.0.1",
                        "createdAt", new Date().toInstant().toString()
                ),
                Map.of(
                        "id", "audit-log-02",
                        "operatorUserId", "00000000-0000-0000-0000-000000000001",
                        "action", "SWF_PORTFOLIO_REBALANCE",
                        "targetEntity", "SWF_TREASURY_ACCOUNT",
                        "ipAddress", "127.0.0.1",
                        "createdAt", new Date().toInstant().toString()
                )
        );
        return ResponseEntity.ok(Map.of("logs", logs, "total", logs.size()));
    }

    @GetMapping("/financial-events")
    public ResponseEntity<Map<String, Object>> getFinancialEvents(HttpServletRequest request) {
        verifyAdmin(request);
        List<Map<String, Object>> events = List.of(
                Map.of("type", "MINT", "amountWld", 1000000000L, "reason", "QUARTERLY_CENTRAL_BANK_ISSUANCE", "timestamp", new Date().toInstant().toString()),
                Map.of("type", "BURN", "amountWld", 50000000L, "reason", "CASINO_FEE_BURN", "timestamp", new Date().toInstant().toString())
        );
        return ResponseEntity.ok(Map.of("events", events));
    }
}
