# 개발 B v645 — 국민연금 연 지급률 표기 정합성 (P1 #1910, 릴리스 보류)

- 원인: 시간당 8bps 산식은 50,000 WLD에서 40 WLD/시간, 연 350,400 WLD(단순 연 환산 700.8%)이지만 기존 공개 화면에는 연 7.0%가 표시됐습니다. 최소 1 WLD 반올림은 소액의 환산값을 더 크게 왜곡할 수 있습니다.
- Backend: `GET /api/v1/pension/overview`는 연 지급률이 인증되지 않은 상태를 `benchmarkAnnualPayoutRate: null`, `annualPayoutRateCertified: false`로 표시하고, 관련 없는 벤치마크 설정값을 연 지급률로 반환하지 않습니다. 기존 문자열 기대 Android/외부 소비자는 계약 변경 대응이 필요합니다.
- Frontend: 구버전 Backend가 8.0%를 반환하더라도 이를 보증된 연 수익률로 표시하지 않으며, 기존 시간당 산식은 참고용·미지급 상태로 명확히 표기합니다. 원금 0의 허위 1 WLD/시간 예상값도 제거했습니다. 기존 기록 조회 및 금융 거래 중단은 유지합니다.
- DB/금융: 마이그레이션 없음, 원장·잔액·국고 데이터 변경 없음. 재원 확보, 원장 증빙, 기존 지급 정합성 검증 및 정책 승인 이전에는 지급 재개 불가.
- 검증: 집중 Backend 15건, Frontend 4건 통과. 전체 타입 검사 및 Backend/Frontend 빌드 통과(Frontend 1GiB OOM 후 1.5GiB 재실행). Contract 41건, DB 정적 56건 통과/4건 건너뜀. 전체 테스트/전체 Lint/API 계약 검사는 기존 통합 결함으로 실패. 실제 PostgreSQL·공식 Test exact-SHA·Android·인증 E2E 미완료.
- 배포: P0 병합 통제 #1891이 해결되지 않아 독립 로컬 브랜치 보존, Push/PR/병합/Test/Production 모두 보류. 이번 작업은 표기 안전성 개선이지 연금 정산 기능 완성이 아닙니다.
- 개발 PostgreSQL 읽기 전용 확인: 시간당 8bps 계좌 1개, 9bps 계좌 1개, 별도 연 벤치마크 설정 800bps(8.0%). 운영 DB 상태는 미확인, 개인 식별 정보 조회 없음.
