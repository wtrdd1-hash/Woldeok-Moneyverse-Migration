package com.moneyverse.api.domain.support;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.support.controller.AdminSupportController;
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
 * W03 admin QA: /admin/support crashed (React #441) because GET /api/v1/admin/support/threads was
 * never ported to Spring (404). The console now reads and writes through the existing role-checked
 * functions (admin_support_threads, admin_support_thread_messages, admin_support_reply,
 * admin_support_set_status) with the verified administrator as actor.
 */
class AdminSupportControllerTest {
    private final UUID actor = UUID.randomUUID();

    private AdminAuthService admin(UUID id) {
        AdminAuthService auth = mock(AdminAuthService.class);
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.ofNullable(id));
        return auth;
    }

    @Test void threadsComeFromTheRoleCheckedFunction() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForList(contains("public.admin_support_threads(?::uuid, ?, ?::integer)"), eq(actor), eq("open"), eq(200)))
                .thenReturn(List.of(Map.of("thread_id", "t")));
        var body = new AdminSupportController(admin(actor), jdbc).threads(new MockHttpServletRequest(), "open").getBody();
        assertEquals(1, ((List<?>) body.get("threads")).size());
    }

    @Test void anUnknownStatusFilterIsIgnoredNotPassedThrough() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        new AdminSupportController(admin(actor), jdbc).threads(new MockHttpServletRequest(), "drop table");
        verify(jdbc).queryForList(contains("admin_support_threads"), eq(actor), isNull(), eq(200));
    }

    @Test void messagesComeFromTheRoleCheckedFunction() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID thread = UUID.randomUUID();
        new AdminSupportController(admin(actor), jdbc).messages(new MockHttpServletRequest(), thread.toString());
        verify(jdbc).queryForList(contains("public.admin_support_thread_messages(?::uuid, ?::uuid, ?::integer)"), eq(actor), eq(thread), eq(500));
    }

    @Test void aReplyReturnsTheFunctionReceipt() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID thread = UUID.randomUUID(), key = UUID.randomUUID();
        when(jdbc.queryForList(contains("public.admin_support_reply(?::uuid, ?::uuid, ?::uuid, ?)"), eq(actor), eq(key), eq(thread), eq("hello")))
                .thenReturn(List.of(Map.of("message_id", "m", "sender_kind", "admin", "body", "hello", "created_at", "2026-11-27T00:00:00Z")));
        var body = new AdminSupportController(admin(actor), jdbc)
                .reply(new MockHttpServletRequest(), thread.toString(), Map.of("body", "hello", "idempotencyKey", key.toString())).getBody();
        assertEquals("admin", ((Map<?, ?>) body.get("message")).get("sender_kind"));
    }

    @Test void aReplyWithoutAKeyIsRejectedBeforeAnyWrite() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        var e = assertThrows(ResponseStatusException.class, () -> new AdminSupportController(admin(actor), jdbc)
                .reply(new MockHttpServletRequest(), UUID.randomUUID().toString(), Map.of("body", "hello")));
        assertEquals(400, e.getStatusCode().value());
        verifyNoInteractions(jdbc);
    }

    @Test void statusIsConfirmedOnlyByTheFunction() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID thread = UUID.randomUUID();
        when(jdbc.queryForObject(contains("public.admin_support_set_status(?::uuid, ?::uuid, ?)"), eq(Boolean.class), eq(actor), eq(thread), eq("resolved"))).thenReturn(true);
        var body = new AdminSupportController(admin(actor), jdbc).status(new MockHttpServletRequest(), thread.toString(), Map.of("status", "resolved")).getBody();
        assertEquals("resolved", body.get("status"));
        JdbcTemplate refusing = mock(JdbcTemplate.class);
        when(refusing.queryForObject(anyString(), eq(Boolean.class), any(), any(), any())).thenReturn(false);
        var e = assertThrows(ResponseStatusException.class, () -> new AdminSupportController(admin(actor), refusing)
                .status(new MockHttpServletRequest(), thread.toString(), Map.of("status", "resolved")));
        assertEquals(404, e.getStatusCode().value());
    }

    @Test void aFailedSourceIsUnavailableAndANonAdministratorIsRefused() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForList(anyString(), eq(actor), isNull(), eq(200))).thenThrow(new DataAccessResourceFailureException("down"));
        var down = assertThrows(ResponseStatusException.class, () -> new AdminSupportController(admin(actor), jdbc).threads(new MockHttpServletRequest(), null));
        assertEquals(503, down.getStatusCode().value());
        JdbcTemplate untouched = mock(JdbcTemplate.class);
        var refused = assertThrows(ResponseStatusException.class, () -> new AdminSupportController(admin(null), untouched).threads(new MockHttpServletRequest(), null));
        assertEquals(401, refused.getStatusCode().value());
        verifyNoInteractions(untouched);
    }
}
