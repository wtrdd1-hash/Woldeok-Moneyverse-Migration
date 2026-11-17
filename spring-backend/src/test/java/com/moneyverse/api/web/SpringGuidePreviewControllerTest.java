package com.moneyverse.api.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = SpringGuidePreviewController.class)
@AutoConfigureMockMvc(addFilters = false)
class SpringGuidePreviewControllerTest {
    @Autowired MockMvc mockMvc;

    @Test
    void englishPreviewIsRealHtmlNotAnEmptySpaAndIsNotIndexed() throws Exception {
        mockMvc.perform(get("/spring-ui/guide"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/html"))
                .andExpect(header().string("X-Robots-Tag", "noindex, nofollow"))
                .andExpect(header().string("Cache-Control", "no-store, private"))
                .andExpect(header().string("Content-Security-Policy", containsString("default-src 'none'")))
                .andExpect(content().string(containsString("Explore Woldeok Moneyverse")))
                .andExpect(content().string(containsString("/work")))
                .andExpect(content().string(containsString("/privacy")));
    }

    @Test
    void koreanPreviewIsLocalizedAndHasNoInternalTechBanner() throws Exception {
        mockMvc.perform(get("/spring-ui/guide").param("lang", "ko"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("<html lang=\"ko\">")))
                .andExpect(content().string(containsString("머니버스에서 할 수 있는 일")))
                .andExpect(content().string(containsString("서비스 내 가상 데이터")));
    }

    @Test
    void unsupportedLanguageDoesNotReflectQueryIntoHtml() throws Exception {
        mockMvc.perform(get("/spring-ui/guide").param("lang", "<script>alert(1)</script>"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Explore Woldeok Moneyverse")));
    }
}
