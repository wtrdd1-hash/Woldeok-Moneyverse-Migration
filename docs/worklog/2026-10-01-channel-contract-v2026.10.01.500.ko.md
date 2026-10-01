# v2026.10.01.500 App/Site Channel Contract 작업일지

## 시작
- 작업: v498 Task 2 — canonical App/Site channel route manifest 추가.
- 기준: `87ebcf0330112d832513bfba00eb5de6f9c65c5f`.
- 최신 확인 `origin/main`: `2bad12eb290cba6b98d08604cd6b1274243e1a4f`.
- native inventory 기준: `docs/mobile-api-contract.json`의 documented App API v1 endpoint 179개.
- 현재 browser drift: production web source에 chat/support/game-clock/dopamine 및 developer-portal example의 `/app-api/v1/**` 직접호출이 남아 있다.
- Ruling: `pathTemplate`에 public channel prefix를 포함해 같은 downstream Economy Core command를 사용하더라도 App/Site public BFF contract는 별도로 유지한다.
- 범위: contract/inventory만 수정하며 Task 2에서 BFF runtime route는 추가하지 않는다.

## 중간 기록
- 올바른 TDD RED: `channel-api.test.ts`가 `./channel-api` 부재로 실패했다. 신규 worktree node_modules 부재로 발생한 첫 환경실패는 `pnpm install --frozen-lockfile`로 해결한 뒤 의도한 RED를 다시 확인했다.
- GREEN: manifest invariant suite가 APP=179, SITE=23, 총 202개로 통과한다.
- Checker TDD RED: checker module 부재로 unit test가 실패했고 구현 후 3개 checker test 모두 PASS.
- Site 후보 감사에서 current backend contract가 아닌 stale developer-portal example (`bank/products`, `casino/stats`, `work/execute`, `streams/market-ticks`, generic stock detail)을 발견해 canonical manifest에 승격하지 않았다.
- 중간 `origin/main=2bad12eb290cba6b98d08604cd6b1274243e1a4f`.

## 완료 증거
- `pnpm --filter @moneyverse/contract test`: 5 files / 40 tests PASS.
- `node --test scripts/check-channel-api-contract.test.mjs`: 3/3 PASS.
- `pnpm api:channel:check`: APP=179 SITE=23 LIVE=0 TARGET=202 PASS.
- `pnpm typecheck`: contract/database/backend/frontend 전체 exit 0.
- 변경 TypeScript ESLint error 0, `.mjs` checker는 저장소 ESLint ignore 대상.
- 전체 `pnpm test`는 신규 channel check까지 통과한 뒤 최신 main에 `packages/database/init/000-create-app-role.sh`가 없는데 parity test가 이를 기대하는 기존 `migration-parity.test.ts`에서 실패한다.
- 전체 root lint는 이번 작업 외 기존 13 errors / 430 warnings가 있으며 v500 변경 TS에는 lint error가 없다.
- mobile contract generated artifact drift 없음.
- Task 2에서는 public route를 활성화하지 않으며 App v2/Site v1은 Task 3용 TARGET 상태다.
