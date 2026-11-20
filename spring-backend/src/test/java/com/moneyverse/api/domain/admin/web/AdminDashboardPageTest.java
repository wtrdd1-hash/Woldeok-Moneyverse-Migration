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
    private final AdminDashboardPage dashboard=new AdminDashboardPage(auth,governance);

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

    @Test void dbOfflineMustNotProduceFakeGreenOrCounts() {
        UUID actor=UUID.randomUUID();when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        when(governance.listUsers(actor,50)).thenThrow(new IllegalStateException("DB OFFLINE"));
        when(governance.listStocks(actor)).thenThrow(new IllegalStateException("DB OFFLINE"));
        when(governance.getFeatureSwitchesOverview(actor)).thenThrow(new IllegalStateException("DB OFFLINE"));
        ResponseEntity<String> out=dashboard.show(new MockHttpServletRequest("GET","/admin"));
        assertEquals(503,out.getStatusCode().value());
        assertTrue(out.getBody().contains("Source unavailable"));
        assertFalse(out.getBody().contains("<strong>0</strong>"));
        assertFalse(out.getBody().contains("DB OFFLINE"));
    }
}
