# Spring 기능 추가 확인 및 도메인 인벤토리

[52개 Spring 도메인 인벤토리](../qa/2026-11-25-spring-domain-inventory.csv)는 기획 문서 파일명·Spring 컨트롤러·SQL 함수 호출·테스트 파일·프론트엔드 디렉터리를 이름과 정적 패턴으로 연결한 후보 목록입니다. 기획 승인 상태나 계약 일치를 검증한 결과가 아니며 최대 표시 개수 제한이 있습니다. 모든 행의 패리티는 UNKNOWN, 런타임 테스트는 NOT_RUN입니다. 이름 불일치, 간접 호출, 별도 모듈과 동적 경로가 빠질 수 있으므로 누락을 미구현의 증거로 사용하지 않습니다.

다음 항목은 기준 main 9876c09888ec84034eec183cf1309c85df3d7447의 메서드 본문에서 직접 확인했습니다.

- 공간: `spring-backend/src/main/java/com/moneyverse/api/domain/space/service/SpaceService.java:20`의 내 공간 조회, 구매, 배치 수정, 세금 납부 메서드는 정식 소스 미확보로 무조건 503을 반환합니다.
- 조언: `spring-backend/src/main/java/com/moneyverse/api/domain/advisor/service/AdvisorService.java:18`의 포트폴리오 진단과 질문 메서드는 정식 소스 미확보로 무조건 503을 반환합니다.
- 성장/신용: `spring-backend/src/main/java/com/moneyverse/api/domain/progression/service/ProgressionService.java:25`의 성장 상태, 갱신, 신용 상태, 초반 게임 상태 메서드는 정식 소스 미확보로 무조건 503을 반환합니다.
- 출석/퀘스트: `spring-backend/src/main/java/com/moneyverse/api/domain/engagement/service/EngagementService.java:52`의 연속 출석 보상 청구, 퀘스트 진행 조회, 상승·하락 투표 메서드는 검증된 기록 미확보로 무조건 503을 반환합니다. 출석 상태 조회는 별도 소스 접근 경로가 있습니다.
- 제작: `spring-backend/src/main/java/com/moneyverse/api/domain/shop/service/ShopService.java:148`의 제작 레시피 조회는 정식 소스 미확보로 무조건 503을 반환합니다. 다른 제작 API 전체가 미구현이라는 뜻은 아닙니다.

위 판단은 Spring 소스 기준이며 실제 운영 트래픽 소유자와 배포 버전은 확인되지 않았습니다. 전체 기획의 기능별 수동 대조와 실제 인증·원장·모바일 검증은 미완료입니다.
