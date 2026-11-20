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
    @Test void registrationServerLabelRetainsItsActualMinimumPasswordCopy() throws Exception {
        mvc.perform(get("/register").header("Accept-Language","ko"))
            .andExpect(status().isOk())
            .andExpect(content().string(containsString("data-i18n=\"authRegisterPassword\">비밀번호 (8자 이상)</label>")));
    }
}
