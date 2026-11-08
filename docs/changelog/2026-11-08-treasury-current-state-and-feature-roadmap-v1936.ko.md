# v2026.11.08.1936 — 국고 현재 개발현황 및 225개 세부기능 고도화 기획
> 한국어 보조문서 | [EN](2026-11-08-treasury-current-state-and-feature-roadmap-v1936.md) | 상태: 기획/읽기 전용/미배포

## 추가 문서
- [Detailed EN plan](../planning/TREASURY_SERVICE_CURRENT_STATE_AND_DETAILED_FEATURE_ROADMAP_v2026.11.08.1936.md) / [KO](../planning/TREASURY_SERVICE_CURRENT_STATE_AND_DETAILED_FEATURE_ROADMAP_v2026.11.08.1936.ko.md).
- [39-source EN map](../research/2026-11-08-sovereign-treasury-feature-reference-matrix-v1936.md) / [KO](../research/2026-11-08-sovereign-treasury-feature-reference-matrix-v1936.ko.md).
- [worklog EN](../worklog/2026-11-08-treasury-current-state-roadmap-v1936.md) / [KO](../worklog/2026-11-08-treasury-current-state-roadmap-v1936.ko.md).
- 국가금융 21개 도메인, 한국어 225개 번호별 세부기능, 신규 API·상태도·DB 구조·실원장 검증과 P0/P1/P2 로드맵.

## 실제 확인한 사실
- 운영 공개 버전 v1770, Test v1742; 작업 중 main b56fdc748d → 4938d491d9 변경.
- 현 국고 정식 잔액과 5개 금고 합계 각각 191,055,911 WLD, 거래 895건/전표1854건, 차대합 오류 0건(해당 집계 기준).
- 창업지원 승인 500,000 WLD 1건은 정식 지급ID 없음. 국부펀드 276 이벤트, 국채 3개 상품에 보유·이자지급 0, 연금코어 영수증 0, KDIC 보험료·지급 0.
- 가장 중요한 P0: 등록된 연금지급 함수의 직접 잔액 수정, 공기업 배당을 MINT에서 발행하는 SQL340 설계, SQL340/341 적용기록 부재.
- 국고 포털 실제 /treasury 포함 신청 모달·별도 /treasury/portal 404. 비로그인 관리자 API의 401은 정상적 권한 거부.

## 운영 경계
실제 DB/금전거래/코드/운영 배포 변경 없음. 설계 문서이므로 완료된 기능으로 오인하지 않는다. 후속 구현 때 문제 SQL을 정방향으로 교체하고 공식 Test·무중단 운영검증 필수.
