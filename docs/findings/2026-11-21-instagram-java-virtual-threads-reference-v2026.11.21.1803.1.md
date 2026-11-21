# Reference review — Instagram Java Virtual Threads (v2026.11.21.1803.1)

[한국어](2026-11-21-instagram-java-virtual-threads-reference-v2026.11.21.1803.1.ko.md)

> Status: DRAFT — source metadata verified; full Reel audiovisual content NOT VERIFIED. Research input, **not adopted planning authority or an implementation decision**.
> Record date: 2026-11-21 KST. Source post date shown by Instagram: 2026-11-20.

## Primary source and provenance
- Owner-supplied URL: https://www.instagram.com/reel/Df966AMhwD1/?cnvx=MXVudW9sYnp4MjZteg==
- Canonical URL: https://www.instagram.com/reel/Df966AMhwD1/
- Instagram account/title (public page metadata): **한 바이트 CS** (`@cs.one.byte`).
- Public post caption, verbatim: **“기다리는 동안 직원을 놓아 주면 요청을 더 받을 수 있을까요? 가상 스레드를 그림으로 풀어 봤어요.”**
- Tags shown in metadata: `#가상스레드 #Java #자바 #스프링부트 #코딩공부`.
- Evidence method: miniPC HTTPS GET, HTML `og:title`, `og:description`, `description`, `twitter:title`. The public HTML metadata was directly read on 2026-11-21; web search indexing did not provide the Reel.
- **Limitation:** no original video frames, narration, timings, on-screen examples or transcript were extracted. Do NOT attribute the details below to the author; they are independently verified general technical context.

## Independently sourced technical context
1. JDK virtual threads are lightweight Java threads designed for large numbers of concurrent tasks, particularly blocking I/O workloads. Waiting tasks need not monopolize an OS/platform thread. This is a **throughput/concurrency** tool, not a guarantee that each request or CPU-intensive task runs faster.
2. Java virtual threads became a final feature in **Java 21 (JEP 444)**. Spring Boot documentation describes optional enablement with `spring.threads.virtual.enabled=true` on **Java 21+**. Execution/scheduling integration and custom executors must be reviewed independently.
3. Virtual threads do **not** increase finite backend capacity (PostgreSQL connection pools, outbound API rate limits, JVM heap, DB locks, network capacity). Preserve backpressure, timeouts, deadlines, bounded resource use, security context propagation, tracing and failure isolation.
4. Performance evaluation must measure throughput, p95/p99 latency, CPU, heap/memory, DB pool wait/active/timeout, downstream error rate, request cancellation and task leaks. Behavior varies with JDK revision and blocking library implementation; do not assume one blog/video example applies to the current deployment.

## Woldeok Moneyverse application disposition
- Repository source inspected at baseline main `52a18d59cb71470128fa0b7739af434ad94b5ac6`: `spring-backend/build.gradle.kts` specifies Spring Boot **3.3.5** and Java source/target **17**. This is a **source-only observation**, NOT a measured Production JVM.
- **Decision: research backlog only.** The current configured Java compilation target is below 21; do not set the virtual-thread property or upgrade the runtime as part of this reference intake.
- Potential candidate paths for a future isolated benchmark: concurrent read-only Spring MVC endpoints, I/O-waiting upstream API aggregation, safe background I/O. Do not use a production ledger or authenticated customer data for load testing.
- Exclude unbounded financial mutations, settlement retries, administrator permissions, and chat delivery semantics from any performance-only change. DB permissions, idempotency, transaction isolation, audit receipts and role boundaries remain required.
- An implementation proposal would require explicit adoption into `docs/planning/PROJECT_PLAN.md` and `docs/planning/INTEGRATED_PLANNING_MASTER.md`, an isolated branch, Java/JDK compatibility audit, deterministic Test QA, concurrency/load comparison, security/DB regression, independent rollback and exact-version Production acceptance. **No approval to implement is inferred from this record.**

## Recommended future QA (NOT executed)
- [ ] Capture/review the Reel frames and narration, mark direct claims vs inferred explanation.
- [ ] Inventory running JVM, Gradle/JDK build target and dependent libraries, including blocking I/O and thread-local/security-context use.
- [ ] Compare current platform-thread baseline with controlled Java 21+ virtual-thread Test candidate using the same data/traffic shape and bounded DB connection pool.
- [ ] Test resource exhaustion, DB lock contention, CSRF/session boundary, authorization and transaction idempotency under concurrency.
- [ ] Record CPU, memory, throughput, latency distribution, DB pool saturation, API 429/5xx, rollback evidence; use stop conditions before Production consideration.

## Independent primary references
- OpenJDK JEP 444 — https://openjdk.org/jeps/444
- Oracle Java 21 Virtual Threads — https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html
- Spring Boot: Task Execution and Scheduling — https://docs.spring.io/spring-boot/reference/features/task-execution-and-scheduling.html
- Spring Boot: SpringApplication / Virtual Threads — https://docs.spring.io/spring-boot/reference/features/spring-application.html
- Current source config: [spring-backend/build.gradle.kts](../../spring-backend/build.gradle.kts)
- [Living project plan](../planning/PROJECT_PLAN.md) / [Integrated planning master](../planning/INTEGRATED_PLANNING_MASTER.md)

**Verification:** Reel metadata only; no video transcript, no source code mutation, no runtime/JDK change, no tests, no Test/Production deployment.
