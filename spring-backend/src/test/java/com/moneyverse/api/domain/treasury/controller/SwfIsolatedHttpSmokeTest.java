package com.moneyverse.api.domain.treasury.controller;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Real embedded HTTP server, isolated H2 test profile; never connects to the live ledger. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class SwfIsolatedHttpSmokeTest {

    @LocalServerPort private int port;

    @Test
    void backendServesHealthAndRefusesSwfMutationsAcrossAllAliases() throws Exception {
        try (HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3)).build()) {
            String root = "http://127.0.0.1:" + port;
            HttpResponse<String> health = client.send(
                    HttpRequest.newBuilder(URI.create(root + "/health")).GET().build(),
                    HttpResponse.BodyHandlers.ofString());
            assertEquals(200, health.statusCode());
            assertTrue(health.body().contains("UP"));

            for (String path : new String[] {
                    "/api/v1/admin/treasury/swf",
                    "/api/admin/treasury/swf",
                    "/api/treasury/swf",
                    "/api/v1/treasury/swf"
            }) {
                HttpRequest read = HttpRequest.newBuilder(URI.create(root + path))
                        .header("x-user-id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20").GET().build();
                assertEquals(403, client.send(read, HttpResponse.BodyHandlers.ofString()).statusCode(), path);
                HttpRequest write = HttpRequest.newBuilder(URI.create(root + path))
                        .header("Content-Type", "application/json")
                        .method("PUT", HttpRequest.BodyPublishers.ofString("{}")).build();
                assertEquals(403, client.send(write, HttpResponse.BodyHandlers.ofString()).statusCode(), path);
                HttpRequest run = HttpRequest.newBuilder(URI.create(root + path + "/rebalance"))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString("{}")).build();
                assertEquals(403, client.send(run, HttpResponse.BodyHandlers.ofString()).statusCode(), path + "/rebalance");
            }
        }
    }
}
