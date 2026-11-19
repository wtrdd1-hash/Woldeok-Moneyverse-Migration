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
class SpringNativeToolHubTest {
    @Autowired MockMvc mvc;

    @Test void toolsNativeEnglishIsRealSpringHtmlAndIncludesAllSeventeenLegacySourceLinks() throws Exception {
        mvc.perform(get("/tools"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-MV-UI-Release", "v2026.11.19.30.1-spring-tools"))
                .andExpect(content().string(containsString("data-spring-page=\"tools-hub\"")))
                .andExpect(content().string(containsString("<html lang=\"en\"")))
                .andExpect(content().string(containsString("data-total-tools=\"17\"")))
                .andExpect(content().string(containsString("application/ld+json")))
                .andExpect(content().string(containsString("href=\"/tools/stock-calculator\"")))
                .andExpect(content().string(containsString("href=\"/tools/compound-calculator\"")))
                .andExpect(content().string(not(containsString("/_next/static/"))))
                .andExpect(content().string(not(containsString("__next_f"))));
    }

    @Test void calculatorsNativeKoreanSharesRealServerIndexNotReactRsc() throws Exception {
        mvc.perform(get("/calculators").param("lang","ko"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("lang=\"ko\"")))
                .andExpect(content().string(containsString("data-spring-page=\"calculators-hub\"")))
                .andExpect(content().string(containsString("data-total-tools=\"17\"")))
                .andExpect(content().string(containsString("복리 계산기")));
    }

    @Test void searchableFilteredServerRenderIsFunctionalWithNoJavaScript() throws Exception {
        mvc.perform(get("/tools").param("q","compound interest"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("data-results=\"1\"")))
                .andExpect(content().string(containsString("href=\"/tools/compound-calculator\"")))
                .andExpect(content().string(not(containsString("href=\"/tools/stock-calculator\""))));
        mvc.perform(get("/calculators").param("q","주식").param("lang","ko"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("data-results=\"2\"")));
        mvc.perform(get("/tools").param("category","retirement"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("data-results=\"3\"")));
    }

    @Test void maliciousAndOverlongQueriesCannotInjectOrClaimWorkingTools() throws Exception {
        mvc.perform(get("/tools").param("q","<script>alert(1)</script>"))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString("<script>alert(1)</script>"))))
                .andExpect(content().string(containsString("data-results=\"0\"")));
        mvc.perform(get("/tools").param("q","X".repeat(110)))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/calculators").param("category","forged"))
                .andExpect(status().isBadRequest());
    }

    @Test void nativeGetHubsRefuseNextFlightHtmlAndDoNotPretendLegacyIsVerified() throws Exception {
        mvc.perform(get("/tools").header("RSC","1").header("Accept","text/x-component"))
                .andExpect(status().isNotAcceptable());
        mvc.perform(get("/calculators").param("_rsc","oldNextBundle"))
                .andExpect(status().isNotAcceptable());
        mvc.perform(get("/tools"))
                .andExpect(content().string(containsString("data-status=\"legacy\"")))
                .andExpect(content().string(containsString("data-status=\"spring-verified\"")));
    }
}
