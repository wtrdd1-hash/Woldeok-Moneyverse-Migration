package com.moneyverse.api.security;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * A read of a relation the migration chain does not grant works only on a database whose privileges
 * drifted, and answers 42501 everywhere else (2026-11-26 finding). Rather than a per-class list, every
 * main source is scanned against the full set of ungranted relations; the remaining offenders are an
 * allowlist that may only shrink. A function call such as {@code FROM public.fn(...)} is not a hit.
 */
class UngrantedRelationReadRatchetTest {
    private static List<String> lines(String resource) throws IOException {
        try (var in = UngrantedRelationReadRatchetTest.class.getResourceAsStream(resource)) {
            return new String(Objects.requireNonNull(in, resource).readAllBytes(), StandardCharsets.UTF_8).lines()
                    .map(String::strip).filter(l -> !l.isEmpty() && !l.startsWith("#")).toList();
        }
    }

    private static Set<String> currentHits() throws IOException {
        List<String> relations = new ArrayList<>(lines("/security/ungranted-relations.txt"));
        relations.sort(Comparator.comparingInt(String::length).reversed());
        Pattern read = Pattern.compile("(?i)\\b(?:FROM|JOIN)\\s+(?:public\\.)?(" + String.join("|", relations) + ")\\b(?!\\s*\\()");
        Set<String> hits = new TreeSet<>();
        try (Stream<Path> files = Files.walk(Path.of("src/main/java"))) {
            for (Path p : files.filter(f -> f.toString().endsWith(".java")).toList()) {
                var m = read.matcher(Files.readString(p));
                while (m.find()) hits.add(p.toString().replace('\\', '/') + " " + m.group(1).toLowerCase(Locale.ROOT));
            }
        }
        return hits;
    }

    @Test void noNewDirectReadOfAnUngrantedRelation() throws IOException {
        Set<String> allowed = new TreeSet<>(lines("/security/ungranted-direct-reads-allowlist.txt"));
        Set<String> added = currentHits().stream().filter(h -> !allowed.contains(h)).collect(Collectors.toCollection(TreeSet::new));
        assertTrue(added.isEmpty(), "direct reads of relations moneyverse_app is not granted (use a function): " + added);
    }

    @Test void allowlistShrinksWhenAReadIsFixed() throws IOException {
        Set<String> hits = currentHits();
        Set<String> stale = lines("/security/ungranted-direct-reads-allowlist.txt").stream().filter(l -> !hits.contains(l))
                .collect(Collectors.toCollection(TreeSet::new));
        assertTrue(stale.isEmpty(), "remove fixed entries from ungranted-direct-reads-allowlist.txt: " + stale);
    }
}
