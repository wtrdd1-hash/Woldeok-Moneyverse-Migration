package com.moneyverse.api.domain.admin.web;

import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.*;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.admin.service.AdminGovernanceService;
import com.moneyverse.api.domain.business.dto.BusinessDtos.*;
import com.moneyverse.api.domain.business.service.BusinessService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class LiveAdminOverviewPagesTest {
    private final AdminAuthService auth=mock(AdminAuthService.class);
    private final AdminGovernanceService governance=mock(AdminGovernanceService.class);
    private final BusinessService business=mock(BusinessService.class);
    private final LiveAdminOverviewPages pages=new LiveAdminOverviewPages(auth,governance,business);
    private MockHttpServletRequest req(String uri) {return new MockHttpServletRequest("GET",uri);}

    @Test void allSensitiveAdminScreensRedirectBeforeDataLookup() {
        for(String path: new String[]{"/admin/market","/admin/economy","/admin/controls","/admin/enterprises","/admin/economy/scenario-lab"}) {
            ResponseEntity<String> out=pages.show(req(path),"en");
            assertEquals(302,out.getStatusCode().value(),path);
        }
        verifyNoInteractions(governance,business);
    }

    @Test void stockMarketUsesOnlyActorScopedCanonicalItemsAndEscapesMarkup() {
        UUID owner=UUID.randomUUID();when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(owner));
        when(governance.listStocks(owner)).thenReturn(new AdminStocksResponse(
                List.of(new AdminStockDto(UUID.randomUUID().toString(),"XSS", "<script>fake</script>", "100", true,"ACTIVE",null))));
        ResponseEntity<String> out=pages.show(req("/admin/market"),"en");
        assertEquals(200,out.getStatusCode().value());
        assertTrue(out.getBody().contains("&lt;script&gt;fake&lt;/script&gt;"));
        assertFalse(out.getBody().contains("<script>fake</script>"));
        verify(governance).listStocks(owner);
    }

    @Test void enterprisesReadsActualCatalogNotFallbackCount() {
        UUID actor=UUID.randomUUID();when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        when(business.getCatalog()).thenReturn(new BusinessCatalogResponse(true,
                List.of(new BusinessCatalogItem(UUID.randomUUID().toString(),"Test enterprise",null,null,"1000","250",null))));
        ResponseEntity<String> out=pages.show(req("/admin/enterprises"),"ko");
        assertEquals(200,out.getStatusCode().value());
        assertTrue(out.getBody().contains("Test enterprise"));
    }

    @Test void controlsAndEconomyHaveReadOnlyTruthfulViews() {
        UUID actor=UUID.randomUUID();when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        when(governance.getFeatureSwitchesOverview(actor)).thenReturn(new FeatureSwitchOverviewResponse(
                List.of(new FeatureSwitchDto("safe_feature","disabled","Feature",null,null,null,null)), List.of(), List.of()));
        EconomyReconciliationHealthDto snapshot=new EconomyReconciliationHealthDto();snapshot.setAvailable(false);
        when(governance.getLatestReconciliationHealth(actor)).thenReturn(snapshot);
        assertEquals(200,pages.show(req("/admin/controls"),"en").getStatusCode().value());
        assertTrue(pages.show(req("/admin/controls"),"en").getBody().contains("safe_feature"));
        assertTrue(pages.show(req("/admin/economy"),"ko").getBody().contains("UNVERIFIED"));
        assertTrue(pages.show(req("/admin/economy/scenario-lab"),"en").getBody().contains("READ-ONLY"));
    }

    @Test void noDatabaseProofMeans503NeverFabricatedAdminSuccess() {
        UUID actor=UUID.randomUUID();when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        when(governance.listStocks(actor)).thenThrow(new IllegalStateException("DB offline"));
        ResponseEntity<String> out=pages.show(req("/admin/market"),"en");
        assertEquals(503,out.getStatusCode().value());
        assertTrue(out.getBody().contains("503"));
    }
}
