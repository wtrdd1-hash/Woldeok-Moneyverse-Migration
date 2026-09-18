# 관리자 사용자 최근 접속 작업 기록 — v2026.09.18.232

날짜: 2026-09-18
브랜치: `feat/admin-user-last-access-v2026.09.18.232`
문서 반영 전 테스트한 런타임 커밋: `b82f6ca4554cbd81153c1a9aab840ac29556e673`
기준 main: `70fcc164fc6b8265975738a9af92ba35345d102c`

## 범위와 구현
운영에는 이미 접속 요약 read model과 요청 활동 로그가 존재했지만 관리자 목록에서는 작은 보조문구로만 보였습니다. 이번 변경은 최근 접속을 독립 관리 항목으로 승격하고 Asia/Seoul 기준 전체 날짜·시간 표시와 최근 접속 순 정렬을 추가합니다.

## 검증 근거
- 운영 DB 접속 요약 read model이 존재하고 로그인/활동/관리자 접속 데이터가 실제 집계됨을 확인했습니다.
- 프론트 회원목록 회귀 테스트 3/3 통과.
- 프론트 TypeScript 타입체크 통과.
- workspace contract 선행 빌드 후 프론트 production build 통과.
- exact runtime commit을 3116 Test canary로 실행해 `/api/version`에서 동일 SHA를 확인했습니다.
- Test 백엔드 3100의 빌드 식별 응답을 확인했고, 비인증 관리자 사용자 API가 401을 반환해 라우트와 인증 가드가 정상임을 확인했습니다.
- canary 검증 중 기존 Test/Production 서비스는 중단하지 않았습니다.

운영 승격 완료 판정은 merge된 exact main SHA가 저장소 Test→Production gate와 운영 공개 post-promotion probe를 모두 통과한 뒤에만 기록합니다.
