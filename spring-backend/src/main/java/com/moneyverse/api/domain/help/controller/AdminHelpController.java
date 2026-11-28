package com.moneyverse.api.domain.help.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/admin/help",
        "/api/admin/help",
        "/admin/help"
})
public class AdminHelpController {

    private HttpHeaders securityHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Cache-Control", "private, no-store");
        headers.set("X-Robots-Tag", "noindex");
        return headers;
    }

    @GetMapping("/articles")
    public ResponseEntity<Map<String, Object>> listArticles() {
        return ResponseEntity.ok()
                .headers(securityHeaders())
                .body(Map.of(
                        "success", true,
                        "articles", Collections.emptyList()
                ));
    }

    @PostMapping("/drafts")
    public ResponseEntity<Map<String, Object>> createDraft(@RequestBody(required = false) Map<String, Object> body) {
        // Security review 2026-11-28: this answered with invented data or acknowledged a write never stored.
        // Unavailable until backed by a canonical source; never a fabricated receipt.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "HELP_DRAFT_SOURCE_UNAVAILABLE");
    }
}
