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
        // No canonical enterprise ownership ledger is approved for this migrated API.
        // Do not expose fictional public companies, valuations or state dividend amounts.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ENTERPRISE_SOURCE_NOT_VERIFIED");
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

        // IPO share operations require canonical ledger receipts, never synthetic success.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "PRIVATIZATION_LEDGER_NOT_VERIFIED");
    }

    @PostMapping("/{id}/dividends/disburse")
    public ResponseEntity<Map<String, Object>> disburseDividends(
            HttpServletRequest request,
            @PathVariable("id") String id) {
        verifyAdmin(request);
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "DIVIDEND_LEDGER_NOT_VERIFIED");
    }

    @GetMapping("/{id}/governance")
    public ResponseEntity<Map<String, Object>> getGovernance(
            HttpServletRequest request,
            @PathVariable("id") String id) {
        verifyAdmin(request);
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "GOVERNANCE_SOURCE_NOT_VERIFIED");
    }
}
