package com.moneyverse.api.domain.identity;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

/**
 * S04 defensive review: on a failed or malformed provider token exchange the controller logged the
 * whole token-response body, which can carry tokens issued for the member (refresh/id tokens).
 * Logs keep the status and the provider's error code only.
 */
class OAuthTokenResponseLoggingTest {
    @Test void tokenResponseBodiesAreNeverLogged() throws Exception {
        String source = Files.readString(Path.of("src/main/java/com/moneyverse/api/domain/identity/controller/OAuthController.java"));
        for (String line : source.split("\n")) {
            if (line.contains("log.")) assertFalse(line.replace("providerError(tokenResponse.body())", "").contains("tokenResponse.body()"), line.trim());
        }
    }
}
