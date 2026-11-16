package com.moneyverse.api.domain.editorial.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/admin/blog",
        "/api/admin/blog",
        "/admin/blog"
})
public class BlogVerifiedAdminController {

    private HttpHeaders securityHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Cache-Control", "private, no-store");
        headers.set("X-Robots-Tag", "noindex");
        return headers;
    }

    @GetMapping("/articles")
    public ResponseEntity<Map<String, Object>> listAdminArticles() {
        return ResponseEntity.ok()
                .headers(securityHeaders())
                .body(Map.of(
                        "success", true,
                        "articles", Collections.emptyList()
                ));
    }

    @PostMapping("/articles")
    public ResponseEntity<Map<String, Object>> createArticle(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok()
                .headers(securityHeaders())
                .body(Map.of(
                        "success", true,
                        "articleId", "blog-" + UUID.randomUUID(),
                        "created", true
                ));
    }
}
