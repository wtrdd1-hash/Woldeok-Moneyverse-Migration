package com.moneyverse.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Security review 2026-11-25: profile image, collection, stock alert, privacy
 * request and stock post writes checked the session but not the CSRF token.
 * Their writes now pass the session+CSRF boundary; public reads stay unfiltered.
 */
class SessionOnlyWriteCsrfTest {
    private static boolean filtered(String method, String path) {
        var filter = new SensitiveApiBoundaryFilter(null, null);
        return !filter.shouldNotFilter(new MockHttpServletRequest(method, path));
    }

    @Test void writesGoThroughTheBoundary() {
        assertTrue(filtered("POST", "/api/v1/profile/image"));
        assertTrue(filtered("DELETE", "/api/v1/profile/image"));
        assertTrue(filtered("PUT", "/api/v1/collections/11111111-1111-4111-8111-111111111111"));
        assertTrue(filtered("POST", "/api/v1/stocks/alerts"));
        assertTrue(filtered("DELETE", "/api/stocks/alerts/abc"));
        assertTrue(filtered("POST", "/api/v1/privacy/requests"));
        assertTrue(filtered("POST", "/api/v1/board/stock-posts"));
    }

    @Test void publicReadsAreNotForcedThroughIt() {
        assertFalse(filtered("GET", "/api/v1/board/stock-posts"));
        assertFalse(filtered("GET", "/api/v1/stocks/alerts/events"));
    }
}
