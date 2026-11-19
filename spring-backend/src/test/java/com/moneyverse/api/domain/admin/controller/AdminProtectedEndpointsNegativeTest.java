package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.service.AdminGovernanceService;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

/** Negative authorization regression: malformed/unverified credentials must never read protected data. */
class AdminProtectedEndpointsNegativeTest {
    @Test
    void usersRejectArbitraryBearer() {
        var request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer non-session-invalid-token");
        var controller = new AdminUsersController(mock(AdminGovernanceService.class), mock(AdminAuthService.class), mock(JdbcTemplate.class));
        assertEquals(401, controller.getUsers(request, 1).getStatusCode().value());
    }

    @Test
    void usersRejectArbitrarySessionCookie() {
        var request = new MockHttpServletRequest();
        request.setCookies(new Cookie("mv_session", "non-session-invalid-cookie"));
        var controller = new AdminUsersController(mock(AdminGovernanceService.class), mock(AdminAuthService.class), mock(JdbcTemplate.class));
        assertEquals(401, controller.getUsers(request, 1).getStatusCode().value());
    }

    @Test
    void usersRejectFakeInternalToken() {
        var request = new MockHttpServletRequest();
        request.addHeader("x-internal-token", "invalid-internal-token");
        var controller = new AdminUsersController(mock(AdminGovernanceService.class), mock(AdminAuthService.class), mock(JdbcTemplate.class));
        assertEquals(401, controller.getUsers(request, 1).getStatusCode().value());
    }

    @Test
    void economyRejectUnverifiedBearer() {
        var request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer unverified");
        var controller = new AdminEconomyController(mock(AdminGovernanceService.class), mock(AdminAuthService.class));
        assertEquals(401, controller.getReconciliationHealth(request).getStatusCode().value());
    }
}
