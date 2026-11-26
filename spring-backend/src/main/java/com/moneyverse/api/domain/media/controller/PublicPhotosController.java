package com.moneyverse.api.domain.media.controller;

import com.moneyverse.api.common.time.JsTime;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.sql.Timestamp;
import java.time.Duration;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Published gallery photos (NestJS ContentController GET /photos; signed-in sweep 2026-11-25:
 * GET was 405 in Spring, so /gallery always said "지금은 사진을 불러올 수 없어요").
 * Only operator-approved rows from content_list_published_photos; an unsafe image URL from the
 * database fails the read instead of reaching a page.
 */
@RestController
public class PublicPhotosController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PublicPhotosController.class);
    private static final Pattern LOCAL_MEDIA = Pattern.compile("^/media/[0-9a-f-]{36}\\.(png|jpg|webp)$");
    private static final int LIMIT = 24;
    private final JdbcClient jdbc;

    public PublicPhotosController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping({"/api/v1/photos", "/api/photos"})
    @Operation(summary = "Published gallery photos")
    public ResponseEntity<?> photos() {
        List<Map<String, Object>> rows;
        try {
            rows = jdbc.sql("SELECT photo_id::text AS photo_id, image_url, alt_text, published_at FROM public.content_list_published_photos(?)")
                    .param(LIMIT).query().listOfRows();
        } catch (RuntimeException e) {
            Throwable c = NestedExceptionUtils.getMostSpecificCause(e);
            log.warn("[public-photos] db call failed: {} {}", c.getClass().getSimpleName(), String.valueOf(c.getMessage()).replaceAll("\\s+", " "));
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "PHOTOS_SOURCE_UNAVAILABLE");
        }
        List<Map<String, Object>> out = new ArrayList<>();
        for (Map<String, Object> r : rows) out.add(photo(r));
        return ResponseEntity.ok().cacheControl(CacheControl.maxAge(Duration.ofSeconds(30)).cachePublic()).body(Map.of("photos", out));
    }

    public static Map<String, Object> photo(Map<String, Object> r) {
        String url = String.valueOf(r.get("image_url"));
        if (!safeImageUrl(url)) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "PHOTOS_UNSAFE_IMAGE_URL");
        String alt = r.get("alt_text") == null ? "" : r.get("alt_text").toString();
        if (alt.length() > 300 || alt.chars().anyMatch(ch -> ch == '<' || ch == '>' || Character.isISOControl(ch))) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "PHOTOS_UNSAFE_ALT_TEXT");
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("photoId", r.get("photo_id"));
        m.put("imageUrl", url);
        m.put("altText", alt);
        m.put("publishedAt", r.get("published_at") instanceof Timestamp t ? JsTime.iso(t.toInstant()) : null);
        return m;
    }

    static boolean safeImageUrl(String url) {
        if (url == null) return false;
        if (LOCAL_MEDIA.matcher(url).matches()) return true;
        try {
            URI u = new URI(url);
            return "https".equals(u.getScheme()) && u.getHost() != null && u.getUserInfo() == null && url.length() <= 2048;
        } catch (Exception e) {
            return false;
        }
    }
}
