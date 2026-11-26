package com.moneyverse.api.domain.shop;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import com.moneyverse.api.domain.shop.controller.ShopHoldingsController;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/** QA 2026-11-25: /shop/catalog read /api/v1/shop/holdings, which Spring never mapped (404). */
class ShopHoldingsTest {
    @Test void unknownFilterIsRefusedBeforeTheDatabase() {
        MemberApiGuard guard = mock(MemberApiGuard.class);
        JdbcClient jdbc = mock(JdbcClient.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(guard.actor(request)).thenReturn(UUID.randomUUID());
        var res = new ShopHoldingsController(jdbc, guard).holdings(request, "everything", null);
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
        verifyNoInteractions(jdbc);
    }

    @Test void attentionKeepsOnlySuspendedOrUnpaidHoldings() {
        Map<String, Object> ok = new HashMap<>(Map.of("suspended", false, "unpaid_weeks", 0));
        Map<String, Object> owing = new HashMap<>(Map.of("suspended", false, "unpaid_weeks", 2));
        Map<String, Object> off = new HashMap<>(Map.of("suspended", true, "unpaid_weeks", 0));
        assertEquals(List.of(owing, off), ShopHoldingsController.attention(List.of(ok, owing, off)));
    }
}
