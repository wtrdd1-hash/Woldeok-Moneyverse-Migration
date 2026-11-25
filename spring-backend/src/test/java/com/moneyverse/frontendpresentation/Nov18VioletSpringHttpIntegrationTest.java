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
        // Since 2026-11-23 (b95625ac70) /bank.html is the member-only Thymeleaf bank
        // (NativeBankController): a guest must be sent to sign-in, never served
        // the page. The no-missing-Next-CSS / no-old-cyan guarantees now apply
        // to that template.
        var response = get("/bank.html");
        assertEquals(302, response.statusCode());
        assertEquals("/login?next=%2Fbank", java.net.URI.create(response.headers().firstValue("Location").orElseThrow()).getRawPath()
            + "?" + java.net.URI.create(response.headers().firstValue("Location").orElseThrow()).getRawQuery());
        String template = new String(getClass().getResourceAsStream("/templates/mv43/bank.html").readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
        assertFalse(template.contains("/_next/static/css/8bbd23f36a44eb75.css"));
        assertFalse(template.contains("via-cyan-300"));
    }
}
