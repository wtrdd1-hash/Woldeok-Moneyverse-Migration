package com.moneyverse.api.domain;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class EngagementWireSecurityTest {
    @LocalServerPort
    private int port;

    @Test
    void realHttpDoesNotAuthenticateUserIdHeader() throws Exception {
        try (HttpClient http = HttpClient.newHttpClient()) {
            for (String path : new String[]{
                    "/api/engagement/streak",
                    "/api/engagement/dopamine/status",
                    "/api/v1/engagement/dopamine/status",
                    "/api/engagement/features"
            }) {
                HttpRequest request = HttpRequest.newBuilder(
                                URI.create("http://127.0.0.1:" + port + path))
                        .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20")
                        .GET().build();
                assertEquals(401,
                        http.send(request, HttpResponse.BodyHandlers.discarding()).statusCode(),
                        "Anonymous HTTP must be denied for " + path);
            }
        }
    }
}
