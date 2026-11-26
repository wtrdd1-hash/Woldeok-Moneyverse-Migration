package com.moneyverse.api.domain.health;

import com.moneyverse.api.domain.health.controller.NativeReleaseController;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringBootVersion;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 2026-11-26: /api/version reported "Spring Boot 3.3.5" while the runtime is 3.5.x; an identity
 * endpoint must not state a framework version it did not read from the running jar.
 */
class NativeReleaseFrameworkTest {
    @Test void frameworkVersionComesFromTheRunningJar() {
        var identity = new NativeBuildIdentity(new org.springframework.core.io.ByteArrayResource(
                ("build.runtimeKind=spring-native\nbuild.sourceRevision=" + "a".repeat(40) + "\n").getBytes()));
        var body = (Map<?, ?>) new NativeReleaseController(identity).version().getBody();
        var data = (Map<?, ?>) body.get("data");
        assertEquals("Spring Boot " + SpringBootVersion.getVersion(), data.get("framework"));
        assertNotEquals("Spring Boot 3.3.5", data.get("framework"));
    }
}
