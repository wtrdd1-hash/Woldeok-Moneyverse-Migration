# 내부 작업내역 — v2026.09.17.184 AI 직업 작업횟수 제한 제어

- 날짜: 2026-09-17
- 브랜치: `feat/ai-job-limit-auto-v2026.09.17.184`
- 정확한 기준: `3f523e6708af2bd9d24b60282f26619263a8c53d`
- 범위: backend AI 검토 + forward-only DB migration + 기획 정합화.

## 문제

Living 기획은 직업 작업횟수 의미 정책을 무제한 기본으로 설명했지만 런타임 migration 189/190/203은 유한 `work_task_catalog.daily_limit`를 강제한다. 기존 경제 컨트롤러는 지급 cap과 반복 감쇠는 조절하지만 실제 작업 완료 횟수는 조절하지 못했다.

## 구현

- `204-adaptive-profession-limits.sql` 추가.
- 모든 작업의 `baseline_daily_limit` 보존.
- 8개 `jobs.assignment_daily_limit_delta.<profession>` knob 등록: 범위 `-1..+2`, 최대 step `1`.
- 반복 정책 주기가 누적되지 않도록 실제 limit는 항상 기준값에서 재계산.
- 7일 직업 선택 근거로 과부족/편중 후보 생성.
- 제한 강화는 직업 점유율 `>60%`, 작업 발행비중 `>50%`, repeat decay `>=25`를 모두 요구하고 근거 부족/회복 시 delta를 `0`으로 복원.
- prompt 계약을 `dual-economy-council-v3`로 올리고 `daily_limit` 변경을 고위험 full rebuttal 대상으로 지정.
- 기존 표본/원장대사/cooldown/feature-switch/AI 검토/rollback gate 유지.

## 로컬 QA 증거

- 격리 PostgreSQL 17에서 migration 002→204 전체 적용 성공.
- AI + 실제 DB/경제/직업 회귀 테스트 5개 파일 42/42 통과.
- 전체 workspace typecheck 통과.
- 저장소 ESLint 오류 0건, 기존 `<img>` 경고 11건.
- 전체 production build 통과.
- `git diff --check` 통과.

## 릴리스 gate

exact-SHA 격리 Test 배포, Test backend/API smoke, 해당 시 same-session continuity, Production 승격 및 Production smoke가 계속 필수다. `BAK-RUNTIME-177-01`은 OPEN이며 이번 변경은 추가형/비파괴 변경으로 backup-runtime 복구를 주장하지 않는다.
