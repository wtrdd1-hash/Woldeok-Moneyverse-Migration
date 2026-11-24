package com.moneyverse.api.domain.editorial.controller;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Public read path for source-verified blog articles, in the shape the Next
 * blog client (frontend/src/app/blog/blog-verified-client.ts) validates:
 * {@code {posts:[...]}} for the list and {@code {post:{...}}} for one slug.
 *
 * Reads go through blog_verified_public_list / blog_verified_public_by_slug
 * (migration 298) rather than the table, because 298 revoked table access from
 * moneyverse_app on purpose: withdrawn bodies must stay unreadable even if this
 * process is compromised. The sibling BlogVerifiedController only ever returned
 * a fixed placeholder article, which is why blog detail pages had nothing real
 * to render.
 */
@RestController
@RequestMapping(path = {"/api/v1/blog/verified", "/api/blog/verified"})
public class PublicVerifiedBlogController {

    // Mirrors the client-side guard so a malformed slug never reaches SQL.
    private static final Pattern SLUG = Pattern.compile("^[a-z0-9-]{10,110}$");

    // Timestamps are rendered in UTC explicitly; to_char on a timestamptz
    // otherwise follows the session TimeZone and the trailing Z would lie.
    private static final String COLUMNS = """
            slug, country, locale, topic, title, excerpt, content,
            primary_source_url, receipt::text AS receipt, status,
            to_char(published_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS published_at,
            to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS updated_at
            """;

    private final JdbcTemplate jdbcTemplate;

    public PublicVerifiedBlogController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> list() {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT " + COLUMNS + " FROM public.blog_verified_public_list()");
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofSeconds(60)).cachePublic())
                .body(Map.of("posts", rows));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Map<String, Object>> bySlug(@PathVariable("slug") String slug) {
        if (slug == null || !SLUG.matcher(slug).matches()) {
            return ResponseEntity.notFound().build();
        }
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT " + COLUMNS + " FROM public.blog_verified_public_by_slug(?)", slug);
        if (rows.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofSeconds(60)).cachePublic())
                .body(Map.of("post", rows.get(0)));
    }
}
