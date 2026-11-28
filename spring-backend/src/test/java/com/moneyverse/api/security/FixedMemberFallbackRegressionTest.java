package com.moneyverse.api.security;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Security review 2026-11-25: controllers fell back to a fixed member
 * (5f7b8b44-...) when no identity header was sent, and trusted the header
 * otherwise (crafting, stock league join, admin pension/central-bank actor).
 * No controller may name that member any more.
 */
class FixedMemberFallbackRegressionTest {
    @Test void noControllerSourceNamesTheFixedMember() throws Exception {
        Path root = Path.of("src/main/java");
        try (Stream<Path> files = Files.walk(root)) {
            List<String> offenders = files.filter(p -> p.toString().endsWith("Controller.java"))
                    .filter(p -> { try { return Files.readString(p).contains("5f7b8b44-e4aa-40b8-b93a-800ec0151d20"); } catch (Exception e) { return true; } })
                    .map(p -> root.relativize(p).toString()).sorted().toList();
            assertEquals(List.of(), offenders);
        }
    }
}
