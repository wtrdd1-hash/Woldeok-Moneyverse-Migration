package com.moneyverse.api.domain.help.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/help",
        "/api/help",
        "/help"
})
public class HelpController {

    private static final List<String> CATEGORIES = List.of("account", "wallet", "shop", "community", "support");

    private HttpHeaders noStoreHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Cache-Control", "no-store");
        return headers;
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> categories(@RequestParam(name = "locale", required = false, defaultValue = "ko") String locale) {
        Map<String, String> counts = new LinkedHashMap<>();
        counts.put("account", "12");
        counts.put("wallet", "8");
        counts.put("shop", "6");
        counts.put("community", "15");
        counts.put("support", "9");

        return ResponseEntity.ok()
                .headers(noStoreHeaders())
                .body(Map.of(
                        "categories", CATEGORIES,
                        "locale", locale,
                        "counts", counts
                ));
    }

    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> search(@RequestBody(required = false) Map<String, Object> body) {
        String locale = body != null ? (String) body.getOrDefault("locale", "ko") : "ko";
        String query = body != null ? (String) body.getOrDefault("query", "") : "";

        List<Map<String, Object>> articles = List.of(
                Map.of(
                        "id", "art-01",
                        "title", "계정 2단계 인증(2FA) 및 보안 세션 관리 가이드",
                        "slug", "account-2fa-security-guide",
                        "category", "account",
                        "locale", locale
                )
        );

        return ResponseEntity.ok()
                .headers(noStoreHeaders())
                .body(Map.of(
                        "articles", articles,
                        "requestedLocale", locale,
                        "resultLocale", locale,
                        "fallbackUsed", false
                ));
    }

    @GetMapping("/articles/{locale}/{slug}")
    public ResponseEntity<Map<String, Object>> article(
            @PathVariable("locale") String locale,
            @PathVariable("slug") String slug) {
        Map<String, Object> art = new LinkedHashMap<>();
        art.put("id", "art-01");
        art.put("title", "계정 2단계 인증(2FA) 및 보안 세션 관리 가이드");
        art.put("slug", slug);
        art.put("locale", locale);
        art.put("published_revision_id", "rev-2026-01");
        art.put("contentHtml", "<p>계정 보안을 위한 2FA 인증 방법 상세 안내입니다.</p>");
        art.put("updatedAt", new Date().toInstant().toString());

        return ResponseEntity.ok()
                .headers(noStoreHeaders())
                .body(Map.of("article", art));
    }
}
