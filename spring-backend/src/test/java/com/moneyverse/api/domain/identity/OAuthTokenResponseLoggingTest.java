package com.moneyverse.api.domain.identity;

import com.moneyverse.api.domain.identity.controller.OAuthController;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

/**
 * S04 defensive review + independent review: provider responses can carry tokens and member
 * profile data, and callback query values are attacker-controlled. Logs carry only allowlisted
 * OAuth error codes, a known provider label, status codes and exception classes; the client never
 * receives an exception message.
 */
class OAuthTokenResponseLoggingTest {
    private static String source() throws Exception {
        return Files.readString(Path.of("src/main/java/com/moneyverse/api/domain/identity/controller/OAuthController.java"));
    }

    @Test void noResponseBodyOrExceptionIsLoggedWhole() throws Exception {
        for (String line : source().split("\n")) {
            if (!line.contains("log.")) continue;
            String l = line.replace("oauthErrorCode(tokenResponse.body())", "");
            assertFalse(l.contains(".body()"), line.trim());
            assertFalse(l.matches(".*,\\s*e\\);.*"), "exception object logged: " + line.trim());
            assertFalse(l.contains("displayName"), "profile data logged: " + line.trim());
        }
    }

    @Test void theClientNeverReceivesAnExceptionMessage() throws Exception {
        assertFalse(source().contains("e.getMessage()"));
    }

    @Test void onlyStandardErrorCodesAreKept() {
        assertEquals("invalid_grant", OAuthController.oauthErrorCode("{\"error\":\"invalid_grant\"}"));
        assertEquals("access_denied", OAuthController.oauthErrorParam("access_denied"));
        assertEquals("other", OAuthController.oauthErrorCode("{\"error\":\"ya29_short_token_value\"}"));
        assertEquals("other", OAuthController.oauthErrorParam("x\nforged log line"));
        assertEquals("other", OAuthController.oauthErrorCode("not json"));
        assertEquals("other", OAuthController.oauthErrorParam(null));
    }

    @Test void theProviderLabelIsKnownOrOther() {
        assertEquals("google", OAuthController.providerLabel("Google"));
        assertEquals("other", OAuthController.providerLabel("evil\nline"));
    }

    /** Re-review (low): an unsupported provider is answered with a fixed message, not an echo. */
    @Test void theUnsupportedProviderResponseEchoesNothing() throws Exception {
        assertFalse(source().contains("+ provider)"));
    }
}
