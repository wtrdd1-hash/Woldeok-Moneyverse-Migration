package com.moneyverse.api.domain.admin.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

@Service
public class EncryptionService {

    private static final Logger log = LoggerFactory.getLogger(EncryptionService.class);

    private final SecretKey secretKey;

    public EncryptionService(
            @Value("${moneyverse.security.encryption-key:}") String dataEncryptionKey,
            @Value("${moneyverse.security.internal-token:8e5f2a1b9c3d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f}") String internalToken,
            @Value("${moneyverse.security.app-secret:}") String appSecret
    ) {
        String rawKey = (dataEncryptionKey != null && !dataEncryptionKey.isBlank()) ? dataEncryptionKey :
                (internalToken != null && !internalToken.isBlank()) ? internalToken :
                        (appSecret != null && !appSecret.isBlank()) ? appSecret :
                                "moneyverse-default-vault-secure-encryption-key-32b";
        try {
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = sha256.digest(rawKey.getBytes(StandardCharsets.UTF_8));
            this.secretKey = new SecretKeySpec(keyBytes, "AES");
        } catch (Exception e) {
            throw new IllegalStateException("Failed to initialize AES key", e);
        }
    }

    public String decrypt(String ciphertext) {
        if (ciphertext == null || ciphertext.isBlank() || !ciphertext.startsWith("enc:v1:")) {
            return ciphertext;
        }

        try {
            String[] parts = ciphertext.split(":");
            String ivHex;
            String tagHex;
            String cipherHex;

            if (parts.length == 6 && "enc".equals(parts[0]) && "v1".equals(parts[1])) {
                ivHex = parts[3];
                tagHex = parts[4];
                cipherHex = parts[5];
            } else if (parts.length == 5 && "enc".equals(parts[0]) && "v1".equals(parts[1])) {
                ivHex = parts[2];
                tagHex = parts[3];
                cipherHex = parts[4];
            } else {
                return ciphertext;
            }

            HexFormat hex = HexFormat.of();
            byte[] iv = hex.parseHex(ivHex);
            byte[] tag = hex.parseHex(tagHex);
            byte[] encrypted = hex.parseHex(cipherHex);

            if (iv.length != 12 || tag.length != 16) {
                return ciphertext;
            }

            // In Java AES/GCM, auth tag is concatenated at the end of ciphertext
            byte[] combined = new byte[encrypted.length + tag.length];
            System.arraycopy(encrypted, 0, combined, 0, encrypted.length);
            System.arraycopy(tag, 0, combined, encrypted.length, tag.length);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec);

            byte[] decrypted = cipher.doFinal(combined);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.debug("Failed to decrypt ciphertext '{}': {}", ciphertext, e.getMessage());
            return ciphertext;
        }
    }
}
