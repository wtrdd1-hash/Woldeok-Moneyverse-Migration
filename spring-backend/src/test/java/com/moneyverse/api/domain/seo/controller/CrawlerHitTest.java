package com.moneyverse.api.domain.seo.controller;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class CrawlerHitTest {
    private static final String T = "0123456789abcdef0123456789abcdef";

    @Test void tokenIsRequiredAndUnsetMeansOff() {
        assertFalse(CrawlerHit.tokenMatches(null, T));
        assertFalse(CrawlerHit.tokenMatches("short", "short"));
        assertFalse(CrawlerHit.tokenMatches(T, null));
        assertFalse(CrawlerHit.tokenMatches(T, T + "x"));
        assertTrue(CrawlerHit.tokenMatches(T, T));
    }

    @Test void validatesEveryField() {
        assertEquals("Googlebot", CrawlerHit.from(Map.of("botName", "Googlebot", "path", "/stocks", "ipAddress", "66.249.1.1")).botName());
        assertThrows(ResponseStatusException.class, () -> CrawlerHit.from(Map.of("botName", "<script>", "path", "/")));
        assertThrows(ResponseStatusException.class, () -> CrawlerHit.from(Map.of("botName", "b", "path", "http://evil")));
        assertThrows(ResponseStatusException.class, () -> CrawlerHit.from(Map.of("botName", "b", "path", "/", "ipAddress", "1.1.1.1; drop")));
        assertThrows(ResponseStatusException.class, () -> CrawlerHit.from(Map.of("botName", "b", "path", "/", "statusCode", 999)));
        assertThrows(ResponseStatusException.class, () -> CrawlerHit.from(null));
    }
}
