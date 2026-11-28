package com.moneyverse.api.domain.admin.totp;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.Base64;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class TotpSecretSealerTest {
    // Synthetic test key (32 bytes of 0x01..0x20); never a deployment value.
    private static final String KEY;
    static {
        byte[] k = new byte[32];
        for (int i = 0; i < 32; i++) k[i] = (byte) (i + 1);
        KEY = Base64.getEncoder().encodeToString(k);
    }
    private final TotpSecretSealer sealer = new TotpSecretSealer(KEY, "test-k1");
    private final UUID alice = UUID.fromString("00000000-0000-4000-8000-00000000000a");
    private final UUID bob = UUID.fromString("00000000-0000-4000-8000-00000000000b");
    private final byte[] secret = "12345678901234567890".getBytes();

    @Test void roundTrips() {
        assertTrue(sealer.available());
        assertEquals("test-k1", sealer.keyId());
        assertArrayEquals(secret, sealer.open(alice, "test-k1", sealer.seal(alice, secret)));
    }

    @Test void rowSwapFailsBecauseUserIdIsAuthenticated() {
        String sealed = sealer.seal(alice, secret);
        assertThrows(IllegalStateException.class, () -> sealer.open(bob, "test-k1", sealed));
    }

    @Test void wrongKeyIdFails() {
        String sealed = sealer.seal(alice, secret);
        assertThrows(IllegalStateException.class, () -> sealer.open(alice, "test-k2", sealed));
    }

    @Test void tamperedTagFails() {
        byte[] raw = Base64.getDecoder().decode(sealer.seal(alice, secret));
        raw[raw.length - 1] ^= 1;
        String tampered = Base64.getEncoder().encodeToString(raw);
        assertThrows(IllegalStateException.class, () -> sealer.open(alice, "test-k1", tampered));
    }

    @Test void sealsAreRandomised() {
        assertNotEquals(sealer.seal(alice, secret), sealer.seal(alice, secret));
    }

    @Test void aDifferentKeyCannotOpen() {
        byte[] other = new byte[32];
        String sealed = sealer.seal(alice, secret);
        var second = new TotpSecretSealer(Base64.getEncoder().encodeToString(other), "test-k1");
        assertThrows(IllegalStateException.class, () -> second.open(alice, "test-k1", sealed));
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "   ", "not base64!!", "AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHw=="})
    void unusableKeyMakesTheSealerUnavailable(String key) {
        var s = new TotpSecretSealer(key, "test-k1");
        assertFalse(s.available());
        assertThrows(IllegalStateException.class, () -> s.seal(alice, secret));
        assertThrows(IllegalStateException.class, () -> s.open(alice, "test-k1", "AAAA"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "UPPER", "-lead", "has space"})
    void invalidKeyIdMakesTheSealerUnavailable(String keyId) {
        assertFalse(new TotpSecretSealer(KEY, keyId).available());
    }

    @Test void nullConfigurationIsUnavailable() {
        assertFalse(new TotpSecretSealer(null, null).available());
    }
}
