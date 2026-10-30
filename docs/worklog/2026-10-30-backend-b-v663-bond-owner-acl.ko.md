# 개발 B v663 — 국채 보유·레포 내역 읽기 권한 수정 (릴리스 보류)

2026-10-30 18:34~18:49 KST. 최신 main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`, 선행 미병합 #2011 SHA `a902f415212c1713292808ad1a5bea92eb403c3f` 기반의 독립 작업 브랜치.

P1 #2022의 원인: 앱 계정은 `treasury_bond_holdings`를 직접 SELECT할 수 없지만 Backend는 직접 조회했음. 신규 전진형 마이그레이션 312에서 회원별 SECURITY DEFINER 보유/레포 조회 함수와 공개 상품·집계 함수를 추가하고 Backend 조회를 함수 호출로 교체. 테이블 직접 접근 권한은 철회하며 기존 원장·잔액·금융 쓰기는 변경하지 않음.

수정 전 테스트 2건 실패 재현, 수정 후 집중 Backend 9/9, DB 정적 2/2, 격리 PostgreSQL 17.11 전체 002~312 적용 및 권한·타 회원 차단·큰 금액 정밀도·HTTP 3건 검증 통과. Lint/Typecheck/Build/모바일 API 계약(183)/보안(31)/Contract(41) 통과. 전체 Backend 118건 실패, Frontend 53건 실패, 공식 Test exact-SHA 미검증. 선행 PR과 P0 운영 프로세스 불일치 #1984가 해결되지 않아 main 병합과 Production 배포 금지. 다른 예약·서비스·공유 DB는 변경하지 않음.
