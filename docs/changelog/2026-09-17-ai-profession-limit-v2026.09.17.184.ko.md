# v2026.09.17.184 — 직업 작업횟수 제한 적응형 자동조절

- 서버 권위 작업 일일 제한에 직업별 제한형 자동조절 계층을 추가했다.
- 변경 불가 작업 기준값과 8개 허용 `jobs.assignment_daily_limit_delta.<profession>` 정책 knob(`-1..+2`, 정책 주기당 1 step)를 추가했다.
- 부족 직업은 제한을 완화할 수 있고, 지속 편중 직업은 반복보상 soft control이 이미 작동한 뒤에만 제한을 강화할 수 있다. 회복 시 정책 delta는 자동으로 기준값으로 돌아간다.
- `daily_limit` 정책은 이중 경제 AI 위원회에서 고위험으로 분류되어 결정론 적용 전 full rebuttal을 거친다.
- 실제 유한 런타임 quota 계약과 영문/한국어 기획서를 정합화해 무제한 의미가 이미 배포됐다고 오인하지 않게 했다.
- 사전 QA: PostgreSQL migration 002→204 전체 적용 성공, AI/경제/직업 회귀 테스트 5개 파일 42/42 통과, 저장소 lint 오류 0건(기존 이미지 경고 11건), 전체 workspace typecheck·production build·`git diff --check` 통과.
