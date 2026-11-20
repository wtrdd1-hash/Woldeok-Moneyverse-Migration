package com.moneyverse.api.domain.tools;

import com.moneyverse.api.domain.status.StatusSourceTruthPolicy;
import com.moneyverse.api.domain.status.StatusTruthService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.params.provider.Arguments;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NativePublicChromeTest {
    @Autowired MockMvc mvc;
    // PostgreSQL collector query cannot execute in H2; only that external boundary is replaced.
    @MockBean StatusTruthService collector;

    @BeforeEach void records() {
        when(collector.publicStatus()).thenReturn(new StatusSourceTruthPolicy.StatusResponse(List.of(
                new StatusSourceTruthPolicy.StatusRow("web","Public web","unknown",null,
                        "2026-11-18T00:00:00.000Z","stale",172800000L,"status-v1"))));
    }

    static Stream<Arguments> localizedRoutes() {
        return Stream.of("/tools","/calculators","/tools/compound-calculator","/tools/stock-calculator","/status")
                .flatMap(path -> Stream.of("en","ko","ja","zh","vi").map(lang -> Arguments.of(path,lang)));
    }

    @ParameterizedTest @MethodSource("localizedRoutes")
    void everyNativeRouteUsesOneSharedLauncherAndNegotiatedLocale(String path,String lang) throws Exception {
        String html=mvc.perform(get(path).header("Accept-Language",lang))
                .andExpect(status().isOk()).andExpect(header().string("Content-Language",lang))
                .andExpect(model().attribute("uiLanguage",lang))
                .andReturn().getResponse().getContentAsString();
        assertTrue(html.contains("data-ui-language=\""+lang+"\""));
        assertTrue(html.contains("id=\"language-selector\""));
        assertEquals(1,html.split("id=\"mv-support-launcher\"", -1).length-1);
        assertFalse(html.contains("floating-help"));
        assertFalse(html.contains("/_next/"));
        assertFalse(html.contains("__next_f"));
        assertTrue(html.contains("/assets/mv43/public.js"));
        assertFalse(html.contains("th:text"));
    }

    @ParameterizedTest @MethodSource("nativeRoutes")
    void savedManualPreferenceWinsOverQueryAndBrowser(String path) throws Exception {
        mvc.perform(get(path).cookie(new Cookie("wdmv_locale","vi")).param("lang","ko").header("Accept-Language","ja"))
                .andExpect(status().isOk()).andExpect(header().string("Content-Language","vi"));
    }
    static Stream<String> nativeRoutes() {return Stream.of("/tools","/calculators","/tools/compound-calculator","/tools/stock-calculator","/status");}

    @Test void compoundRetainsExactInputsMetricsMilestonesAndFrequency() throws Exception {
        String html=mvc.perform(get("/tools/compound-calculator").param("principal","1000").param("monthlyDeposit","100")
                        .param("annualRate","0").param("years","2").param("frequency","daily").header("Accept-Language","ja"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        for(String field:List.of("principal","monthlyDeposit","annualRate","years","frequency"))
            assertTrue(html.contains("name=\""+field+"\""));
        assertTrue(html.contains("value=\"daily\" selected=\"selected\""));
        assertTrue(html.contains(">3,400</strong>"));
        assertTrue(html.contains("data-testid=\"total-deposit\""));
        assertTrue(html.contains("<td>2,200</td>"));
        assertTrue(html.contains("data-i18n=\"publicPrincipal\""));
        assertFalse(html.contains("function recalculate"),"Only authoritative server math may replace the submitted result");
    }

    @Test void stockRetainsExactFieldsAndServerValuesInOtherLocales() throws Exception {
        String html=mvc.perform(get("/tools/stock-calculator").param("initialPrice","50").param("initialQuantity","100")
                        .param("additionalPrice","40").param("additionalQuantity","150").param("targetProfitPercent","15").param("feeRate","0.05")
                        .header("Accept-Language","zh"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        for(String field:List.of("initialPrice","initialQuantity","additionalPrice","additionalQuantity","targetProfitPercent","feeRate"))
            assertTrue(html.contains("name=\""+field+"\""));
        for(String value:List.of("44","250","11,000","50.63"))assertTrue(html.contains(">"+value+"</strong>"));
        assertTrue(html.contains("data-i18n=\"publicInitialPurchase\""));
    }

    @Test void invalidCalculatorInputRemainsVisibleWithoutResults() throws Exception {
        String html=mvc.perform(get("/tools/compound-calculator").param("principal","-5").header("Accept-Language","vi"))
                .andExpect(status().isBadRequest()).andExpect(header().string("Content-Language","vi"))
                .andReturn().getResponse().getContentAsString();
        assertTrue(html.contains("role=\"alert\""));
        assertTrue(html.contains("value=\"-5\""));
        assertFalse(html.contains("data-testid=\"total-final\""));
        assertTrue(html.contains("data-i18n=\"publicInputError\""));
    }

    @Test void hubKeepsAllSeventeenDestinationsAndNativeOnlyFilter() throws Exception {
        String html=mvc.perform(get("/calculators").header("Accept-Language","ko"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        for(String id:List.of("stock-calculator","compound-calculator","dividend-tax-calculator","capital-gains-tax-calculator",
                "salary-calculator","isa-calculator","pension-tax-calculator","fire-calculator","retirement-calculator",
                "tax-calculator","gift-tax-calculator","loan-interest-calculator","real-estate-calculator",
                "youth-leap-calculator","kimchi-premium-calculator","crypto-apy-calculator","farming-calculator"))
            assertTrue(html.contains("href=\"/tools/"+id+"\""));
        assertEquals(15,html.split("data-status=\"legacy\"", -1).length-1);
        assertEquals(2,html.split("data-status=\"spring-verified\"", -1).length-1);
        mvc.perform(get("/tools").param("q","compound").param("category","investing").param("verified","true"))
                .andExpect(status().isOk()).andExpect(model().attribute("resultCount",1));
    }

    @Test void staleStatusKeepsSourceIdentityAndNeverBecomesHealthy() throws Exception {
        String html=mvc.perform(get("/status").header("Accept-Language","vi"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertTrue(html.contains("Public web"));assertTrue(html.contains("2026-11-18T00:00:00.000Z"));
        assertTrue(html.contains("state-unknown"));assertFalse(html.contains("state-operational"));
        assertTrue(html.contains("data-i18n=\"publicFreshnessStale\""));
        when(collector.publicStatus()).thenReturn(new StatusSourceTruthPolicy.StatusResponse(List.of()));
        String empty=mvc.perform(get("/status")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertTrue(empty.contains("No public source observations are registered. Current health is unknown."));
    }
}
