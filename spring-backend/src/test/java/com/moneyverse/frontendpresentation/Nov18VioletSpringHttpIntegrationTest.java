package com.moneyverse.frontendpresentation;

import com.moneyverse.api.MoneyverseSpringApplication;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;
import static org.junit.jupiter.api.Assertions.*;

/** Real loopback Spring HTTP: CSS must be byte-identical to the reviewed JAR, not host overlay. */
@SpringBootTest(classes = MoneyverseSpringApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {"server.address=127.0.0.1", "moneyverse.frontend.classpath-only=true"})
@ActiveProfiles("test")
class Nov18VioletSpringHttpIntegrationTest {
    @LocalServerPort int port;

    private HttpResponse<byte[]> get(String path) throws Exception {
        return HttpClient.newHttpClient().send(
            HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path)).GET().build(),
            HttpResponse.BodyHandlers.ofByteArray());
    }

    @Test
    void exactPackagedVioletAndSharedStylesAreServed() throws Exception {
        for (String name : new String[]{"mv-theme-nov18.css", "mv-brand-violet.css"}) {
            var response = get("/css/" + name);
            assertEquals(200, response.statusCode(), name + " missing from real Spring renderer");
            byte[] expected = new ClassPathResource("static/css/" + name).getContentAsByteArray();
            assertArrayEquals(expected, response.body(), name + " was shadowed by mutable host assets");
        }
    }

    @Test
    void legacyNextVioletAdapterAndStoredTailwindBaseHaveExactClasspathBytes() throws Exception {
        for (String path : new String[]{"css/mv-legacy-violet.css", "_next/static/css/5f13fc286907515d.css"}) {
            var response = get("/" + path);
            assertEquals(200, response.statusCode(), "Spring must serve " + path);
            byte[] expected = new ClassPathResource("static/" + path).getContentAsByteArray();
            assertArrayEquals(expected, response.body(), "Must never serve an unreviewed mutable CSS overlay: " + path);
        }
    }

    @Test
    void bankPageDoesNotFallBackToMissingNextCssOrOldCyanBrand() throws Exception {
        var response = get("/bank.html");
        assertEquals(200, response.statusCode());
        String html = new String(response.body(), java.nio.charset.StandardCharsets.UTF_8);
        assertTrue(html.contains("bank-brand-hero"));
        assertTrue(html.contains("bank-product-grid"));
        assertFalse(html.contains("/_next/static/css/8bbd23f36a44eb75.css"));
        assertFalse(html.contains("via-cyan-300"));
    }
}
