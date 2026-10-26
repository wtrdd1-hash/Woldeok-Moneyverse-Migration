# QA A1555 — 본인 활성 가상 주식 조건부 알림 설정 CSV (운영 배포 보류)

**일자:** 2026-10-26. **main 기준:** `1c5b84a1c45baafcca83f375a6f99698121e9bb5`. **구현 SHA:** `18d365072a349be2713aca9636cf4a172ac2943c`. **브랜치:** `auto/hourly-a-stock-alert-rules-export-20261026-1555`. 최종 문서 커밋 SHA는 PR #1425에 별도 기록.

## 구현 범위
- 본인 활성 주식 알림 설정을 최대 100건 CSV로 다운로드. 기존 DB 보안 정의 함수 `stock_alert_rules_list(actor)`만 사용하며 101건 탐지 시 **409로 전체 다운로드 차단**. 세션 인증·동의·본인 범위, `private,no-store` 적용.
- WLD 정수 문자열 정밀도, CSV 수식 삽입/제어문자 방어, UTF-8 BOM, noindex, 키보드 접근성, 인증 실패/장애 시 허위 파일 제공 방지.
- Android app-api 동일 인증 세션 전달, JSON 응답 계약 및 영문/국문 명세 갱신(총 180개 엔드포인트). 이는 **현재 활성 설정**이며 과거 삭제 설정, 알림 발생 이력(#1381), 실제 투자 증빙이 아님.
- 신규 DB 마이그레이션·테이블 권한 부여·금융 원장 쓰기·운영 서비스 변경 없음.

## 구현 SHA 기준 검증
| 항목 | 결과 |
|---|---|
| Backend 집중 | **3 PASS** |
| Frontend CSV/라우트/접근성/app-api 집중 | **18 PASS** |
| Contract | **38 PASS** |
| DB 패키지 | **15 PASS / 3 SKIP** |
| Backend 전체 | **1,316 PASS / 398 SKIP** |
| Frontend 전체 | **1,405 PASS / 6 FAIL** |
| Bot 전체(격리 의존성 설치 후) | **8 PASS** |
| Typecheck / ESLint | **PASS / 오류 0, 경고 1,128** |
| Backend + 기본 Next 빌드 | **PASS** |
| Android 계약 문서 정합성 | **PASS** |
| 운영 의존성 보안 | **FAIL — High 2** |
| 전체 의존성 보안 | **FAIL — Critical 2 / High 10 / Moderate 11 / Low 3** |
| Bot 보안 | **FAIL — Critical 1 / High 5** |
| CI #40283191372 | **FAIL — Runtime Test** |
| Test Candidate #40283163722 | **FAIL — Runtime Test, 후속 배포 게이트 미실행** |

기존 Frontend 실패 6건은 SEO/다국어 3, 로그인 터치 영역 1, 계산기 회원가입 링크 1, 관리자 M2 1. 별도 QA Draft #1412의 수정사항은 이 후보에 병합되지 않았음.

## 격리 PostgreSQL 실측
PostgreSQL 17.11 `wdmv_v761_test_acl`, 적용 마이그레이션 281개. 롤백 트랜잭션에서 임시 활성 알림 101개를 생성하여 실제 앱 역할로 조회: **본인 101 / 타인 0 / 101건 초과 탐지 / WLD 큰 정수 정확 / 알림 테이블 직접 SELECT 차단 / 원장 INSERT 차단 / ROLLBACK 후 0**. 운영 연동 5433에는 쓰기 없음.

## 브랜치 및 운영 차단
시작 브랜치 267개·PR 263개 → 후보 생성 후 브랜치 268개·PR 264개(초안 262개). Head SHA 중복 0, 로컬 확보된 비-main 264개 모두 미통합, 객체 미확보 3개 보존, 충돌 PR #1107/#1110/#1143 보존, 삭제 0. 다른 개발 A/B/C/Gemini/QA 변경 보존. main SHA 변동 없음.

공식 Test `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, Production `6a989b5ac0c6155587d43426d64f6def6b62c917`: 후보 SHA와 불일치. 정확 SHA 인증 E2E·전체 보안·백업 복구·운영 재무권한·GitOps/호스트 게이트 미충족. 루트 디스크 97%(여유 약 3.3GiB), 데이터 86%. main 병합·Test 승격·운영 배포·서비스 재시작·원장 변경·브랜치 삭제 0.

**최종 판정: PARTIAL / BLOCKED — Production RELEASE HOLD.** 롤백은 코드 커밋 되돌리기이며 DB 롤백 없음.
