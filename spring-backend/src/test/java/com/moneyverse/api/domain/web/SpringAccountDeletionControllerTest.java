package com.moneyverse.api.domain.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "moneyverse.web.account-deletion-preview-enabled=true")
@ActiveProfiles("test")
@AutoConfigureMockMvc
class SpringAccountDeletionControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void englishPreviewIsServerRenderedWithoutAccountMutation() throws Exception {
        mvc.perform(get("/spring-web/account-deletion"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/html"))
                .andExpect(content().string(containsString("<html lang=\"en\"")))
                .andExpect(content().string(containsString("Account deletion request")))
                .andExpect(content().string(containsString("within 30 days")))
                .andExpect(content().string(containsString("for up to one year")))
                .andExpect(content().string(containsString("href=\"/account\"")))
                .andExpect(content().string(containsString("href=\"/privacy\"")))
                .andExpect(content().string(not(containsString("<form"))))
                .andExpect(content().string(not(containsString("<script"))));
    }

    @Test
    void koreanPreviewPreservesExistingNextPolicyAndWorksAtMobileWidth() throws Exception {
        mvc.perform(get("/spring-web/account-deletion?lang=ko"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("<html lang=\"ko\"")))
                .andExpect(content().string(containsString("계정 삭제 요청 방법")))
                .andExpect(content().string(containsString("30일 이내 삭제")))
                .andExpect(content().string(containsString("최대 1년 보관")))
                .andExpect(content().string(containsString("탈퇴 후 3년")))
                .andExpect(content().string(containsString("90일")))
                .andExpect(content().string(containsString("비밀번호, 인증번호, 세션 토큰")))
                .andExpect(content().string(containsString("width=device-width,initial-scale=1")))
                .andExpect(content().string(containsString("href=\"#main\"")));
    }

    @Test
    void previewHasPrivateIndexingAndContentSecurityProtections() throws Exception {
        mvc.perform(get("/spring-web/account-deletion"))
                .andExpect(header().string("X-Robots-Tag", "noindex, nofollow"))
                .andExpect(header().string("Cache-Control", "private, no-store"))
                .andExpect(header().string("Referrer-Policy", "no-referrer"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Content-Security-Policy",
                        "default-src 'none'; style-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'none'"));
    }

    @Test
    void unknownLocaleCannotInjectHtmlAndFallsBackToEnglish() throws Exception {
        mvc.perform(get("/spring-web/account-deletion")
                        .param("lang", "<img src=x onerror=alert(1)>"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("<html lang=\"en\"")))
                .andExpect(content().string(not(containsString("<img src=x onerror=alert(1)>"))));
    }
}
