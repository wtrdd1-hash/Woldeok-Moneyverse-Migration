# QA 감사 보고서 V477 — 전체 기능 / 페이지 / 화면 점검

> 버전: v2026.09.28.477
> 날짜: 2026-09-28
> Candidate: `44933fd7abe83284e067c85115bf7ac1033cc895` (v476 main)
> Android 기준: `44288fccb321b5df889ca099989cb9afd350979c`
> 결과: **BLOCKED — 이번 실행을 운영 승격 증거로 사용하면 안 됨**

## 핵심 결과
현재 source에는 **페이지 route 108개, 관리자 route 24개, dynamic page route 12개**가 있다. 과거 86/22/8 snapshot보다 크게 증가했으므로 v473 ALL_GREEN 보고서는 과거 증거일 뿐 현재 전체 coverage를 증명하지 않는다.

Guest 상태 browser 5-pass에서 320, 390, 768, 1024, 1440 CSS px 기준 총 540 route/view row를 확인했다. 페이지 단위 horizontal overflow는 재현되지 않았다. 최초 sweep의 29개 `ERR_ABORTED`는 동일 browser page에서 redirect/prefetch navigation이 다음 이동과 경합한 harness 현상이었고, 각 route를 새 context로 격리 재실행하자 **29/29 모두 PASS**, overflow 0, page error 0이었다.

다만 관리자/회원/제한/소유자 fixture, 모든 dynamic valid/permission scenario, 전체 responsive/zoom matrix, Android instrumentation을 확보하지 못했으므로 완전 acceptance 통과가 아니다. 또한 아래 정적/자동 release gate에는 실제 실패가 존재한다.

## Candidate 및 runtime
- Web `origin/main`은 시작·중간·종료 재확인 모두 `44933fd7...`로 유지됐다.
- App `origin/main`은 `44288fcc...`로 유지됐다.
- Production/Test 주요 서비스는 active이며 backend `/health`는 양쪽 200이다.
- active release symlink는 `prod-v476`, `test-v476`이다.
- Test/Production frontend version ID는 확인했지만 이를 Git SHA에 묶는 영구 release metadata가 없어 exact-SHA runtime identity는 증거 공백으로 남는다.

## Web 자동 gate
| Gate | 결과 | 증거 |
|---|---|---|
| Route inventory | PASS | 108 pages / 관리자 24 / dynamic 12; inventory SHA `922ce3006e61ec6c9f81e473e457594901b881418a522755663eaad4ec1cea01` |
| Route ledger verifier unit test | PASS | 3/3 |
| TypeScript typecheck | PASS | 전체 workspace |
| Production build | PASS | Nest build + Next production build; static generation 120 단위 완료 |
| Root lint | **FAIL** | 총 453건: **89 errors / 364 warnings** |
| Root test/release gate | **FAIL** | mobile API contract drift |
| Contract package test | PASS | 23/23 |
| Database package test | PASS | 7/7 |
| Backend test | PASS/PARTIAL | 1,018 pass; DB 의존 391 skip |
| Frontend test | **FAIL** | 927 pass / 1 fail; teardown 후 unhandled error 6건 |

### 확정 release-gate 결함
1. **Mobile API contract drift** — generator 실행 시 유지 문서 3개에 총 84 line이 추가된다. `docs/mobile-api-contract.json` 70줄, 양 언어 schema reference 각각 7줄이며 nullable `authorUserId` schema가 추가된다. 따라서 `pnpm test`가 실패한다.
2. **Frontend i18n corpus test 실패** — `src/lib/i18n/corpus.test.ts`가 요구하는 `references/corpus-150k.json` 실파일이 없다. 결과 1 fail.
3. **Frontend test hygiene** — calculator test environment teardown 이후 `window is not defined` unhandled exception 6건이 보고된다. React `act(...)` warning과 jsdom canvas warning도 다수 존재한다.
4. **Lint gate 실패** — root lint 89 error. 제품 source/test error와 함께 root ESLint가 `skills/brainstorming` CommonJS helper script에 browser/TypeScript 규칙을 적용하는 scope/config 문제도 포함된다.

## Browser 화면 sweep
- Test URL: `https://test.easy-scraping.com`
- Pass: 5회
- Viewport: 320x800, 390x844, 768x1024, 1024x768, 1440x1000
- 총 row: 540
- 재현된 horizontal overflow: **0**
- 최초 navigation-abort row: 29
- 해당 29건 격리 재실행: **29 PASS / 0 FAIL / 0 overflow**
- 원 sweep 응답: HTTP 200 481건, dynamic/not-found 성격의 HTTP 404 30건, 이후 격리 재실행에서 해소된 navigation-abort 29건.
- Guest 상태에서 관리자 login redirect가 관측됐다. Guest에서 shell/title이 그려지는 것은 **관리자 acceptance 통과가 아니다**.

### Browser coverage 제한
권위 QA 계약은 추가로 360/375/412/430 폭, 대표 landscape, 200% 및 해당 시 400% reflow, 정확한 role fixture, local tab/dialog/action, success/error/loading/permission state, dynamic valid/not-found/permission scenario를 요구한다. 이번 실행에서 이를 모두 만족하지 못했으므로 route ledger를 완료로 표시할 수 없다.

## Android QA
- App exact main을 격리 worktree에서 사용.
- Unit test: **25 pass / 0 fail**.
- Android lint: **PASS**.
- Unit test task가 수행하는 Kotlin/Java compile: **PASS**.
- `assembleDebug`: **BLOCKED** — 격리 source worktree에 signing keystore가 의도적으로 존재하지 않음.
- Device/instrumentation/UI: **BLOCKED** — online ADB device/emulator 없음.
- 정적 UI inventory에서 현재 5-tab scaffold(Home, Economy, Play, Community, My)와 조건부 Admin, Auth/Capability/Seasons/detail surface를 확인했지만 정적 확인은 runtime UI acceptance가 아니다.

## 운영 승격 판단
**BLOCKED. 운영 승격은 수행하지 않았다.** Green 승격을 위해 최소한 다음이 필요하다:
- API contract drift 해결;
- frontend corpus test 및 unhandled test error 해결;
- lint gate green 또는 올바른 scope/config 수정;
- 격리 QA DB에서 DB 의존 test 수행;
- member/restricted/owner/admin Test fixture 구성 후 권위 5-pass role/state ledger 수행;
- 남은 responsive/zoom matrix 완료;
- 승인된 signing/device 환경에서 Android assemble/instrumentation 수행;
- Test release evidence를 exact candidate SHA에 결합.

이번 QA에서는 제품 코드와 Production runtime을 변경하지 않았다.
