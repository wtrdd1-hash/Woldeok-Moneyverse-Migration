package com.moneyverse.api.domain.seo;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.seo.controller.SeoController;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** seo_crawler_logs is not granted to the application role; the console reads 364 with the administrator. */
class SeoCrawlerLogsSourceTest {
    @Test void logsComeFromTheAdministratorFunction() {
        UUID actor = UUID.randomUUID();
        AdminAuthService auth = mock(AdminAuthService.class);
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForList(anyString(), any(Object[].class))).thenReturn(Collections.emptyList());
        new SeoController(jdbc, auth).getAdminStatus(new MockHttpServletRequest());
        verify(jdbc).queryForList(contains("public.admin_seo_crawler_logs_read(?::uuid, ?::integer)"), eq(actor), eq(300));
    }

    @Test void nonAdministratorIsRefused() {
        AdminAuthService auth = mock(AdminAuthService.class);
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.empty());
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        var e = assertThrows(ResponseStatusException.class, () -> new SeoController(jdbc, auth).getAdminStatus(new MockHttpServletRequest()));
        assertEquals(401, e.getStatusCode().value());
        verifyNoInteractions(jdbc);
    }
}
