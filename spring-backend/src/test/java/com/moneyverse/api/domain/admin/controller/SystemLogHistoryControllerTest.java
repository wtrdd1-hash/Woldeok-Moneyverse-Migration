package com.moneyverse.api.domain.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.admin.dto.SystemLogSource;
import com.moneyverse.api.domain.admin.service.SystemLogHistoryService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SystemLogHistoryControllerTest {
    private final UserAuthService auth = mock(UserAuthService.class);
    private final AdminLogConsoleGate console = mock(AdminLogConsoleGate.class);
    private final SystemLogHistoryOtpGate otp = mock(SystemLogHistoryOtpGate.class);
    private final SystemLogHistoryService service = mock(SystemLogHistoryService.class);
    private final SystemLogHistoryController subject = new SystemLogHistoryController(auth, console, otp, service);
    private final MockHttpServletRequest request = new MockHttpServletRequest();
    private final MockHttpServletResponse response = new MockHttpServletResponse();
    private UUID actor, sid;

    private void login(String... roles) {
        var session = new UserAuthService.SessionInfo();
        actor = UUID.randomUUID();
        sid = UUID.randomUUID();
        session.setUserId(actor);
        session.setSessionId(sid);
        session.setRoles(List.of(roles));
        when(auth.resolveSession(request)).thenReturn(Optional.of(session));
    }

    private void allowConsole() { when(console.isOpen(sid, actor)).thenReturn(true); }

    @Test void anonymousForgedInternalHeaderNeverReadHistory() {
        request.addHeader("x-internal-token", "forged");
        var denial = assertThrows(ResponseStatusException.class, () ->
                subject.history(request, response, "NGINX_ACCESS", "routine",
                        "2026-11-16T00:00:00Z", "2026-11-17T00:00:00Z", "", 100, null));
        assertEquals(HttpStatus.UNAUTHORIZED, denial.getStatusCode());
        assertEquals("private, no-store", response.getHeader("Cache-Control"));
        verifyNoInteractions(service);
    }

    @Test void adminRoleCannotReadEvenRoutine() {
        login("ADMIN");
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ResponseStatusException.class, () ->
                subject.history(request, response, "NGINX_ACCESS", "routine",
                        "2026-11-16T00:00:00Z", "2026-11-17T00:00:00Z", "", 100, null)).getStatusCode());
        verifyNoInteractions(service);
    }

    @Test void importantLogRequiresRecentSessionBoundOtp() {
        login("SUPERADMIN");
        allowConsole();
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ResponseStatusException.class, () ->
                subject.history(request, response, "NGINX_ERROR", "important",
                        "2026-11-16T00:00:00Z", "2026-11-17T00:00:00Z", "", 100, null)).getStatusCode());
        verifyNoInteractions(service);
    }

    @Test void routineHistoryReadsOnlyAllowedFixedSource() throws Exception {
        login("SUPERADMIN");
        allowConsole();
        var payload = new ObjectMapper().readTree("{\"source\":\"NGINX_ACCESS\",\"status\":\"EMPTY\",\"entries\":[]}");
        when(service.read(eq(SystemLogSource.NGINX_ACCESS), eq("routine"), any(), any(), eq(""), eq(100), isNull()))
                .thenReturn(payload);
        var result = subject.history(request, response, "NGINX_ACCESS", "routine",
                "2026-11-16T00:00:00Z", "2026-11-17T00:00:00Z", "", 100, null);
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("noindex, nofollow", response.getHeader("X-Robots-Tag"));
        assertSame(payload, result.getBody());
    }

    @Test void otpMustBeVerifiedServerSideAndBoundToSession() {
        login("SUPERADMIN");
        allowConsole();
        subject.requestOtp(request, response);
        verify(otp).request(actor, sid);
        when(otp.verify(actor, sid, "123456")).thenReturn(false);
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ResponseStatusException.class,
                () -> subject.verifyOtp(request, response, new SystemLogHistoryController.VerifyOtpRequest("123456"))).getStatusCode());
        when(otp.verify(actor, sid, "654321")).thenReturn(true);
        assertEquals(HttpStatus.OK, subject.verifyOtp(request, response,
                new SystemLogHistoryController.VerifyOtpRequest("654321")).getStatusCode());
    }

    @Test void actualHttpAnonymousAccessReturns401AndPrivateHeaders() throws Exception {
        var mvc = org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup(subject).build();
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                        "/api/v1/admin/logs/system/history")
                        .header("x-internal-token", "forged")
                        .param("source", "NGINX_ACCESS")
                        .param("start", "2026-11-16T00:00:00Z")
                        .param("end", "2026-11-17T00:00:00Z"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isUnauthorized())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header()
                        .string("Cache-Control", "private, no-store"));
    }

    @Test void unknownSourceDoesNotFallback() {
        login("SUPERADMIN");
        allowConsole();
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ResponseStatusException.class, () ->
                subject.history(request, response, "../../etc", "routine",
                        "2026-11-16T00:00:00Z", "2026-11-17T00:00:00Z", "", 10, null)).getStatusCode());
        verifyNoInteractions(service);
    }
}
