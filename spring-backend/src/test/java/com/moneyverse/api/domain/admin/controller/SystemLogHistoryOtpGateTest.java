package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.service.AdminChannelOtpService;
import org.junit.jupiter.api.Test;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SystemLogHistoryOtpGateTest {
    @Test void grantOnlyAfterConsumedOneTimeCodeAndOnlyForExactSession() {
        var otp = mock(AdminChannelOtpService.class);
        var gate = new SystemLogHistoryOtpGate(otp);
        var actor = UUID.randomUUID();
        var session = UUID.randomUUID();
        assertFalse(gate.allowed(actor, session));
        assertFalse(gate.verify(actor, session, "bad"));
        gate.request(actor, session);
        String key = "log-history:" + UUID.nameUUIDFromBytes((actor + ":" + session).getBytes(java.nio.charset.StandardCharsets.UTF_8));
        verify(otp).requestOtp(eq(key), anyString());
        assertThrows(IllegalStateException.class, () -> gate.request(actor, session));
        when(otp.verifyOtp(key, "123456")).thenReturn(true);
        assertTrue(gate.verify(actor, session, "123456"));
        assertTrue(gate.allowed(actor, session));
        assertFalse(gate.allowed(actor, UUID.randomUUID()));
        assertFalse(gate.allowed(UUID.randomUUID(), session));
    }
}
