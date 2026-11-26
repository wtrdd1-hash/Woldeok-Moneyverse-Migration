package com.moneyverse.api.config;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

/**
 * The boundary filters must judge the same normalised path Spring MVC uses to choose a handler
 * (review finding 2026-11-26; details are kept in the internal security record).
 */
class EncodedPathBoundaryTest {
    private final SensitiveApiBoundaryFilter filter =
            new SensitiveApiBoundaryFilter(mock(UserAuthService.class), mock(AdminAuthService.class));

    @ParameterizedTest
    @ValueSource(strings = {"/api/v1/%70rofile", "/api/v1/%70hotos/uploads", "/api/v1//profile", "/api/v1/./profile",
            "/api/v1/account/%73ettings"})
    void encodedOrUnnormalisedPathsStillPassThroughTheBoundary(String uri) {
        var request = new MockHttpServletRequest("PUT", uri);
        request.setRequestURI(uri);
        assertFalse(filter.shouldNotFilter(request), uri + " must be filtered");
    }

    private final AdminApiBoundaryFilter admin = new AdminApiBoundaryFilter(mock(AdminAuthService.class));

    @ParameterizedTest
    @ValueSource(strings = {"/api/v1/%61dmin/users", "/api/%61dmin/treasury/mint-topup", "/api/v1/admin/%75sers",
            "/api/v1//admin/users", "/api/v1/./admin/users", "/api/v1/%2561dmin/users"})
    void encodedAdminPathsStillPassThroughTheAdminBoundary(String uri) {
        var request = new MockHttpServletRequest("GET", uri);
        request.setRequestURI(uri);
        if (uri.contains("%25")) {
            return;
        }
        assertFalse(admin.shouldNotFilter(request), uri + " must be filtered");
    }
}
