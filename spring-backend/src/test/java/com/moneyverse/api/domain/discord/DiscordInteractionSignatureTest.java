package com.moneyverse.api.domain.discord;

import com.moneyverse.api.domain.discord.controller.DiscordInteractionVerifier;
import org.junit.jupiter.api.Assertions;
import org.bouncycastle.crypto.AsymmetricCipherKeyPair;
import org.bouncycastle.crypto.generators.Ed25519KeyPairGenerator;
import org.bouncycastle.crypto.params.Ed25519KeyGenerationParameters;
import org.bouncycastle.crypto.params.Ed25519PublicKeyParameters;
import org.bouncycastle.crypto.signers.Ed25519Signer;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.HexFormat;

import static org.junit.jupiter.api.Assertions.*;

/**
 * AGENTS.md: the public Discord interactions endpoint must verify an Ed25519 signature over
 * timestamp + exact body before parsing (security review 2026-11-25: it verified nothing).
 */
class DiscordInteractionSignatureTest {
    @Test void onlyACorrectSignatureOverTimestampAndExactBodyIsAccepted() {
        var gen = new Ed25519KeyPairGenerator();
        gen.init(new Ed25519KeyGenerationParameters(new SecureRandom()));
        AsymmetricCipherKeyPair kp = gen.generateKeyPair();
        String pub = HexFormat.of().formatHex(((Ed25519PublicKeyParameters) kp.getPublic()).getEncoded());
        String ts = "1764036000", body = "{\"type\":1}";
        var signer = new Ed25519Signer();
        signer.init(true, kp.getPrivate());
        byte[] msg = (ts + body).getBytes(StandardCharsets.UTF_8);
        signer.update(msg, 0, msg.length);
        String sig = HexFormat.of().formatHex(signer.generateSignature());

        var verifier = new DiscordInteractionVerifier(pub);
        assertTrue(verifier.verify(sig, ts, body));
        assertFalse(verifier.verify(sig, ts, body + " "), "body must be byte-exact");
        assertFalse(verifier.verify(sig, "1764036001", body), "timestamp is signed");
        assertFalse(verifier.verify("00".repeat(64), ts, body));
        assertFalse(verifier.verify(null, ts, body));
        assertFalse(verifier.verify("zz", ts, body));
    }

    @Test void withoutAConfiguredKeyNothingIsAccepted() {
        assertFalse(new DiscordInteractionVerifier(null).verify("00".repeat(64), "1", "{}"));
        assertFalse(new DiscordInteractionVerifier("").verify("00".repeat(64), "1", "{}"));
    }
}

class DiscordInteractionEndpointTest {
    @Test void unsignedInteractionsAreRefused() {
        var controller = new com.moneyverse.api.domain.discord.controller.DiscordController(new DiscordInteractionVerifier(null));
        var res = controller.handleInteraction("{\"type\":1}", null, null);
        assertEquals(401, res.getStatusCode().value());
    }
}
