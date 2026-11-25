# 추가 점검 2: 운영 데이터 신뢰성과 차단된 기능

기준 main `9876c09888ec84034eec183cf1309c85df3d7447`. 코드의 존재와 실제 운영 노출은 별도로 확인해야 한다.

| 기능 | 근거 | 소스에서 확인한 상태 |
| --- | --- | --- |
| 활동 로그 | `activity/service/ActivityService.java:27` | 이벤트 입력 DB 오류가 발생해도 요청 건수로 성공을 반환할 수 있고, 로그 조회 예외도 성공·빈 목록으로 처리한다. 감사·분석 누락이 정상 수집처럼 보일 위험이 있다. |
| 시즌 | `season/service/SeasonService.java:25` | 시즌 정보가 고정값과 현재 시각으로 구성되고 보상은 DB 오류를 삼킨 뒤 임의 원장 ID를 성공으로 반환한다. 정식 원장 기록은 확인되지 않는다. |
| 중앙은행 | `centralbank/service/CentralBankService.java:24` | 통화 집계 조회 실패 시 고정값을 사용하고 금리·지준율 변경은 저장 없이 성공 맵을 반환한다. |
| 외환 | `fx/service/FxService.java:21` | 일부 현황과 목록이 고정값 또는 빈 목록이다. 금융 작업은 `guardFinancialOperations`에서 503으로 보류되므로 허위 정산 성공과 구별해야 한다. |
| 연금 | `pension/service/PensionService.java:29`, `pension/controller/PensionController.java:40` | 개요 조회 오류 시 고정값을 반환할 수 있다. 확인한 컨트롤러의 납입·은퇴 변경 및 적립 포지션은 원장 미인증으로 503 차단한다. 서비스에 위험한 옛 구현이 존재해 다른 호출 경로는 추가 추적이 필요하다. |
| KDIC | `kdic/service/KdicService.java:47` | 원장 무결성, 보험료 부과, 유동성 지원, 지급은 503으로 차단한다. 구현 존재를 기능 정상으로 집계하면 안 된다. |
| 클럽 | `club/service/ClubService.java:100` | 가입과 탈퇴 메서드는 503으로 차단한다. 목록·상세 조회는 별도 데이터 접근 구현이 있으며 실제 DB 검증은 미실시다. |
| 국고 | `treasury/service/TreasuryService.java:49` | 정식 함수를 호출하는 일부 경로가 있으나 호출 내부에서 새 요청 키를 생성한다. 재시도 중복 방지 여부와 직접 테이블을 수정하는 SWF 경로는 PostgreSQL 권한·동시성 검증이 필요하다. |

실제 운영에서 어느 경로가 연결됐는지와 위험한 서비스가 다른 컨트롤러에서 호출되는지는 미확인이다. 사용자·금융 데이터 변경 없이 코드와 테스트 프로파일만 살펴봤다. 각 행의 API·DB·화면·실제 테스트 증거를 완성하기 전에는 전체 기능 정상으로 판정하지 않는다.
