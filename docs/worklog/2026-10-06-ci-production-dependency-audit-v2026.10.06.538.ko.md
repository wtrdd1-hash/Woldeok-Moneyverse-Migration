# CI 운영 의존성 감사 차단 수정 작업 기록 — v2026.10.06.538

- 날짜: 2026-10-06
- 브랜치: `security/ci-audit-v2026.10.06.538`
- 기준선: `origin/main=103e0aa2a134eb533a2cf5cbd17cbb1e95b7dfeb`
- 시작 근거: v537 Build Test Candidate run 37425866287은 정책/테스트/빌드는 통과했지만 필수 `pnpm audit --prod --audit-level=high` 게이트에서 실패했다.
- CI 증거: `proxy-addr@2.0.7`은 critical이며 패치 버전 >=2.0.8, `source-map-js@1.2.1`은 high이며 패치 버전 >=1.2.2로 보고됐다.
- 범위: 의존성 해석만 수정한다. 애플리케이션 동작, DB 권한, 경제 로직, UI는 변경하지 않는다.
- 권위 문서: 상위 v537 작업에서 문서/릴리스/보안 정책을 이미 재확인했으며, UI 수정에 보안 게이트 수정이 섞여 숨지 않도록 별도 선행 브랜치로 격리한다.
- 동시작업: 최신 main에서 전용 worktree를 만들었고 다른 브랜치를 reset/덮어쓰기 하지 않는다.

## 계획
1. 깨끗한 의존성 설치에서 운영 audit를 재현한다.
2. 패치된 transitive 버전만 강제하는 최소 root pnpm override를 추가한다.
3. lockfile 재생성 후 production audit, typecheck/tests/lint/build, lockfile 정합성을 검증한다.
4. 영어 원문 + 한국어 2차 언어 변경 증거를 기록한다.
5. 전용 브랜치를 push하고 exact-head CI 성공 후 main에 병합한 뒤 v537을 재베이스/재검증한다.

## 로컬 GREEN 검증 — 2026-10-06
- RED에서 CI와 동일하게 `proxy-addr 2.0.7`의 GHSA-jqcg-44mw-7w3h, `source-map-js 1.2.1`의 GHSA-68fv-2mgg-jv7q를 재현했고 production audit는 exit 1이었다.
- root override 2개와 lockfile 갱신 후 확인한 모든 경로가 `proxy-addr 2.0.8`, `source-map-js 1.2.2`로 해석되며 `pnpm audit --prod --audit-level=high`는 `No known vulnerabilities found`를 반환한다.
- 전체 로컬 게이트 통과: typecheck, root 테스트 9/9, contract 31/31, database 7/7, backend 1,076 통과(로컬 환경에서 DB 연동 391개 skip), frontend 1,060/1,060, lint 오류 0개(기존 warning만 유지), Production build, `git diff --check`.
- 애플리케이션 런타임 소스와 DB migration은 변경하지 않았다. 병합 전 exact-head GitHub CI와 격리 Test backend/version/noindex smoke가 남아 있다.
