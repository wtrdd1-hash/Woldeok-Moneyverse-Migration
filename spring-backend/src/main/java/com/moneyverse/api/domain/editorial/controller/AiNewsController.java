package com.moneyverse.api.domain.editorial.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI_NEWS_SOURCE_UNAVAILABLE");
    }

    @PutMapping("/settings")
    public ResponseEntity<Map<String, Object>> updateSettings(@RequestBody(required = false) Map<String, Object> body) {
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI_NEWS_SOURCE_UNAVAILABLE");
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
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI_NEWS_SOURCE_UNAVAILABLE");
    }

    @PostMapping("/publish")
    public ResponseEntity<Map<String, Object>> publishArticle(@RequestBody(required = false) Map<String, Object> body) {
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI_NEWS_SOURCE_UNAVAILABLE");
    }
}
