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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Public legal text must be real Java/Thymeleaf SSR, not the 475-byte SPA loader. */
@SpringBootTest(properties = {"moneyverse.web.spring-policy-enabled=true",
        "moneyverse.web.account-deletion-canonical-enabled=true",
        "moneyverse.web.account-deletion-preview-enabled=true"})
@ActiveProfiles("test")
@AutoConfigureMockMvc
class SpringPublicPolicyControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void englishTermsPreservesFullSourceIncludingVirtualMoneyAgeAndContact() throws Exception {
        mvc.perform(get("/terms?lang=en"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/html"))
                .andExpect(content().string(containsString("<html lang=\"en\"")))
                .andExpect(content().string(containsString("Article 1 (Purpose & Scope)")))
                .andExpect(content().string(containsString("at least 14 years old")))
                .andExpect(content().string(containsString("Virtual Economy Notice")))
                .andExpect(content().string(containsString("2026-09-02")))
                .andExpect(content().string(containsString("mailto:jungchwimisaenghwal63@gmail.com")))
                .andExpect(content().string(containsString("href=\"https://easy-scraping.com/terms\"")))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(content().string(not(containsString("페이지를 불러오는 중입니다"))));
    }

    @Test
    void koreanTermsDoesNotDropArticlesSixThroughEight() throws Exception {
        mvc.perform(get("/terms?lang=ko"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("<html lang=\"ko\"")))
                .andExpect(content().string(containsString("제6조 서비스 변경과 중단")))
                .andExpect(content().string(containsString("제7조 약관의 변경")))
                .andExpect(content().string(containsString("제8조 탈퇴, 책임과 문의")))
                .andExpect(content().string(containsString("만 14세 이상")))
                .andExpect(content().string(containsString("2026-09-02")));
    }

    @Test
    void englishPrivacyKeepsSourceDisclosureAndStructuredTable() throws Exception {
        mvc.perform(get("/privacy"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("<html lang=\"en\"")))
                .andExpect(content().string(containsString("OAuth Login")))
                .andExpect(content().string(containsString("Virtual Ledger")))
                .andExpect(content().string(containsString("Security Audit")))
                .andExpect(content().string(containsString("href=\"https://easy-scraping.com/privacy\"")))
                .andExpect(content().string(containsString("Personal Data Table")))
                .andExpect(header().string("Cache-Control", "public, max-age=60"));
    }

    @Test
    void koreanPrivacyKeepsAllSixDataCategoriesAndRights() throws Exception {
        mvc.perform(get("/privacy?lang=ko"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("<html lang=\"ko\"")))
                .andExpect(content().string(containsString("프로필·갤러리 사진")))
                .andExpect(content().string(containsString("실시간 로비")))
                .andExpect(content().string(containsString("정책 확인")))
                .andExpect(content().string(containsString("탈퇴 후 3년")))
                .andExpect(content().string(containsString("개인정보 보호책임자")));
    }

    @Test
    void languageInjectionDoesNotEscapeHtmlOrAllowUnboundedLocale() throws Exception {
        mvc.perform(get("/terms?lang=%3Cscript%3Ealert(1)%3C%2Fscript%3E"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("<html lang=\"en\"")))
                .andExpect(content().string(not(containsString("<script>alert(1)</script>"))));
    }

    @Test
    void canonicalAccountDeletionIsLivePolicyNotPreview() throws Exception {
        mvc.perform(get("/account-deletion?lang=ko"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("계정 삭제 요청 방법")))
                .andExpect(content().string(containsString("href=\"https://easy-scraping.com/account-deletion\"")))
                .andExpect(content().string(containsString("탈퇴 후 3년")))
                .andExpect(content().string(not(containsString("Spring 웹 전환 미리보기"))))
                .andExpect(header().string("Cache-Control", "private, no-store"));
    }

    @Test
    void strictCspKeepsMailtoFunctionalWithoutCloudflareDecoderJavascript() throws Exception {
        for (String path : new String[]{"/terms?lang=en", "/terms?lang=ko", "/privacy?lang=en",
                "/privacy?lang=ko", "/account-deletion?lang=en", "/account-deletion?lang=ko",
                "/spring-web/account-deletion?lang=ko"}) {
            mvc.perform(get(path))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("<!--email_off-->")))
                    .andExpect(content().string(containsString("<!--/email_off-->")))
                    .andExpect(content().string(containsString("mailto:jungchwimisaenghwal63@gmail.com")))
                    .andExpect(content().string(not(containsString("<script"))))
                    .andExpect(header().string("Content-Security-Policy", containsString("default-src 'none'")));
        }
    }

    @Test
    void previewStaysNoindexedAfterCanonicalRouteAdded() throws Exception {
        mvc.perform(get("/spring-web/account-deletion?lang=ko"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Robots-Tag", "noindex, nofollow"))
                .andExpect(content().string(containsString("Spring 웹 전환 미리보기")));
    }
}
