package com.moneyverse.api.security;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Dependency review 2026-11-25: spring-webmvc 6.2.19 still carries CVE-2026-47884 (XsltView path
 * limitation) and CVE-2026-47890 (SSE stream corruption), fixed only in Spring 7.0.9. Neither
 * feature is used, so the risk is not reachable. This guard fails if one is introduced before
 * the Spring 7 / Boot 4 upgrade.
 */
class UnpatchedSpringFeatureGuardTest {
    @Test void unpatchedSpringFeaturesAreNotUsed() throws Exception {
        List<String> banned = List.of("XsltView", "SseEmitter", "ResponseBodyEmitter", "ServerSentEvent", "text/event-stream");
        try (Stream<Path> files = Files.walk(Path.of("src/main"))) {
            List<String> hits = files.filter(Files::isRegularFile)
                    .filter(p -> p.toString().endsWith(".java") || p.toString().endsWith(".kt"))
                    .filter(p -> { try { String s = Files.readString(p); return banned.stream().anyMatch(s::contains); } catch (Exception e) { return false; } })
                    .map(Path::toString).toList();
            assertEquals(List.of(), hits);
        }
    }
}
