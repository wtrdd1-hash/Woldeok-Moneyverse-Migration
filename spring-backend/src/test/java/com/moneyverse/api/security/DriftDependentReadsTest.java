package com.moneyverse.api.security;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 2026-11-26: these paths read tables the migration chain does not grant to the application role
 * (in a clean database sign-in answered 500 and the quote streamer logged permission denied every
 * 2 s). They now read through SECURITY DEFINER functions (180, 356, stock_market_overview). This
 * guard fails if a direct read of those tables comes back.
 */
class DriftDependentReadsTest {
    private static final Map<String, String> FORBIDDEN = Map.of(
            "src/main/java/com/moneyverse/api/domain/identity/service/UserAuthService.java",
            "(?i)\\b(FROM|JOIN)\\s+(public\\.)?(auth_local_credentials|member_profiles|user_roles|admin_role_designations)\\b",
            "src/main/java/com/moneyverse/api/socket/streamer/StockMarketSocketStreamer.java",
            "(?i)\\b(FROM|JOIN)\\s+(public\\.)?virtual_stocks\\b",
            // Admin roles come only from admin_current_roles; a user_roles fallback would grant
            // roles from a table the chain does not grant when the authoritative function fails.
            "src/main/java/com/moneyverse/api/domain/admin/service/AdminAuthService.java",
            "(?i)\\b(FROM|JOIN)\\s+(public\\.)?user_roles\\b");

    @Test void signInSessionAndQuoteStreamReadThroughFunctions() throws Exception {
        for (var e : FORBIDDEN.entrySet()) {
            String src = Files.readString(Path.of(e.getKey()));
            var m = Pattern.compile(e.getValue()).matcher(src);
            assertFalse(m.find(), e.getKey() + " reads a table the application role is not granted: " + (m.hitEnd() ? "" : m.group()));
        }
    }
}
