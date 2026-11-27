package com.moneyverse.api.security;

import com.moneyverse.api.domain.admin.service.EncryptionService;
import org.junit.jupiter.api.Test;

import java.nio.file.*;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Security 2026-11-26 (PR #3454 P1 recheck): a 64-hex internal token was committed as a default
 * in application.yml, UserAuthService, EncryptionService and the frontend gateway, and the
 * production configuration used that same value. No secret-shaped default may return, and the
 * admin controllers may not trust an x-internal-token header.
 */
class CommittedSecretRegressionTest {
    private static final Pattern HEX_DEFAULT = Pattern.compile("(internal-token|INTERNAL_API_TOKEN|internalToken)[^\\n]{0,40}[0-9a-f]{32,}");

    @Test void noSecretShapedDefaultsInSourceOrConfig() throws Exception {
        try (Stream<Path> files = Files.walk(Path.of("src/main"))) {
            var offenders = files.filter(Files::isRegularFile)
                    .filter(p -> p.toString().endsWith(".java") || p.toString().endsWith(".yml") || p.toString().endsWith(".properties"))
                    .filter(p -> { try { return HEX_DEFAULT.matcher(Files.readString(p)).find(); } catch (Exception e) { return false; } })
                    .toList();
            assertEquals(java.util.List.of(), offenders);
        }
    }

    @Test void adminControllersDoNotTrustAnInternalTokenHeader() throws Exception {
        for (String f : new String[]{"src/main/java/com/moneyverse/api/domain/admin/controller/AdminBackupController.java",
                "src/main/java/com/moneyverse/api/domain/admin/controller/AuditController.java"}) {
            assertFalse(Files.readString(Path.of(f)).contains("getHeader(\"x-internal-token\")"), f);
        }
    }

    @Test void withoutKeyMaterialCiphertextStaysUnreadableInsteadOfUsingAKnownKey() {
        var svc = new EncryptionService("", "", "");
        assertEquals("enc:v1:abc:def", svc.decrypt("enc:v1:abc:def"));
        assertEquals("plain", svc.decrypt("plain"));
    }

    /**
     * Gitleaks full-history scan (v2002.1): the compromised internal token value was still present
     * in tracked documents, an example env file and a test. No tracked text file may contain it.
     * Only its SHA-256 fingerprint is held here; the value is never stored or printed.
     */
    private static final String COMPROMISED_TOKEN_SHA256 = "1eb829e05776a61428a25bc398e69127f67c89e87af0d2176209bc387ed7a9cd";
    private static final Pattern HEX64 = Pattern.compile("[0-9a-fA-F]{64}");

    @Test void theCompromisedTokenValueIsNotInAnyTrackedFile() throws Exception {
        Path root = Path.of("..").toRealPath();
        Process ls = new ProcessBuilder("git", "-C", root.toString(), "ls-files", "-z").redirectErrorStream(true).start();
        String[] tracked = new String(ls.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8).split("\0");
        ls.waitFor();
        java.security.MessageDigest sha = java.security.MessageDigest.getInstance("SHA-256");
        var offenders = new java.util.ArrayList<String>();
        for (String rel : tracked) {
            if (rel.isBlank()) continue;
            Path p = root.resolve(rel);
            if (!Files.isRegularFile(p) || Files.size(p) > 5_000_000) continue;
            String text = new String(Files.readAllBytes(p), java.nio.charset.StandardCharsets.ISO_8859_1);
            var m = HEX64.matcher(text);
            while (m.find()) {
                String hex = java.util.HexFormat.of().formatHex(sha.digest(m.group().getBytes(java.nio.charset.StandardCharsets.US_ASCII)));
                if (hex.equals(COMPROMISED_TOKEN_SHA256)) { offenders.add(rel); break; }
            }
        }
        assertEquals(java.util.List.of(), offenders);
    }
}
