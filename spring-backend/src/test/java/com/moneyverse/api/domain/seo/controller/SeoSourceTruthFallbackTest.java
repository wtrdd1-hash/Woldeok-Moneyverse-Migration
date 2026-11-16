package com.moneyverse.api.domain.seo.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;

class SeoSourceTruthFallbackTest {
    private MockMvc mvc;

    @BeforeEach
    void setup() { mvc = MockMvcBuilders.standaloneSetup(new SeoController()).build(); }

    @Test
    void anonymousStatusCannotPublishPlaceholderCrawlerCounts() throws Exception {
        mvc.perform(get("/api/v1/seo/status"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("seo_source_unavailable"))
                .andExpect(content().string(not(containsString("totalCrawls"))))
                .andExpect(content().string(not(containsString("healthyPercent"))));
    }

    @Test
    void directSpringCannotFakeGscOrAuditSuccess() throws Exception {
        for (String path : new String[] {
                "/api/v1/seo/gsc/analytics", "/api/v1/seo/crawl-audit", "/api/v1/seo/status/admin",
                "/api/v1/seo/twitter/status", "/seo/status", "/api/seo/status" }) {
            mvc.perform(get(path))
                    .andExpect(status().isServiceUnavailable())
                    .andExpect(jsonPath("$.error").value("seo_source_unavailable"))
                    .andExpect(content().string(not(containsString("totalClicks30d"))))
                    .andExpect(content().string(not(containsString("healthyUrls"))));
        }
    }

    @Test
    void unauthenticatedSpringMutationsCannotFakeSuccess() throws Exception {
        for (String path : new String[] {
                "/api/v1/seo/submit", "/api/v1/seo/crawl-audit", "/api/v1/seo/log" }) {
            mvc.perform(post(path).contentType("application/json").content("{\"urls\":[\"https://easy-scraping.com/\"]}"))
                    .andExpect(status().isServiceUnavailable())
                    .andExpect(jsonPath("$.error").value("seo_source_unavailable"))
                    .andExpect(content().string(not(containsString("submittedCount"))))
                    .andExpect(content().string(not(containsString("\"recorded\":true"))));
        }
    }

    @Test
    void directSpringMustNotLeakMismatchedStaticVerificationKey() throws Exception {
        mvc.perform(get("/.well-known/indexnow.key"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(content().string(not(containsString("8f7b3c2e1a9d4f6b8c0e2a4d6f8a0b2c"))));
        mvc.perform(get("/api/v1/seo/indexnow-key"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(content().string(not(containsString("8f7b3c2e1a9d4f6b8c0e2a4d6f8a0b2c"))));
    }
}
