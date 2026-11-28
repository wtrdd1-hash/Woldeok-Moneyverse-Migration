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
        // Security review 2026-11-28: this served invented live state (figures, standings, boosts,
        // "verified" content). Unavailable until read from its canonical source.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "HELP_SOURCE_UNAVAILABLE");
    }

    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> search(@RequestBody(required = false) Map<String, Object> body) {
        // Security review 2026-11-28: this served invented live state (figures, standings, boosts,
        // "verified" content). Unavailable until read from its canonical source.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "HELP_SOURCE_UNAVAILABLE");
    }

    @GetMapping("/articles/{locale}/{slug}")
    public ResponseEntity<Map<String, Object>> article(
            @PathVariable("locale") String locale,
            @PathVariable("slug") String slug) {
        // Security review 2026-11-28: this served invented live state (figures, standings, boosts,
        // "verified" content). Unavailable until read from its canonical source.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "HELP_SOURCE_UNAVAILABLE");
    }
}
