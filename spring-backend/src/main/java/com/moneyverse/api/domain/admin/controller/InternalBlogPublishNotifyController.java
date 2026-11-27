package com.moneyverse.api.domain.admin.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Local post-publish hook for new blog articles.
 *
 * The public notify route became administrator-only on 2026-11-25 because anyone could make the
 * bots post arbitrary links; the server-side hook had no administrator session and has failed
 * since. This route accepts only loopback callers holding the internal token, takes only a slug,
 * (or nothing, for the newest unannounced article) and builds the announcement from the published
 * row via blog_claim_publish_notification (355), which also makes each article announce once. Rejected: re-opening the public route with a
 * token (callers could still choose the text and link).
 */
@RestController
public class InternalBlogPublishNotifyController {
    // SHA-256 of the token default once committed to this public repository; never accept it.
    // Stored as a digest so the literal does not reappear in source.
    private static final String COMMITTED_DEFAULT_SHA256 = "1eb829e05776a61428a25bc398e69127f67c89e87af0d2176209bc387ed7a9cd";
    private static final Set<String> LOOPBACK = Set.of("127.0.0.1", "::1", "0:0:0:0:0:0:0:1");

    private final JdbcTemplate jdbcTemplate;
    private final BlogNotificationController notifier;
    private final String internalToken;

    public InternalBlogPublishNotifyController(JdbcTemplate jdbcTemplate, BlogNotificationController notifier,
            @Value("${moneyverse.security.internal-token:}") String internalToken) {
        this.jdbcTemplate = jdbcTemplate;
        this.notifier = notifier;
        this.internalToken = internalToken;
    }

    private static String sha256(String value) {
        try {
            return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    @PostMapping("/internal/blog/published-notify")
    public ResponseEntity<Map<String, Object>> notifyPublished(HttpServletRequest request,
            @RequestBody(required = false) Map<String, String> body) {
        if (!LOOPBACK.contains(request.getRemoteAddr())) return ResponseEntity.status(404).build();
        if (internalToken == null || internalToken.length() < 32 || COMMITTED_DEFAULT_SHA256.equals(sha256(internalToken))) {
            return ResponseEntity.status(503).body(Map.of("code", "INTERNAL_TOKEN_NOT_CONFIGURED"));
        }
        String supplied = request.getHeader("x-internal-token");
        if (supplied == null || !MessageDigest.isEqual(supplied.getBytes(StandardCharsets.UTF_8),
                internalToken.getBytes(StandardCharsets.UTF_8))) {
            return ResponseEntity.status(403).body(Map.of("code", "FORBIDDEN"));
        }
        // No slug: claim the newest unannounced article from the last 6 hours (see 355).
        String slug = body == null ? null : body.get("slug");
        if (slug != null && !slug.matches("[a-z0-9][a-z0-9-]{0,159}")) {
            return ResponseEntity.badRequest().body(Map.of("code", "INVALID_SLUG"));
        }
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT slug, title, topic, excerpt FROM public.blog_claim_publish_notification(?)", slug);
        if (rows.isEmpty()) return ResponseEntity.ok(Map.of("status", "ALREADY_NOTIFIED_OR_NOT_PUBLISHED"));
        Map<String, Object> row = rows.get(0);
        notifier.notifyPublish(Map.of(
                "title", String.valueOf(row.get("title")),
                "url", "https://easy-scraping.com/blog/" + row.get("slug"),
                "category", String.valueOf(row.get("topic")),
                "excerpt", String.valueOf(row.get("excerpt"))));
        return ResponseEntity.accepted().body(Map.of("status", "QUEUED_FOR_DISPATCH"));
    }
}
