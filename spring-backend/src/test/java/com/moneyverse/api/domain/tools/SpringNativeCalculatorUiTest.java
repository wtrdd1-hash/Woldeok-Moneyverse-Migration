package com.moneyverse.api.domain.tools;

import org.junit.jupiter.api.Test;
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
class SpringNativeCalculatorUiTest {
    @Autowired MockMvc mvc;

    @Test void compoundDefaultIsSpringRenderedModernFormWithNoReactHydration() throws Exception {
        mvc.perform(get("/tools/compound-calculator"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-MV-UI-Release", "v2026.11.18.28.1-spring-ssr"))
                .andExpect(content().string(containsString("<html lang=\"en\"")))
                .andExpect(content().string(containsString("data-spring-page=\"compound\"")))
                .andExpect(content().string(containsString("<form")))
                .andExpect(content().string(containsString("name=\"principal\"")))
                .andExpect(content().string(containsString("data-testid=\"total-final\"")))
                .andExpect(content().string(not(containsString("/_next/static/"))))
                .andExpect(content().string(not(containsString("__next_f"))));
    }

    @Test void compoundHasVerifiedZeroRateNoInterestAndKoreanLocale() throws Exception {
        mvc.perform(get("/tools/compound-calculator")
                .param("lang", "ko").param("principal", "1000").param("monthlyDeposit", "100")
                .param("annualRate", "0").param("years", "2").param("frequency", "monthly"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("lang=\"ko\"")))
                .andExpect(content().string(containsString("3,400")))
                .andExpect(content().string(containsString("복리 계산기")));
    }

    @Test void stockAverageAndTargetStayCompatibleWithExistingNextFormula() throws Exception {
        mvc.perform(get("/tools/stock-calculator")
                .param("initialPrice", "50").param("initialQuantity", "100")
                .param("additionalPrice", "40").param("additionalQuantity", "150")
                .param("targetProfitPercent", "15").param("feeRate", "0.05"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("data-spring-page=\"stock-calculator\"")))
                .andExpect(content().string(containsString("44")))
                .andExpect(content().string(containsString("250")))
                .andExpect(content().string(not(containsString("/_next/static/"))));
    }

    @Test void invalidInputsDoNotBecomeFakeSuccessOrStoredFinance() throws Exception {
        mvc.perform(get("/tools/compound-calculator").param("principal", "-5"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("role=\"alert\"")));
        mvc.perform(get("/tools/stock-calculator").param("feeRate", "100"))
                .andExpect(status().isBadRequest());
    }

    @Test void serverWillNotReturnHtmlAsNextFlight() throws Exception {
        mvc.perform(get("/tools/compound-calculator").header("RSC", "1").header("Accept", "text/x-component"))
                .andExpect(status().isNotAcceptable());
    }
}
