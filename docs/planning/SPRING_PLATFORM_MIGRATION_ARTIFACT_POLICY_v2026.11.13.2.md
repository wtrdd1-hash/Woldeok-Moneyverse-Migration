# Spring migration build artifacts, registry (Artifactory) and zero-downtime release policy

**Version:** v2026.11.13.2 · **Date:** 2026-11-13 KST · **Status:** DRAFT / NO ARTIFACT PIPELINE CHANGE
**English canonical** · [한국어](SPRING_PLATFORM_MIGRATION_ARTIFACT_POLICY_v2026.11.13.2.ko.md) · [Detailed migration review](SPRING_PLATFORM_MIGRATION_DETAILED_REVIEW_v2026.11.13.2.md)

## 1. Meaning and baseline — distinguish artifact from Artifactory

**Artifact** is an immutable, version-identifiable output: compiled Spring executable JAR, OCI container image, SBOM, build provenance, test attestation, release manifest, database migration-set hash and rollback package. **JFrog Artifactory** is one possible product for storing and governing these outputs; it is **not required** for this plan and is not known to be installed.

Existing repository baseline at review: GitHub Actions CI, Test candidate/deploy workflows, GHCR-based OCI backend/frontend images, SHA-bound candidate/production digests, BuildKit provenance and SBOM flags, and GitHub Actions artifact uploads with 30-day and 90-day retention. Existing immutable Debian release directories are also documented. Avoid building a duplicate registry or claiming current artifacts are unsecured without an audit.

**Default proposal:** extend GHCR + GitHub Actions + separately verified immutable host releases. Consider JFrog Artifactory only if business needs (private multi-language repositories, repository-level immutability/retention, vulnerability/license policy, remote proxying, controlled mirroring or an audited offline restore) cannot be met under existing GHCR/Actions terms. A decision record must compare licensing, disk, operational staff, backup, availability and migration cost. Do not introduce another always-on artifact service on this memory-constrained mini-PC by default.

## 2. Artifact types, ownership and evidence

| Artifact | Producer and transport | Required identity & check | Warning |
| --- | --- | --- | --- |
| Spring executable bootJar | Approved CI, Gradle/Maven wrapper | Source SHA, Java/Boot/toolchain version, SHA256, dependency lock, passing test-run ID | Host must never rebuild from a moving branch |
| Spring OCI image | Approved image build from the same tested source | OCI digest sha256:..., parent image digest, architecture, SBOM/provenance identity | Docker tag alone is not immutable |
| Current Next frontend | Existing Next build workflow | Exact source SHA and frontend version endpoint/build ID | Spring release must not accidentally change SEO/site build |
| Nest last-known-good | Existing validated image/release | Live-resolvable immutable digest, schema/session compatibility, runtime smoke | TTL expiration can destroy emergency rollback |
| Contract bundle | Reviewed OpenAPI/schema + parity fixtures | Hash + source refs for TS, Java, Kotlin consumers | Generated DTO type equality is not behavioral parity |
| Migration-set evidence | Canonical numbered SQL tree | Ordered checksum hash + applied DB checksum attestations | Spring Flyway/Hibernate must not rewrite migration authority |
| SBOM and dependency evidence | CI (SPDX or CycloneDX) | Digest, known CVEs/license outcomes and exceptions | SBOM creation without screening and tracking is insufficient |
| Build provenance/attestation | CI trust identity | Repo, workflow, source SHA, subject digest, valid verification result | CI success is not proof a stored binary is that tested binary |
| Release manifest | Protected release orchestrator | Candidate digest, exact Test attestation, DB/schema epoch, rollback digest, approval | Separate Git repository SHA from actual application source SHA |
| Recovery evidence | Independent restore/rollback drill | Restored target, digest, tested date, signed operator, result | Backup existence is NOT a successful restore |

Never put database credentials, OAuth tokens, Discord/Telegram secrets, session keys, .env snapshots, production member data or signed credentials inside artifacts, logs, image layers, SBOM custom fields or release manifests.

## 3. Versioning and naming

- **Planning version:** v2026.11.13.2 labels *this design*, NEVER a deployed Spring server.
- **Application build identity:** immutable 40-character application source commit + CI run ID + toolchain/dependency-lock fingerprints.
- **OCI:** recommend ghcr.io/wtrdd1-hash/moneyverse/spring-backend@sha256:FULL_DIGEST (example repository path, not evidence the package exists). A human-friendly app version/tag may be additional metadata; deployments must resolve by digest.
- **JAR:** moneyverse-spring-backend-APP_VERSION.jar with SHA256 manifest and independently recorded commit/CI identifiers. A jar from a local developer machine is never an accepted release.
- **Contracts:** include route-map hash and OpenAPI/schema hash; historical TypeScript original route map must not be regenerated silently.
- **DB:** include immutable migrationSetHash / compatibility epoch; no irreversible DB step without reviewed backward-compatible application window.
- **Rollback:** record *resolved* last-known-good image digest or immutable release folder and physical availability at release time, plus compatible database/session epoch.

## 4. Repeatable G1 build and trust chain

1. Approved source branch/PR and pinned actions; CI checks exact SHA, required reviews and no prohibited changes to applied SQL.
2. Approved stable Spring Boot + Java21 toolchain; pinned Gradle/Maven wrapper, dependency locking/verification, repository allowlist, checksum checks and reproducible-build investigation. Java/Boot version chosen with CVE and library compatibility evidence.
3. Static analysis, Java compiler, tests and real isolated PostgreSQL function/auth negative fixtures; inventory and OpenAPI/consumer parity gates must pass.
4. Run dependency, license, secret and OCI-base image scanning; record findings as BLOCKED/approved exception with expiry. Never hide required warnings to achieve green.
5. Produce bootJar + tests report + SPDX/CycloneDX SBOM; compute SHA256 and bind to source SHA and CI run. Build OCI image only from an approved candidate source (or from verified same binary); check OCI base image digest and non-root execution.
6. Publish OCI digest and, if required, JAR to approved controlled storage; generate GitHub build provenance / attestations and verify them on an **independent** consumer path. Existing BuildKit provenance is useful but is not a substitute for actually verifying identity and signatures.
7. Assemble immutable release manifest; deploy exact **same digest** to isolated Test, do not recompile production from the moving main branch.
8. Execute exact SHA/digest/DB identity/test-route/auth/backup/restore + replay/load/rollback gates; record separate Test attestation and promotion approval.
9. For Production, promote only verified digest/manifest through current Debian systemd/Nginx zero-downtime procedure once G0 certifies actual ingress. Never treat an Actions workflow status or GHCR upload as public deployment.
10. Observe production cohorts, verify edge/frontend/backend/DB identities and business behavior, retain tested last-known-good; halt and rollback on defined stop events.

**Protection rules:** PR/branch protections, least-privilege ephemeral CI credentials, separate TEST and PROD roles, approval-backed production environment, immutable provenance, non-root containers, secret scanning and signed manifest validation. Do not allow arbitrary PR workflows to publish trusted production artifacts.

## 5. Proposed immutable release manifest contract

This is a **schema example only**; values below are placeholders and must never be interpreted as actual deployed artifacts.

~~~json
{
  "schemaVersion": 2,
  "state": "CANDIDATE_NOT_DEPLOYED",
  "repository": "wtrdd1-hash/Woldeok-Moneyverse-Migration",
  "repositoryHeadSha": "REPLACE_EXACT_40_CHAR_SHA",
  "applicationSourceSha": "REPLACE_EXACT_40_CHAR_SHA",
  "ciRunId": "REPLACE_CI_RUN_ID",
  "spring": {
    "version": "SELECT_AFTER_G1_AUDIT",
    "java": "21",
    "bootJarSha256": "REPLACE_64_HEX",
    "image": "REPLACE_WITH_REGISTRY_REPOSITORY",
    "imageDigest": "sha256:REPLACE_64_HEX"
  },
  "frontend": {
    "imageDigest": "sha256:REPLACE_64_HEX",
    "sourceSha": "REPLACE_EXACT_SHA"
  },
  "contractHash": "REPLACE_64_HEX",
  "migrationSetHash": "REPLACE_64_HEX",
  "databaseCompatibilityEpoch": "REPLACE_REVIEWED_EPOCH",
  "sbomSha256": "REPLACE_64_HEX",
  "provenanceRef": "REPLACE_VERIFIED_ATTESTATION_REF",
  "testAttestationRef": null,
  "rollback": {
    "lastKnownGoodDigest": "sha256:REPLACE_64_HEX",
    "verifiedRestoreRef": null
  },
  "approval": "NOT_APPROVED"
}
~~~

**Validation:** runtime verifier rejects placeholders, untrusted repositories, missing/different image digest, invalid signature, missing Test/restore evidence or DB incompatibility. Manifest is immutable once used for Test or Production attestation; new build => new ID, new manifest and new tests.

## 6. Storage/retention/cleanup proposal (not a configured policy)

| Class | Proposed retention/cleanup rule | Hard prohibition |
| --- | --- | --- |
| Active Production | Retain as long as live and for required compliance interval | Never garbage-collect currently referenced image/JAR/manifest |
| Verified last-known-good | Retain at least across the whole approved observation + rollback period; propose >=90 days unless stricter operational policy requires longer | Never delete solely because Action artifact TTL expired |
| Candidate Test | Propose 30 days for investigated candidates, after closure only | Do not delete a candidate still used by actual Test or incident reproduction |
| Failed/abandoned CI | Propose 14 days after failed build review, with reproducibility metadata retained longer | Do not erase security findings/audit trail |
| SBOM/provenance/manifest | Retain with the corresponding promoted artifact and required policy interval | No orphan manifest without resolvable binary/OCI digest |
| Live DB backup/recovery | Follow separately approved financial backup/retention rules | No backup deletion or production data reset tied to artifact cleanup |

Before each cleanup produce a graph of images/JARs/manifests -> active Test/Prod -> rollback pointer -> incident holds, verify registry HEAD or pull-by-digest plus local cold restore, and get operator approval. Use minimum disk free space and swap/IO budget; deploy archives may live on /srv data but must not hold secrets. Garbage collection failure must not threaten live services.

## 7. Optional JFrog Artifactory decision gate

| Criterion | Extend existing GHCR/Actions (default) | Add JFrog Artifactory |
| --- | --- | --- |
| OCI and immutable manifest | Already present in deployment workflows (verify effectiveness) | Also possible, but requires new install/contract |
| Maven/Gradle package proxy | Maven Central with verified dependency lock initially | May centralize/scan internal packages if audited requirement |
| Operational cost | Existing GitHub credential and registry lifecycle | Additional server/licensing/backup/patch/on-call burden |
| Host pressure | No new mini-PC registry daemon | Must run on adequately resourced separate host/service |
| Supply chain | GitHub OIDC/Sigstore attestation + SBOM + digest verification | Evaluate exact signing/provenance parity and vendor lock-in |
| Decision | **Prefer**, unless G0/G1 proves unmet needs | CONDITIONAL / owner-approved RFC only |

If JFrog is later selected, specify OCI + Maven repositories separately, immutable release repository, scoped deploy-only and read-only roles, TLS, retention/backup/restore, mirror consistency, outage mode, disaster-recovery RTO/RPO and pinned signatures. A registry migration must not retag a new artifact as a pre-existing approved digest.

## 8. Spring runtime packaging and rollout precautions

- Default Docker image is layered and non-root; Java process JVM memory and CPU limits are set from G0 capacity, not copied from workstation defaults. Container or systemd environment supplies secrets; config is audited without exposing values.
- Health split: liveness = process, readiness = safe service and mandatory dependencies, startup = cold classloading readiness. Do not expose actuator env/config/heapdump, sensitive metrics, Swagger or DB admin ports publicly.
- Bound JDBC/Hikari maximum pool, request queues, servlet threads, scheduled workers and outbound clients to the proven DB/host envelope. Keep migrations disabled in the boot path; canonical SQL remains in packages/database.
- Resolve clock/timezone, classpath locale/UTF-8 and Korean text, graceful shutdown, stuck requests, log redaction, OTEL trace cardinality and rollback to old auth/session structures.
- Do **not** run new JVMs permanently on Production until memory/swap and Test isolation gates pass; Java already installed does not constitute an approved service.
- For zero downtime: old healthy node retained -> start new isolated candidate -> readiness and exact identity -> old-session/Android/signed-event checks -> controlled read cohort -> for commands enforce DB writer fence -> Nginx switch -> observe -> rollback-capable hold. Release procedure may vary if G0 discovers a different authoritative edge path.

## 9. Artifact/security failure injection and proof

| Drill | Trigger and expected safe outcome |
| --- | --- |
| Digest mismatch | Pull/manifest checksum differs -> refuse start and notify, keep old |
| Missing registry image | Prior digest unresolvable -> block Test/Production (even when tag exists) |
| Invalid provenance | Wrong repo/workflow/commit signature -> reject artifact |
| SBOM vulnerability exception | High/critical finding or expired exception -> gate hold and security review |
| JDK/boot incompatibility | CI or cold-start fail -> keep existing upstream and capture logs |
| DB epoch mismatch | Startup/route readiness fail-closed without schema mutation |
| JVM OOM / Hikari exhaustion | Backpressure, no double commands, old upstream remains healthy |
| Frontend/server source skew | Edge identity mismatch -> reject promotion |
| Scheduled worker dual ownership | Lease/fence test proves one active consumer; otherwise block cutover |
| Lost last-known-good | Restore rehearsal fails -> halt, no new Production release |

**Completion evidence (artifact track):** verified manifest, bootJar hash, OCI digest resolvability, independent attestation verification, SBOM decision, exact-source successful Test, corrected runtime topology, compatible LKG rollback rehearsal and release owner approval. Without all required evidence, status remains PLANNING/BLOCKED.

## 10. External authoritative references

- Existing [repo release guide](../RELEASING.md), .github/workflows/test-candidate.yml and .github/workflows/deploy.yml (as of source SHA above).
- Spring Boot version/build requirements: https://docs.spring.io/spring-boot/system-requirements.html ; executable packaging: https://docs.spring.io/spring-boot/installing.html .
- GitHub artifact attestations and independent verification: https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations .
- GitHub artifact provenance and SBOM concepts: https://docs.github.com/en/actions/concepts/security/artifact-attestations .

**DRAFT only. No Artifactory deployed, no new JAR/image produced, no registry changes, no Test or Production release.**
