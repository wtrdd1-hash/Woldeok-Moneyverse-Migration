package com.moneyverse.api.domain.seo.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Fail-closed SEO migration boundary.
 *
 * The canonical crawler event log, authenticated Google Search Console client,
 * admin session authorization and real IndexNow submission currently live in
 * the retained NestJS SEO module. The internal Nginx gateway must keep SEO
 * traffic routed there until the Java replacement has independently passed
 * end-to-end, authenticated source-truth tests. Returning invented successful
 * crawler counts, GSC analytics, IndexNow receipts or crawler audit records is
 * prohibited. Do not use the frontend's internal service token as proof of a
 * human administrator session.
 */
@RestController
public class SeoController {

    private ResponseEntity<Map<String, Object>> unavailable() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .header(HttpHeaders.CACHE_CONTROL, "private, no-store")
                .header("X-Robots-Tag", "noindex, nofollow")
                .body(Map.of(
                        "error", "seo_source_unavailable",
                        "source", "spring_seo_migration_hold",
                        "indexingConfirmed", false));
    }

    @GetMapping(path = {
            "/api/v1/seo/status", "/api/seo/status", "/seo/status",
            "/api/v1/seo/status/admin", "/api/seo/status/admin", "/seo/status/admin",
            "/api/v1/seo/crawl-audit", "/api/seo/crawl-audit", "/seo/crawl-audit",
            "/api/v1/seo/gsc/analytics", "/api/seo/gsc/analytics", "/seo/gsc/analytics",
            "/api/v1/seo/gsc/digest-report", "/api/seo/gsc/digest-report", "/seo/gsc/digest-report",
            "/api/v1/seo/twitter/status", "/api/seo/twitter/status", "/seo/twitter/status",
            "/api/v1/seo/indexnow-key", "/api/seo/indexnow-key", "/seo/indexnow-key"
    })
    public ResponseEntity<Map<String, Object>> getSeoUnavailable() {
        return unavailable();
    }

    @PostMapping(path = {
            "/api/v1/seo/submit", "/api/seo/submit", "/seo/submit",
            "/api/v1/seo/crawl-audit", "/api/seo/crawl-audit", "/seo/crawl-audit",
            "/api/v1/seo/log", "/api/seo/log", "/seo/log",
            "/api/v1/seo/gsc/sitemap", "/api/seo/gsc/sitemap", "/seo/gsc/sitemap",
            "/api/v1/seo/gsc/credentials", "/api/seo/gsc/credentials", "/seo/gsc/credentials",
            "/api/v1/seo/gsc/credentials/delete", "/api/seo/gsc/credentials/delete", "/seo/gsc/credentials/delete",
            "/api/v1/seo/gsc/digest-report", "/api/seo/gsc/digest-report", "/seo/gsc/digest-report"
    })
    public ResponseEntity<Map<String, Object>> rejectUnimplementedSeoWrite() {
        return unavailable();
    }

    /** The actual key is served by the Next.js canonical origin, never a placeholder. */
    @GetMapping(path = "/.well-known/indexnow.key", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> rejectUnconfiguredIndexNowKey() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .header("X-Robots-Tag", "noindex, nofollow")
                .body("seo_source_unavailable");
    }
}
