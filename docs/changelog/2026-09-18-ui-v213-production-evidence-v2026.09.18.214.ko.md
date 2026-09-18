# v2026.09.18.214 — v213 Production 승격 증거

문서 전용 증거 버전입니다. Runtime은 v213 exact main `24b85df1e0e5f922e461b1dcea82ec291bf54e48`을 유지합니다.

## GitHub 게이트
- PR #467
- CI #1279 / run `35292212685`: success
- Runtime tree: v213 exact main

## Test
- Frontend release: `/srv/moneyverse-data/releases/test-24b85df1e0e5-ui213`
- Edge service/upstream: `moneyverse-test-ui-v213-main.service` / 3115
- 핵심 route: HTTP 200
- Browser: 280/320/390px responsive/CSP/title/input 통과, 일시적 network-change 1건은 3회 clean 재검증
- Backend PID `1282208` 유지
- Rollback config: `/etc/nginx/backups/moneyverse.before-v213-test-20260918-094530`

## Production
- Frontend release: `/srv/moneyverse-data/releases/prod-24b85df1e0e5-ui213`
- 영구 service/upstream: `moneyverse-frontend.service` / 3001
- 3202 canary 검증 후 영구 승격 완료, 이후 canary 종료
- 공개 browser: canary 27/27, 영구 승격 후 27/27
- Backend `moneyverse-backend-v196-canary.service` PID `1286971` 재시작 없음
- 승격 후 frontend/backend warning journal 0건
- 3201 `moneyverse-frontend-v196-canary.service`를 rollback anchor로 유지

v214로 runtime을 다시 배포하지 않습니다.
