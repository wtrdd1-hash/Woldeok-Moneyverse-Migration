package com.moneyverse.api.domain.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SpringWebControllerTest {
    @Autowired MockMvc mvc;
    @MockBean SpringStatusReader reader;

    @Test
    void rendersEnglishServerSideHtmlAndPrivateHeaders() throws Exception {
        when(reader.read()).thenReturn(List.of(
                new SpringStatusReader.StatusRow("database", "Database", "operational", null, "2026-11-17T00:00:00Z")));
        mvc.perform(get("/spring-web/status"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/html"))
                .andExpect(header().string("X-Robots-Tag", "noindex, nofollow"))
                .andExpect(header().string("Cache-Control", "private, no-store"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("<html lang=\"en\"")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Database")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Operational")));
    }

    @Test
    void rendersKoreanAsSecondLanguageWithoutDynamicHtmlExecution() throws Exception {
        when(reader.read()).thenReturn(List.of(
                new SpringStatusReader.StatusRow("site", "<img src=x onerror=alert(1)>", "degraded", null, null)));
        mvc.perform(get("/spring-web/status?lang=ko"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("<html lang=\"ko\"")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("서비스 상태")))
                .andExpect(content().string(org.hamcrest.Matchers.not(
                        org.hamcrest.Matchers.containsString("<img src=x onerror=alert(1)>"))));
    }

    @Test
    void failsClosedWhenStatusAuthorityIsUnavailable() throws Exception {
        when(reader.read()).thenThrow(new org.springframework.dao.DataAccessResourceFailureException("DB secret detail"));
        mvc.perform(get("/spring-web/status"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(header().string("X-Robots-Tag", "noindex, nofollow"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Status unavailable")))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("DB secret detail"))));
    }

    @Test
    void invalidLocaleDefaultsToEnglishAndLandingIsRendered() throws Exception {
        mvc.perform(get("/spring-web?lang=es"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/html"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("<html lang=\"en\"")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Woldeok Moneyverse")));
    }
}
