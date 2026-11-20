package com.moneyverse.api.domain.admin;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.admin.service.AdminGovernanceService;
import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.FeatureSwitchOverviewResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters=false)
@ActiveProfiles("test")
class AdminLegacyControlsRegressionTest {
    @Autowired MockMvc mvc;
    @MockBean AdminAuthService auth;
    @MockBean AdminGovernanceService governance;
    @SpyBean JdbcTemplate jdbc;
    final UUID actor=UUID.fromString("00000000-0000-0000-0000-000000000101");
    final String quick="{\"feature\":\"stocks\",\"enabled\":true}";
    final String canonical="{\"state\":\"paused\",\"reason\":\"Synthetic regression only\",\"idempotencyKey\":\"00000000-0000-0000-0000-000000000202\"}";
    @BeforeEach void anonymous() {
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.empty());
        doReturn(ResponseEntity.status(401).build()).when(auth).unauthorizedResponse();
    }
    void verified(boolean proof) {
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        when(auth.isAuthorizedAdmin(any())).thenReturn(true);
        when(auth.hasVerifiedSessionCsrf(any())).thenReturn(proof);
    }
    @Test void quickAliasesRefuseAnonymousWithoutTouchingGovernance() throws Exception {
        for(String path:List.of("/api/v1/admin/controls","/api/admin/controls"))
            mvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(quick)).andExpect(status().isUnauthorized());
        verifyNoInteractions(governance);
    }
    @Test void quickAliasStillRequiresProofForAVerifiedSession() throws Exception {
        verified(false);
        mvc.perform(post("/api/v1/admin/controls").contentType(MediaType.APPLICATION_JSON).content(quick))
            .andExpect(status().isForbidden());
        verifyNoInteractions(governance);
    }
    @Test void unverifiedLegacyStepUpNeverWritesOrInventsASuccessOnSourceFailure() throws Exception {
        verified(true);
        when(governance.setFeatureSwitch(any(),anyString(),any())).thenThrow(new IllegalStateException("synthetic-source-unavailable"));
        mvc.perform(post("/api/v1/admin/controls").contentType(MediaType.APPLICATION_JSON).content(quick))
            .andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.ok").value(false));
        verifyNoInteractions(governance);
        verify(jdbc,never()).update(contains("UPDATE public.feature_switches"),any(),any());
    }
    @Test void canonicalReadCarriesTheActualVerifiedActor() throws Exception {
        verified(true);
        when(governance.getFeatureSwitchesOverview(actor)).thenReturn(new FeatureSwitchOverviewResponse(List.of(),List.of(),List.of()));
        mvc.perform(get("/api/v1/admin/controls")).andExpect(status().isOk())
            .andExpect(jsonPath("$.featureSwitches").isArray());
        verify(governance).getFeatureSwitchesOverview(actor);
    }
    @Test void canonicalMutationDoesNotTreatSessionRoleAsCsrf() throws Exception {
        verified(false);
        mvc.perform(put("/api/v1/admin/controls/feature-switches/stocks").contentType(MediaType.APPLICATION_JSON).content(canonical))
            .andExpect(status().isForbidden());
        verifyNoInteractions(governance);
    }
    @Test void canonicalMutationNeedsARealStepUpBridgeBeforeItCanBeEnabled() throws Exception {
        verified(true);
        mvc.perform(put("/api/v1/admin/controls/feature-switches/stocks").contentType(MediaType.APPLICATION_JSON).content(canonical))
            .andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.ok").value(false));
        verifyNoInteractions(governance);
    }
}
