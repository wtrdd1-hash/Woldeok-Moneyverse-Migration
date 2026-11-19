package com.moneyverse.api.domain.admin.web;

import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.AdminUserDto;
import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.AdminUsersResponse;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.admin.service.AdminGovernanceService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class LiveAdminUsersPageTest {
    private final AdminAuthService auth = mock(AdminAuthService.class);
    private final AdminGovernanceService governance = mock(AdminGovernanceService.class);
    private final LiveAdminUsersPage page = new LiveAdminUsersPage(auth, governance);
    private final MockHttpServletRequest request = new MockHttpServletRequest("GET", "/admin/users");

    @Test void adminCspAllowsOnlySelfHostedV38StylesheetsNotExternalScript() {
        var response = page.show(request,30,"","en");
        var csp = response.getHeaders().getFirst("Content-Security-Policy");
        assertNotNull(csp);
        assertTrue(csp.contains("style-src 'self' 'unsafe-inline'"));
        assertTrue(csp.contains("default-src 'none'"));
        assertFalse(csp.contains("script-src 'unsafe-inline'"));
    }

    @Test void anonymousUserIsRedirectedToLoginWithoutReadingAnyUserData() {
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.empty());
        ResponseEntity<String> result = page.show(request, 30, "", "en");
        assertEquals(302, result.getStatusCode().value());
        assertEquals("/login?next=%2Fadmin%2Fusers", result.getHeaders().getLocation().toString());
        verifyNoInteractions(governance);
    }

    @Test void authenticatedAdminSeesRealScopeAndEscapedNames() {
        UUID id = UUID.randomUUID();
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(id));
        AdminUserDto row = new AdminUserDto(); row.setUserId(UUID.randomUUID().toString());
        row.setDisplayName("<script>alert('x')</script>"); row.setStatus("active"); row.setCreatedAt("2026-11-18T00:00:00Z");
        when(governance.listUsers(eq(id), eq(30))).thenReturn(new AdminUsersResponse(List.of(row), Map.of("source","canonical")));
        ResponseEntity<String> result = page.show(request, 30, "", "en");
        assertEquals(200, result.getStatusCode().value());
        String html = result.getBody();
        assertNotNull(html);
        assertTrue(html.contains("&lt;script&gt;"));
        assertFalse(html.contains("<script>alert('x')</script>"));
        assertTrue(html.contains("canonical"));
        assertFalse(html.contains("사용자 목록을 불러오지 못했어요"));
        assertEquals("no-store", result.getHeaders().getCacheControl());
    }

    @Test void sourceErrorIsExplicitAndCannotClaimZeroUsers() {
        UUID actor = UUID.randomUUID();
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        when(governance.listUsers(eq(actor), anyInt())).thenThrow(new ResponseStatusException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,"SOURCE_DOWN"));
        ResponseEntity<String> result = page.show(request, 30, "", "ko");
        assertEquals(503, result.getStatusCode().value());
        assertFalse(result.getBody().contains("0 users"));
        assertFalse(result.getBody().contains("사용자 목록을 불러오지 못했어요"));
    }

    @Test void oversizedRequestsAreClampedAndSearchFiltersOnlyReturnedRows() {
        UUID actor = UUID.randomUUID();
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        AdminUserDto yes = new AdminUserDto(); yes.setDisplayName("Alexa");yes.setStatus("active");
        AdminUserDto no = new AdminUserDto(); no.setDisplayName("Bob");no.setStatus("active");
        when(governance.listUsers(eq(actor), eq(200))).thenReturn(new AdminUsersResponse(List.of(yes,no), Map.of()));
        ResponseEntity<String> result = page.show(request, 300000, "lex", "ko");
        assertEquals(200,result.getStatusCode().value());
        assertTrue(result.getBody().contains("Alexa"));
        assertFalse(result.getBody().contains("Bob"));
        verify(governance).listUsers(actor,200);
    }
}
