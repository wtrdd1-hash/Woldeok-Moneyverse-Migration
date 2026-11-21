# 11월 18일 디자인 전체 프론트엔드 통일

## Before work
- 사용자 최신 지시: 운영 프론트엔드를 실제 확인하고, 전체 UI를 11월18일 디자인으로 통일한다. 기존 관리자 우선순위·실제 backend 사용·favicon 로고·PC 기본/모바일 반응형·5언어·운영 승인 유지. 반복 질문 생략 요청 유지.
- 시작 main1d9539dce084fb06a892701021925088229467a4. 미니PC 기존 clean isolated worktree에서 task branch를 생성했다. 공유 checkout/외부 작업은 건드리지 않는다.
- Superpowers using-superpowers/systematic-debugging/brainstorming(기존 확정 디자인 및 질문 생략 유지)/worktrees/writing-plans/executing-plans/TDD를 적용한다.
- 이전 운영 범위는 공개5경로93a3 및 관리자 홈·시스템 로그98b이다. 전체 전환 완료로 보지 않는다.

## In progress
- [ ] 실제 운영 관리자·공개·회원 경로의 renderer/디자인/상호작용·에러·언어·모바일 분류.
- [ ] 기존18일 원본/공통 셸 및 실제 source/API 계약과 비교해 구현 계획 고정.
- [ ] 공통 디자인 전환을 RED→GREEN 및 실제 browser로 검증. 정상 기능/권한/금융 불일치 은폐 금지.
- [ ] 독립 리뷰·정확한 CI/Test·한 범위씩 운영 전환과 증거 기록.

## Finished
아직 완료하지 않았다. 전체180디자인 대상과 실제 운영 기능 수용은 구분한다. 원시 로그/쿠키/회원ID/개별잔액은 기록하지 않는다.

### Implementation checkpoint
- 운영 관리자36경로(홈+도구35) 및 사용자/정책13경로를 실제 브라우저로 열어 디자인·언어·오류 상태를 분류했다. 회원 검색 버튼 실제 동작/부분 결과 범위도 확인했다. 개인ID/잔액/원시로그는 저장하지 않았다. [경로 원장](../qa/2026-11-21-nov18-frontend-route-ledger.ko.md).
- 기존 별도 inline/2언어 관리자 조회6개를 공통 Nov18 셸로 이식했다. 추가 DB/쓰기 컴포넌트 없이 실제 GET 원천만 사용하며 경제2경로는 기존 exact approver 조건을 유지한다. 회원 검색/상한/부분 조회 의미, source 오류 및 미검증503, 정수 문자열 정밀도와 화면 그룹 서식을 검증한다.
- 7개 논리 RED403 후 관련27GREEN, 회원 미전송 검색/언어 폼 RED 후 native Node82GREEN. optional 회원 alias 충돌이200으로 숨겨지는 추가 RED를503으로 수정했다.
- 독립 전체 소스 리뷰 Important1건: raw URI와 Spring 매핑 차이로 인코딩된 경제 경로가 추가 권한검사를 건너뛰고 정합성 원천을 읽었다. 실제 HTTP RED로 재현 후 trusted matched mapping+명시적 경제 경로로 수정했다. 관련30GREEN, 리뷰 확인 완료. 이 문제는 아직 미배포 후보에 있었으며 기존 운영 취약점으로 확대하지 않는다.
- 최종 전체 Spring580건 실패/오류/skip0 및 bootJar 성공, native Node82건 통과. 기본 test task 제외 PostgreSQL messaging은 로컬 통과로 보고하지 않으며 CI 게이트를 따른다. repository-security/control-byte/diff-check 통과. source freeze에서 main1d9539 유지 확인.
- 아직 실제 후보 브라우저/Test·CI 아티팩트·운영 승격 전이다. 전체 프론트엔드 통일 목표와 다른 경로/권한·금융·문의/계정403/에러 로그 문제는 OPEN으로 유지한다.
