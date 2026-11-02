# 개발 C v1296 — 회원 주식 거래 내역 원본 검증

**상태:** 작업 시작 / 초안 / 운영 보류. 2026-11-02 12:46 KST.
**기준:** origin/main a8541927c3a351d980454c66e95a3356c47e0722.
**브랜치:** auto/hourly-c-stock-history-source-v1296-20261102-1245.

## 작업 설계
기존 NestJS 인증 회원 GET /api/v1/stocks/history와 PostgreSQL stock_my_trades(actor, limit) 읽기만 재사용한다. 현재 웹/Android는 minGross가 없는 기본 조회에서 성공 응답의 거래 구조를 검증하지 않아 잘못된 가격이 BigInt 처리에서 오류를 일으키거나 잘못된 내역을 표시할 수 있다. 모든 조회에 엄격한 검증을 적용하고 실제 빈 내역과 장애를 구분한다. WLD 금액은 문자열/BigInt로 보존하고 데이터베이스·원장·권한을 수정하지 않는다.

## 시작
AGENTS, README, 영문·한국어 통합기획서, 최신 기획 v1648, 열린 PR, A/B, QA 확인. main의 README.ko.md는 없음. 작업은 독립 worktree에서 진행한다.

## 진행
RED 테스트 및 구현·검증 예정.

## 종료
전체 게이트 완료 전 main 병합·Test·Production 배포 금지.
