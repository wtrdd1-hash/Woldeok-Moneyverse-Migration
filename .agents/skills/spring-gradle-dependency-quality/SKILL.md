---
name: spring-gradle-dependency-quality
description: Establish or audit Java 21 Spring Boot Gradle Kotlin DSL modules, dependency versions, build reproducibility, SBOM, vulnerability controls, CI and packaging. Trigger for Spring project scaffolding, Gradle build failures, library upgrades or JVM compatibility questions.
---
# Spring build and supply-chain quality

## Verify first
- Check installed Java toolchain, approved Spring Boot baseline, Gradle wrapper, existing Android Gradle build and repository CI policy. Do not guess the latest supported versions; confirm compatibility and security maintenance from official release metadata.
- Keep server Gradle modules separate from Android build unless a documented integration is necessary. Do not modify existing mobile wrapper without direct need.

## Implementation
- Use pinned, verified Gradle wrapper and managed dependency versions; prefer built-in Spring Boot starters and standard Java APIs over custom dependencies (YAGNI).
- Use Java toolchain 21 only where approved and tested; enforce UTF-8, deterministic builds, locked dependencies when feasible and controlled plugin repositories.
- Keep secrets outside repositories and build logs. Generate dependency/SBOM inventory and check vulnerabilities/license policy before introducing new libraries.
- Constrain memory footprint and JVM resource limits on the 8 GiB host; establish budget from measured runtime before creating persistent workers.

## Gates
Run `./gradlew --offline help` only when dependency caches support it, otherwise run normal wrapper tasks in the isolated environment; report unavailable network/cache honestly. Required gates include test, check, compilation, package verification, dependency audit and minimal startup probe; no runtime promotion from build PASS alone.
