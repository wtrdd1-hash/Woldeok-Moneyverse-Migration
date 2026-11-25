package com.moneyverse.api.domain.discord.controller;

import org.bouncycastle.crypto.params.Ed25519PublicKeyParameters;
import org.bouncycastle.crypto.signers.Ed25519Signer;

import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

/**
 * Discord interaction request verification: Ed25519 over (X-Signature-Timestamp + raw body),
 * hex-encoded signature and public key. Without a configured key every request is refused.
 */
public class DiscordInteractionVerifier {
    private final Ed25519PublicKeyParameters key;

    public DiscordInteractionVerifier(String publicKeyHex) {
        Ed25519PublicKeyParameters k = null;
        try {
            if (publicKeyHex != null && publicKeyHex.trim().length() == 64) {
                k = new Ed25519PublicKeyParameters(HexFormat.of().parseHex(publicKeyHex.trim()), 0);
            }
        } catch (RuntimeException ignored) {
            k = null;
        }
        this.key = k;
    }

    public boolean configured() { return key != null; }

    public boolean verify(String signatureHex, String timestamp, String rawBody) {
        if (key == null || signatureHex == null || timestamp == null || rawBody == null) return false;
        try {
            byte[] sig = HexFormat.of().parseHex(signatureHex.trim());
            if (sig.length != 64) return false;
            byte[] msg = (timestamp + rawBody).getBytes(StandardCharsets.UTF_8);
            Ed25519Signer v = new Ed25519Signer();
            v.init(false, key);
            v.update(msg, 0, msg.length);
            return v.verifySignature(sig);
        } catch (RuntimeException e) {
            return false;
        }
    }
}
