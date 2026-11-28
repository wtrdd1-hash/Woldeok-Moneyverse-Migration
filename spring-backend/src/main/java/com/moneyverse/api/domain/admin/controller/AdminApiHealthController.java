package com.moneyverse.api.domain.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.lang.management.ManagementFactory;
import com.sun.management.OperatingSystemMXBean;
import java.time.Instant;
import java.util.*;

@Tag(name = "Admin API Health", description = "14대 도메인 API 가용성, 지연시간, 성공률 및 텔레메트리 관제 API")
@RestController
@RequestMapping(path = {
        "/api/v1/admin/api-health",
        "/api/admin/api-health",
        "/admin/api-health"
})
public class AdminApiHealthController {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public AdminApiHealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Operation(summary = "14대 도메인 API 헬스 및 시스템 자원 측정 상태 조회")
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        long uptime = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
        Instant now = Instant.now();

        // Security review 2026-11-28: the probe used to swallow a failed query and still report the
        // database OPERATIONAL, beside invented per-domain latencies labelled ROUTE_METRICS. Only what
        // is measured here is reported; route metrics are not collected, so they are null/UNKNOWN.
        Long dbLatency = null;
        String dbStatus;
        long start = System.nanoTime();
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            dbLatency = Math.max(1L, (System.nanoTime() - start) / 1_000_000L);
            dbStatus = "OPERATIONAL";
        } catch (RuntimeException e) {
            dbStatus = "DEGRADED";
        }

        OperatingSystemMXBean osBean = ManagementFactory.getPlatformMXBean(OperatingSystemMXBean.class);
        Runtime runtime = Runtime.getRuntime();
        // A negative value means the platform did not measure it: report null, not 0 or a made-up load.
        double cpuLoad = osBean.getCpuLoad();
        long heapUsedMb = (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024);

        Map<String, Object> sysTelemetry = new LinkedHashMap<>();
        sysTelemetry.put("cpuLoad1m", cpuLoad < 0 ? null : Math.round(cpuLoad * 100.0) / 100.0);
        sysTelemetry.put("cpuCores", runtime.availableProcessors());
        sysTelemetry.put("totalMemMb", runtime.totalMemory() / (1024 * 1024));
        sysTelemetry.put("freeMemMb", runtime.freeMemory() / (1024 * 1024));
        sysTelemetry.put("heapUsedMb", heapUsedMb);
        sysTelemetry.put("rssMb", residentSetMb().orElse(null));
        sysTelemetry.put("activeDbConnections", null);
        sysTelemetry.put("dbCacheHitRatio", null);

        String[][] catalogue = {
                new String[]{"auth", "인증 및 보안 세션", "Auth & Security", "/api/v1/auth/session", "/api/v1/auth/csrf"},
                new String[]{"wallet", "월렛 및 가상계좌", "Wallet & Ledger", "/api/v1/wallet/balance", "/api/v1/wallet/transactions"},
                new String[]{"stock", "가상 주식 거래소", "Stock Exchange", "/api/v1/stocks", "/api/v1/stocks/order"},
                new String[]{"bank", "복리 예금 및 뱅킹", "Virtual Bank", "/api/v1/bank/accounts", "/api/v1/bank/deposit"},
                new String[]{"bond", "기획재정 국채 (KTB)", "Treasury Bonds", "/api/v1/bonds/list", "/api/v1/bonds/overview"},
                new String[]{"pension", "국민연금 및 복지기금", "National Pension", "/api/v1/pension/status"},
                new String[]{"kdic", "예금보험공사 (KDIC)", "Deposit Insurance", "/api/v1/kdic/overview"},
                new String[]{"treasury", "국고 및 국부펀드 (SWF)", "Sovereign Wealth Fund", "/api/v1/treasury/status"},
                new String[]{"market", "거시경제 및 물가지표", "Macro Economy", "/api/v1/economy/macro"},
                new String[]{"shop", "상점 및 프리미엄 아이템", "Shop & Items", "/api/v1/shop/items"},
                new String[]{"work", "일일 노동 및 직무 파밍", "Daily Work & Farming", "/api/v1/work/jobs"},
                new String[]{"community", "커뮤니티 및 채팅/피드", "Community & Feed", "/api/v1/community/posts"},
                new String[]{"seo", "검색엔진 SEO 및 색인", "Search Engine & SEO", "/api/v1/seo/status/admin"},
                new String[]{"admin", "통합 관제 콘솔 및 보안", "Admin Console", "/api/v1/admin/api-health/status"}
        };
        List<Map<String, Object>> domains = new ArrayList<>();
        int totalEndpoints = 0;
        for (String[] d : catalogue) {
            List<String> samples = List.of(Arrays.copyOfRange(d, 3, d.length));
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", d[0]);
            row.put("name", d[1]);
            row.put("nameEn", d[2]);
            row.put("endpointCount", samples.size());
            row.put("status", "UNKNOWN");
            row.put("latencyMs", null);
            row.put("successRate", null);
            row.put("measuredAt", null);
            row.put("measurementSource", "NOT_MEASURED");
            row.put("sampleEndpoints", samples);
            domains.add(row);
            totalEndpoints += samples.size();
        }

        Map<String, Object> dbProbe = new LinkedHashMap<>();
        dbProbe.put("status", dbStatus);
        dbProbe.put("measuredAt", now.toString());
        dbProbe.put("source", "POSTGRES_READ_PROBE");

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", dbStatus);
        res.put("serverTime", now.toString());
        res.put("uptimeSeconds", uptime);
        res.put("dbLatencyMs", dbLatency);
        res.put("dbProbe", dbProbe);
        res.put("isLiveTelemetry", false);
        res.put("systemTelemetry", sysTelemetry);
        res.put("totalDomains", domains.size());
        res.put("totalEndpoints", totalEndpoints);
        res.put("averageLatencyMs", null);
        res.put("globalSuccessRate", null);
        res.put("domains", domains);
        return ResponseEntity.ok(res);
    }

    private static Optional<Long> residentSetMb() {
        try {
            for (String line : java.nio.file.Files.readAllLines(java.nio.file.Path.of("/proc/self/status"))) {
                if (line.startsWith("VmRSS:")) {
                    return Optional.of(Long.parseLong(line.replaceAll("[^0-9]", "")) / 1024L);
                }
            }
        } catch (Exception ignored) {
            // Not Linux or not readable: unmeasured (null), never a substitute figure.
        }
        return Optional.empty();
    }

    @Operation(summary = "백업 인벤토리 증빙 조회")
    @GetMapping("/backup-inventory")
    public ResponseEntity<Map<String, Object>> getBackupInventory() {
        // Security review 2026-11-28: this answered with constants an operator would act on.
        // Unavailable until read from its canonical source; never invented evidence.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BACKUP_INVENTORY_SOURCE_UNAVAILABLE");
    }
}
