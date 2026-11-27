package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.admin.service.AdminGovernanceService;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * virtual_stocks and virtual_stock_positions are revoked from the application role (023/047). The
 * member detail page reads the role-checked admin_get_user_portfolio, whose identity fields
 * (displayName, status, createdAt) the page needs and the direct read never returned.
 */
class AdminUserPortfolioSourceTest {
    private static AdminAuthService admin(UUID id) {
        AdminAuthService auth = mock(AdminAuthService.class);
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.ofNullable(id));
        return auth;
    }

    @Test void portfolioComesFromTheRoleCheckedFunction() {
        UUID actor = UUID.randomUUID();
        UUID target = UUID.randomUUID();
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForObject(contains("public.admin_get_user_portfolio(?::uuid, ?::uuid)"), eq(String.class), eq(actor), eq(target)))
                .thenReturn("{\"userId\":\"" + target + "\",\"displayName\":\"Synthetic\",\"status\":\"active\"}");

        var response = new AdminUsersController(mock(AdminGovernanceService.class), admin(actor), jdbc)
                .getUserPortfolio(new MockHttpServletRequest(), target.toString());

        assertEquals(200, response.getStatusCode().value());
        Map<?, ?> portfolio = (Map<?, ?>) ((Map<?, ?>) response.getBody()).get("portfolio");
        assertEquals("Synthetic", portfolio.get("displayName"));
        verify(jdbc, never()).query(contains("virtual_stock"), any(org.springframework.jdbc.core.RowMapper.class), any(Object[].class));
    }

    @Test void databaseFailureIsUnavailableNotEmpty() {
        UUID actor = UUID.randomUUID();
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForObject(anyString(), eq(String.class), any(), any())).thenThrow(new DataAccessResourceFailureException("down"));
        var response = new AdminUsersController(mock(AdminGovernanceService.class), admin(actor), jdbc)
                .getUserPortfolio(new MockHttpServletRequest(), UUID.randomUUID().toString());
        assertEquals(503, response.getStatusCode().value());
    }

    @Test void nonAdministratorIsRefused() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        var response = new AdminUsersController(mock(AdminGovernanceService.class), admin(null), jdbc)
                .getUserPortfolio(new MockHttpServletRequest(), UUID.randomUUID().toString());
        assertEquals(401, response.getStatusCode().value());
        verifyNoInteractions(jdbc);
    }
}
