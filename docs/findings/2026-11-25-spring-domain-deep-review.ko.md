# 추가 도메인 코드 대조 — 2026-11-25

기준: main `9876c09888ec84034eec183cf1309c85df3d7447`. 아래는 소스에서 확인한 결함과 구현 공백이다. 실제 운영 노출·악용·손실은 검증하지 않았다. 위험한 동작을 직접 호출하지 않았다.

| 우선순위 | 기능 | 소스 근거 | 확인한 내용 | 필요한 조치 |
| --- | --- | --- | --- | --- |
| P0 | 은행 | `bank/controller/BankController.java:25`, `bank/service/BankService.java:24` | 사용자 헤더 및 기본 ID 사용, 조회 실패 시 고정 잔액, 입출금 오류 후 임의 영수증과 성공 반환 | 세션·CSRF·멱등성·정식 원장 함수와 실제 영수증. 기존 데이터 직접 보정 금지 |
| P0 | 개인정보 요청 | `privacy/controller/PrivacyController.java:45` | 조회는 항상 빈 목록이고 생성은 DB 기록 없이 임의 ID와 SUBMITTED를 반환 | 저장 및 소유자 조회·감사·재시도 증거를 구현하거나 미완료 응답 |
| P0 | 긴급 삭제/신고 | `safety/controller/SafetyController.java:17` | 긴급 신고 접수와 상태, 관리자 처리 결과를 저장 없이 생성; 신고가 실제 접수됐다고 오인 가능 | 실제 접수·처리 저장, 권한 검증, 감사 및 영수증 또는 명확한 실패 |
| P0 | 조폐 | `mint/service/MintService.java:25`, `mint/controller/MintController.java:20` | 조회는 샘플이며 주조·소각은 임의 ID로 성공 응답을 구성; 컨트롤러는 사용자 헤더/기본값 사용 | 실제 운영 경로 차단 여부 확인, 정식 관리자 권한·원장 함수·영수증 연결 |
| P0 | 마켓플레이스 | `marketplace/service/MarketplaceService.java:25` | 조회 예외를 빈 목록으로 변환, 등록·구매는 DB 예외를 삼키며 성공 응답을 구성 | 소유자 검증, 원자적 아이템/결제 처리와 영수증, 실패 시 실패 반환 |
| P0 | PVP | `arena/service/PvpArenaService.java:27`, `arena/controller/PvpArenaController.java:32` | DB 실패 시 예시 방 반환 및 방 생성·참가·취소에서 예외를 삼키고 결과 반환; 헤더 ID 사용 | 검증된 사용자·판돈 잠금·원장 정산·실패 처리 및 재시도 검증 |
| P0 | 비밀 경매 | `market/service/BlackMarketService.java:24` | DB 실패 시 예시 경매·입찰 이력을 반환하고 입찰 DB 오류를 삼킴 | 실제 경매/입찰 데이터와 원장 영수증만 표시, 실패 시 차단 |
| P1 | 카지노 | `casino/service/CasinoService.java:26` | 통계가 고정값이고 게임 결과를 임의로 구성; 컨트롤러 일부는 민감 API 필터 대상 | 활성화 게이트와 실제 경로 확인, 검증된 통계·원장·확률 검증 전 사용 금지 |
| P1 | 국채 | `bond/service/BondService.java:24`, `bond/controller/BondController.java:57` | DB 실패 시 고정 개요 또는 빈 목록, 내 대출 내역은 항상 빈 목록, 일부 경로는 직접 테이블 수정 | 오류와 빈 결과 구분, 원장 함수·소유권·동시성 검증 |
| P1 | 제작 | `crafting/service/CraftingService.java:23` | 레시피 조회 실패 시 대체 데이터를 반환하고 제작 결과를 임의 ID로 생성 | 실제 레시피·재료 차감·아이템 지급 원자 처리 및 영수증 |
| P1 | 초기 게임 | `earlygame/controller/EarlyGameController.java:37` | 오늘의 이벤트 등 일부 응답은 임의 식별자를 생성 | 정식 시드와 저장 상태 및 지급 영수증 대조 |

경로는 `spring-backend/src/main/java/com/moneyverse/api/domain/` 기준이다. 민감 API 필터는 일부 카지노 및 국채 읽기를 보호하지만 PVP `/rooms`, 은행 전체, 조폐, 제작, 마켓플레이스가 모두 포함됐다고 볼 수 없다. 다른 필터와 실제 프록시, 기능 스위치 및 배포 SHA는 별도 확인해야 한다.

## 검증과 미완료

위 결과는 메서드 본문과 컨트롤러·보안 필터를 대상으로 한 정적 분석이다. 실제 PostgreSQL 역할 권한, Test와 Production 격리, 배포 SHA, 인증된 양성·음성 HTTP 요청, 장애 시 재시도, 모든 기획서 기능과의 전수 대조는 미완료다. [52개 도메인 후보 인벤토리](../qa/2026-11-25-spring-domain-inventory.md)는 증거가 아니라 추적 출발점이다.

P0 경로는 운영 트래픽 소유권과 외부 노출 여부를 먼저 읽기 전용으로 확인하고, 안전한 차단·복구 계획을 수립해야 한다. 수정은 실제 DB 함수와 권한, 원장 및 영수증 테스트를 포함한 별도 작업으로 수행한다.
