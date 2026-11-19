package com.moneyverse.api.domain.enterprise.controller;

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
        "/api/v1/admin/enterprises",
        "/api/admin/enterprises"
})
public class EnterpriseController {

    private final UserAuthService userAuthService;

    @Autowired
    public EnterpriseController(UserAuthService userAuthService) {
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

    @GetMapping
    public ResponseEntity<Map<String, Object>> listEnterprises(HttpServletRequest request) {
        verifyAdmin(request);
        List<Map<String, Object>> enterprises = List.of(
            Map.of("id", "ENT-01", "name", "한국가상전력공사", "sector", "에너지·전력", "stateSharePct", 85.0, "valuationWld", 150_000_000_000L, "status", "PUBLIC_OWNED"),
            Map.of("id", "ENT-02", "name", "월덕가상철도공사", "sector", "교통·물류", "stateSharePct", 100.0, "valuationWld", 80_000_000_000L, "status", "PUBLIC_OWNED"),
            Map.of("id", "ENT-03", "name", "한국가상가스공사", "sector", "자원·에너지", "stateSharePct", 70.0, "valuationWld", 60_000_000_000L, "status", "PUBLIC_OWNED"),
            Map.of("id", "ENT-04", "name", "월덕우체국금융공사", "sector", "금융·우편", "stateSharePct", 100.0, "valuationWld", 120_000_000_000L, "status", "PUBLIC_OWNED")
        );
        return ResponseEntity.ok(Map.of("ok", true, "enterprises", enterprises, "total", enterprises.size()));
    }

    @PostMapping("/{id}/privatize")
    public ResponseEntity<Map<String, Object>> privatizeShares(
            HttpServletRequest request,
            @PathVariable("id") String id,
            @RequestBody(required = false) Map<String, Object> body) {
        verifyAdmin(request);
        if (body == null || !body.containsKey("sharesToOfferPercent")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sharesToOfferPercent is required");
        }
        double pct = ((Number) body.get("sharesToOfferPercent")).doubleValue();
        return ResponseEntity.ok(Map.of(
            "ok", true,
            "enterpriseId", id,
            "privatizedPct", pct,
            "message", "공기업 지분 " + pct + "% 민영화 공모 절차가 승인되었습니다."
        ));
    }

    @PostMapping("/{id}/dividends/disburse")
    public ResponseEntity<Map<String, Object>> disburseDividends(
            HttpServletRequest request,
            @PathVariable("id") String id) {
        verifyAdmin(request);
        return ResponseEntity.ok(Map.of(
            "ok", true,
            "enterpriseId", id,
            "disbursedAmountWld", 5_000_000_000L,
            "message", "국고 및 주주 대상 배당금 지급이 완료되었습니다."
        ));
    }

    @GetMapping("/{id}/governance")
    public ResponseEntity<Map<String, Object>> getGovernance(
            HttpServletRequest request,
            @PathVariable("id") String id) {
        verifyAdmin(request);
        return ResponseEntity.ok(Map.of(
            "ok", true,
            "enterpriseId", id,
            "boardMembers", List.of("김상임 (이사장)", "박이사 (정부파견)", "이사외 (사외이사)"),
            "auditStatus", "QUALIFIED",
            "lastAuditedAt", "2026-10-31T00:00:00Z"
        ));
    }
}
