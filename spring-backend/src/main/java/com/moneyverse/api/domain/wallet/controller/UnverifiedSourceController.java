package com.moneyverse.api.domain.wallet.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Routes the frontend calls whose source is not certified (QA 2026-11-25: they were 404).
 * Each answers the honest 503 the NestJS original or the release policy requires instead of
 * a missing route: RELEASING.md requires PUBLIC_TREASURY_RECONCILIATION_PENDING for the public
 * treasury; notification search is disabled by default in NestJS; commercial rates derive from
 * the base rate, which has no certified source; mint certificates have no certified source.
 */
@RestController
public class UnverifiedSourceController {
    private static ResponseEntity<Map<String, Object>> unavailable(String code, String message) {
        return ResponseEntity.status(503).header("Cache-Control", "private, no-store")
                .body(Map.of("ok", false, "code", code, "message", message));
    }

    @GetMapping({"/api/v1/treasury/public-overview", "/api/treasury/public-overview"})
    public ResponseEntity<Map<String, Object>> treasuryPublicOverview() {
        return unavailable("PUBLIC_TREASURY_RECONCILIATION_PENDING", "Public treasury figures are withheld until reconciliation is certified");
    }

    @PostMapping({"/api/v1/notifications/search", "/api/notifications/search"})
    public ResponseEntity<Map<String, Object>> notificationSearch() {
        return unavailable("NOTIFICATION_SEARCH_DISABLED", "Notification search is disabled");
    }

    @GetMapping({"/api/v1/central-bank/commercial-rates", "/api/central-bank/commercial-rates"})
    public ResponseEntity<Map<String, Object>> commercialRates() {
        return unavailable("CENTRALBANK_CANONICAL_SOURCE_UNAVAILABLE", "Commercial rates derive from an uncertified base rate");
    }

    @GetMapping({"/api/v1/mint/audit-certificates", "/api/mint/audit-certificates"})
    public ResponseEntity<Map<String, Object>> mintAuditCertificates() {
        return unavailable("MINT_CANONICAL_SOURCE_UNAVAILABLE", "Mint audit certificates have no certified source");
    }
}
