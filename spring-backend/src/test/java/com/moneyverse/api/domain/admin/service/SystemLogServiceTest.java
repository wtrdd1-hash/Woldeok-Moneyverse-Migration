package com.moneyverse.api.domain.admin.service;

import com.moneyverse.api.domain.admin.dto.SystemLogSource;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SystemLogServiceTest {
    @Test
    void masksSecretsAndMemberIdentifiers() {
        String raw = "Authorization: Bearer abcdefgh12345 cookie: mv_session=someveryprivatevalue email=jane@example.com /api/?token=secret123&password=hunter2";
        String cleaned = SystemLogService.redact(raw);
        assertFalse(cleaned.contains("abcdefgh12345"));
        assertFalse(cleaned.contains("someveryprivatevalue"));
        assertFalse(cleaned.contains("jane@example.com"));
        assertFalse(cleaned.contains("secret123"));
        assertFalse(cleaned.contains("hunter2"));
        assertTrue(cleaned.contains("[REDACTED]"));
    }

    @Test
    void masksUrlQuerySecretsIndependentOfKnownParameterNames() {
        String cleaned = SystemLogService.redact("GET /login?code=secretCode&state=secretState HTTP/1.1 from 192.0.2.44");
        assertFalse(cleaned.contains("secretCode"));
        assertFalse(cleaned.contains("secretState"));
        assertFalse(cleaned.contains("192.0.2.44"));
    }

    @Test
    void masksStructuredFieldsAndUuids() {
        String cleaned = SystemLogService.redact("{\"access_token\":\"payload123\",\"password\":\"p455w0rd\"} user=f39c8aa9-9609-48c5-a80a-5745dab55370");
        assertFalse(cleaned.contains("payload123"));
        assertFalse(cleaned.contains("p455w0rd"));
        assertFalse(cleaned.contains("f39c8aa9-9609-48c5-a80a-5745dab55370"));
    }

    @Test
    void unknownSourceIsNotSilentlyMappedToNginx() {
        assertThrows(IllegalArgumentException.class, () -> SystemLogSource.fromString("UNKNOWN"));
    }

    @Test
    void excessiveFilterIsRejected() {
        assertThrows(IllegalArgumentException.class, () ->
                new SystemLogService().getLogs(SystemLogSource.NGINX_ERROR, 10, "X".repeat(200)));
    }
}
