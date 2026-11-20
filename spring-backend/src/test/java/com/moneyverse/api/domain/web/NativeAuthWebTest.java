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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test")
class NativeAuthWebTest {
    @Autowired MockMvc mvc;
    private static final String[] PAGES={"login","register","forgot-password","reset-password","verify-email","verify-email-change","account-deletion"};
    @ParameterizedTest @ValueSource(strings={"en","ko","ja","zh","vi"})
    void nativeAuthFamilyUsesNegotiatedLocalePrivateCacheAndSharedChrome(String language) throws Exception {
        for(String page:PAGES) mvc.perform(get("/"+page).cookie(new Cookie("wdmv_locale",language)).header("Accept-Language","en"))
            .andExpect(status().isOk()).andExpect(view().name("mv43/auth"))
            .andExpect(header().string("Content-Language",language))
            .andExpect(header().string("Cache-Control",containsString("no-store")))
            .andExpect(header().string("X-Robots-Tag",containsString("noindex")))
            .andExpect(header().string("Content-Security-Policy",containsString("form-action 'self'")))
            .andExpect(content().string(containsString("id=\"mv-support-panel\"")))
            .andExpect(content().string(containsString("data-auth-page=\""+page+"\"")))
            .andExpect(content().string(not(containsString("/_next/"))));
    }
    @Test void allPublicAliasesUseNativeHtmlWithoutReflectingUntrustedTokenOrNext() throws Exception {
        for(String page:PAGES) for(String suffix:new String[]{"/",".html","/index.html"})
            mvc.perform(get("/"+page+suffix).param("token","ci_do_not_reflect").param("next","https://untrusted.invalid"))
                .andExpect(status().isOk()).andExpect(view().name("mv43/auth"))
                .andExpect(content().string(not(containsString("ci_do_not_reflect"))))
                .andExpect(content().string(not(containsString("https://untrusted.invalid"))));
        mvc.perform(get("/login/providers")).andExpect(status().isOk()).andExpect(view().name("mv43/auth"));
    }
    @Test void activeFormsKeepActualFieldsAndUncheckedLegalAcknowledgements() throws Exception {
        for(String page:new String[]{"login","register"}) mvc.perform(get("/"+page))
            .andExpect(content().string(containsString("name=\"email\"")))
            .andExpect(content().string(containsString("name=\"password\"")))
            .andExpect(content().string(containsString("name=\"terms\"")))
            .andExpect(content().string(containsString("name=\"privacy\"")))
            .andExpect(content().string(containsString("name=\"age\"")))
            .andExpect(content().string(not(containsString("checked="))))
            .andExpect(content().string(containsString("href=\"/terms\"")))
            .andExpect(content().string(containsString("href=\"/privacy\"")));
        mvc.perform(get("/register")).andExpect(content().string(containsString("name=\"displayName\"")))
            .andExpect(content().string(containsString("id=\"auth-submit\" type=\"submit\" disabled")))
            .andExpect(content().string(containsString("data-i18n=\"authRegistrationUnavailable\"")));
        mvc.perform(get("/login")).andExpect(content().string(containsString("href=\"/auth/discord/authorize\"")));
    }
    @Test void missingActionsRenderUnavailableWithoutFormOrTokenReflection() throws Exception {
        for(String page:new String[]{"forgot-password","reset-password","verify-email","verify-email-change","account-deletion"})
            mvc.perform(get("/"+page).param("token","ci_private_value"))
                .andExpect(content().string(containsString("data-i18n=\"authUnavailable\"")))
                .andExpect(content().string(not(containsString("id=\"native-auth-form\""))))
                .andExpect(content().string(not(containsString("ci_private_value"))));
    }
    @Test void apiAndFlightRequestsNeverReceiveAuthHtmlAndLoginPostsRemainOwned() throws Exception {
        mvc.perform(get("/api/v1/auth/local/login").accept("text/html")).andExpect(status().isMethodNotAllowed());
        mvc.perform(get("/login").header("RSC","1")).andExpect(status().isNotAcceptable());
        mvc.perform(get("/register").param("_rsc","ci_fixture")).andExpect(status().isNotAcceptable());
        mvc.perform(post("/login").contentType("application/json").content("{}"))
            .andExpect(status().isBadRequest()).andExpect(content().contentTypeCompatibleWith("application/json"));
        mvc.perform(post("/login").contentType("application/x-www-form-urlencoded"))
            .andExpect(status().isFound()).andExpect(redirectedUrl("/login?error=missing_credentials"));
    }
}
