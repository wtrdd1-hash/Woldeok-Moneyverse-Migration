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

/** Actual ephemeral Spring HTTP with H2 test profile. No production DB or server. */
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SpringNativeUiV38HttpTest {
    @LocalServerPort int port;

    private HttpResponse<String> get(String route) throws Exception {
        var http = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER)
                .connectTimeout(Duration.ofSeconds(5)).build();
        var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + route))
                .timeout(Duration.ofSeconds(15)).GET().build();
        return http.send(request,HttpResponse.BodyHandlers.ofString());
    }

    @Test void springCalculatorsEnglishRenderRealThymeleafAndOneHelpDock() throws Exception {
        var response=get("/calculators?lang=en");
        assertEquals(200,response.statusCode());
        assertTrue(response.body().contains("Spring verified"));
        assertTrue(response.body().contains("class=\"mv-support-dock\""));
        assertTrue(response.body().contains("href=\"/mv-spring/v38/shared-ui.css\""));
        assertTrue(response.body().contains("pending security verification"));
        assertFalse(response.body().contains("onClick="));
    }

    @Test void springCalculatorsKoreanRenderLocalizedReadOnlySupport() throws Exception {
        var response=get("/calculators?lang=ko");
        assertEquals(200,response.statusCode());
        assertTrue(response.body().contains("보안 확인 전"));
        assertTrue(response.body().contains("고객센터 보기"));
        assertTrue(response.body().contains("lang=\"ko\""));
    }

    @Test void newCssIsActuallyExposedBySpringAtPublicPath() throws Exception {
        var response=get("/mv-spring/v38/shared-ui.css");
        assertEquals(200,response.statusCode());
        assertTrue(response.body().contains("56px"));
        assertTrue(response.body().contains("safe-area-inset-bottom"));
    }

    @Test void unverifiedUserCannotSeePrivateAdminDesignOrData() throws Exception {
        var response=get("/admin/users");
        assertEquals(302,response.statusCode());
        assertTrue(response.headers().firstValue("Location").orElse("").startsWith("/login"));
        assertFalse(response.body().contains("ADMIN CONTROL CENTER"));
    }
}
