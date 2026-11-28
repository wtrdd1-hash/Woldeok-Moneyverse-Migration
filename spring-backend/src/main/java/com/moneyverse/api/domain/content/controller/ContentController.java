package com.moneyverse.api.domain.content.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/content",
        "/api/content",
        "/content"
})
public class ContentController {

    @GetMapping("/popups")
    public ResponseEntity<Map<String, Object>> getActivePopups() {
        // Security review 2026-11-28: this served invented live state (figures, standings, boosts,
        // "verified" content). Unavailable until read from its canonical source.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "CONTENT_POPUP_SOURCE_UNAVAILABLE");
    }

    @GetMapping("/pages/{slug}")
    public ResponseEntity<Map<String, Object>> getStaticPage(@PathVariable("slug") String slug) {
        // Security review 2026-11-28: this served invented live state (figures, standings, boosts,
        // "verified" content). Unavailable until read from its canonical source.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "CONTENT_PAGE_SOURCE_UNAVAILABLE");
    }

    @PostMapping("/banners/{id}/click")
    public ResponseEntity<Map<String, Object>> recordBannerClick(@PathVariable("id") String id) {
        // Nothing is stored for banner clicks; say so instead of claiming a recordedAt
        // (security review 2026-11-25). No frontend caller depends on this route.
        return ResponseEntity.status(org.springframework.http.HttpStatus.ACCEPTED)
                .body(Map.of("success", false, "recorded", false, "bannerId", id));
    }
}
