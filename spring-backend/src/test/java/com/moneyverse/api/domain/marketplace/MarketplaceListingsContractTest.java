package com.moneyverse.api.domain.marketplace;

import com.moneyverse.api.domain.marketplace.controller.MarketplaceController;
import com.moneyverse.api.domain.marketplace.service.MarketplaceService;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * The marketplace page parses /api/v1/marketplace/listings as a bare array of snake_case rows
 * (id, status, item_name, quantity, price_wld, created_at). The list used to arrive wrapped and
 * camelCased from a direct read naming columns the table does not have, so it never rendered.
 */
class MarketplaceListingsContractTest {
    @Test void listReadsTheScopedFunction() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        new MarketplaceService(jdbc).listListings(50);
        verify(jdbc).query(contains("public.marketplace_active_listings(NULL, NULL, ?, 0)"), any(RowMapper.class), eq(50));
    }

    @Test void anUnreadableListIsUnavailableNotEmpty() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.query(anyString(), any(RowMapper.class), anyInt())).thenThrow(new DataAccessResourceFailureException("down"));
        var e = assertThrows(ResponseStatusException.class, () -> new MarketplaceService(jdbc).listListings(50));
        assertEquals(503, e.getStatusCode().value());
    }

    @Test void v1PathAnswersTheBareArray() {
        MarketplaceService service = mock(MarketplaceService.class);
        List<Map<String, Object>> rows = List.of(Map.of("id", "x"));
        when(service.listListings(anyInt())).thenReturn(rows);
        var controller = new MarketplaceController(service, mock(MemberApiGuard.class));
        assertSame(rows, controller.listListings(new MockHttpServletRequest("GET", "/api/v1/marketplace/listings"), 50));
    }
}
