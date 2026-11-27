package com.moneyverse.api.domain.admin.totp;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AdminTotpControllerTest {
    private final AdminAuthService auth = mock(AdminAuthService.class);
    private final AdminTotpService service = mock(AdminTotpService.class);
    private final AdminTotpController controller = new AdminTotpController(auth, service);
    private final UUID actor = UUID.randomUUID();
    private final UUID session = UUID.randomUUID();
    private final MockHttpServletRequest request = new MockHttpServletRequest();

    private void signedIn() {
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        when(auth.currentSessionId(any(), eq(actor))).thenReturn(Optional.of(session));
    }

    @Test void routesLiveUnderTheAdminSecurityPrefix() {
        var mapping = AdminTotpController.class.getAnnotation(RequestMapping.class);
        assertArrayEquals(new String[]{"/api/v1/admin/security/totp", "/api/admin/security/totp"}, mapping.value());
    }

    @Test void statusShape() {
        signedIn();
        when(service.status(actor)).thenReturn(Map.of("enrolled", false, "enforced", false, "available", true));
        var res = controller.status(request);
        assertEquals(200, res.getStatusCode().value());
        assertEquals(false, res.getBody().get("enrolled"));
    }

    @Test void enrolmentResponseIsNeverCached() {
        signedIn();
        when(service.beginEnrolment(actor, session)).thenReturn(Map.of("otpauthUri", "otpauth://totp/x", "keyId", "k"));
        var res = controller.beginEnrolment(request);
        assertEquals(200, res.getStatusCode().value());
        assertEquals("no-store", res.getHeaders().getCacheControl());
    }

    @Test void verifyPassesScopeAndCode() {
        signedIn();
        when(service.verify(actor, session, "backup.restore", "123456")).thenReturn(Map.of("scope", "backup.restore"));
        assertEquals(200, controller.verify(request, Map.of("scope", "backup.restore", "code", "123456")).getStatusCode().value());
    }

    @Test void failuresBecomeTheirStatusAndCode() {
        signedIn();
        when(service.verify(any(), any(), any(), any())).thenThrow(new AdminTotpService.Failure(423, "second_factor_locked"));
        var res = controller.verify(request, Map.of("scope", "backup.restore", "code", "123456"));
        assertEquals(423, res.getStatusCode().value());
        assertEquals("second_factor_locked", res.getBody().get("code"));
    }

    @Test void noSessionMeansLoginRequired() {
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        when(auth.currentSessionId(any(), eq(actor))).thenReturn(Optional.empty());
        assertEquals(401, controller.verify(request, Map.of("scope", "backup.restore", "code", "1")).getStatusCode().value());
        verifyNoInteractions(service);
    }

    @Test void nonStringBodyValuesAreRejected() {
        signedIn();
        assertEquals(400, controller.verify(request, Map.of("scope", 7, "code", "123456")).getStatusCode().value());
        assertEquals(400, controller.confirmEnrolment(request, Map.of()).getStatusCode().value());
        verifyNoInteractions(service);
    }

    @Test void revokeSelfAndOther() {
        signedIn();
        UUID other = UUID.randomUUID();
        when(service.revoke(actor, session, actor)).thenReturn(Map.of("revoked", true));
        when(service.revoke(actor, session, other)).thenReturn(Map.of("revoked", true));
        assertEquals(200, controller.revokeSelf(request).getStatusCode().value());
        assertEquals(200, controller.revokeOther(request, other.toString()).getStatusCode().value());
        assertEquals(400, controller.revokeOther(request, "not-a-uuid").getStatusCode().value());
    }

    @Test void writeMethodsAreMapped() throws Exception {
        assertNotNull(AdminTotpController.class.getMethod("beginEnrolment", jakarta.servlet.http.HttpServletRequest.class).getAnnotation(PostMapping.class));
        assertNotNull(AdminTotpController.class.getMethod("revokeSelf", jakarta.servlet.http.HttpServletRequest.class).getAnnotation(DeleteMapping.class));
    }
}
