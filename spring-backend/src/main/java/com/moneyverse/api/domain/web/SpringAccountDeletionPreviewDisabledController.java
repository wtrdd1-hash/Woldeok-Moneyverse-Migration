package com.moneyverse.api.domain.web;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Fail-closed route for a disabled preview. Without an explicit 404 handler,
 * the legacy broad SPA static-resource fallback could serve index.html for
 * an unregistered preview URL and falsely imply the Spring page is available.
 */
@Controller
@ConditionalOnProperty(prefix = "moneyverse.web", name = "account-deletion-preview-enabled",
        havingValue = "false", matchIfMissing = true)
final class SpringAccountDeletionPreviewDisabledController {

    @GetMapping("/spring-web/account-deletion")
    ResponseEntity<Void> unavailable() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .header("Cache-Control", "private, no-store")
                .header("X-Robots-Tag", "noindex, nofollow")
                .header("Referrer-Policy", "no-referrer")
                .header("X-Content-Type-Options", "nosniff")
                .build();
    }
}
