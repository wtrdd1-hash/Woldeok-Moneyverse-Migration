package com.moneyverse.api.domain.web;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NativeHomeWebTest {
    @Autowired MockMvc mvc;
    @ParameterizedTest @ValueSource(strings={"en","ko","ja","zh","vi"})
    void rendersNativeTemplateInAllSupportedLanguages(String code) throws Exception {
        mvc.perform(get("/").header("Accept-Language", code))
            .andExpect(status().isOk()).andExpect(view().name("mv43/home"))
            .andExpect(header().string("X-MV-Renderer", "Spring-MVC-Thymeleaf"))
            .andExpect(header().string("Content-Language", code))
            .andExpect(content().string(containsString("lang=\"" + code + "\"")))
            .andExpect(content().string(containsString("id=\"mv-support-panel\"")))
            .andExpect(content().string(not(containsString("100,000,000,000,000"))))
            .andExpect(content().string(not(containsString("/_next/"))));
    }
    @Test void savedManualPreferenceBeatsAutomaticHeader() throws Exception {
        mvc.perform(get("/").cookie(new Cookie("wdmv_locale","ko")).header("Accept-Language","vi"))
            .andExpect(header().string("Content-Language","ko"))
            .andExpect(content().string(containsString("내 자산")));
    }
    @Test void unsupportedAndMalformedLanguagesUseEnglishAndZeroWeightIsNotSelected() throws Exception {
        for (String value : new String[]{"fr, de;q=0.8", "ko;q=0,en;q=1", "not-valid;q=broken"}) {
            mvc.perform(get("/").header("Accept-Language", value))
                .andExpect(status().isOk()).andExpect(header().string("Content-Language","en"));
        }
    }
    @Test void unavailableCookieCannotOverrideSupportedRegionHeader() throws Exception {
        mvc.perform(get("/index.html").cookie(new Cookie("wdmv_locale","unsupported")).header("Accept-Language","ja-JP, en;q=0.8"))
            .andExpect(status().isOk()).andExpect(view().name("mv43/home"))
            .andExpect(header().string("Content-Language","ja"));
    }
    @Test void homepageCannotPretendToBeNextFlight() throws Exception {
        mvc.perform(get("/").header("RSC","1")).andExpect(status().isNotAcceptable());
    }
    @Test void localeVariantsCannotShareAnUnkeyedCacheEntry() throws Exception {
        mvc.perform(get("/")).andExpect(header().string("Cache-Control", containsString("no-store")))
            .andExpect(header().string("Vary", allOf(containsString("Cookie"),containsString("Accept-Language"))));
    }
}
