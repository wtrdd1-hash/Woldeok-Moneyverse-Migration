# 개발 B v632 — 클럽 공성전 금융 증빙 안전 차단 (Draft/HOLD)

- 기준 main: `b84d645a87e8fa0d544ca3ee17e785e737e477ea`.
- 이전에 닫혔지만 병합되지 않은 C PR #1250의 고유한 안전 개선을 독립 작업 브랜치에 복구하고, NestJS 실제 HTTP no-store 회귀 검증을 보강했다.
- 결함: 실제 원장 증빙이 없는 가상 길드 점령·시즌·누적 4,200,000 WLD·미수령 1,250,000 WLD 세금 정보가 인증된 조회 API에서 반환되었고 웹에는 시뮬레이션 배당 수령 누적이 표시되었다.
- 변경: 공성전 조회 2개와 결제·공격·세금 수령 3개 API는 검증된 증빙 전까지 503/no-store. 인증·동의 경계 유지. 웹은 실제 클럽 목록 API에서 확인된 정보만 표시하고 실패/빈 목록을 구분하며, 금융 성공 알림과 허위 SEO를 제거한다.
- 테스트: 수정 전 Backend RED 2, Frontend RED 5, HTTP 캐시 RED 2. 집중 GREEN Backend 11/11, Frontend 5/5. 전체 검증은 별도 증빙 확인 전까지 완료로 보고하지 않는다.
- 격리 PostgreSQL 17.11 합성 스키마에서 회원별 클럽 조회 및 앱 역할 직접 UPDATE/DELETE 거부 2/2 PASS, 컨테이너 정리.
- DB 마이그레이션·금융 잔액·공유 DB·운영 서비스 변경 없음. Test exact-SHA 및 GitOps 검증 전 병합·배포 금지. 다른 개발 A/C/QA와 기존 예약 보존.

## 로컬 검증 결과 (13:44 KST)
- 전체 Typecheck PASS, Lint PASS(오류 0·기존 경고 1,074).
- 전체 테스트 PASS: 계약 38, DB 46/4 SKIP, Backend 1,961/440 SKIP, Frontend 1,915. API 계약 검사 PASS.
- 전체 빌드 PASS(격리 Next.js 빌드 재시도 성공, 앞선 중복 실행의 `.next/lock` 충돌은 제품 결함 아님).
- NestJS 실제 HTTP 3, Controller 3, 기존 API 계약 5, 웹 UI/SEO 5, 격리 PostgreSQL 2 PASS.
- 의존성 감사 FAIL: 기존 `qs@6.16.0` Moderate 취약점(별도 QA PR #1687). 공식 Test exact-SHA·Android E2E·전체 마이그레이션·GitOps 미검증으로 운영 승격 금지.
