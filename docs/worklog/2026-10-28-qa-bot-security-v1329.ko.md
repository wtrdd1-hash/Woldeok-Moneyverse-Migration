# QA v1329 — 디스코드 봇 의존성 보안 수정 (Draft / 운영 승격 보류)

- **기준:** 2026-10-28 01:15 KST, origin/main `4f5efd1f48615f0112701feec25a9b0fc67d9719`, 영문/국문 통합기획서 SHA256 `506c291f...` / `630a8293...`. 별도 `qa/security-bot-audit-v1329` 브랜치에서 작업. Superpowers·AGENTS.md·README 검토. 공유 작업 환경, 실제 DB/WLD, Test/Production 변경 없음.
- **P0 재현:** 봇 독립 lockfile `npm audit`에서 Critical 1건/High 5건. `@discordjs/opus` → `@discordjs/node-pre-gyp` → `tar@6.2.1` 및 `undici@6.28.1` 경로. 기존 루트 pnpm 운영 의존성 검사는 봇을 포함하지 않음. 실제 악용 증거 없음.
- **원인 및 수정:** `prism-media`의 선택적 네이티브 Opus 의존성을 제거하고 기존 `opusscript` 대체 코덱을 유지. `undici`를 6.29.1로 갱신. 위험한 tar 메이저 강제 업그레이드 대신 취약한 설치 경로 자체를 제거. 기존 CI 정책 테스트 목록에 봇 lockfile 취약 경로 검사를 추가. 별도 `npm audit` 워크플로 단계 추가는 GitHub OAuth `workflow` 권한 부족으로 **BLOCKED**이며, 봇 npm audit는 로컬에서만 직접 검증.
- **TDD/검증:** 원본 lockfile과 CI 설정에서 회귀 테스트 RED 확인. 수정 후 봇 11/11, 20ms 스테레오 PCM OpusScript 인코딩/디코딩, 기존 CI 정책 테스트 및 신규 lockfile 정책 테스트 PASS. 봇 npm audit High 이상 0건. 정확한 PR SHA CI, 실제 Test 인증 음성·금융 E2E는 별도 미완료 게이트.
- **잔여 위험:** 순수 JS Opus로 변경되므로 다중 음성 세션 CPU/지연·음질 검증 필요. 실제 Discord 음성 통화 검증 없음. 보안 검토 없이 기존 취약 네이티브 패키지로 되돌리지 말 것. 공식 Test SHA/DB/API/인증/원장/E2E, GitOps 승인, 무중단 운영 smoke 이전에 병합·배포 금지.
- **기존 차단 요인:** main 마이그레이션 283 중복과 블로그 lint 오류는 기존 QA Draft #1610에서만 수정됨. 본 PR은 #1610 위에 독립적으로 쌓아 무관한 main 오류를 혼동하지 않음. 개발 DB 과도 권한·체크섬·릴리스 링크·복원 시험 문제 지속. 다른 작업자 브랜치 보존.
