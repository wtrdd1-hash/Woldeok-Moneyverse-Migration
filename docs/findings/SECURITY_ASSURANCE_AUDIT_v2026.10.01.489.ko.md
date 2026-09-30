# 보안 보증 점검 — v2026.10.01.489

[English canonical](SECURITY_ASSURANCE_AUDIT_v2026.10.01.489.md) | **한국어**

상태: **AUDIT / REMEDIATION_REQUIRED**
날짜: 2026-10-01 KST
서버 저장소 기준: `597c6029a8539d501e3c554582552cb761feab6c`
Android 저장소 기준: `e24a2f8c9390092b0ae7aeaa3286ca8d799d91b3`
감사 브랜치: `docs/security-audit-v2026.10.01.489`

이 문서는 방어적 보안 보증 증거다. 공개 인터넷 대상 침투시험, Test 검증, Production 수정 또는 배포 성공을 주장하지 않는다.

## 권위 레퍼런스 기준

- OWASP Top 10:2025 — https://owasp.org/Top10/2025/
- OWASP ASVS 5.0.0 — https://owasp.org/www-project-application-security-verification-standard/
- OWASP API Security Top 10:2023 — https://owasp.org/API-Security/
- NIST SP 800-63B-4 — https://csrc.nist.gov/pubs/sp/800/63/b/4/final
- NIST SP 800-218 SSDF 1.1 — https://csrc.nist.gov/pubs/sp/800/218/final
- PostgreSQL 17 함수 보안 — https://www.postgresql.org/docs/17/perm-functions.html
- GitHub Actions 보안 사용 — https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
- GitHub secret scanning / push protection — https://docs.github.com/en/code-security/secret-scanning
- Debian 보안 / unattended upgrades — https://www.debian.org/doc/manuals/securing-debian-manual/
- Android App Links — https://developer.android.com/training/app-links
- OAuth 2.0 Security BCP RFC 9700 — https://www.rfc-editor.org/rfc/rfc9700

현행 Moneyverse 보안 마스터 문서는 필요한 통제 범주를 이미 잘 포함한다. 이번 점검의 핵심은 문서보다 실제 구현·운영 설정의 드리프트다.

## P1 — 우선 수정 필요

### SEC-489-01 — PostgreSQL 개발 컨테이너가 모든 호스트 인터페이스에 공개

Debian 13 런타임에서 PostgreSQL 17.11 Docker 포트가 `0.0.0.0:5433->5432`, `[::]:5433->5432`로 publish되어 있고 Docker nftables에도 해당 DNAT/accept 경로가 존재한다. 5433의 실제 localhost 연결도 확인했다.

영향: 호스트까지 라우팅 가능한 네트워크는 DB 포트 접근을 시도할 수 있다. 이번 점검에서는 공개 인터넷 도달성을 증명하지 않았으므로 인터넷 노출이라고 단정하지 않는다.

조치:
- DB 포트를 loopback으로만 publish하거나 host publish를 없애고 private container network만 사용;
- host INPUT 방화벽 allowlist 명시;
- Test/Production DB role의 non-owner/최소권한/자격증명 분리 확인;
- 예상하지 않은 wildcard DB listener를 차단하는 호스트 릴리스 점검 추가.

### SEC-489-02 — SSH root 비밀번호 로그인과 광범위 forwarding 허용

실효 `sshd -T`에 `permitrootlogin yes`, `passwordauthentication yes`, `x11forwarding yes`, `allowtcpforwarding yes`, `maxauthtries 6`가 확인됐다.

영향: SSH가 엄격히 제한된 관리망 밖에서 접근 가능하면 credential attack과 로그인 후 터널링 영향이 커진다.

조치:
- key-only 비-root 운영 계정 사용;
- 복구 접근을 검증한 뒤 root password login/password authentication 비활성화;
- 문서화된 필요가 없으면 X11 비활성화 및 TCP forwarding 제한;
- 관리망 source firewall 제한과 복구 접근을 함께 검증.

### SEC-489-03 — 네이티브 OAuth handoff가 검증되지 않은 커스텀 URI bearer code를 사용

Android는 `woldeok-moneyverse://oauth/callback`을 등록한다. 서버의 짧은 수명·1회용 opaque handoff와 replay/expiry 방어는 좋지만 code가 요청한 앱 인스턴스에 결속되지 않는다.

영향: 동일 private scheme을 등록한 다른 설치 앱이 callback을 먼저 받으면 bearer handoff code를 먼저 교환할 수 있다.

조치:
- `android:autoVerify` + `assetlinks.json` 기반 HTTPS Android App Link 우선;
- mobile authorization 시작 시 앱 생성 verifier/challenge를 사용해 handoff를 앱 인스턴스에 추가 결속;
- 기존 5분/1회용/hash-at-rest와 hostile-app interception/replay 회귀시험 유지.

### SEC-489-04 — GitHub Actions full commit SHA pin이 불완전

서버 저장소 current workflow의 action 참조 20개 중 10개가 `@v4`, `@v7` 같은 mutable major tag였다. Android CI도 동일하다. Production 배포 자격증명을 읽는 credential export workflow에도 unpinned action이 존재한다.

조치:
- 모든 third-party action을 full commit SHA로 pin;
- 자동 업데이트는 review를 거친 SHA 변경으로만 수행;
- 최소 workflow permissions와 protected environment approval 유지;
- provenance/attestation 검증은 유지하되 그것만으로 안전성을 보장한다고 간주하지 않음.

### SEC-489-05 — Android release signing 비밀번호 fallback 하드코딩 및 debug의 release key 사용

`app/build.gradle.kts`는 signing 환경변수가 없을 때 literal 비밀번호로 fallback하고 debug도 release signing config를 사용한다. 공개 저장소에서 해당 JKS 파일은 발견되지 않았으므로 signing key 자체가 노출됐다고 주장하지 않는다.

조치:
- password fallback 제거, release signing secret이 없으면 release build fail-closed;
- 일반 debug build는 release key를 사용하지 않음;
- 실제 keystore가 공개 fallback 비밀번호를 쓴 적이 있으면 upload-key credential 회전 검토;
- keystore는 source/CI artifact/log 밖에 유지.

## P2 — 방어 심화 및 드리프트 수정

- **SEC-489-06 Discord edge prefix:** 문서는 exact `/api/v1/integrations/discord/interactions`만 공개하지만 Nginx는 `/api/v1/integrations/discord/` prefix를 proxy한다. 현재 controller의 추가 endpoint는 발견되지 않았다. exact location + sibling negative test로 고정한다.
- **SEC-489-07 arbitrary Host:** `Host: untrusted.invalid` 로컬 요청이 HTTP 200 normal site를 반환했고 Production Nginx는 `server_name _` default다. 승인 host만 명시하고 별도 default reject server를 둔다.
- **SEC-489-08 cookie fail-open:** Production 기본은 Secure지만 `COOKIE_SECURE=false`가 허용된다. Production에서는 Secure=false면 boot 실패하도록 한다.
- **SEC-489-09 systemd sandboxing:** 주요 Moneyverse unit에서 `NoNewPrivileges`, filesystem/home/private tmp/device/kernel/capability 제한이 대부분 꺼져 있다. economy-AI unit의 일부 hardening을 참고해 서비스별 최소권한 drop-in을 검증한다.
- **SEC-489-10 patch automation:** `unattended-upgrades`가 없고 57개 package가 upgradeable이었다. 57개 모두 보안 취약점이라고 주장하지 않는다. 보안 업데이트 정책/자동화와 reboot·release coordination을 수립한다.
- **SEC-489-11 CSP:** 유용한 CSP가 있으나 `script-src/style-src 'unsafe-inline'`이 남아 XSS containment가 약해진다. 민감 경로부터 nonce/hash 기반 정책으로 축소한다.
- **SEC-489-12 process-local throttling:** HTTP throttler가 process-local이라 multi-instance/blue-green에서 budget이 분할될 수 있다. scale-out 전 atomic shared limiter를 사용한다.
- **SEC-489-13 secret history:** `scripts/check-secrets.sh`는 current tree에서 통과했지만 전체 Git history 청결을 증명하지 않는다. GitHub secret scanning/push protection 및 history-aware scan을 릴리스 gate에 둔다.
- **SEC-489-14 Android WebView:** 약관/개인정보 고정 URL이지만 JavaScript/DOM storage가 켜져 있다. 필요 없으면 끄고 HTTPS host/path navigation을 allowlist한다.

## 확인된 긍정 통제

- backend 기본 loopback bind + Production internal token boundary;
- constant-time internal-token 비교와 client bundle 비노출;
- global DTO whitelist/forbid + body size 제한;
- HttpOnly/SameSite 및 Secure 시 `__Host-` session cookie;
- CSRF/server session/rotation/revocation/recent-auth 구조;
- 광범위한 PostgreSQL `SECURITY DEFINER` safe search_path + actor check + explicit grants/revokes, migration 233 PUBLIC execute 강화;
- current tree secret-floor scan PASS;
- Android cleartext/backup 차단, API HTTPS host pin, encrypted preferences, redirect 차단, credential header 로그 redaction;
- 여러 릴리스 workflow의 exact-SHA candidate, SBOM/provenance, isolated-Test/Production gate.

## 릴리스 상태

v489에서는 런타임 수정이 없고 isolated Test/Production 승격도 수행하지 않았다. P1은 각각 전용 구현 브랜치에서 수정하고 isolated Test exact-SHA 검증 후 기존 무중단 절차로 Production에 승격해야 한다.

## 최종 main 드리프트 재검토

점검 중 `origin/main`이 먼저 `34dddce057df97ca745d5cf580b5eda12b1b6a8d`, 이후 `597c6029a8539d501e3c554582552cb761feab6c`로 이동했고 감사 브랜치에 두 변경을 모두 병합한 뒤 최종화했다. 마지막 런타임 변경은 플로팅 지원 채팅 위젯과 브라우저 합성 오디오였다. 검토한 지원 mutation은 CSRF 상태와 멱등키를 계속 사용하고 API path의 thread ID를 인코딩하며 message body를 raw HTML이 아닌 React 텍스트로 렌더링한다. 이 최종 드리프트 재검토에서 추가 P1은 발견되지 않았다.
