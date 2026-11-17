package com.moneyverse.api.domain.web;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Explicitly denies disabled Spring UI previews. The legacy SPA static fallback
 * otherwise converts an unknown page into a misleading HTTP 200 index.html.
 */
@Controller
@ConditionalOnProperty(prefix = "moneyverse.web", name = "preview-enabled",
        havingValue = "false", matchIfMissing = true)
final class SpringWebPreviewDisabledController {
    @GetMapping({"/spring-web", "/spring-web/status"})
    ResponseEntity<Void> disabled() {
        return ResponseEntity.notFound()
                .header("Cache-Control", "private, no-store")
                .header("X-Robots-Tag", "noindex, nofollow")
                .header("Referrer-Policy", "no-referrer")
                .header("X-Content-Type-Options", "nosniff")
                .build();
    }
}
