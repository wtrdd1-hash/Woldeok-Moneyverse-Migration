package com.moneyverse.api.domain.admin.totp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Seals administrator TOTP secrets with AES-256-GCM under a key that exists only in the
 * deployment's environment, so a database read alone never yields a usable factor (the reason
 * 058 gave for keeping the verifier out of SQL, and still the reason).
 *
 * The key is exactly 32 random bytes, base64. It is deliberately not derived from a passphrase
 * and there is no fallback to any other configured secret: EncryptionService's fallback chain
 * ended at an internal token that was later found committed, which is the failure this class
 * must not be able to repeat. With no usable key the sealer reports unavailable and refuses.
 *
 * The additional authenticated data is {@code userId|keyId}: a ciphertext copied onto another
 * administrator's row, or relabelled with another key id, fails authentication instead of
 * opening as that administrator's factor.
 */
@Component
public class TotpSecretSealer {
    private static final Logger log = LoggerFactory.getLogger(TotpSecretSealer.class);
    private static final Pattern KEY_ID = Pattern.compile("^[a-z0-9][a-z0-9_.:-]{0,63}$");
    private static final int NONCE_BYTES = 12;
    private static final int TAG_BITS = 128;

    private final SecretKey key;
    private final String keyId;
    private final SecureRandom random = new SecureRandom();

    public TotpSecretSealer(@Value("${moneyverse.security.admin-totp-key:}") String base64Key,
                            @Value("${moneyverse.security.admin-totp-key-id:}") String keyId) {
        SecretKey parsed = null;
        if (base64Key != null && !base64Key.isBlank() && keyId != null && KEY_ID.matcher(keyId).matches()) {
            try {
                byte[] raw = Base64.getDecoder().decode(base64Key.trim());
                if (raw.length == 32) parsed = new SecretKeySpec(raw, "AES");
            } catch (IllegalArgumentException malformed) {
                parsed = null;
            }
        }
        if (parsed == null) {
            // States only that the factor is unavailable; never the configured value.
            log.warn("[AdminTotp] no usable TOTP sealing key configured; enrolment and verification are unavailable");
        }
        this.key = parsed;
        this.keyId = parsed == null ? null : keyId;
    }

    public boolean available() {
        return key != null;
    }

    public String keyId() {
        return keyId;
    }

    public String seal(UUID user, byte[] secret) {
        requireAvailable();
        try {
            byte[] nonce = new byte[NONCE_BYTES];
            random.nextBytes(nonce);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, nonce));
            cipher.updateAAD(aad(user, keyId));
            byte[] body = cipher.doFinal(secret);
            return Base64.getEncoder().encodeToString(ByteBuffer.allocate(nonce.length + body.length).put(nonce).put(body).array());
        } catch (Exception e) {
            throw new IllegalStateException("TOTP secret could not be sealed");
        }
    }

    public byte[] open(UUID user, String rowKeyId, String sealed) {
        requireAvailable();
        try {
            if (!keyId.equals(rowKeyId)) throw new IllegalStateException("sealed with another key");
            byte[] raw = Base64.getDecoder().decode(sealed);
            if (raw.length <= NONCE_BYTES + TAG_BITS / 8) throw new IllegalStateException("truncated");
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, raw, 0, NONCE_BYTES));
            cipher.updateAAD(aad(user, rowKeyId));
            return cipher.doFinal(raw, NONCE_BYTES, raw.length - NONCE_BYTES);
        } catch (Exception e) {
            // One message for every cause, so the caller cannot distinguish key, tag or format.
            throw new IllegalStateException("TOTP secret could not be opened");
        }
    }

    private void requireAvailable() {
        if (key == null) throw new IllegalStateException("TOTP sealing key unavailable");
    }

    private static byte[] aad(UUID user, String keyId) {
        return (user + "|" + keyId).getBytes(StandardCharsets.UTF_8);
    }
}
