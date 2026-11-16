package com.moneyverse.api.domain.admin.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class SystemLogHttpSmokeTest {
    @Autowired private TestRestTemplate client;

    @Test
    void runningHttpEndpointRejectsAnonymousReadAndProtectsResponseCaching() {
        var response = client.getForEntity("/api/v1/admin/logs/system?source=NGINX_ACCESS&lines=50", String.class);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("private, no-store", response.getHeaders().getFirst("Cache-Control"));
        assertEquals("noindex, nofollow", response.getHeaders().getFirst("X-Robots-Tag"));
    }

    @Test
    void runningHttpEndpointRejectsForgedGatewayToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("x-internal-token", "not-a-valid-credential");
        var response = client.exchange("/api/v1/admin/logs/system?source=SPRING_BACKEND",
                HttpMethod.GET, new HttpEntity<>(headers), String.class);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertFalse(response.getBody() != null && response.getBody().contains("lines"));
    }
}
