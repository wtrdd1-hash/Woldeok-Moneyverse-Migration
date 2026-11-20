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
        assertEquals(1,java.util.regex.Pattern.compile("id=\"mv-support-heading\"").matcher(html).results().count(),"Only the closed support dialog owns its heading");
        var titles=java.util.Map.of(
                "/tools",List.of("Financial tools","금융 도구","金融ツール","金融工具","Công cụ tài chính"),
                "/calculators",List.of("Calculator center","금융 계산기 센터","金融計算機センター","金融计算器中心","Trung tâm máy tính tài chính"),
                "/tools/compound-calculator",List.of("Compound interest calculator","복리 계산기","複利計算機","复利计算器","Máy tính lãi kép"),
                "/tools/stock-calculator",List.of("Stock average price calculator","주식 평균단가 계산기","株式平均取得単価計算機","股票平均成本计算器","Máy tính giá vốn cổ phiếu"),
                "/status",List.of("Service status","서비스 상태","サービス状態","服务状态","Tình trạng dịch vụ"));
        var heading=java.util.regex.Pattern.compile("<header[^>]*class=\"topbar\"[^>]*>[\\s\\S]*?<h1[^>]*>([^<]+)</h1>").matcher(html);
        assertTrue(heading.find(),"Shared header has a real rendered heading for "+path+"/"+lang);
        assertEquals(titles.get(path).get(List.of("en","ko","ja","zh","vi").indexOf(lang)),heading.group(1));
        assertEquals(1,html.split("id=\"mv-support-launcher\"", -1).length-1);
        assertFalse(html.contains("floating-help"));
        assertFalse(html.contains("/_next/"));
        assertFalse(html.contains("__next_f"));
        assertTrue(html.contains("/assets/mv43/public.js"));
        assertFalse(html.contains("th:text"));
        mvc.perform(get(path).param("lang",lang).header("Accept-Language","en"))
                .andExpect(status().isOk()).andExpect(header().string("Content-Language",lang));
        mvc.perform(get(path).cookie(new Cookie("wdmv_locale",lang)).param("lang","en").header("Accept-Language","ko"))
                .andExpect(status().isOk()).andExpect(header().string("Content-Language",lang));
        if(path.equals("/tools/compound-calculator")) {
            String label=switch(lang){case "ko" -> "초기 투자 금액"; case "ja" -> "初期投資額";
                case "zh" -> "初始本金"; case "vi" -> "Vốn ban đầu"; default -> "Initial principal";};
            assertTrue(html.contains(">"+label+"</label>"));
            String metric=switch(lang){case "ko" -> "예상 최종 자산"; case "ja" -> "予測最終資産";
                case "zh" -> "预计最终资产"; case "vi" -> "Số dư dự kiến"; default -> "Projected balance";};
            assertTrue(html.contains(">"+metric+"</span>"));
        }
        if(path.equals("/status")) {
            String label=switch(lang){case "ko" -> "기록 만료"; case "ja" -> "期限切れの記録";
                case "zh" -> "记录已过期"; case "vi" -> "Quan sát hết hạn"; default -> "Stale observation";};
            assertTrue(html.contains(">"+label+"</span>"));
        }
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
        assertTrue(java.util.regex.Pattern.compile("<option[^>]*value=\"daily\"[^>]*selected=\"selected\"").matcher(html).find());
        assertTrue(html.contains(">3,400</strong>"));
        assertTrue(html.contains("data-testid=\"total-deposit\""));
        assertTrue(html.contains("<td>2,200</td>"));
        assertTrue(html.contains("data-i18n=\"publicPrincipal\""));

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
    @Test void submittedAnnualFrequencyUsesTheExistingAnnualMath() throws Exception {
        String html=mvc.perform(get("/tools/compound-calculator").param("principal","1000").param("monthlyDeposit","0")
                        .param("annualRate","100").param("years","1").param("frequency","annually"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertTrue(html.contains(">2,000</strong>"));
        assertFalse(html.contains(">2,613</strong>"));
    }

    @Test void nativeFormsKeepSourceNumericConstraintsAndDefaults() throws Exception {
        String compound=mvc.perform(get("/tools/compound-calculator")).andReturn().getResponse().getContentAsString();
        for(String[] field:new String[][]{{"principal","0","1000000000000","0.01","100000"},
                {"monthlyDeposit","0","1000000000000","0.01","10000"},{"annualRate","0","100","0.01","8.5"},{"years","1","50","1","3"}})
            assertNumericField(compound,field);
        String stock=mvc.perform(get("/tools/stock-calculator")).andReturn().getResponse().getContentAsString();
        for(String[] field:new String[][]{{"initialPrice","0","1000000000","0.01","50"},{"initialQuantity","0","100000000","1","100"},
                {"additionalPrice","0","1000000000","0.01","40"},{"additionalQuantity","0","100000000","1","150"},
                {"targetProfitPercent","0","1000","0.01","15"},{"feeRate","0","50","0.01","0.05"}})
            assertNumericField(stock,field);
    }
    private static void assertNumericField(String html,String[] field) {
        var matcher=java.util.regex.Pattern.compile("<input[^>]*name=\""+field[0]+"\"[^>]*>").matcher(html);
        assertTrue(matcher.find(),field[0]);String input=matcher.group();
        for(String attribute:List.of("type=\"number\"","min=\""+field[1]+"\"","max=\""+field[2]+"\"", "step=\""+field[3]+"\"","value=\""+field[4]+"\"","required"))
            assertTrue(input.contains(attribute),field[0]+": "+attribute);
    }

    @Test void publicLocaleFallsBackSafelyAndAllRoutesRejectFlight() throws Exception {
        for(String path:nativeRoutes().toList()) {
            mvc.perform(get(path).param("lang","xx").header("Accept-Language","fr-FR"))
                    .andExpect(status().isOk()).andExpect(header().string("Content-Language","en"));
            mvc.perform(get(path).param("_rsc","legacy"))
                    .andExpect(status().isNotAcceptable());
        }
    }

    @Test void statusStatesStaySeparateAndLocalizedWithoutChangingEvidence() throws Exception {
        when(collector.publicStatus()).thenReturn(new StatusSourceTruthPolicy.StatusResponse(List.of(
                new StatusSourceTruthPolicy.StatusRow("web","Web","operational",null,"2026-11-20T00:00:00.000Z","fresh",100L,"status-v1"),
                new StatusSourceTruthPolicy.StatusRow("api","API","outage",null,"2026-11-20T00:00:01.000Z","fresh",100L,"status-v1"))));
        String html=mvc.perform(get("/status").header("Accept-Language","zh"))
                .andExpect(status().isOk()).andExpect(model().attribute("overall","outage"))
                .andReturn().getResponse().getContentAsString();
        assertTrue(html.contains("state-operational"));assertTrue(html.contains("state-outage"));
        assertTrue(html.contains("观测为正常"));assertTrue(html.contains("观测到故障"));
        assertTrue(html.contains("有效的最新记录"));assertTrue(html.contains("2026-11-20T00:00:01.000Z"));
    }

    @ParameterizedTest @org.junit.jupiter.params.provider.ValueSource(strings={"en","ko","ja","zh","vi"})
    void statusHeadKeepsExactlyOneOriginalMobileViewportAndUtf8(String lang) throws Exception {
        String html=mvc.perform(get("/status").header("Accept-Language",lang))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        var head=java.util.regex.Pattern.compile("<head>([\\s\\S]*?)</head>").matcher(html);
        assertTrue(head.find());String markup=head.group(1);
        var viewport=java.util.regex.Pattern.compile("<meta[^>]*name=\"viewport\"[^>]*>").matcher(markup);
        assertTrue(viewport.find(),"Status must use the device layout viewport");
        assertTrue(viewport.group().contains("content=\"width=device-width,initial-scale=1,viewport-fit=cover\""));
        assertFalse(viewport.find(),"Status must not declare conflicting viewports");
        var charset=java.util.regex.Pattern.compile("<meta[^>]*charset=\"utf-8\"[^>]*>").matcher(markup);
        assertTrue(charset.find(),"Status must preserve UTF-8 metadata");
        assertFalse(charset.find(),"Status must declare UTF-8 once");
    }

}
