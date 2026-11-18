# Spring P0 장애 복구 실행 계획 — v2026.11.18.2

**상태:** 일부 소스 구현 / 남은 QA 게이트 차단. 구현 전에 비공개 초기 단계 계획을 기록했고 이 문서는 그 공개 가능한 대응본입니다. 이슈 #3265, Draft PR #3267.

## A — 인증·역할·CSRF P0 [소스 구현, 격리 부정 테스트]
AdminApiBoundaryFilter, AdminAuthService, 회원·주식·경제 관리자 컨트롤러와 회귀 테스트. 위조 세션 RED→GREEN. 실제 관리자 세션·권한 철회·MFA·CSRF 성공 E2E 전 운영 릴리스 금지. Nginx 임시 보호 유지.

## B — 상점 DB 계약 [소스 구현, 읽기 전용 확인]
ShopController, ShopService, ShopDtos 및 집중 테스트. `shop_catalog_list_v2(NULL::uuid)`가 Test DB 상품 146건 정상 조회, 위조 요청 401, 가짜 성공 제거. 실제 구매 멱등성·세금 영수증·본인 보관함 필드·정본 원장은 격리 ROLLBACK으로 추가 검증 필수.

## C — 공식 Test 배포 [차단]
공식 Test 웹 포트 미가동. 내부 읽기 전용 Spring 4610은 공식 Test가 아님. 독립 Test DB 권한/버전과 Spring 프론트·백엔드를 정확 SHA로 배포하고 실제 로그인 E2E를 통과한 뒤 Test Nginx 전환. Production API를 Test로 돌려서 가짜 통과시키지 않음.

## D — Spring 동적 관리자 화면 [차단]
정적 Next HTML에 포함된 실패 상태를 제거하고 320/390px Spring 서버 기반 실제 회원 검색·상세·오류 표시 UI로 대체. 권한, 터치 타깃, 스크린리더, 국제화 요구 준수. 가짜 빈 화면/성공 방지.

## E — 금융·직업·디스코드 [차단]
국민연금 사용자 헤더·테이블 ACL 500 및 다른 회원별 기능을 실제 세션·원장 함수에 연결. 원장 DML을 직접 수행하지 않으며 격리된 DB에서 ROLLBACK-only 검증. 디스코드 Gateway 연결과 음성방 실제 입장·재접속을 별도로 측정.

## F — 전체 QA와 무중단 승격 [차단]
Spring 전체 테스트 136개 중 17개 FAIL. 후보 SHA `72de60d9`, 분리 PR은 원격 기능 브랜치 위에 쌓였으며 main 직행 없음. 다른 작업자의 HEAD 재확인, CI·보안·복원·정확 SHA 독립 Test와 로그인 E2E 통과, 버전 불변 운영 카나리, Nginx 원자적 무중단 승격과 롤백 증명 후에만 릴리스. 실패한 후보를 승격하지 않음.
