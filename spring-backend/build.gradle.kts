plugins {
    java
    id("org.springframework.boot") version "3.3.5"
    id("io.spring.dependency-management") version "1.1.6"
}

group = "com.moneyverse"
version = "0.0.1-SNAPSHOT"

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot Starters
    implementation("org.springframework.boot:spring-boot-starter-web")
    // Owner directive v28: all website frontend HTML rendered in Spring.
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    // Database
    runtimeOnly("org.postgresql:postgresql:42.7.4")
    testImplementation("com.h2database:h2:2.3.232")

    // OpenAPI 3.0 / Swagger UI
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0")

    // JSON Date/Time
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jdk8")

    // Netty-SocketIO (Real-time Socket.IO v4 protocol compatible engine)
    implementation("com.corundumstudio.socketio:netty-socketio:2.0.12")

    // Discord4J Core & Voice (Unified Discord Bot service)
    implementation("com.discord4j:discord4j-core:3.3.3")
    implementation("com.discord4j:discord4j-voice:3.3.3")
    // Discord DAVE Protocol E2EE Natives (Linux & Windows)
    implementation("moe.kyokobot.libdave:natives-linux-x86-64:0.1.2")
    implementation("moe.kyokobot.libdave:natives-win-x86-64:0.1.2")

    // Lavaplayer 2.2.3 & Natives (Audio Engine for Discord Music & Voice Stay)
    implementation("dev.arbjerg:lavaplayer:2.2.3")
    implementation("dev.arbjerg:lavaplayer-natives:2.2.3")

    // Security Cryptography (Argon2id)
    implementation("org.bouncycastle:bcprov-jdk18on:1.78.1")

    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.named<Test>("test") {
    useJUnitPlatform { excludeTags("postgres-messaging", "postgres-shop") }
}

tasks.register<Test>("postgresMessagingTest") {
    description = "Verify native messaging against the explicitly configured disposable CI PostgreSQL"
    group = "verification"
    testClassesDirs = sourceSets["test"].output.classesDirs
    classpath = sourceSets["test"].runtimeClasspath
    // Keep the established CI entry point while certifying both canonical native services.
    useJUnitPlatform { includeTags("postgres-messaging", "postgres-shop") }
    testLogging {
        events("failed")
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
    doLast {
        val xml = layout.buildDirectory.file("test-results/postgresMessagingTest/TEST-com.moneyverse.api.domain.shop.AdminShopPostgresIntegrationTest.xml").get().asFile.readText()
        fun count(name: String): Int = Regex(name + "=\\\"([0-9]+)\\\"").find(xml)?.groupValues?.get(1)?.toIntOrNull()
            ?: error("Native PostgreSQL shop result field is missing: " + name)
        val shopTests = count("tests")
        val shopFailures = count("failures")
        val shopErrors = count("errors")
        val shopSkipped = count("skipped")
        check(shopTests >= 5 && shopFailures == 0 && shopErrors == 0 && shopSkipped == 0) {
            "Native PostgreSQL shop coverage is incomplete"
        }
        println("Native PostgreSQL shop: tests=$shopTests failures=$shopFailures errors=$shopErrors skipped=$shopSkipped")
        providers.exec {
            workingDir(rootDir.parentFile)
            commandLine("python3", "scripts/release/verify-native-pg-results.py", "--class",
                "com.moneyverse.catalogread.CatalogReadPostgresIntegrationTest", "--minimum", "4",
                layout.buildDirectory.file("test-results/postgresMessagingTest/TEST-com.moneyverse.catalogread.CatalogReadPostgresIntegrationTest.xml").get().asFile.absolutePath)
        }.result.get().assertNormalExitValue()
        providers.exec {
            workingDir(rootDir.parentFile)
            commandLine("python3", "scripts/release/verify-native-pg-results.py", "--class",
                "com.moneyverse.api.domain.content.ContentPublicationPostgresIntegrationTest", "--minimum", "6",
                layout.buildDirectory.file("test-results/postgresMessagingTest/TEST-com.moneyverse.api.domain.content.ContentPublicationPostgresIntegrationTest.xml").get().asFile.absolutePath)
        }.result.get().assertNormalExitValue()
    }
}

tasks.register<Test>("postgresShopTest") {
    description = "Verify native administrator shop against the explicitly configured disposable CI PostgreSQL"
    group = "verification"
    testClassesDirs = sourceSets["test"].output.classesDirs
    classpath = sourceSets["test"].runtimeClasspath
    useJUnitPlatform { includeTags("postgres-shop") }
}

tasks.register<JavaExec>("nativeUiPreview") {
    description = "Run an explicitly opted-in loopback H2 native UI preview on the test classpath"
    group = "verification"
    classpath = sourceSets["test"].runtimeClasspath
    mainClass.set("com.moneyverse.api.domain.web.NativeUiPreview")
}

// CI artifact provenance is checked independently; runtime environment cannot override this resource.
val nativeSourceRevision = providers.gradleProperty("moneyverseSourceSha")
    .orElse(providers.environmentVariable("GITHUB_SHA"))
    .getOrElse("unverified")
springBoot {
    buildInfo {
        properties {
            additional.set(mapOf("sourceRevision" to nativeSourceRevision, "runtimeKind" to "spring-native"))
        }
    }
}
