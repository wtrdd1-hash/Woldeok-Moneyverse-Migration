package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.service.SystemLogService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SystemLogAuthorizationTest {
    @Test void callerSuppliedInternalHeaderCannotAuthorizePrivateLogs(){
        var logs=mock(SystemLogService.class);var users=mock(UserAuthService.class);
        var controller=new SystemLogController(logs,users);
        var request=new MockHttpServletRequest("GET","/api/v1/admin/logs/system");
        request.addHeader("x-internal-token","not-an-administrator");
        var refusal=assertThrows(ResponseStatusException.class,()->controller.getSystemLogs(request,"NGINX_ERROR",10,null));
        assertEquals(401,refusal.getStatusCode().value());verifyNoInteractions(logs);
    }
    @Test void ordinarySignedInMemberCannotReadPrivateLogs(){
        var logs=mock(SystemLogService.class);var users=mock(UserAuthService.class);
        var request=new MockHttpServletRequest();var member=new UserAuthService.SessionInfo();
        member.setUserId(java.util.UUID.randomUUID());member.setRoles(java.util.List.of("member"));
        when(users.resolveSession(request)).thenReturn(java.util.Optional.of(member));
        var controller=new SystemLogController(logs,users);
        var refusal=assertThrows(ResponseStatusException.class,()->controller.getSystemLogs(request,"NGINX_ERROR",10,null));
        assertEquals(403,refusal.getStatusCode().value());verifyNoInteractions(logs);
    }
}
