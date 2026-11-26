package com.moneyverse.api.domain.business;

import com.moneyverse.api.domain.business.controller.BusinessController;
import com.moneyverse.api.domain.business.controller.BusinessTypesController;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Signed-in E2E 2026-11-25: /businesses crashed (digest 2910198970) because GET
 * /api/v1/business-types was mapped to BusinessController's "my businesses" handler and
 * answered {businesses: [...]}, while the page (and NestJS) use {businessTypes: [...]}:
 * the catalogue of types the member does not own yet.
 */
class BusinessTypesContractTest {
    @Test void businessControllerNoLongerOwnsTheBusinessTypesPath() {
        String[] paths = BusinessController.class.getAnnotation(RequestMapping.class).value();
        assertFalse(Arrays.stream(paths).anyMatch(p -> p.contains("business-types")));
    }

    @Test void catalogueLeavesOutOwnedTypesAndUsesTheFrontendShape() {
        var all = List.<Map<String, Object>>of(
                Map.of("id", "a", "symbol", "A", "name", "n", "description", "d", "purchase_cost", "1", "daily_revenue", "2", "daily_operating_cost", "3"),
                Map.of("id", "b", "symbol", "B", "name", "n", "description", "d", "purchase_cost", "1", "daily_revenue", "2", "daily_operating_cost", "3"));
        var out = BusinessTypesController.available(all, java.util.Set.of("a"));
        assertEquals(1, out.size());
        assertEquals("b", out.get(0).get("id"));
        assertEquals("1", out.get(0).get("purchaseCost"));
    }

    @Test void purchaseWithoutCsrfNeverReachesTheLedger() {
        MemberApiGuard guard = mock(MemberApiGuard.class);
        JdbcClient jdbc = mock(JdbcClient.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(guard.verifiedMutationActor(request)).thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "CSRF_REQUIRED"));
        assertThrows(ResponseStatusException.class, () -> new BusinessTypesController(jdbc, guard).purchase(request, UUID.randomUUID().toString(), Map.of()));
        verifyNoInteractions(jdbc);
    }
}
