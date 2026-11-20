package com.moneyverse.api.domain.admin.web;

import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.*;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.admin.service.AdminGovernanceService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminDashboardPageTest {
    private final AdminAuthService auth=mock(AdminAuthService.class);
    private final AdminGovernanceService governance=mock(AdminGovernanceService.class);
    private final AdminDashboardPage dashboard=new AdminDashboardPage(auth,governance,pages(),new AdminNavigation(new com.fasterxml.jackson.databind.ObjectMapper(),new com.moneyverse.api.domain.web.UiLocale(new com.fasterxml.jackson.databind.ObjectMapper())));

    private static com.moneyverse.api.domain.web.UiPageRenderer pages() {
        var resolver=new org.thymeleaf.templateresolver.ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setSuffix(".html");
        resolver.setCharacterEncoding("UTF-8");
        resolver.setTemplateMode("HTML");
        var engine=new org.thymeleaf.spring6.SpringTemplateEngine();
        engine.setTemplateResolver(resolver);
        return new com.moneyverse.api.domain.web.UiPageRenderer(engine,
                new com.moneyverse.api.domain.web.UiLocale(new com.fasterxml.jackson.databind.ObjectMapper()));
    }

    @Test void guestAndForgedHeadersMustNotReadSources() {
        MockHttpServletRequest req=new MockHttpServletRequest("GET","/admin");req.addHeader("X-User-Id", UUID.randomUUID().toString());
        ResponseEntity<String> out=dashboard.show(req);
        assertEquals(302,out.getStatusCode().value());
        verifyNoInteractions(governance);
    }

    @Test void legacyStaticAdminAndPreviewAliasesRedirectToSingleServerRenderedEntry() {
        UUID actor=UUID.randomUUID();when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        for(String path:new String[]{"/admin.html","/admin/index.html","/admin-preview","/admin-preview/index.html"}) {
            ResponseEntity<Void> out=dashboard.canonicalAdminAlias(new MockHttpServletRequest("GET",path));
            assertEquals(302,out.getStatusCode().value(),path);
            assertEquals("/admin",out.getHeaders().getLocation().toString(),path);
        }
        verifyNoInteractions(governance);
    }

    @Test void realDbSourceRowsOnlyAndMarkupEscaped() {
        UUID actor=UUID.randomUUID();when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        when(governance.listUsers(actor,50)).thenReturn(new AdminUsersResponse(List.of(new AdminUserDto()),java.util.Map.of()));
        when(governance.listStocks(actor)).thenReturn(new AdminStocksResponse(List.of(
                new AdminStockDto(UUID.randomUUID().toString(),"ABC","<img src=x onerror=alert(1)>","135",true,"ACTIVE",null))));
        when(governance.getFeatureSwitchesOverview(actor)).thenReturn(new FeatureSwitchOverviewResponse(
                List.of(new FeatureSwitchDto("feature_test","enabled","Feature",null,null,null,null)),List.of(),List.of()));
        ResponseEntity<String> out=dashboard.show(new MockHttpServletRequest("GET","/admin"));
        assertEquals(200,out.getStatusCode().value());
        assertTrue(out.getBody().contains("<strong>1</strong>"));
        assertTrue(out.getBody().contains("&lt;img src=x onerror=alert(1)&gt;"));
        assertFalse(out.getBody().contains("<img src=x onerror=alert(1)>"));
        assertTrue(out.getBody().contains("135 WLD"));
        for(String code:List.of("auto","en","ko","ja","zh","vi"))assertTrue(out.getBody().contains("value=\""+code+"\""));
        assertTrue(out.getBody().contains("/assets/mv39/i18n.js"));
        assertTrue(out.getBody().contains("/assets/mv40/admin.js"));
        assertFalse(out.getBody().contains("12,840"));
        assertFalse(out.getBody().contains("100조"));
        assertFalse(out.getBody().contains("Netty 9092"));
        assertEquals("private, no-store",out.getHeaders().getFirst("Cache-Control"));
        String fixtureDir=System.getenv("MV_ADMIN_FIXTURE_DIR");
        if(fixtureDir!=null&&!fixtureDir.isBlank()) {
            try {
                java.nio.file.Files.createDirectories(java.nio.file.Path.of(fixtureDir));
                // The screenshot-only fixture uses an innocuous test label; the assertion above
                // separately proves that the real rendering escapes untrusted names.
                String sanitizedFixture=out.getBody().replace("&lt;img src=x onerror=alert(1)&gt;","Fixture Industrial");
                java.nio.file.Files.writeString(java.nio.file.Path.of(fixtureDir,"index.html"),sanitizedFixture);
            } catch(java.io.IOException e) {throw new AssertionError(e);}
        }
    }

    @Test void nativeAdminRendererHonorsManualLanguageAndHasOneGlobalSupportEntry() {
        UUID actor=UUID.randomUUID();when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        MockHttpServletRequest request=new MockHttpServletRequest("GET","/admin");
        request.setCookies(new jakarta.servlet.http.Cookie("wdmv_locale","ko"));
        request.addHeader("Accept-Language","vi");
        ResponseEntity<String> out=dashboard.show(request);
        assertEquals("Spring-MVC-Thymeleaf",out.getHeaders().getFirst("X-MV-Renderer"));
        assertEquals("ko",out.getHeaders().getFirst("Content-Language"));
        assertTrue(out.getBody().contains("lang=\"ko\""));
        assertEquals(1,out.getBody().split("id=\"mv-support-launcher\"", -1).length-1);
        assertFalse(out.getBody().contains("@@"));
    }

    @Test void desktopAndMobileAdminBrandingReuseTheActualFavicon() {
        UUID actor=UUID.randomUUID();when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        String html=dashboard.show(new MockHttpServletRequest("GET","/admin")).getBody();
        var logos=java.util.regex.Pattern.compile("<img\\b[^>]*class=\"brand-mark\"[^>]*>").matcher(html)
            .results().map(java.util.regex.MatchResult::group).toList();
        assertEquals(2,logos.size(),"Admin sidebar and drawer must use the site favicon");
        for(String logo:logos) assertTrue(logo.contains("src=\"/assets/mv39/favicon.ico\"") && logo.contains("alt=\"\""));
    }

    @Test void malformedSourceListsStayUnavailable() {
        UUID actor=UUID.randomUUID();when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        when(governance.listUsers(actor,50)).thenReturn(new AdminUsersResponse(null,java.util.Map.of()));
        when(governance.listStocks(actor)).thenReturn(new AdminStocksResponse(null));
        when(governance.getFeatureSwitchesOverview(actor)).thenReturn(new FeatureSwitchOverviewResponse(null,List.of(),List.of()));
        ResponseEntity<String> out=assertDoesNotThrow(() -> dashboard.show(new MockHttpServletRequest("GET","/admin")));
        assertEquals(503,out.getStatusCode().value());
        assertTrue(out.getBody().contains("Unable to load data"));
    }

    @Test void allOriginal35ToolDestinationsRemainDiscoverableWithoutFakeOperationFeedback() {
        UUID actor=UUID.randomUUID();when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        String html=dashboard.show(new MockHttpServletRequest("GET","/admin")).getBody();
        for (String path : List.of("/admin/economy",
                "/admin/mint",
                "/admin/central-bank",
                "/admin/treasury",
                "/admin/enterprises",
                "/admin/bonds",
                "/admin/pension",
                "/admin/fx",
                "/admin/treasury/grants",
                "/admin/kdic",
                "/admin/catalog",
                "/admin/work",
                "/admin/market",
                "/admin/shop",
                "/admin/economy/scenario-lab",
                "/admin/market/ai-news",
                "/admin/security",
                "/admin/logs",
                "/admin/logs/errors",
                "/admin/logs/system",
                "/admin/logs/integrity",
                "/admin/logs/delivery",
                "/admin/users",
                "/admin/blog",
                "/admin/money-flow",
                "/admin/content",
                "/admin/support",
                "/admin/safety",
                "/admin/controls",
                "/admin/api-health",
                "/admin/seo",
                "/admin/seo-audit",
                "/admin/analytics",
                "/admin/discord",
                "/admin/operations/storage")) assertTrue(html.contains("href=\"" + path + "\""),path);
        assertEquals(35,html.split("data-admin-tool=", -1).length-1);
        assertTrue(html.contains("id=\"admin-tool-search\""));
        assertTrue(html.contains("id=\"admin-tool-category\""));
        assertFalse(html.contains("ELEVATED"));
        assertFalse(html.contains("12,840"));
    }

    @Test void dbOfflineMustNotProduceFakeGreenOrCounts() {
        UUID actor=UUID.randomUUID();when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        when(governance.listUsers(actor,50)).thenThrow(new IllegalStateException("DB OFFLINE"));
        when(governance.listStocks(actor)).thenThrow(new IllegalStateException("DB OFFLINE"));
        when(governance.getFeatureSwitchesOverview(actor)).thenThrow(new IllegalStateException("DB OFFLINE"));
        ResponseEntity<String> out=dashboard.show(new MockHttpServletRequest("GET","/admin"));
        assertEquals(503,out.getStatusCode().value());
        assertTrue(out.getBody().contains("Unable to load data"));
        assertFalse(out.getBody().contains("<strong>0</strong>"));
        assertFalse(out.getBody().contains("DB OFFLINE"));
    }
}
