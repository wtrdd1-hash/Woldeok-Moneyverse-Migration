# 보안 강화 (PR #3454 재검증) — v2026.11.26.SEC.1

Branch security/app-hardening-20261126, stacked on #3447 head 8a48975a00a104308a1de5d366f8d200d336caf5 (verified production code: prod backend jar sha256 prefix a1889e90 = build of 979c7d4270; prod frontend release 471adc4eed; head adds docs only). main 1df1150e979106ec03d682a10f1f1348bff0a44c.
Worker: Claude Code (Claude Opus 5.5, claude-opus-5-5). State: CODE_READY / CI (local) green; G6-G8 HOLD.

## Timeline (KST)
- Start 2026-11-26T09:15 — read handoffs v0908.1 / v0912.1, PR #3454 report, verified production artifacts.
- Mid 2026-11-26T09:32:26+09:00 — fixes committed (07ea61d403); TESTGATE.1 (PR #3455) adopted: no further direct Test deployment by this agent.

## Skills (G2)
security-review (secrets/input/authz checklist), springboot-security (deny by default, keep CSRF, secrets from env), spring-security-admin-auth (threat model, admin identity in service/DB, no global CSRF disable), spring-gradle-dependency-quality (no version guessing; dependencies unchanged in this change). Read from ~/.agents/skills (not exposed to the Skill tool).

## Findings on the production build
| ID | Finding | Status |
|---|---|---|
| SEC-1 | Internal API token default committed (application.yml, UserAuthService, EncryptionService, frontend gateway); production Spring and frontend are configured with that same value; repository is public | Code fixed (defaults removed, gateway fails closed). Rotation: BLOCKED pending owner approval |
| SEC-2 | Socket.IO admin room granted by ?role=admin&twoFactorVerified=true or the shared token; reachable via https://<prod>/socket.io/ | Reproduced on Test; fixed (verified admin session cookie only) |
| SEC-3 | chat:join any room; anonymous chat:send under any sender name | Fixed (public rooms only; send refused) |
| SEC-4 | Admin backup/audit controllers trusted any non-empty x-internal-token header | Latent (filter 401 first, verified); removed |
| SEC-5 | Stored identity ciphertext key derived from the public token: 20/24 identity values and the Search Console credential decrypt with it (checked privately, nothing printed) | Code no longer ships the key; rotation + re-encryption + GSC key rotation BLOCKED (data conversion/credential change need approval) |
| SEC-6 | Production Spring listens on all interfaces (*:4550, *:9092) | Socket default now 127.0.0.1; HTTP bind and host firewall need an infra decision (BLOCKED) |
| SEC-7 | Password change without CSRF/reauth (#3454 P1) | Already fixed on #3447 (3ec3df6185) and in production; Nest is not running |
| SEC-8 | Blog Next.js 16.4.2, Spring Security allowlist inventory, OAuth/IDOR/XSS/SSRF sweep | Not started in this checkpoint |

## Verification (G3/G4)
Spring full suite: 851 tests, 0 failures (exact working tree of 07ea61d403). Frontend: 621 files / 3,238 tests, tsc clean. New tests: SocketAdminAccessTest, CommittedSecretRegressionTest; Phase8 socket test now asserts refusal. Live reproduction of SEC-2 on Test (pre-fix build). Not yet: SAST/SCA rerun on this SHA, Test deployment of this SHA, independent review (G7).

## 한국어 요약
- 운영 = #3447 head 코드임을 jar 해시로 확인. 공개 저장소에 박힌 내부 토큰이 운영 설정값과 동일 → 코드 기본값 제거(교체는 승인 필요).
- 운영에서 인터넷으로 열린 소켓의 관리자 방이 주소 값만으로 열림 → Test에서 재현 후 수정(실제 관리자 세션만).
- 저장된 신원 암호문 키가 공개 토큰에서 유도됨(20/24, 서치콘솔 키 포함) → 키 교체·재암호화는 데이터 변환이라 승인 필요(BLOCKED).
- TESTGATE.1에 따라 이 에이전트는 Test에 직접 배포하지 않고 후보만 등록. 배포 담당·공통 잠금 미확인 → G8 HOLD.
