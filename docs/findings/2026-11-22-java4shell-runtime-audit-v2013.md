# Java4Shell (CVE-2026-114938) — Mini-PC runtime inventory and risk audit

**Version:** v2026.11.22.2013 | **Observed:** 2026-11-22 20:13–20:18 KST
**Status:** READ-ONLY ASSESSED; REMEDIATION OPEN; NO TEST/PRODUCTION RELEASE
**Scope:** One authorized Debian 13 mini-PC host only. This is NOT an enterprise-wide inventory, authenticated penetration test, exploit validation, or patch certification of all running services.
**Korean:** [Companion report](2026-11-22-java4shell-runtime-audit-v2013.ko.md)
**Task log:** [EN](../worklog/2026-11-22-java4shell-runtime-audit-v2013.md) / [KO](../worklog/2026-11-22-java4shell-runtime-audit-v2013.ko.md)

## 1. Source integrity and official confirmation

- Owner-supplied Instagram reel: https://www.instagram.com/reel/DgCmvLryp6I/
- Direct public metadata/caption on the mini-PC (HTTP 200) identifies an Instagram post dated 2026-11-22 concerning Java4Shell / CVE-2026-114938. The caption claims unauthenticated exploitation and recommends Oracle patch releases for Java 17, 21, 25 and 27. **The actual video/audio was NOT independently viewed or transcribed.**
- The CVE is real, not merely a reel claim. KISA published its Oracle Java advisory on 2026-11-18, then updated its FAQ by 2026-11-20. Oracle released the November CSPU on 2026-11-17.
- Technical condition: affected OpenJDK Java 17 (17.0.6 onward), 21, 25, 27 plus the accelerated Base64 decoder on an x86-64 CPU exposing AVX-512 VBMI. Attacker-controlled input reaching the decoder is another condition for network exploitation. This is **not** a universal RCE in every Spring Boot instance. The Java 8 Enterprise Performance Pack is a special affected case. Other Java CVEs in the November advisory have DIFFERENT preconditions and must be assessed separately.
- Official Oracle fixed versions for CVE-2026-114938: 17.0.21.1, 21.0.13.1, 25.0.5.1, 27.0.1.1. For non-Oracle runtimes, confirm the distribution-specific fixed build and any backported patches; version strings alone need vendor context.

## 2. Direct, read-only mini-PC evidence

| Property | Observed evidence | Interpretation |
| --- | --- | --- |
| Host | Debian 13, x86_64 | Scope limited to inspected host |
| CPU | AMD Ryzen 7 7735HS | Exposed /proc/cpuinfo lacks avx512vbmi |
| Installed default Java | OpenJDK 21.0.13.1+2-1-deb13u1-Debian | Matches patched Java 21 release line |
| Running Java PIDs | 32 | Includes backend, test, preview, and production-labelled canaries |
| Runtime verification via jcmd VM.version | 28 Java 21.0.12.1; 1 Java 21.0.13.1; 3 unverified | Runtime state is NOT identical to installed java -version |
| Deleted executable references | 28 PIDs | Old Java executable inodes remain mapped after package replacement; consistent with unrestarted JVMs |
| Main backend unit | moneyverse-spring-backend.service, observed Java 21.0.13.1 | Main Spring unit uses patched JVM build |
| Other services | Many Java 21.0.12.1 JVMs in test, preview and production-labelled canary units | Do not infer they are internet-exposed solely from the unit names |
| Network | Multiple old Java listeners bound to 127.0.0.1 | Reverse-proxy exposure/traffic was not established here |

**Evidence collection commands (safe summaries only):** java -version; grep of avx512vbmi in /proc/cpuinfo; readlink /proc/PID/exe; jcmd PID VM.version; systemctl list-units; ss -lntp; git status and remote main SHA. No secret-bearing process arguments, environment variables, databases, account records or tokens were retained in this finding.

## 3. Risk and disposition

1. **CVE-2026-114938 exploitability on this host: LOW based on CPU prerequisite not being present.** The currently visible AMD Ryzen 7 7735HS does not expose the requisite AVX-512 VBMI instruction set. This is a hardware-dependent assessment, NOT proof that every application or deployed machine is safe. If runtime migrates to a supported x86-64 CPU, reassess before deployment.
2. **Java patch hygiene: ACTION REQUIRED.** 28 JVMs are still running 21.0.12.1, whereas the host package and main backend have reached 21.0.13.1. KISA lists additional November vulnerabilities (including CVE-2026-114939 through -114942) that are not all subject to the Java4Shell CPU prerequisite. Their impact must be separately triaged; do not call these old JVMs secure.
3. **Unknown runtime evidence: OPEN.** Three Java processes were not verifiable using jcmd, so their patch state must be established from their actual executable/runtime image and service inventory.
4. **Operational impact: NOT VALIDATED.** No full Test API, login/role, financial ledger, rollback or zero-downtime acceptance was performed in this read-only audit. Existing frontend 503/QA holds remain unchanged.

## 4. Recommended remediation sequence (requires separate release-gated execution)

1. Capture an approved list of service owners, listeners, actual reverse-proxy routes, immutable JAR/runtime paths and rollback artifacts. Mark primary API, finance, production-labelled canaries and isolated test instances separately.
2. Confirm Debian vendor patch provenance, container/bundled JDK versions, and the three unverified JVMs. Do not use just the shell java -version.
3. For each old Java service, perform isolated Test validation on a patched runtime; check startup, health, role/auth guards, API data provenance, finance read-only and release gates. Do not terminate all 28 JVMs at once.
4. Use the project's verified zero-downtime/rollback procedure to rotate only the approved service instances after Test success. Recheck jcmd VM.version from every live PID and inspect regressions before proceeding to the next group.
5. When patching is delayed on a CPU that *does* support AVX-512 VBMI, consult the exact runtime vendor advisory regarding the temporary flag -XX:-UseBASE64Intrinsics, validate it in Test, and still schedule the vendor JDK patch. The flag is not a substitute for fixes to other CVEs.
6. Refresh the inventory and verify zero remaining old runtimes plus the three previously unverified processes. Preserve the production release evidence and avoid unverified success claims.

## 5. Source references

- KISA advisory and FAQ: https://www.boho.or.kr/kr/bbs/view.do?bbsId=B0000133&menuNo=205020&nttId=72313
- Oracle November CSPU: https://docs.oracle.com/en-us/iaas/releasenotes/java-management/jdk-cspu-november-2026.htm
- Scala community distribution-specific remediation: https://www.scala-lang.org/blog/jdk-java4shell-vulnerability.html
- Sophos prerequisite/exploitability advisory: https://www.sophos.com/en-us/security-advisories/sophos-sa-20261118-java4shell

## 6. Change boundary

**Documentation-only.** No source changes, exploit tests, restarts, OS updates, Java service redeployments, DB mutations, permission changes, Nginx changes, Test promotion or Production promotion occurred. This finding does not supersede living plans or approve any release.
