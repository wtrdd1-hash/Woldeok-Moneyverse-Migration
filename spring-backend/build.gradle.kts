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
    // Server-rendered Spring MVC pages replacing the Next.js presentation layer.
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
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

    // Discord4J Core (Unified Discord Bot service)
    implementation("com.discord4j:discord4j-core:3.3.3")
    // Security Cryptography (Argon2id)
    implementation("org.bouncycastle:bcprov-jdk18on:1.78.1")

    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
    // Gradle's remote-selected JDK25 exceeds Spring Boot 3.3's Byte Buddy support.
    // Run tests on the deployed supported JDK21 without altering shared Gradle daemons.
    javaLauncher.set(javaToolchains.launcherFor {
        languageVersion.set(JavaLanguageVersion.of(21))
    })
    useJUnitPlatform()
}

