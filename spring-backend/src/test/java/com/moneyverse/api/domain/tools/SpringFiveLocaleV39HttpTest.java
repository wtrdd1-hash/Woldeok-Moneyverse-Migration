package com.moneyverse.api.domain.tools;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SpringFiveLocaleV39HttpTest {
    @LocalServerPort int port;

    private HttpResponse<String> request(String path) throws Exception {
        var client = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NEVER)
            .connectTimeout(Duration.ofSeconds(5)).build();
        var request = HttpRequest.newBuilder(
            URI.create("http://127.0.0.1:" + port + path))
            .timeout(Duration.ofSeconds(12)).GET().build();
        return client.send(request,HttpResponse.BodyHandlers.ofString());
    }

    @Test void actualEnglishSpringCalculatorOffersFiveChoicesAndAuto() throws Exception {
        var r = request("/calculators?lang=en");
        assertEquals(200,r.statusCode());
        assertTrue(r.body().contains("data-mv-language-slot"));
        assertTrue(r.body().contains("data-lang=\"ja\""));
        assertTrue(r.body().contains("data-lang=\"zh\""));
        assertTrue(r.body().contains("data-lang=\"vi\""));
        assertTrue(r.body().contains("data-mv-auto"));
        assertTrue(r.body().contains("/mv-spring/v39/language-picker.mjs"));
    }

    @Test void nativeKoreanCalculatorKeepsActualSpringDataAndSwitcher() throws Exception {
        var r = request("/calculators?lang=ko");
        assertEquals(200,r.statusCode());
        assertTrue(r.body().contains("lang=\"ko\""));
        assertTrue(r.body().contains("data-mv-language-slot"));
        assertTrue(r.body().contains("Spring"));
    }

    @Test void pureLocaleLogicAndModuleHaveBrowserLoadableMimeType() throws Exception {
        for (String path : new String[]{
            "/mv-spring/v39/language-picker.mjs",
            "/mv-spring/v39/locale-core.mjs"
        }) {
            var r = request(path);
            assertEquals(200,r.statusCode(),path);
            assertTrue(r.headers().firstValue("Content-Type").orElse("")
                .toLowerCase().contains("javascript"),path + ": browser module MIME");
            assertTrue(r.body().contains("locale"), path);
        }
    }

    @Test void responsiveCssLoadsWithViewportAndReducedMotionRules() throws Exception {
        var r = request("/mv-spring/v39/language-picker.css");
        assertEquals(200,r.statusCode());
        assertTrue(r.headers().firstValue("Content-Type").orElse("").contains("text/css"));
        assertTrue(r.body().contains("max-width:390px"));
        assertTrue(r.body().contains("safe-area-inset-bottom"));
        assertTrue(r.body().contains("44px"));
    }

    @Test void guestCannotAccessAdministratorDataThroughPicker() throws Exception {
        var r = request("/admin/users?lang=ja");
        assertEquals(302,r.statusCode());
        assertTrue(r.headers().firstValue("Location").orElse("").startsWith("/login"));
        assertFalse(r.body().contains("Member directory"));
    }
}
