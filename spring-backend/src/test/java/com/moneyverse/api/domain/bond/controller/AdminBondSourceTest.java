package com.moneyverse.api.domain.bond.controller;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.bond.service.BondService;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * treasury_bonds and treasury_bond_coupon_logs are not granted to the application role. The
 * overview used to answer a fallback of 3 active bonds and fixed benchmark yields when its direct
 * read failed; it now reads actor-checked functions (363) and withholds what has no source.
 */
class AdminBondSourceTest {
    private static AdminAuthService admin(UUID id) {
        AdminAuthService auth = mock(AdminAuthService.class);
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.ofNullable(id));
        return auth;
    }

    @Test void overviewComesFromTheFunctionAndInventsNoYield() {
        UUID actor = UUID.randomUUID();
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForList(contains("public.admin_treasury_bonds_overview_read(?::uuid)"), eq(actor)))
                .thenReturn(List.of(Map.of("total_bonds_active", 2L, "total_funded_wld", "500", "total_holders_count", 4L, "total_coupons_paid_wld", "12")));
        var body = new AdminBondController(mock(BondService.class), jdbc, admin(actor)).getOverview(new MockHttpServletRequest()).getBody();
        assertEquals(2L, body.get("totalBondsActive"));
        assertEquals("500", body.get("totalFundedWld"));
        assertEquals(4L, body.get("totalHoldersCount"));
        assertEquals("12", body.get("totalCouponsPaidWld"));
        assertEquals("—", body.get("benchmark1YYield"));
        assertEquals("—", body.get("benchmark3YYield"));
        assertEquals("—", body.get("benchmark5YYield"));
    }

    @Test void overviewFailureIsUnavailableNotAFallbackCount() {
        UUID actor = UUID.randomUUID();
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForList(anyString(), any(Object[].class))).thenThrow(new DataAccessResourceFailureException("down"));
        var e = assertThrows(ResponseStatusException.class,
                () -> new AdminBondController(mock(BondService.class), jdbc, admin(actor)).getOverview(new MockHttpServletRequest()));
        assertEquals(503, e.getStatusCode().value());
    }

    @Test void listAndCouponLogsReadTheFunctions() {
        UUID actor = UUID.randomUUID();
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        var c = new AdminBondController(mock(BondService.class), jdbc, admin(actor));
        c.listBonds(new MockHttpServletRequest());
        c.getCouponLogs(new MockHttpServletRequest(), 30);
        verify(jdbc).queryForList(contains("public.admin_treasury_bonds_read(?::uuid)"), eq(actor));
        verify(jdbc).queryForList(contains("public.admin_treasury_bond_coupon_logs_read(?::uuid, ?::integer)"), eq(actor), eq(30));
    }

    @Test void couponLogFailureIsUnavailableNotEmpty() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForList(anyString(), any(Object[].class))).thenThrow(new DataAccessResourceFailureException("down"));
        var e = assertThrows(ResponseStatusException.class,
                () -> new AdminBondController(mock(BondService.class), jdbc, admin(UUID.randomUUID())).getCouponLogs(new MockHttpServletRequest(), 30));
        assertEquals(503, e.getStatusCode().value());
    }

    @Test void nonAdministratorIsRefused() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        var e = assertThrows(ResponseStatusException.class,
                () -> new AdminBondController(mock(BondService.class), jdbc, admin(null)).listBonds(new MockHttpServletRequest()));
        assertEquals(401, e.getStatusCode().value());
        verifyNoInteractions(jdbc);
    }
}
