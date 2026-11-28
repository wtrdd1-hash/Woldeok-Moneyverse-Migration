package com.moneyverse.api.domain.admin.totp;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

import static org.junit.jupiter.api.Assertions.*;

class TotpCodecTest {
    // RFC 6238 Appendix B, SHA-1 seed.
    private static final byte[] RFC_SECRET = "12345678901234567890".getBytes(StandardCharsets.US_ASCII);

    @ParameterizedTest
    @CsvSource({"59,287082", "1111111109,081804", "1111111111,050471", "1234567890,005924", "2000000000,279037"})
    void matchesRfc6238Vectors(long epochSeconds, String expected) {
        assertEquals(expected, TotpCodec.code(RFC_SECRET, TotpCodec.stepAt(epochSeconds)));
        assertEquals(TotpCodec.stepAt(epochSeconds), TotpCodec.matchStep(RFC_SECRET, expected, epochSeconds).getAsLong());
    }

    @Test
    void acceptsAdjacentStepsOnly() {
        long now = 1_800_000_000L;
        long step = TotpCodec.stepAt(now);
        for (long delta = -1; delta <= 1; delta++) {
            String code = TotpCodec.code(RFC_SECRET, step + delta);
            assertEquals(step + delta, TotpCodec.matchStep(RFC_SECRET, code, now).getAsLong(), "delta " + delta);
        }
        for (long delta : new long[]{-2, 2}) {
            String code = TotpCodec.code(RFC_SECRET, step + delta);
            // A distant code may collide with an adjacent one by chance; only assert it is not matched as itself.
            var match = TotpCodec.matchStep(RFC_SECRET, code, now);
            assertTrue(match.isEmpty() || match.getAsLong() != step + delta, "delta " + delta);
        }
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "12345", "1234567", "12a456", " 287082", "２８７０８２"})
    void rejectsMalformedCodes(String code) {
        assertTrue(TotpCodec.matchStep(RFC_SECRET, code, 59).isEmpty());
    }

    @Test
    void encodesBase32AndOtpauthUri() {
        assertEquals("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", TotpCodec.base32(RFC_SECRET));
        String uri = TotpCodec.otpauthUri("Woldeok Moneyverse", "admin 1", RFC_SECRET);
        assertEquals("otpauth://totp/Woldeok%20Moneyverse:admin%201?secret=GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"
                + "&issuer=Woldeok%20Moneyverse&algorithm=SHA1&digits=6&period=30", uri);
    }

    @Test
    void newSecretsAreTwentyRandomBytes() {
        var random = new SecureRandom();
        byte[] a = TotpCodec.newSecret(random), b = TotpCodec.newSecret(random);
        assertEquals(20, a.length);
        assertFalse(java.util.Arrays.equals(a, b));
    }
}
