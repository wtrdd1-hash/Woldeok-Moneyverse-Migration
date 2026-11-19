package com.moneyverse.api.domain.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Tag(name = "Admin Blog Notification", description = "블로그 발행 시 텔레그램 채널 및 디스코드 관리자 1:1 DM 알림 API")
@RestController
public class BlogNotificationController {

    private static final Logger log = LoggerFactory.getLogger(BlogNotificationController.class);

    private static final String TELEGRAM_SCRIPT = "/usr/local/lib/moneyverse-telegram/telegram_blog_notifier.py";
    private static final String DISCORD_SCRIPT = "/usr/local/lib/moneyverse-discord/discord_dm_sender.py";

    @PostMapping(path = {
            "/api/v1/admin/blog/notify/test",
            "/api/v1/blog/notify/test"
    })
    @Operation(summary = "블로그 알림 즉시 테스트 발송 (텔레그램 채널 브로드캐스트 + 디스코드 DM)")
    public ResponseEntity<Map<String, Object>> testNotification(@RequestBody(required = false) Map<String, String> body) {
        String title = (body != null && body.containsKey("title")) ? body.get("title") : "분산 컴퓨팅 환경과 데이터 통신 무결성";
        String url = (body != null && body.containsKey("url")) ? body.get("url") : "https://easy-scraping.com/blog/2026-11-19-kr-computer-4";
        String category = (body != null && body.containsKey("category")) ? body.get("category") : "IT/컴퓨터";
        String excerpt = (body != null && body.containsKey("excerpt")) ? body.get("excerpt") : "분산 시스템에서 합의 알고리즘과 데이터 무결성을 보장하는 통신 프로토콜 심층 분석.";

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("requestedAt", java.time.Instant.now().toString());
        res.put("title", title);
        res.put("url", url);

        // Run synchronously for test endpoint so admin gets immediate response & feedback
        Map<String, Object> telegramResult = executeScript(TELEGRAM_SCRIPT, title, url, category, excerpt);
        Map<String, Object> discordResult = executeScript(DISCORD_SCRIPT, title, url, category, excerpt);

        res.put("telegram", telegramResult);
        res.put("discord", discordResult);
        boolean success = Boolean.TRUE.equals(telegramResult.get("success")) || Boolean.TRUE.equals(discordResult.get("success"));
        res.put("success", success);
        res.put("status", success ? "DELIVERED" : "FAILED");

        return ResponseEntity.ok(res);
    }

    @PostMapping(path = {
            "/api/v1/admin/blog/notify",
            "/api/v1/blog/notify"
    })
    @Operation(summary = "신규 블로그 발행 시 자동 알림 발송 (비동기)")
    public ResponseEntity<Map<String, Object>> notifyPublish(@RequestBody Map<String, String> body) {
        String title = body.getOrDefault("title", "머니버스 공식 블로그 새 글");
        String url = body.getOrDefault("url", "https://easy-scraping.com/blog");
        String category = body.getOrDefault("category", "공지/안내");
        String excerpt = body.getOrDefault("excerpt", "머니버스에 새로운 지식과 분석이 등록되었습니다.");

        // Async execution with isolated error boundaries to never block caller
        CompletableFuture.runAsync(() -> {
            try {
                executeScript(TELEGRAM_SCRIPT, title, url, category, excerpt);
            } catch (Exception e) {
                log.error("[BlogNotify] Telegram async dispatch error: {}", e.getMessage());
            }
        });

        CompletableFuture.runAsync(() -> {
            try {
                executeScript(DISCORD_SCRIPT, title, url, category, excerpt);
            } catch (Exception e) {
                log.error("[BlogNotify] Discord async dispatch error: {}", e.getMessage());
            }
        });

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("status", "QUEUED_FOR_DISPATCH");
        res.put("dispatchedAt", java.time.Instant.now().toString());
        return ResponseEntity.accepted().body(res);
    }

    private Map<String, Object> executeScript(String scriptPath, String title, String url, String category, String excerpt) {
        Map<String, Object> result = new LinkedHashMap<>();
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    "python3", scriptPath,
                    "--title", title,
                    "--url", url,
                    "--category", category,
                    "--excerpt", excerpt
            );
            pb.redirectErrorStream(true);
            Process proc = pb.start();

            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(proc.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line).append("\n");
                }
            }

            int exitCode = proc.waitFor();
            result.put("exitCode", exitCode);
            result.put("output", sb.toString().trim());
            result.put("success", exitCode == 0);
        } catch (Exception e) {
            log.warn("[BlogNotify] Execution error for {}: {}", scriptPath, e.getMessage());
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }
}
