package com.moneyverse.api.domain.media;

import com.moneyverse.api.domain.media.controller.PublicPhotosController;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class PublicPhotosTest {
    private static Map<String, Object> row(String url, String alt) {
        Map<String, Object> r = new HashMap<>();
        r.put("photo_id", "11111111-1111-1111-1111-111111111111");
        r.put("image_url", url);
        r.put("alt_text", alt);
        r.put("published_at", Timestamp.from(Instant.parse("2026-11-25T01:02:03.456789Z")));
        return r;
    }

    @Test void approvedPhotoKeepsThePageShape() {
        var m = PublicPhotosController.photo(row("/media/11111111-1111-1111-1111-111111111111.webp", "사진"));
        assertEquals("2026-11-25T01:02:03.456Z", m.get("publishedAt"));
        assertEquals("사진", m.get("altText"));
    }

    @Test void unsafeUrlsAndMarkupNeverReachThePage() {
        assertThrows(ResponseStatusException.class, () -> PublicPhotosController.photo(row("javascript:alert(1)", "x")));
        assertThrows(ResponseStatusException.class, () -> PublicPhotosController.photo(row("http://example.com/a.png", "x")));
        assertThrows(ResponseStatusException.class, () -> PublicPhotosController.photo(row("https://user:pw@example.com/a.png", "x")));
        assertThrows(ResponseStatusException.class, () -> PublicPhotosController.photo(row("https://example.com/a.png", "<img>")));
    }
}
