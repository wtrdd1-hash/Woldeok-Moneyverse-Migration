package com.moneyverse.api.domain.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StatusSourceTruthIntegrationTest {
    @Autowired MockMvc mvc;

    @Test void missingPostgresqlSourceInH2Returns503NotInventedGreen() throws Exception {
        mvc.perform(get("/api/v1/status")).andExpect(status().isServiceUnavailable());
        mvc.perform(get("/status")).andExpect(status().isServiceUnavailable());
    }

    @Test void nonSupportedNextFlightNeverClaimsSuccessfulHtml() throws Exception {
        mvc.perform(get("/status").header("RSC","1").header("Accept","text/x-component"))
                .andExpect(status().isNotAcceptable());
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(strings={"en","ko","ja","zh","vi"})
    void unavailableStatusRetainsLocalizedNativeNavigationAndHonestHttp503(String language) throws Exception {
        String html=mvc.perform(get("/status").header("Accept-Language",language))
            .andExpect(status().isServiceUnavailable())
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Cache-Control","no-store"))
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Language",language))
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content().contentTypeCompatibleWith("text/html"))
            .andReturn().getResponse().getContentAsString();
        org.junit.jupiter.api.Assertions.assertTrue(html.contains("lang=\""+language+"\""));
        org.junit.jupiter.api.Assertions.assertTrue(html.contains("id=\"mv-support-launcher\""));
        org.junit.jupiter.api.Assertions.assertTrue(html.contains("data-i18n=\"unavailable\""));
        org.junit.jupiter.api.Assertions.assertFalse(html.contains("Whitelabel Error Page"));
        org.junit.jupiter.api.Assertions.assertFalse(html.contains("state-operational"));
        org.junit.jupiter.api.Assertions.assertFalse(html.contains("STATUS_SOURCE_UNAVAILABLE"));
    }
}
