package com.moneyverse.api.domain.web;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Public legal document SSR. Generated legal templates preserve the EN/KO
 * literal text and links from the original Next policy components exactly.
 * No user/session, PostgreSQL access or mutation occurs in these routes.
 */
@Controller
@ConditionalOnProperty(prefix = "moneyverse.web", name = "spring-policy-enabled", havingValue = "true")
public final class SpringPublicPolicyController {
    @GetMapping("/terms")
    public String terms(@RequestParam(name = "lang", required = false) String lang,
                        HttpServletResponse response) {
        legalHeaders(response);
        return "spring-policy/terms-" + language(lang);
    }

    @GetMapping("/privacy")
    public String privacy(@RequestParam(name = "lang", required = false) String lang,
                          HttpServletResponse response) {
        legalHeaders(response);
        return "spring-policy/privacy-" + language(lang);
    }

    private static String language(String lang) {
        // Explicit, finite locale set; untrusted URL input is never a view path.
        return "ko".equalsIgnoreCase(lang) ? "ko" : "en";
    }

    private static void legalHeaders(HttpServletResponse response) {
        response.setHeader("Cache-Control", "public, max-age=60");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        response.setHeader("Content-Security-Policy",
                "default-src 'none'; style-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'none'");
    }
}
