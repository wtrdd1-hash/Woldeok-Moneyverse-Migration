package com.moneyverse.api.domain.web;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Optional;
import java.util.UUID;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test")
class NativeMessagingWebTest {
    @Autowired MockMvc mvc;
    @Autowired UiLocale locale;
    @MockBean UserAuthService auth;
    private void signedIn() {
        var session=new UserAuthService.SessionInfo();
        session.setUserId(UUID.fromString("00000000-0000-0000-0000-000000000101"));
        when(auth.resolveSession(any())).thenReturn(Optional.of(session));
    }
    @ParameterizedTest @ValueSource(strings={"support","chat"})
    void guestAndForgedHeadersDoNotEnterPrivatePages(String family) throws Exception {
        when(auth.resolveSession(any())).thenReturn(Optional.empty());
        for(String suffix:new String[]{"","/",".html","/index.html"}) {
            mvc.perform(get("/"+family+suffix).header("X-User-Id",UUID.randomUUID().toString())
                .header("x-actor-user-id",UUID.randomUUID().toString()))
                .andExpect(status().isFound()).andExpect(redirectedUrl("/login?next=%2F"+family))
                .andExpect(header().string("Cache-Control",containsString("no-store")));
        }
    }
    @ParameterizedTest @ValueSource(strings={"en","ko","ja","zh","vi"})
    void nativeMessagingHasFiveLocalesPrivateHeadersAndSingularChrome(String code) throws Exception {
        signedIn();
        for(String family:new String[]{"support","chat"}) {
            for(String suffix:new String[]{"","/",".html","/index.html"}) {
                String html=mvc.perform(get("/"+family+suffix).cookie(new Cookie("wdmv_locale",code))
                    .header("Accept-Language","en").param("lang","vi"))
                    .andExpect(status().isOk()).andExpect(view().name("mv43/"+family))
                    .andExpect(header().string("Content-Language",code))
                    .andExpect(header().string("Cache-Control",containsString("no-store")))
                    .andExpect(header().string("X-Robots-Tag",containsString("noindex")))
                    .andExpect(header().string("X-MV-Renderer","Spring-MVC-Thymeleaf"))
                    .andExpect(content().string(not(containsString("/_next/"))))
                    .andExpect(content().string(containsString("id=\"messaging-root\"")))
                    .andExpect(content().string(containsString("id=\"message-form\"")))
                    .andExpect(content().string(containsString("id=\"message-body\"")))
                    .andExpect(content().string(containsString("id=\"message-history\"")))
                    .andReturn().getResponse().getContentAsString();
                org.junit.jupiter.api.Assertions.assertEquals(1,html.split("id=\"mv-support-launcher\"",-1).length-1);
                org.junit.jupiter.api.Assertions.assertEquals(1,html.split("id=\"mv-support-heading\"",-1).length-1);
                org.junit.jupiter.api.Assertions.assertTrue(html.contains(locale.labels(code).get("msg"+(family.equals("support")?"Support":"Chat"))));
                org.junit.jupiter.api.Assertions.assertFalse(html.contains("maxlength=\"1000\""));
            }
        }
    }
    @Test void originalControlsAndUnsupportedActionsStayVisible() throws Exception {
        signedIn();
        var support=mvc.perform(get("/support")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        for(String id:new String[]{"new-thread-form","support-subject","support-body","support-search","support-status","support-order","support-date-from","support-date-to","support-export-csv","support-export-txt","support-summary"})
            org.junit.jupiter.api.Assertions.assertTrue(support.contains("id=\""+id+"\""),id);
        var chat=mvc.perform(get("/chat")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        for(String id:new String[]{"chat-new","chat-archived","chat-archive","chat-mute","chat-block","chat-unblock","chat-report","chat-upload","chat-back","chat-search"})
            org.junit.jupiter.api.Assertions.assertTrue(chat.contains("id=\""+id+"\""),id);
    }
    @ParameterizedTest @ValueSource(strings={"support","chat"})
    void flightRequestsAreRefusedAndBrowserLanguageResolves(String family) throws Exception {
        signedIn();
        mvc.perform(get("/"+family).header("RSC","1")).andExpect(status().isNotAcceptable());
        mvc.perform(get("/"+family).param("_rsc","opaque")).andExpect(status().isNotAcceptable());
        mvc.perform(get("/"+family).header("Accept-Language","fr;q=1,ja;q=0.8"))
            .andExpect(status().isOk()).andExpect(header().string("Content-Language","ja"));
    }
}
