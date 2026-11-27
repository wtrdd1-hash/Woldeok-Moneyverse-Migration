package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** The admin blog list reads blog_verified_admin_list (role-checked) for the verified administrator. */
class AdminBlogSourceTest {
    @Test void listReadsTheRoleCheckedFunctionForTheVerifiedAdministrator() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        AdminAuthService auth = mock(AdminAuthService.class);
        UUID admin = UUID.randomUUID();
        var request = new MockHttpServletRequest();
        when(auth.resolveVerifiedAdminActor(request)).thenReturn(Optional.of(admin));
        new AdminBlogController(jdbc, auth).getVerifiedBlogPosts(request);
        verify(jdbc).queryForList(contains("public.blog_verified_admin_list(?::uuid)"), eq(admin));
    }

    @Test void noVerifiedAdministratorNoRead() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        AdminAuthService auth = mock(AdminAuthService.class);
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> new AdminBlogController(jdbc, auth).getVerifiedBlogPosts(new MockHttpServletRequest()));
        verifyNoInteractions(jdbc);
    }
}
