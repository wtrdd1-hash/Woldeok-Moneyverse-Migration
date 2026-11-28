package com.moneyverse.api.domain.admin.totp;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.OptionalLong;
import java.util.regex.Pattern;

/**
 * RFC 6238 TOTP (HMAC-SHA1, 6 digits, 30-second steps), the parameters every standard
 * authenticator app accepts by default. HMAC comes from the JCA; only the RFC 4226 dynamic
 * truncation is written here, and it is pinned by the RFC 6238 Appendix B vectors in the test.
 * A TOTP library was considered and not added: it would be a new dependency for twenty lines of
 * specified arithmetic.
 */
public final class TotpCodec {
    public static final int DIGITS = 6;
    public static final int PERIOD_SECONDS = 30;
    /** Clock tolerance in steps on each side; the database applies the same bound independently. */
    public static final int WINDOW = 1;
    private static final Pattern SIX_ASCII_DIGITS = Pattern.compile("[0-9]{6}");
    private static final char[] BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".toCharArray();

    private TotpCodec() {}

    public static long stepAt(long epochSeconds) {
        return Math.floorDiv(epochSeconds, PERIOD_SECONDS);
    }

    public static String code(byte[] secret, long step) {
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(secret, "HmacSHA1"));
            byte[] h = mac.doFinal(java.nio.ByteBuffer.allocate(8).putLong(step).array());
            int offset = h[h.length - 1] & 0x0f;
            int binary = ((h[offset] & 0x7f) << 24) | ((h[offset + 1] & 0xff) << 16)
                    | ((h[offset + 2] & 0xff) << 8) | (h[offset + 3] & 0xff);
            return String.format("%06d", binary % 1_000_000);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("HmacSHA1 unavailable", e);
        }
    }

    /**
     * The step whose code equals {@code code} within the window around now, or empty. Every
     * candidate is compared (no early exit) and in constant time, so timing does not reveal which
     * step matched or how many digits did.
     */
    public static OptionalLong matchStep(byte[] secret, String code, long nowEpochSeconds) {
        if (secret == null || code == null || !SIX_ASCII_DIGITS.matcher(code).matches()) return OptionalLong.empty();
        byte[] supplied = code.getBytes(StandardCharsets.US_ASCII);
        long now = stepAt(nowEpochSeconds);
        long matched = Long.MIN_VALUE;
        for (long step = now - WINDOW; step <= now + WINDOW; step++) {
            if (MessageDigest.isEqual(code(secret, step).getBytes(StandardCharsets.US_ASCII), supplied) && matched == Long.MIN_VALUE) {
                matched = step;
            }
        }
        return matched == Long.MIN_VALUE ? OptionalLong.empty() : OptionalLong.of(matched);
    }

    public static byte[] newSecret(SecureRandom random) {
        byte[] secret = new byte[20]; // RFC 4226 recommends the HMAC-SHA1 output length, 160 bits
        random.nextBytes(secret);
        return secret;
    }

    public static String base32(byte[] data) {
        StringBuilder out = new StringBuilder((data.length * 8 + 4) / 5);
        int buffer = 0, bits = 0;
        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xff);
            bits += 8;
            while (bits >= 5) {
                out.append(BASE32[(buffer >> (bits - 5)) & 31]);
                bits -= 5;
            }
        }
        if (bits > 0) out.append(BASE32[(buffer << (5 - bits)) & 31]);
        return out.toString();
    }

    public static String otpauthUri(String issuer, String account, byte[] secret) {
        String i = encode(issuer);
        return "otpauth://totp/" + i + ":" + encode(account) + "?secret=" + base32(secret)
                + "&issuer=" + i + "&algorithm=SHA1&digits=" + DIGITS + "&period=" + PERIOD_SECONDS;
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
