package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.admin.service.AdminGovernanceService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Migration 287 suspends stock halt settlement (P0 #1553) until a ledger-atomic settlement with a
 * replay receipt exists. The halt toggle wrote virtual_stocks directly instead, which both skips
 * that hold and needs table privileges the application role does not have. It now answers that
 * the halt is suspended and touches no table.
 */
class AdminStocksHaltSourceTest {
    @Test void haltIsSuspendedAndWritesNothing() {
        AdminAuthService auth = mock(AdminAuthService.class);
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(UUID.randomUUID()));
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        var controller = new AdminStocksController(mock(AdminGovernanceService.class), auth, jdbc);

        var response = controller.haltStock(new MockHttpServletRequest(), UUID.randomUUID().toString(), Map.of());

        assertEquals(503, response.getStatusCode().value());
        assertEquals("stock_halt_suspended", ((Map<?, ?>) response.getBody()).get("code"));
        verifyNoInteractions(jdbc);
    }

    @Test void nonAdministratorIsRefused() {
        AdminAuthService auth = mock(AdminAuthService.class);
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.empty());
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        var response = new AdminStocksController(mock(AdminGovernanceService.class), auth, jdbc)
                .haltStock(new MockHttpServletRequest(), UUID.randomUUID().toString(), Map.of());
        assertEquals(401, response.getStatusCode().value());
        verifyNoInteractions(jdbc);
    }
}
