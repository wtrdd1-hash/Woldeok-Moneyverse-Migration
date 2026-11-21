package com.moneyverse.frontendpresentation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.web.UiLocale;
import com.moneyverse.api.domain.web.UiPageRenderer;
import java.util.Map;
import java.util.regex.Pattern;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockHttpServletRequest;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import static org.junit.jupiter.api.Assertions.*;

class Nov18VisualChromeTest {
    @org.junit.jupiter.api.Test
    void brandedImageUsesTheCurrentPublicFaviconBytes() throws Exception {
        try(var current=getClass().getResourceAsStream("/static/favicon.ico");
                var brand=getClass().getResourceAsStream("/static/assets/mv39/favicon.ico")) {
            assertNotNull(current);assertNotNull(brand);
            assertArrayEquals(current.readAllBytes(),brand.readAllBytes(),
                "Navigation must use the current public favicon rather than an older export");
        }
    }

    @ParameterizedTest
    @org.junit.jupiter.params.provider.CsvSource({
        "en,Skip to main content,Main navigation,Mobile navigation,Choose language,Menu,Close",
        "ko,본문 바로가기,주 메뉴,모바일 메뉴,언어 선택,메뉴,닫기",
        "ja,本文へ移動,メインナビゲーション,モバイルナビゲーション,言語を選択,メニュー,閉じる",
        "zh,跳至主内容,主导航,移动导航,选择语言,菜单,关闭",
        "vi,Chuyển đến nội dung chính,Điều hướng chính,Điều hướng di động,Chọn ngôn ngữ,Trình đơn,Đóng"
    })
    void administratorAccessibleNamesUseTheApprovedLocaleBeforeClientCodeRuns(String language,String skip,String main,String mobile,String choose,String menu,String close) {
        var resolver=new ClassLoaderTemplateResolver();resolver.setPrefix("templates/");resolver.setSuffix(".html");resolver.setTemplateMode("HTML");
        var engine=new SpringTemplateEngine();engine.setTemplateResolver(resolver);
        var pages=new UiPageRenderer(engine,new UiLocale(new ObjectMapper()));
        var request=new MockHttpServletRequest();request.addHeader("Accept-Language",language);
        String html=pages.render("mv43/admin-unavailable",request,Map.of("denied",true,"adminPageKey","dashboard"));
        assertEquals(skip,match(html,"<a[^>]*href=\"#main\"[^>]*>([^<]*)</a>"));
        assertEquals(main,match(html,"<aside[^>]*class=\"admin-sidebar\"[^>]*aria-label=\"([^\"]*)\""));
        assertEquals(mobile,match(html,"<aside[^>]*id=\"admin-drawer\"[^>]*aria-label=\"([^\"]*)\""));
        assertEquals(mobile,match(html,"<nav[^>]*class=\"admin-bottom-tabs\"[^>]*aria-label=\"([^\"]*)\""));
        assertEquals(choose,match(html,"<select[^>]*id=\"admin-locale\"[^>]*aria-label=\"([^\"]*)\""));
        assertEquals(menu,match(html,"<button[^>]*id=\"admin-menu-open\"[^>]*aria-label=\"([^\"]*)\""));
        assertEquals(close,match(html,"<button[^>]*id=\"admin-menu-close\"[^>]*aria-label=\"([^\"]*)\""));
    }
    private static String match(String html,String expression){var result=Pattern.compile(expression).matcher(html);assertTrue(result.find(),expression);return result.group(1);}

    @ParameterizedTest
    @ValueSource(strings={"en","ko","ja","zh","vi"})
    void administratorHeaderRetainsTheRealBrandWhenBothSidebarsAreClosed(String language) {
        var resolver=new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");resolver.setSuffix(".html");resolver.setTemplateMode("HTML");
        var engine=new SpringTemplateEngine();engine.setTemplateResolver(resolver);
        var pages=new UiPageRenderer(engine,new UiLocale(new ObjectMapper()));
        var request=new MockHttpServletRequest();request.addHeader("Accept-Language",language);
        String html=pages.render("mv43/admin-unavailable",request,Map.of("denied",true,"adminPageKey","dashboard"));
        var header=Pattern.compile("<header[^>]*class=\"admin-topbar\"[^>]*>([\\s\\S]*?)</header>").matcher(html);
        assertTrue(header.find(),"The administrator header must be rendered");
        assertTrue(Pattern.compile("<img[^>]+src=\"/assets/mv39/favicon\\.ico[^\"]*\"").matcher(header.group(1)).find(),
            "The visible header must own a real favicon image independently of closed navigation");
    }
}
