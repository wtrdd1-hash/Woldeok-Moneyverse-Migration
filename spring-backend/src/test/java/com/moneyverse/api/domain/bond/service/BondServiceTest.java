package com.moneyverse.api.domain.bond.service;

import com.moneyverse.api.domain.bond.controller.BondController;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * The public bond page verifies /api/v1/bonds/markets as {overview, bonds, disclosed_at} with the
 * catalogue's own columns; the member page reads my-holdings as a bare array. Both now come from the
 * 312 functions. The former overview substituted invented figures (holder count, coupons, a whole
 * fallback market) and the reads ignored failures.
 */
class BondServiceTest {
    @SuppressWarnings("unchecked")
    @Test void marketSnapshotIsBuiltOnlyFromTheCatalogueAndTotals() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        Map<String, Object> bond = new java.util.LinkedHashMap<>(Map.of("status", "OPEN_SUBSCRIPTION", "total_funded_wld", "700"));
        Map<String, Object> closed = new java.util.LinkedHashMap<>(Map.of("status", "CLOSED", "total_funded_wld", "300"));
        when(jdbc.queryForList(contains("public.bond_public_catalog()"))).thenReturn(List.of(bond, closed));
        when(jdbc.queryForMap(contains("public.bond_public_read_totals()"))).thenReturn(Map.of("holders_count", "4", "coupons_paid_wld", "12"));
        Map<String, Object> snapshot = new BondService(jdbc).marketSnapshot();
        Map<String, Object> overview = (Map<String, Object>) snapshot.get("overview");
        assertEquals(1, overview.get("totalBondsActive"));
        assertEquals("1000", overview.get("totalFundedWld"));
        assertEquals(4, overview.get("totalHoldersCount"));
        assertEquals("12", overview.get("totalCouponsPaidWld"));
        assertEquals(2, ((List<?>) snapshot.get("bonds")).size());
        assertNotNull(snapshot.get("disclosed_at"));
    }

    @Test void anUnreadableMarketIsUnavailable() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForList(anyString())).thenThrow(new DataAccessResourceFailureException("down"));
        assertEquals(503, assertThrows(ResponseStatusException.class, () -> new BondService(jdbc).marketSnapshot()).getStatusCode().value());
    }

    @Test void holdingsAreActorBoundAndFailuresAreNotEmpty() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        String actor = UUID.randomUUID().toString();
        new BondService(jdbc).listUserHoldings(actor);
        verify(jdbc).queryForList(contains("public.bond_owner_holdings(?::uuid)"), eq(actor));
        JdbcTemplate down = mock(JdbcTemplate.class);
        doThrow(new DataAccessResourceFailureException("down")).when(down).queryForList(anyString(), eq(actor));
        assertEquals(503, assertThrows(ResponseStatusException.class, () -> new BondService(down).listUserHoldings(actor)).getStatusCode().value());
    }

    @Test void v1MarketsIsTheBarePayload() {
        BondService service = mock(BondService.class);
        Map<String, Object> snapshot = Map.of("overview", Map.of());
        when(service.marketSnapshot()).thenReturn(snapshot);
        assertSame(snapshot, new BondController(service, mock(MemberApiGuard.class))
                .getMarkets(new MockHttpServletRequest("GET", "/api/v1/bonds/markets")));
    }
}
