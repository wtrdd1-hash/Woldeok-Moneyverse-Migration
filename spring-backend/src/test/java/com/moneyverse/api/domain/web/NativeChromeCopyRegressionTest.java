package com.moneyverse.api.domain.web;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NativeChromeCopyRegressionTest {
    @Autowired MockMvc mvc;
    @ParameterizedTest @CsvSource({"en,Log in","ko,로그인","ja,ログイン","zh,登录","vi,Đăng nhập"})
    void serverRenderedPageHeaderAndDocumentTitleUseTheActualPageKey(String language,String title) throws Exception {
        mvc.perform(get("/login").header("Accept-Language",language))
            .andExpect(status().isOk())
            .andExpect(content().string(containsString("<title>"+title+" · W Moneyverse</title>")))
            .andExpect(content().string(containsString("<h1 data-i18n=\"login\">"+title+"</h1>")));
    }
    @ParameterizedTest @org.junit.jupiter.params.provider.ValueSource(strings={"/","/login","/register"})
    void headerFragmentDoesNotDuplicateTheHiddenSupportHeading(String path) throws Exception {
        String html=mvc.perform(get(path)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        org.junit.jupiter.api.Assertions.assertEquals(1,java.util.regex.Pattern.compile("id=\\\"mv-support-heading\\\"").matcher(html).results().count(),
            "The support heading belongs only to the single hidden dialog");
        org.junit.jupiter.api.Assertions.assertEquals(1,java.util.regex.Pattern.compile("class=\\\"topbar\\\"").matcher(html).results().count());
    }
    @Test void registrationServerLabelRetainsItsActualMinimumPasswordCopy() throws Exception {
        mvc.perform(get("/register").header("Accept-Language","ko"))
            .andExpect(status().isOk())
            .andExpect(content().string(containsString("data-i18n=\"authRegisterPassword\">비밀번호 (8자 이상)</label>")));
    }

    @ParameterizedTest
    @CsvSource({
        "en,Menu,Close,Terms,Privacy,Skip to main content",
        "ko,메뉴,닫기,이용약관,개인정보처리방침,본문으로 건너뛰기",
        "ja,メニュー,閉じる,利用規約,プライバシー,本文へスキップ",
        "zh,菜单,关闭,服务条款,隐私政策,跳转到主要内容",
        "vi,Trình đơn,Đóng,Điều khoản,Quyền riêng tư,Chuyển đến nội dung chính"
    })
    void sharedNavigationAndFooterUseTheNegotiatedLanguage(
            String language, String menu, String close, String terms, String privacy, String skip) throws Exception {
        String html = mvc.perform(get("/").header("Accept-Language", language))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        org.junit.jupiter.api.Assertions.assertTrue(html.contains("data-i18n-aria=\"menu\"") && html.contains("aria-label=\"" + menu + "\""));
        org.junit.jupiter.api.Assertions.assertTrue(html.contains("data-i18n-aria=\"close\"") && html.contains("aria-label=\"" + close + "\""));
        org.junit.jupiter.api.Assertions.assertTrue(html.contains("data-i18n=\"authTermsLink\">" + terms + "</a>"));
        org.junit.jupiter.api.Assertions.assertTrue(html.contains("data-i18n=\"authPrivacyLink\">" + privacy + "</a>"));
        org.junit.jupiter.api.Assertions.assertTrue(html.contains("data-i18n=\"authSkip\">" + skip + "</a>"));
    }
}
