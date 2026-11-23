# 실제 Test 프론트엔드·백엔드 점검 — 2026-11-23
현재 작업은 Test 전용이다. 운영 승격하지 않는다. [실제 Test](https://test.easy-scraping.com/) · [배포본 식별](https://test.easy-scraping.com/frontend-ui-version).
기준: UI_UX_SINGLE_REFERENCE.ko.md 및 원본 파비콘. 신규180개 PNG는 생성된 디자인 자료이며 실제180개 기능 정상 증거가 아니다.

## 현재 연결
독립 Spring MVC/Thymeleaf frontend-presentation 서비스가 실제 Test API와 별도 합성 PostgreSQL에 연결된다. 운영4550으로의 fallback은 제거했다. 운영 설정은 Test 블록 바깥의 바이트 동일성을 확인했다.
초기 연결 applicationSource5e0ede9ff8bddd187e8f14ac1ee89270f659acd0; 실제 backendSourcef0336fded6068f884c87f88efedeb770fd3387d4. 두 소스를 같은 배포본이라고 표시하지 않는다. 소스 DB 트리는 동일하지만 신규 백엔드를 운영 배포한 것은 아니다.

## 실제180경로 대조 — 익명 GET만
| 결과 | 개수 | 의미 |
|---|---:|---|
| HTML 응답 |15| 게스트 화면 존재; 모든 기능 정상 증거 아님 |
| 로그인 필요 |14| 보호된 native 관리자/회원 경로; 실제 로그인 후 기능은 미검증 |
| 동적 fixture 필요 |33| 임의 계정/게시글 ID를 만들지 않았음 |
| 미구현 또는 미연결404 |117| 실제 신규 프론트엔드 누락. 홈으로 우회해 정상으로 세지 않음 |
| 실제 source unavailable503 |1| /status; 정상 상태를 합성하지 않음 |

원시 결과: [180행 기록](2026-11-23-test-frontend-route-180-initial.json).
이 점검은 모든 관리자·회원·금융 기능 PASS가 아니다. 현재 브라우저의 운영 로그인 세션을 Test에 복사하지 않았다.

## 발견·수정 현황
- F01 Test가 운영과 같은 renderer를 프록시하고 버전 조회가503/홈HTML을 반환: 독립 서비스와 정확한 JSON/SHA 응답으로 연결 확인.
- F02 관리자 장식의 문자W: 현재 파비콘 바이너리로 교체;5언어 real-render 회귀 RED→GREEN.
- F03 실제 브라우저 /?lang=ko가 영어로 유지: 최초 matrix의 두 번째 조건에서 실패. 서버/클라이언트 query 우선순위 및 URL 동기화, 게임시간 안내의 번역 누락을 수정 중. 새 배포본 실제 브라우저 재검증 전까지 OPEN.
- F04117개 route 미연결: OPEN. 금융·게임·계정·정책·관리자 기능을 개별 실제 계약과 연결해야 한다.
- F05 /status 실제 데이터 unavailable: OPEN. 정상 온라인 상태/시각을 만들어 표시하지 않음.
- F06 Test 인증·OAuth·실제 회원/관리자 양성·쓰기 기능: OPEN. 현재 read-only Test 계약/게스트 UI 점검으로 통과 처리하지 않음.

## 검증 구분
초기 소스 Java667/Node351/Python16 통과; 최초 실제 UI matrix는1조건 통과 후 한국어 조건 실패로 중단했다.240개 통과가 아니다.
언어 수정 후보는 Java673/Node353/Python19 통과를 확인했으며 신규 exact CI/artifact와 실제 browser acceptance를 기다린다. 로컬 Gradle에서 제외되는 PostgreSQL 태그는 통과로 세지 않았다.

## 후속 실제 브라우저 결과
번역 수정 dbac 배포본은 홈40개 조건을 통과했다. 이후 /tools320px에서 문의 버튼이 검색칸과5.25px 겹쳐 전체 실행이 중단됨: [실측 JSON](2026-11-23-test-frontend-browser-overlap.json). 문의 버튼을 공통 헤더 공간에 배치하는 수정은 Java674/Node354 통과했으나 신규 실제 브라우저 재검증 전까지 미완료다.
상태503은 [실제 앱 역할의 읽기 경계 결함](../findings/2026-11-23-test-status-read-boundary.ko.md)으로 확인됐으며 raw table GRANT 우회는 하지 않았다.
