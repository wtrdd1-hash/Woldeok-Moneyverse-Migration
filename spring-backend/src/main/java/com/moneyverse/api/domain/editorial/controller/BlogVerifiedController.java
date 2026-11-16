package com.moneyverse.api.domain.editorial.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/blog",
        "/api/blog",
        "/blog"
})
public class BlogVerifiedController {

    private HttpHeaders cacheHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Cache-Control", "public, max-age=300");
        return headers;
    }

    @GetMapping("/articles")
    public ResponseEntity<Map<String, Object>> listArticles(
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "limit", required = false, defaultValue = "10") int limit) {
        List<Map<String, Object>> articles = List.of(
                Map.of(
                        "id", "blog-01",
                        "title", "2026년 하반기 글로벌 거시경제 전망 및 가상 자산 시장 분석",
                        "slug", "2026-macroeconomic-outlook",
                        "category", "economy",
                        "author", "월덱 리서치 센터",
                        "publishedAt", new Date().toInstant().toString(),
                        "viewCount", 3420
                )
        );

        return ResponseEntity.ok()
                .headers(cacheHeaders())
                .body(Map.of(
                        "articles", articles,
                        "total", articles.size()
                ));
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> listCategories() {
        return ResponseEntity.ok()
                .headers(cacheHeaders())
                .body(Map.of(
                        "categories", List.of("economy", "crypto", "trading", "fintech", "market_pulse")
                ));
    }

    @GetMapping("/articles/{slug}")
    public ResponseEntity<Map<String, Object>> getArticle(@PathVariable("slug") String slug) {
        Map<String, Object> article = new LinkedHashMap<>();
        article.put("id", "blog-01");
        article.put("title", "2026년 하반기 글로벌 거시경제 전망 및 가상 자산 시장 분석");
        article.put("slug", slug);
        article.put("category", "economy");
        article.put("contentHtml", "<article><h1>2026 거시경제 분석</h1><p>글로벌 통화 정책 완화 및 유동성 회복에 따른 금융 시장 구조 변화 분석입니다.</p></article>");
        article.put("author", "월덱 리서치 센터");
        article.put("publishedAt", new Date().toInstant().toString());
        article.put("viewCount", 3421);

        return ResponseEntity.ok()
                .headers(cacheHeaders())
                .body(Map.of("article", article));
    }
}
