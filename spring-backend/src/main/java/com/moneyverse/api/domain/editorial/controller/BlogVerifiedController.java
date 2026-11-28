package com.moneyverse.api.domain.editorial.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

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
        // Security review 2026-11-28: this served invented live state (figures, standings, boosts,
        // "verified" content). Unavailable until read from its canonical source.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BLOG_SOURCE_UNAVAILABLE");
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
        // Security review 2026-11-28: this served invented live state (figures, standings, boosts,
        // "verified" content). Unavailable until read from its canonical source.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BLOG_SOURCE_UNAVAILABLE");
    }
}
