package com.moneyverse.api.domain.kdic;

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
class KdicWireSecurityTest {
    @LocalServerPort int port;

    @Test
    void realHttpAdminPathsDenyAnonymousForgedRoleAndSessionHeaders() throws Exception {
        try (HttpClient http = HttpClient.newHttpClient()) {
            for (String path : new String[]{
                    "/api/admin/kdic/overview",
                    "/api/v1/admin/kdic/ledger-integrity",
                    "/api/v1/admin/kdic/payout"
            }) {
                HttpRequest.Builder builder = HttpRequest.newBuilder(
                        URI.create("http://127.0.0.1:" + port + path))
                        .header("x-user-id", "superadmin")
                        .header("x-internal-token", "forged");
                HttpRequest request = path.endsWith("payout")
                        ? builder.POST(HttpRequest.BodyPublishers.noBody()).build()
                        : builder.GET().build();
                assertEquals(401, http.send(request, HttpResponse.BodyHandlers.discarding()).statusCode(),
                        "No public administrative access: " + path);
            }
        }
    }
}
