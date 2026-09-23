# 사업 공급망 멱등성 v2026.09.23.411

- 사업 경제 명령의 서비스 및 PostgreSQL 저장소 경계에서 호출자 소유 UUID 멱등성 키를 필수화했다.
- 검증되지 않던 조달 요청 본문을 DTO로 교체하고 수량을 1..500으로 제한했다.
- 저장소의 자동 재시도 키 생성을 제거해 전송 재시도가 별도 명령으로 바뀌는 경로를 차단했다.
- 조달 계약 회귀 테스트를 추가했다.

검증: focused Vitest 5/5 PASS; backend TypeScript PASS; changed-file ESLint PASS; git diff --check PASS.
