# 작업 로그: v2026.09.22.342 주식 거래정지 버그 수정 및 운영 무중단 배포

> 일시: 2026-09-22
> 커밋: 06fde76 / be6344f
> 환경: 미니 PC Debian 호스트 (192.168.100.190)

## 1. 목적 및 작업 배경
- 관리자 콘솔(/admin/market)에서 종목 거래정지 및 원가정산 확정 시 500 에러("서비스가 일시적으로 불안정해요")가 발생하는 결함 해결.
- 전체 최신 프론트엔드/백엔드 코드를 GitHub origin/main에 통합하고 테스트 및 운영 서버에 무중단 배포.

## 2. 해결 내역
- PostgreSQL 함수 `public.stock_halt_and_settle`의 PL/pgSQL 컬럼 모호성(`halt_status`)을 테이블 별칭(`s.halt_status`)으로 한정하여 500 버그 수정.
- `packages/database/migrations/221-stock-halt-cost-basis-settlement.sql` 수정 및 실DB 적용.
- GitHub `main` 브랜치 푸시 완료.
- 운영 서버(`easy-scraping.com`) 819개 세션 무손실 유지 및 200 OK 확인.
