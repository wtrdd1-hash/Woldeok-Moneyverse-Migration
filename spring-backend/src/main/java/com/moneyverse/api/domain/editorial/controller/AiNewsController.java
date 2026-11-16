package com.moneyverse.api.domain.editorial.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/admin/ai-news",
        "/api/admin/ai-news",
        "/admin/ai-news"
})
public class AiNewsController {

    private HttpHeaders securityHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Cache-Control", "private, no-store");
        headers.set("X-Robots-Tag", "noindex");
        return headers;
    }

    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSettings() {
        return ResponseEntity.ok()
                .headers(securityHeaders())
                .body(Map.of(
                        "success", true,
                        "apiBaseUrl", "https://api.openai.com/v1",
                        "model", "gpt-4o-mini",
                        "hasApiKey", true,
                        "generationIntervalMinutes", 60,
                        "autoPublish", true
                ));
    }

    @PutMapping("/settings")
    public ResponseEntity<Map<String, Object>> updateSettings(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok()
                .headers(securityHeaders())
                .body(Map.of(
                        "success", true,
                        "updated", true
                ));
    }

    @GetMapping("/templates")
    public ResponseEntity<Map<String, Object>> getTemplates() {
        return ResponseEntity.ok()
                .headers(securityHeaders())
                .body(Map.of(
                        "templates", List.of(
                                Map.of("id", "tpl-macro", "name", "거시경제 브리핑", "promptPrefix", "한국은행 및 연준 금리 결정을 분석하라."),
                                Map.of("id", "tpl-crypto", "name", "가상자산 동향", "promptPrefix", "비트코인 및 WLD 온체인 유동성을 요약하라.")
                        )
                ));
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateArticle(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok()
                .headers(securityHeaders())
                .body(Map.of(
                        "success", true,
                        "generatedTitle", "[AI 속보] 중앙은행 기준금리 동결 전망과 외환 유동성 분석",
                        "generatedBody", "AI 기반 실시간 시장 데이터 분석 결과 외환 보유액 안정성과 거시경제 지표가 견고한 흐름을 유지하고 있습니다.",
                        "generatedAt", new Date().toInstant().toString()
                ));
    }

    @PostMapping("/publish")
    public ResponseEntity<Map<String, Object>> publishArticle(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok()
                .headers(securityHeaders())
                .body(Map.of(
                        "success", true,
                        "articleId", "news-" + UUID.randomUUID(),
                        "published", true
                ));
    }
}
