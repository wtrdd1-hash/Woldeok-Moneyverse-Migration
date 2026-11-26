package com.moneyverse.api.security;

import com.moneyverse.api.domain.admin.service.EncryptionService;
import org.junit.jupiter.api.Test;

import java.nio.file.*;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Security 2026-11-26 (PR #3454 P1 recheck): a 64-hex internal token was committed as a default
 * in application.yml, UserAuthService, EncryptionService and the frontend gateway, and the
 * production configuration used that same value. No secret-shaped default may return, and the
 * admin controllers may not trust an x-internal-token header.
 */
class CommittedSecretRegressionTest {
    private static final Pattern HEX_DEFAULT = Pattern.compile("(internal-token|INTERNAL_API_TOKEN|internalToken)[^\\n]{0,40}[0-9a-f]{32,}");

    @Test void noSecretShapedDefaultsInSourceOrConfig() throws Exception {
        try (Stream<Path> files = Files.walk(Path.of("src/main"))) {
            var offenders = files.filter(Files::isRegularFile)
                    .filter(p -> p.toString().endsWith(".java") || p.toString().endsWith(".yml") || p.toString().endsWith(".properties"))
                    .filter(p -> { try { return HEX_DEFAULT.matcher(Files.readString(p)).find(); } catch (Exception e) { return false; } })
                    .toList();
            assertEquals(java.util.List.of(), offenders);
        }
    }

    @Test void adminControllersDoNotTrustAnInternalTokenHeader() throws Exception {
        for (String f : new String[]{"src/main/java/com/moneyverse/api/domain/admin/controller/AdminBackupController.java",
                "src/main/java/com/moneyverse/api/domain/admin/controller/AuditController.java"}) {
            assertFalse(Files.readString(Path.of(f)).contains("getHeader(\"x-internal-token\")"), f);
        }
    }

    @Test void withoutKeyMaterialCiphertextStaysUnreadableInsteadOfUsingAKnownKey() {
        var svc = new EncryptionService("", "", "");
        assertEquals("enc:v1:abc:def", svc.decrypt("enc:v1:abc:def"));
        assertEquals("plain", svc.decrypt("plain"));
    }
}
