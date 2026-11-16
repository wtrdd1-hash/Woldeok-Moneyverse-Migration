package com.moneyverse.api.domain.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Actual embedded HTTP server/servlet/template/static-asset probe on a random test port.
 * The disposable H2 database has no production status function; it must fail closed.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class SpringWebEmbeddedHttpTest {
    @Autowired TestRestTemplate http;

    @Test
    void publicPreviewRendersKoreanOverRealHttpWithNoindexHeaders() {
        ResponseEntity<String> response = http.getForEntity("/spring-web?lang=ko", String.class);
        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getHeaders().getContentType().toString().contains("text/html"));
        assertEquals("noindex, nofollow", response.getHeaders().getFirst("X-Robots-Tag"));
        assertTrue(response.getBody().contains("<html lang=\"ko\""));
        assertTrue(response.getBody().contains("Spring 웹 전환"));
    }

    @Test
    void dbSourceFailureNeverClaimsHealthyStatus() {
        ResponseEntity<String> response = http.getForEntity("/spring-web/status?lang=en", String.class);
        assertEquals(503, response.getStatusCode().value());
        assertEquals("private, no-store", response.getHeaders().getFirst("Cache-Control"));
        assertEquals("noindex, nofollow", response.getHeaders().getFirst("X-Robots-Tag"));
        assertTrue(response.getBody().contains("Status unavailable"));
        assertFalse(response.getBody().contains("Operational</"));
    }

    @Test
    void cssIsServedFromSpringClasspathNotNextAssets() {
        ResponseEntity<String> response = http.getForEntity("/assets/spring-web-site.css", String.class);
        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().contains("--panel"));
    }
}
