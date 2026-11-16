package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.dto.SystemLogResponse;
import com.moneyverse.api.domain.admin.dto.SystemLogSource;
import com.moneyverse.api.domain.admin.service.SystemLogService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SystemLogAuthorizationUnitTest {
    private final SystemLogService service = mock(SystemLogService.class);
    private final UserAuthService auth = mock(UserAuthService.class);
    private final AdminLogConsoleGate gate = mock(AdminLogConsoleGate.class);
    private final SystemLogController controller = new SystemLogController(service, auth, gate);
    private UUID sessionId;
    private UUID userId;
    private final MockHttpServletRequest request = new MockHttpServletRequest();
    private final MockHttpServletResponse response = new MockHttpServletResponse();

    private void sessionWithRoles(String... roles) {
        UserAuthService.SessionInfo session = new UserAuthService.SessionInfo();
        userId = UUID.randomUUID();
        sessionId = UUID.randomUUID();
        session.setUserId(userId);
        session.setSessionId(sessionId);
        session.setRoles(List.of(roles));
        when(auth.resolveSession(request)).thenReturn(Optional.of(session));
    }

    @Test
    void ordinaryAdminsCannotReadRuntimeLogs() {
        sessionWithRoles("ADMIN");
        ResponseStatusException denial = assertThrows(ResponseStatusException.class,
                () -> controller.getSystemLogs(request, response, "NGINX_ACCESS", 50, null));
        assertEquals(HttpStatus.FORBIDDEN, denial.getStatusCode());
        assertEquals("private, no-store", response.getHeader("Cache-Control"));
        verifyNoInteractions(service);
    }

    @Test
    void superadminReadsOnlyAllowlistedSources() {
        sessionWithRoles("SUPERADMIN");
        when(gate.isOpen(sessionId, userId)).thenReturn(true);
        var item = new SystemLogResponse("frontend", "FRONTEND", List.of("safe"), 1, false, "2026-11-17T00:00:00Z", "OK");
        when(service.getLogs(SystemLogSource.FRONTEND, 50, "error")).thenReturn(item);
        var result = controller.getSystemLogs(request, response, "FRONTEND", 50, "error");
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(item, result.getBody());
        assertEquals("private, no-store", response.getHeader("Cache-Control"));
        assertEquals("noindex, nofollow", response.getHeader("X-Robots-Tag"));
        verify(service).getLogs(SystemLogSource.FRONTEND, 50, "error");
    }

    @Test
    void superadminWithoutOpenConsoleCannotReadLogs() {
        sessionWithRoles("SUPERADMIN");
        when(gate.isOpen(sessionId, userId)).thenReturn(false);
        ResponseStatusException denied = assertThrows(ResponseStatusException.class,
                () -> controller.getSystemLogs(request, response, "SPRING_BACKEND", 50, null));
        assertEquals(HttpStatus.FORBIDDEN, denied.getStatusCode());
        verifyNoInteractions(service);
    }

    @Test
    void superadminCannotSelectUnknownSourceOrExcessiveLines() {
        sessionWithRoles("SUPERADMIN");
        when(gate.isOpen(sessionId, userId)).thenReturn(true);
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ResponseStatusException.class,
                () -> controller.getSystemLogs(request, response, "../../etc/passwd", 50, null)).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ResponseStatusException.class,
                () -> controller.getSystemLogs(request, response, "NGINX_ACCESS", 10000, null)).getStatusCode());
        verifyNoInteractions(service);
    }
}
