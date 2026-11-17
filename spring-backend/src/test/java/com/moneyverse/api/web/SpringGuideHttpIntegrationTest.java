package com.moneyverse.api.web;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

/** Isolated real HTTP server; in-memory Test DB, not Production/Test shared PostgreSQL. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {"server.address=127.0.0.1", "moneyverse.web.spring-guide-enabled=true", "moneyverse.web.spring-home-enabled=true"})
@ActiveProfiles("test")
class SpringGuideHttpIntegrationTest {
    @LocalServerPort private int port;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();

    private HttpResponse<String> get(String path) throws IOException, InterruptedException {
        return client.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
                        .timeout(Duration.ofSeconds(6)).GET().build(),
                HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void liveGuideActuallyRendersHtmlAndCssOverRealHttp() throws Exception {
        HttpResponse<String> guide = get("/guide?lang=ko");
        assertThat(guide.statusCode()).isEqualTo(200);
        assertThat(guide.headers().firstValue("content-type").orElse("")).contains("text/html");
        assertThat(guide.body()).contains("<html lang=\"ko\">", "머니버스에서 할 수 있는 일", "/spring-ui/guide.css");
        assertThat(guide.body()).doesNotContain("페이지를 불러오는 중입니다", "Spring Boot 3.3 단일 엔진");
        assertThat(guide.headers().firstValue("x-robots-tag")).isEmpty();
        HttpResponse<String> css = get("/spring-ui/guide.css");
        assertThat(css.statusCode()).isEqualTo(200);
        assertThat(css.body()).contains("@media(max-width:460px)");
    }

    @Test
    void enabledSpringHomeRendersRealLocalizedHtmlRatherThanPlaceholder() throws Exception {
        HttpResponse<String> home = get("/?lang=ko");
        assertThat(home.statusCode()).isEqualTo(200);
        assertThat(home.body()).contains("<html lang=\"ko\">", "배우고, 도전하고, 성장하는 가상경제", "/spring-ui/home.css");
        assertThat(home.body()).doesNotContain("페이지를 불러오는 중입니다", "Spring Boot 3.3 단일 엔진");
        HttpResponse<String> css = get("/spring-ui/home.css");
        assertThat(css.statusCode()).isEqualTo(200);
        assertThat(css.body()).contains(".home-hero");
    }

    @Test
    void springHomePreviewIsUnindexedAndEnglishByDefault() throws Exception {
        HttpResponse<String> home = get("/spring-ui/home");
        assertThat(home.statusCode()).isEqualTo(200);
        assertThat(home.headers().firstValue("x-robots-tag")).hasValue("noindex, nofollow");
        assertThat(home.body()).contains("Learn, explore and grow in a virtual economy");
    }

    @Test
    void previewRemainsUnindexedAndDoesNotSetCookies() throws Exception {
        HttpResponse<String> page = get("/spring-ui/guide?lang=en");
        assertThat(page.statusCode()).isEqualTo(200);
        assertThat(page.headers().firstValue("x-robots-tag")).hasValue("noindex, nofollow");
        assertThat(page.headers().firstValue("cache-control")).hasValue("no-store, private");
        assertThat(page.headers().allValues("set-cookie")).isEmpty();
        assertThat(page.body()).contains("Explore Woldeok Moneyverse");
    }
}
