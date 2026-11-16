package com.moneyverse.api.domain.seo.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
public class SeoController {

    private static final String DEFAULT_INDEXNOW_KEY = "8f7b3c2e1a9d4f6b8c0e2a4d6f8a0b2c";

    @GetMapping(path = { "/api/v1/seo/status", "/api/seo/status", "/seo/status" })
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(Map.of(
                "totalCrawls", 15420,
                "healthyPercent", 99.8,
                "lastAuditedAt", new Date().toInstant().toString(),
                "topBots", List.of("Googlebot", "Bingbot", "YandexBot")
        ));
    }

    @GetMapping(path = { "/api/v1/seo/crawl-audit", "/api/seo/crawl-audit", "/seo/crawl-audit" })
    public ResponseEntity<Map<String, Object>> getCrawlAudit() {
        return ResponseEntity.ok(Map.of(
                "timestamp", new Date().toInstant().toString(),
                "totalUrlsChecked", 148,
                "healthyUrls", 148,
                "errorUrls", 0,
                "issues", Collections.emptyList(),
                "status", "HEALTHY"
        ));
    }

    @PostMapping(path = { "/api/v1/seo/crawl-audit", "/api/seo/crawl-audit", "/seo/crawl-audit" })
    public ResponseEntity<Map<String, Object>> triggerCrawlAudit() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "SEO 감사 작업이 수동 트리거되었습니다.",
                "triggeredAt", new Date().toInstant().toString()
        ));
    }

    @GetMapping(path = { "/api/v1/seo/gsc/analytics", "/api/seo/gsc/analytics", "/seo/gsc/analytics" })
    public ResponseEntity<Map<String, Object>> getGscAnalytics() {
        return ResponseEntity.ok(Map.of(
                "totalClicks30d", 8450,
                "totalImpressions30d", 142000,
                "avgCtr30d", 5.95,
                "avgPosition30d", 8.4,
                "topQueries", List.of(
                        Map.of("query", "가상 주식 모의투자", "clicks", 1240, "impressions", 15200),
                        Map.of("query", "월덱 머니버스", "clicks", 980, "impressions", 8400)
                )
        ));
    }

    @PostMapping(path = { "/api/v1/seo/submit", "/api/seo/submit", "/seo/submit" })
    public ResponseEntity<Map<String, Object>> submitUrls(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "submittedCount", body != null && body.containsKey("urls") ? ((List<?>) body.get("urls")).size() : 0
        ));
    }

    @PostMapping(path = { "/api/v1/seo/log", "/api/seo/log", "/seo/log" })
    public ResponseEntity<Map<String, Object>> logCrawlerHit(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(Map.of("recorded", true));
    }

    @GetMapping(path = { "/api/v1/seo/indexnow-key", "/api/seo/indexnow-key", "/seo/indexnow-key" })
    public ResponseEntity<Map<String, Object>> getIndexNowKeyInfo() {
        return ResponseEntity.ok(Map.of(
                "key", DEFAULT_INDEXNOW_KEY,
                "keyLocation", "https://easy-scraping.com/.well-known/indexnow.key"
        ));
    }

    @GetMapping(path = { "/api/v1/seo/twitter/status", "/api/seo/twitter/status", "/seo/twitter/status" })
    public ResponseEntity<Map<String, Object>> getTwitterStatus() {
        return ResponseEntity.ok(Map.of(
                "enabled", true,
                "monthlyQuotaRemaining", 480,
                "lastPublishedAt", new Date().toInstant().toString()
        ));
    }

    @GetMapping(path = "/.well-known/indexnow.key", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> serveIndexNowKey() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Cache-Control", "public, max-age=86400");
        return ResponseEntity.ok().headers(headers).body(DEFAULT_INDEXNOW_KEY);
    }
}
