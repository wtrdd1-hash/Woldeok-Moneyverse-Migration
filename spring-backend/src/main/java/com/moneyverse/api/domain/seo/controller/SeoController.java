package com.moneyverse.api.domain.seo.controller;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
public class SeoController {

    private static final Logger log = LoggerFactory.getLogger(SeoController.class);
    private static final String DEFAULT_INDEXNOW_KEY = "8f7b3c2e1a9d4f6b8c0e2a4d6f8a0b2c";
    private static final String BASE_URL = "https://easy-scraping.com";

    public record TargetUrlDef(String path, String category, String name) {}

    public static final List<TargetUrlDef> TARGET_URLS = List.of(
            // 10 Canonical Virtual Stocks
            new TargetUrlDef("/stocks/CHIPS", "stock", "침팬지 반도체 (CHIPS)"),
            new TargetUrlDef("/stocks/DUCKS", "stock", "월덕 인더스트리 (DUCKS)"),
            new TargetUrlDef("/stocks/COIN", "stock", "도지 밈 파이낸스 (COIN)"),
            new TargetUrlDef("/stocks/SPACE", "stock", "덕스페이스 로켓 (SPACE)"),
            new TargetUrlDef("/stocks/CYBER", "stock", "네오사이버 시큐리티 (CYBER)"),
            new TargetUrlDef("/stocks/ROBOT", "stock", "휴머노이드 다이내믹스 (ROBOT)"),
            new TargetUrlDef("/stocks/GOLD", "stock", "골든덕 홀딩스 (GOLD)"),
            new TargetUrlDef("/stocks/ENERGY", "stock", "쿼크 에너지 코퍼레이션 (ENERGY)"),
            new TargetUrlDef("/stocks/BIO", "stock", "바이오덕 테라퓨틱스 (BIO)"),
            new TargetUrlDef("/stocks/GAME", "stock", "도파민 게임즈 (GAME)"),
            // 5 Financial/Gaming Guides
            new TargetUrlDef("/guide/stock-trading", "guide", "가상 주식 실전 매매 가이드"),
            new TargetUrlDef("/guide/virtual-banking", "guide", "가상 금융 & 복리 예금 가이드"),
            new TargetUrlDef("/guide/career-mastery", "guide", "직업 & 일일 파밍 루틴 가이드"),
            new TargetUrlDef("/guide/glossary", "guide", "핀테크 & 가상경제 핵심 용어사전"),
            new TargetUrlDef("/guide/dopamine-system", "guide", "도파민 보상 & 확률 가이드"),
            // 3 Key Hubs & Portals
            new TargetUrlDef("/", "hub", "월덕 머니버스 메인 포털"),
            new TargetUrlDef("/stocks", "hub", "가상 주식 통합 거래소"),
            new TargetUrlDef("/bonds", "hub", "국채 거래소 포털")
    );

    private final JdbcTemplate jdbcTemplate;
    private final AdminAuthService adminAuthService;

    @Autowired
    public SeoController(JdbcTemplate jdbcTemplate, AdminAuthService adminAuthService) {
        this.jdbcTemplate = jdbcTemplate;
        this.adminAuthService = adminAuthService;
    }

    @GetMapping(path = {
            "/api/v1/seo/status/admin",
            "/api/seo/status/admin",
            "/seo/status/admin",
            "/api/v1/seo/status",
            "/api/seo/status",
            "/seo/status"
    })
    public ResponseEntity<Map<String, Object>> getAdminStatus(HttpServletRequest request) {
        UUID actor = adminAuthService.resolveVerifiedAdminActor(request)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "admin_session_required"));
        return ResponseEntity.ok(buildSeoObservation(actor));
    }

    private Map<String, Object> buildSeoObservation(UUID actor) {
        Instant now = Instant.now();
        Instant oneDayAgo = now.minus(24, ChronoUnit.HOURS);
        Instant sevenDaysAgo = now.minus(7, ChronoUnit.DAYS);

        List<Map<String, Object>> rawLogs = new ArrayList<>();
        try {
            // seo_crawler_logs is not granted to the application role and carries crawler IPs;
            // 364 reads it with the administrator checked inside the function.
            rawLogs = jdbcTemplate.queryForList(
                    "SELECT * FROM public.admin_seo_crawler_logs_read(?::uuid, ?::integer)", actor, 300);
        } catch (Exception e) {
            log.warn("[SeoController] crawler source unavailable (fail closed)");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Crawler observations unavailable");
        }

        // External crawler filtering (exclude internal sentinel)
        List<Map<String, Object>> externalLogs = new ArrayList<>();
        for (Map<String, Object> l : rawLogs) {
            String bot = String.valueOf(l.get("bot_name")).toLowerCase();
            String ua = String.valueOf(l.get("user_agent")).toLowerCase();
            if (!bot.contains("sentinel") && !bot.contains("internal") && !ua.contains("sentinel")) {
                externalLogs.add(l);
            }
        }

        // Partition 24h and 7d
        List<Map<String, Object>> logs24h = new ArrayList<>();
        List<Map<String, Object>> logs7d = new ArrayList<>();
        Map<String, Integer> botDist = new LinkedHashMap<>();
        Map<String, Integer> statusDist = new LinkedHashMap<>();
        long totalDurationMs = 0;

        for (Map<String, Object> l : externalLogs) {
            Object catObj = l.get("created_at");
            Instant createdAt = (catObj instanceof java.sql.Timestamp ts) ? ts.toInstant() : now;
            if (!createdAt.isBefore(sevenDaysAgo)) {
                logs7d.add(l);
            }
            if (!createdAt.isBefore(oneDayAgo)) {
                logs24h.add(l);
                String bot = String.valueOf(l.get("bot_name"));
                botDist.put(bot, botDist.getOrDefault(bot, 0) + 1);

                String status = String.valueOf(l.get("status_code"));
                statusDist.put(status, statusDist.getOrDefault(status, 0) + 1);

                Number dur = (Number) l.get("duration_ms");
                if (dur != null) totalDurationMs += dur.longValue();
            }
        }

        // Never fabricate Search Engine crawler counts or average response time.
        int totalHits24h = logs24h.size();
        int totalHits7d = logs7d.size();
        int avgDurationMs = totalHits24h > 0 ? (int) (totalDurationMs / totalHits24h) : 0;

        // Build targetUrls
        List<Map<String, Object>> targetUrls = new ArrayList<>();
        int stockIndexed = 0;
        int guideIndexed = 0;

        for (TargetUrlDef def : TARGET_URLS) {
            Map<String, Object> target = new LinkedHashMap<>();
            target.put("path", def.path());
            target.put("category", def.category());
            target.put("name", def.name());

            // Match recent log
            Map<String, Object> matched = null;
            for (Map<String, Object> l : externalLogs) {
                String p = String.valueOf(l.get("path"));
                if (def.path().equals(p) || p.startsWith(def.path() + "?")) {
                    matched = l;
                    break;
                }
            }

            if (matched != null) {
                Object catObj = matched.get("created_at");
                Instant cat = (catObj instanceof java.sql.Timestamp ts) ? ts.toInstant() : now.minus(2, ChronoUnit.HOURS);
                target.put("lastVisitedAt", cat.toString());
                target.put("lastBot", String.valueOf(matched.get("bot_name")));
                target.put("lastStatusCode", ((Number) matched.get("status_code")).intValue());
                target.put("healthStatus", "healthy");
                if ("stock".equals(def.category())) stockIndexed++;
                if ("guide".equals(def.category())) guideIndexed++;
            } else {
                // No source crawler receipt: unobserved, not indexed or healthy by assumption.
                target.put("lastVisitedAt", null);
                target.put("lastBot", null);
                target.put("lastStatusCode", null);
                target.put("healthStatus", "warning");
            }
            targetUrls.add(target);
        }

        // Build recentLogs formatted for parseSeoObservation
        List<Map<String, Object>> formattedLogs = new ArrayList<>();
        int logLimit = Math.min(50, rawLogs.size());
        for (int i = 0; i < logLimit; i++) {
            Map<String, Object> row = rawLogs.get(i);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", String.valueOf(row.get("id")));
            item.put("botName", String.valueOf(row.get("bot_name")));
            item.put("path", String.valueOf(row.get("path")));
            item.put("statusCode", ((Number) row.get("status_code")).intValue());
            item.put("durationMs", ((Number) row.get("duration_ms")).intValue());
            item.put("ipAddress", String.valueOf(row.get("ip_address")));
            item.put("userAgent", String.valueOf(row.get("user_agent")));
            Object catObj = row.get("created_at");
            Instant cat = (catObj instanceof java.sql.Timestamp ts) ? ts.toInstant() : now;
            item.put("createdAt", cat.toString());
            formattedLogs.add(item);
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("totalHits24h", totalHits24h);
        res.put("totalCrawls", totalHits24h);
        res.put("totalHits7d", totalHits7d);
        res.put("avgDurationMs", avgDurationMs);
        res.put("botDistribution", botDist);
        res.put("statusDistribution", statusDist);
        res.put("stockCoverage", Map.of("indexed", stockIndexed, "total", 10));
        res.put("guideCoverage", Map.of("indexed", guideIndexed, "total", 5));
        res.put("targetUrls", targetUrls);
        res.put("recentLogs", formattedLogs);
        res.put("indexNowKey", DEFAULT_INDEXNOW_KEY);
        res.put("sitemapUrl", BASE_URL + "/sitemap.xml");
        res.put("coverageSourceVerified", false);
        res.put("observationSource", "admin_seo_crawler_logs_read");

        return res;
    }

    @GetMapping(path = { "/api/v1/seo/crawl-audit", "/api/seo/crawl-audit", "/seo/crawl-audit" })
    public ResponseEntity<Map<String, Object>> getCrawlAudit() {
        return ResponseEntity.ok(Map.of(
                "timestamp", Instant.now().toString(),
                "totalUrlsChecked", 0,
                "healthyUrls", 0,
                "errorUrls", 0,
                "issues", Collections.emptyList(),
                "status", "UNKNOWN"
        ));
    }

    @PostMapping(path = { "/api/v1/seo/crawl-audit", "/api/seo/crawl-audit", "/seo/crawl-audit" })
    public ResponseEntity<Map<String, Object>> triggerCrawlAudit() {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Crawl audit scheduler receipt not verified");
    }

    @GetMapping(path = { "/api/v1/seo/gsc/analytics", "/api/seo/gsc/analytics", "/seo/gsc/analytics" })
    public ResponseEntity<Map<String, Object>> getGscAnalytics() {
        // Security/QA 2026-11-26: the old body returned invented Search Console figures
        // (14,280 clicks, top queries). No Search Console credential is connected.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "GSC_SOURCE_UNAVAILABLE");
    }

    @PostMapping(path = { "/api/v1/seo/submit", "/api/seo/submit", "/seo/submit" })
    public ResponseEntity<Map<String, Object>> submitUrls() {
        // Security/QA 2026-11-26: answered "submitted 18" to anyone, guests included, and
        // submitted nothing. No IndexNow/Search Console submission client exists here.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SEO_SUBMISSION_NOT_CONFIGURED");
    }

    @PostMapping(path = { "/api/v1/seo/log", "/api/seo/log", "/seo/log" })
    public ResponseEntity<Map<String, Object>> logCrawlerHit(
            @RequestHeader(value = "X-Moneyverse-Telemetry-Token", required = false) String token,
            @RequestBody(required = false) Map<String, Object> body) {
        // Security 2026-11-26: this INSERT was open to the internet through the public /api
        // route, so anyone could write any bot, path, IP and user agent into seo_crawler_logs.
        // It now needs the shared secret only the frontend server holds; unset means off.
        if (!CrawlerHit.tokenMatches(System.getenv("MONEYVERSE_TELEMETRY_TOKEN"), token)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "TELEMETRY_TOKEN_REQUIRED");
        }
        CrawlerHit hit = CrawlerHit.from(body);
        try {
            jdbcTemplate.update("""
                INSERT INTO seo_crawler_logs (id, bot_name, path, status_code, duration_ms, ip_address, user_agent, created_at)
                VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?, NOW())
                """, hit.botName(), hit.path(), hit.statusCode(), hit.durationMs(), hit.ipAddress(), hit.userAgent());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "TELEMETRY_UNAVAILABLE");
        }
        return ResponseEntity.ok(Map.of("recorded", true));
    }

    @GetMapping(path = { "/api/v1/seo/indexnow-key", "/api/seo/indexnow-key", "/seo/indexnow-key" })
    public ResponseEntity<Map<String, Object>> getIndexNowKeyInfo() {
        return ResponseEntity.ok(Map.of(
                "key", DEFAULT_INDEXNOW_KEY,
                "keyLocation", BASE_URL + "/.well-known/indexnow.key"
        ));
    }

    @GetMapping(path = { "/api/v1/seo/twitter/status", "/api/seo/twitter/status", "/seo/twitter/status" })
    public ResponseEntity<Map<String, Object>> getTwitterStatus() {
        // Security/QA 2026-11-26: published a fixed "enabled, 480 left, published just now".
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "TWITTER_SOURCE_UNAVAILABLE");
    }

    @GetMapping(path = "/.well-known/indexnow.key", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> serveIndexNowKey() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Cache-Control", "public, max-age=86400");
        return ResponseEntity.ok().headers(headers).body(DEFAULT_INDEXNOW_KEY);
    }
}
