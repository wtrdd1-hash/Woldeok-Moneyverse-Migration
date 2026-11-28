package com.moneyverse.api.domain.shop;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** A database outage must not turn into sample stock or a manufactured mutation receipt. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminShopCanonicalTest {
    @Autowired MockMvc mvc;
    @MockBean AdminAuthService admin;
    @MockBean UserAuthService sessions;
    @MockBean JdbcTemplate jdbc;
    final UUID actor=UUID.fromString("00000000-0000-4000-8000-000000000101");
    final String item="00000000-0000-4000-8000-000000000102";
    @BeforeEach void authorized() {
        when(admin.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        when(admin.isAuthorizedAdmin(any())).thenReturn(true);
        when(admin.hasVerifiedSessionCsrf(any())).thenReturn(true);
        // Step-up (v2026.11.27.1457.1): these cases test the controller behind a recently re-verified session.
        when(admin.hasRecentSessionReauthentication(any(), anyInt())).thenReturn(true);
        var session=new SessionInfo();session.setUserId(actor);session.setRoles(List.of("superadmin"));
        when(sessions.resolveSession(any())).thenReturn(Optional.of(session));
        when(jdbc.query(anyString(),any(org.springframework.jdbc.core.RowMapper.class),any(Object[].class)))
            .thenThrow(new IllegalStateException("Unavailable canonical database"));
    }
    @Test void listFailureCannotReturnSyntheticCatalog() throws Exception {
        mvc.perform(get("/api/v1/admin/shop/items")).andExpect(status().isServiceUnavailable())
            .andExpect(jsonPath("$.items").doesNotExist()).andExpect(jsonPath("$.success").value(false));
    }
    @Test void createWithoutCanonicalFunctionCannotClaimCreated() throws Exception {
        mvc.perform(post("/api/v1/admin/shop/items").contentType("application/json").content("{\"name\":\"QA item\",\"basePrice\":\"1\"}"))
            .andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.success").value(false));
    }
    @Test void updateWithoutVerifiedStepUpCannotClaimPersisted() throws Exception {
        mvc.perform(patch("/api/v1/admin/shop/items/"+item).contentType("application/json").content("{\"base_price\":\"9007199254740993\",\"active\":true,\"current_stock\":1}"))
            .andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.success").value(false));
        verify(jdbc,never()).update(anyString(),any(Object[].class));
    }
    @Test void deleteWithoutCanonicalReceiptCannotClaimDeleted() throws Exception {
        mvc.perform(delete("/api/v1/admin/shop/items/"+item)).andExpect(status().isServiceUnavailable())
            .andExpect(jsonPath("$.success").value(false));
    }
    @Test void csrfFailurePrecedesAnyUnsupportedWrite() throws Exception {
        when(admin.hasVerifiedSessionCsrf(any())).thenReturn(false);
        mvc.perform(patch("/api/v1/admin/shop/items/"+item).contentType("application/json").content("{}"))
            .andExpect(status().isForbidden());
    }
    @Test void unverifiedActorCannotReadCatalog() throws Exception {
        when(admin.resolveVerifiedAdminActor(any())).thenReturn(Optional.empty());
        mvc.perform(get("/api/v1/admin/shop/items").header("X-User-Id",actor.toString())).andExpect(status().isUnauthorized());
    }
    @Test void canonicalReadCallsActorScopedFunctionAndKeepsLargePriceString() throws Exception {
        var result=mock(java.sql.ResultSet.class);
        Map<String,String> fields=Map.of("id",item,"code","QA_ITEM","name","Verified fixture","description","Description","category","title","base_price","9007199254740993","rarity","rare","purchase_limit","none");
        when(result.getString(anyString())).thenAnswer(call->fields.get(call.getArgument(0)));
        when(result.getObject("max_stock",Integer.class)).thenReturn(100);
        when(result.getObject("current_stock",Integer.class)).thenReturn(4);
        when(result.getBoolean(anyString())).thenReturn(true);
        when(jdbc.query(anyString(),any(org.springframework.jdbc.core.RowMapper.class),any(Object[].class))).thenAnswer(call->{
            String sql=call.getArgument(0);assertTrue(sql.contains("public.admin_shop_items(?::uuid)"));
            assertTrue(sql.contains("base_price::text"));assertFalse(sql.contains("FROM public.shop_catalog"));
            assertEquals(actor,call.getArgument(2));
            org.springframework.jdbc.core.RowMapper<?> mapper=call.getArgument(1);
            return List.of(mapper.mapRow(result,0));
        });
        mvc.perform(get("/api/v1/admin/shop/items").header("X-User-Id",item))
            .andExpect(status().isOk()).andExpect(header().string("X-MV-Owner",actor.toString()))
            .andExpect(header().string("Cache-Control",org.hamcrest.Matchers.containsString("no-store")))
            .andExpect(jsonPath("$.items[0].id").value(item)).andExpect(jsonPath("$.items[0].base_price").value("9007199254740993"));
    }


    @Test void aWriteWithoutRecentReauthenticationNeverReachesTheController() throws Exception {
        when(admin.hasRecentSessionReauthentication(any(), anyInt())).thenReturn(false);
        mvc.perform(delete("/api/v1/admin/shop/items/"+java.util.UUID.randomUUID()))
            .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("reauthentication_required"));
        verifyNoInteractions(jdbc);
    }
}
