# 조건부 주식 알림 작업기록 — v2026.09.13.12

## 기준선
- 개발 직전 main: `6a2089a22f7bba70af3ce970a8c751e72539849b`.
- 최신 관련 런타임 후보: PR #208 / `1832baffb57eb7d2ad603346de20769587d94b0a`.
- 통합 기준선: `3be9ce47407804a7166c6a02dff4dc0f76399d0f`.
- #208이 migration 181을 사용하므로 동일 번호 충돌을 막기 위해 최신 main을 #208 계보에 먼저 병합했습니다.

## 구현 범위
- PostgreSQL migration 182: 회원 알림 규칙, 발생 이력, 사용자 범위 CRUD/조회 함수, ticker 평가 함수.
- NestJS: 입력 검증이 포함된 알림 API와 평가 repository.
- 시장 ticker: 실제 가격 이동 뒤 조건을 평가하며 알림 평가 실패가 가격 broadcast를 중단하지 않게 분리했습니다.
- Next.js: `/stocks/alerts` 생성·삭제, 현재 상태, 최근 발생 이력, 주식 도구 내비게이션.

## 안전성
- WLD 가격 기준은 정수 문자열 정밀도를 유지합니다.
- 앱 DB 역할은 알림 테이블을 직접 쓰지 못하고 SECURITY DEFINER 함수만 실행합니다.
- 알림은 가격·보유·지갑·원장·랭킹·추천 결과를 변경하지 않습니다.
- 발생 이력은 보존하며 API의 조회 limit은 보존 개수 제한이 아닙니다.

## 검증 상태
- 최종 feature SHA CI 대기.
- exact-SHA `wdmv-test` 검증 대기.
- Production 변경 없음.
