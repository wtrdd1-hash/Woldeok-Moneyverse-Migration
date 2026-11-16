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
        "/api/admin/enterprises",
        "/admin/enterprises"
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
                Map.of(
                        "id", "ent-korail-wld",
                        "name", "한국철도공사 (월덱)",
                        "code", "KORAIL_WLD",
                        "stateSharePercent", 100.0,
                        "marketValuationWld", 50000000000L,
                        "quarterlyDividendWld", 250000000L,
                        "status", "STATE_OWNED"
                ),
                Map.of(
                        "id", "ent-kepco-wld",
                        "name", "한국전력공사 (월덱)",
                        "code", "KEPCO_WLD",
                        "stateSharePercent", 80.0,
                        "marketValuationWld", 80000000000L,
                        "quarterlyDividendWld", 400000000L,
                        "status", "PUBLIC_HYBRID"
                )
        );
        return ResponseEntity.ok(Map.of("enterprises", enterprises, "total", enterprises.size()));
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

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("enterpriseId", id);
        res.put("sharesOfferedPercent", body.get("sharesToOfferPercent"));
        res.put("ipoStatus", "OFFERED");
        res.put("processedAt", new Date().toInstant().toString());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/dividends/disburse")
    public ResponseEntity<Map<String, Object>> disburseDividends(
            HttpServletRequest request,
            @PathVariable("id") String id) {
        verifyAdmin(request);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("enterpriseId", id);
        res.put("status", "DISBURSED");
        res.put("disbursedAt", new Date().toInstant().toString());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}/governance")
    public ResponseEntity<Map<String, Object>> getGovernance(
            HttpServletRequest request,
            @PathVariable("id") String id) {
        verifyAdmin(request);
        Map<String, Object> gov = new LinkedHashMap<>();
        gov.put("enterpriseId", id);
        gov.put("boardSeats", 7);
        gov.put("governmentAppointedSeats", 5);
        gov.put("publicShareholderSeats", 2);
        gov.put("auditCommitteeRating", "AAA");
        return ResponseEntity.ok(gov);
    }
}
