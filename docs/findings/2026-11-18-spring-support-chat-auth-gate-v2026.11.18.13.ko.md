# 고객지원·채팅 신원/허위 성공 보안 게이트 — v2026.11.18.13

상태: 소스상 확인 위험 / P0 운영 연동 보류 / 침투테스트는 미실시
일자: 2026-11-18 KST
범위: 미니PC 소스 읽기 전용 분석, 실제 로그인 E2E는 미검증.
관련: 관리자·전역 채팅 시안, Spring 긴급보안 PR #3267.

## 실제 코드 확인
1. `spring-backend/src/main/java/com/moneyverse/api/domain/support/controller/SupportController.java`: `resolveUserUuid`가 `X-User-Id`, `x-actor-user-id` 헤더를 신원으로 사용하고 누락/오류 시 고정 UUID를 대입함.
2. `spring-backend/src/main/java/com/moneyverse/api/domain/chat/controller/ChatController.java`: 회원 쪽지 조회·전송에서도 동일한 신원 헤더 및 고정 UUID 대체 로직을 사용함.
3. `spring-backend/src/main/java/com/moneyverse/api/domain/support/service/SupportService.java`: 목록·요약·메시지 조회 실패 때도 `success:true`와 빈 정보를 돌려줄 수 있고, 문의 생성 DB 실패 시에도 가짜 성공형 스레드를 반환할 수 있음.
4. `frontend/src/components/route-aware-floating-utilities.tsx`: 기존 고객지원 위젯이 /admin 화면에서는 표시되지 않도록 되어 있음.

## 위험과 검증 범위
클라이언트에서 조작 가능한 헤더를 서버의 인증된 회원으로 신뢰하면 교차 회원 조회 등의 위험이 존재한다. 고정 UUID 대체와 실패 시 허위 성공은 개인정보·정확한 문의 영수증 정책에 어긋난다. 이는 소스 점검 결과이며 실제 운영 공격 성공을 주장하지 않는다.

## 반드시 필요한 분리 작업
- 서버 SecurityContext/유효 세션을 통해서만 신원을 확인하고 사용자 헤더/고정 UUID 대체 제거.
- 스레드·쪽지별 실제 소유권, 관리자 역할/OTP, 원장 권한 등 서버 인증 강화.
- DB 장애 시 401/403/503 및 정확한 실패 응답, 영수증 성공 여부, 중복 방지 구현.
- 비로그인·타 회원·타 관리자·비정상 ID·동시 요청·서버장애·복구 후 정확한 Test E2E 검증.
- Spring 담당 PR #3267 등과 파일 충돌을 피하도록 보안 담당자가 별도 처리.

**이번 브랜치:** Java·기존 프론트엔드·운영 수정 없음. 보안 검증 전 새 전역 채팅을 실제 API에 연결하지 않음.
