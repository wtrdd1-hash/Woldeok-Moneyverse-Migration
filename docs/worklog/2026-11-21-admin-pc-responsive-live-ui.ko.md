# 관리자 PC 기본·반응형 실제 기능 복구

## Before work
- 사용자 최종 우선순위: 관리자부터 제대로 구현하고 실제 백엔드 결함도 수정. 디자인 날짜는 사용자가 11월 18일 네이비·보라로 재확정했다. PC 기본 구조에서 태블릿·모바일로 재배치한다.
- 시작 main: c95d0bf5314e787fc8442a21643d7515c63542c0. 미니PC 기존 격리 worktree를 사용하며 공유 checkout·다른 브랜치는 수정하지 않는다.
- Superpowers systematic-debugging, brainstorming(이전 질문 생략/구현 승인 유지), using-git-worktrees, writing-plans, executing-plans, TDD 적용.
- 실제 운영 로그인 관리자 홈 재접속 성공. 기존 35개 도구의 서로 다른 셸 및 시스템 로그의 정적 오류 캡처는 이전 QA에서 재현됐다.
- 원인: 관리자 홈은 실제 Spring 데이터이며 일부 하위 화면은 정적 Next 오류 HTML/다른 렌더러. 시스템 로그 API는 정상 응답한 이력이 있어 UI 오류와 백엔드 오류를 구분한다.

## In progress
- [x] 관리자 홈·시스템 로그를 동일한 PC/반응형 셸과 실제 API로 제공.
- [x] 새 관리자 UI 실행 범위를 명시적으로 격리하고 기존 서버의 검증된 관리자 쿠키/역할 조회를 사용. DB·원장·세션 생성·관리자 변경 작업 없음.
- [x] RED→GREEN, 전체 Spring/관련 Node, 익명·위조 헤더·장애·이전 요청·다국어 검증.
- [x] PC 1440/1920 및 1024/768/430/390/360/320, 확대 대응 재배치(물리 줌은 미검증), 메뉴·검색·로그 조회/빈 화면/장애를 실제 검사.
- [x] 독립 리뷰, 정확한 main CI, 보호된 Test 및 동일 artifact 운영 승격·롤백·기록.

## Finished
관리자 대시보드·시스템 로그 조회 화면의 1차 운영 전환 완료. 전체 35개 도구의 변경 기능 완료는 아니다. 아래 초기 checkpoint의 미배포 표현은 당시 역사 기록이며 최종 상태는 마지막 운영 수용 기록을 따른다.

### Source implementation checkpoint
- 공통 관리자 셸을 실제 Thymeleaf fragment로 추출해 홈·로그·실패 화면에서 공유한다. 홈 값은 검증된 기존 관리자 API의 응답이며 금융 숫자는 문자열로 유지한다.
- 격리된 admin-presentation 모드는 DB·세션 생성·금융 쓰기·스케줄러·봇을 import하지 않는다. 고정 loopback GET만 사용하고 실제 관리자 cookie를 기존 역할 API에 확인한다. 위조 actor/internal 헤더·중복 cookie·redirect·HTML·손상/대용량 응답은 거부한다.
- 시스템 로그 부재 논리 RED5건 후 관련23건 GREEN. 원본의 오류 문자열을 정상 EMPTY로 처리하지 않는다. 메뉴 언어 변경 레이블 RED→GREEN 및 기존 native Node81건 통과.
- 실제 운영 브라우저에서 시스템 로그 오류 화면을 재현했으며 같은 인증의 API는 status OK/실제10줄이다. 원시 로그·쿠키·회원 정보는 기록하지 않았다. PC1440 관리자 기준 화면은 사이드바가 표시되지만 기존 SPAN 로고가 남아 있다.
- 아직 후보이며 운영 변경 없음. 전체 Spring/build·PC/모바일 브라우저 검증을 진행한다.

### Backend defense in depth
- SystemLogController 자체에 x-internal-token 존재만으로 권한 검사를 생략하는 코드가 있었다. 상위 AdminApiBoundaryFilter가 별도로 검증하므로 전체 운영 우회가 입증됐다고 보고하지 않는다.
- 실제 세션 없이 위조 헤더로 controller를 호출하는 테스트에서 예외가 발생하지 않는 논리 RED 확인 후 해당 생략 분기를 제거했다. 일반 회원의403도 회귀 검사한다.
- 이 컨트롤러 소스 수정은 전체 백엔드 승격 전까지 기존 백엔드 실행 파일에 반영됐다고 주장하지 않는다. 이번 관리자 UI는 기존 검증된 쿠키·권한 조회를 독립적으로 요구하며 identity/internal 헤더를 전달하지 않는다.

### Desktop/responsive and validation checkpoint
- 최초 전체 Spring561건 실패·오류·skip0 및 bootJar 성공. 이후 원천 행 유효성/권한 테스트를 보강했으므로 최종 전체 검사를 다시 실행한다.
- 개발 전용(소스 신원 unverified) 실제 Chromium에서 홈·로그 2경로×1440/1920/1024/768/430/390/360/320×5언어=80배치 통과. PC4열·모바일1열 로그 폼, 실제 입력/빈 검색, 메뉴/Escape, 로고 로딩/가로 넘침 검사를 포함한다. QA fixture이며 실제 운영 데이터 또는 승격 증거로 대체하지 않는다.
- 비정상 원천 행이 통계로 집계되는 문제 RED→GREEN, 거대금액의 숫자/지수 표기 거부·정수 문자열 유지. 네트워크 권한을 포함하는 상대 URI로 source origin을 바꾸는 문제도 RED→GREEN 수정.

### Low-height desktop regression
- 최종 로직 전체 Spring566건0실패/0오류/0skip 및 build 성공. 개발 서비스가 빌드 파일을 직접 열고 있어 재빌드 후 QA 요청 timeout이 발생한 환경 오류는 제외했다. 해당 개발 프로세스만 종료하고 별도 불변 사본/새 작업 디렉터리로 재시작했다. 운영에는 영향 없음.
- 실제 PC1440×600에서 사이드바 내용762px/상자600px/overflow visible로 마지막 메뉴 접근 문제가 재현됐다. 768/900px 높이는 정상이었다. 공통 PC 사이드바 자체에 세로 스크롤을 적용하고 후속 불변 후보에서 재검증한다.

### Independent whole-change review and one fix pass
- 독립 리뷰의 Important3건을 모두 수정한다: 실제 DTO snake_case 계약, 필터가 숨기는 로그 읽기 실패, 비정상 회원 객체의 정상 통계 집계.
- 회원 빈 객체 및 필터로 감춘 읽기 실패가200을 반환하는 논리 RED 각각 확인. 실제 AdminGovernanceDtos 직렬화 원천으로 fixture를 교체했을 때 정상 응답을503으로 거부하는 필드명 불일치도 재현했다.
- canonical/alias 필드 충돌·정수 문자열·회원 UUID/status 검증, 필터 전 원천 조회/검증 후 서버 내 필터링으로 GREEN. 기존 Discord 원천은 자체 기본 필터를 적용하므로 sourceAvailable 증거 없는 EMPTY는 미검증으로 거부한다.
- 백엔드 SystemLogService도 필터 전에 실패를 분류하고 sourceAvailable/status UNAVAILABLE을 보존하도록 소스 수정했다. 실제 실행 중인 기존 백엔드에 배포됐다고 주장하지 않는다. 컨트롤러 위조 헤더 방어/새 원천 metadata 테스트 포함24건 GREEN.
- 실제 기존 백엔드에 익명·위조 actor/internal 헤더 GET을 보냈을 때 관리자 권한 및 시스템 로그 API 모두401을 확인했다. 외부 경계 전체가 우회됐다는 주장은 하지 않는다.
- 라우팅 제안과 최종 CI artifact/실제 브라우저는 아직 별도 게이트다. 전체 관리자 기능 완료가 아니다.

### Frozen source acceptance before CI
- 리뷰 수정 후 전체 Spring570건 실패·오류·skip0 및 bootJar 성공. 기본 test task에서 제외된 postgres-messaging 태그는 로컬 실행했다고 보고하지 않는다. 별도 CI 게이트를 따른다.
- native Node81건 통과, 보안/제어문자/whitespace 검사 통과. 기존 별도 Next QA5실패는 이번 범위에서 해결/면제하지 않는다.
- 불변 개발 사본의 실제 Chromium80배치+200% 대응 CSS폭/deviceScaleFactor2 재배치20건, 실패0. 물리 브라우저의 줌 메뉴 조작 증거로 확대 보고하지 않는다. PC 높이600/768/900에서 사이드바 마지막 메뉴 접근도 수정 후통과.
- 실제 로그인 브라우저에서 원천 users/stocks/controls의 snake_case 필드, 회원 identity/status 존재, 모든 주가 canonical string을 확인했다. 개인 식별자·잔액 원문 미기록.
- [35개 관리자 도구 검증 원장](../qa/2026-11-21-admin-functional-ledger.ko.md)에 미검증·다른 셸·금융 게이트를 OPEN으로 고정했다. 아직 운영 승격 전이다.

### Final scoped Production acceptance
- PR #3328 main98b5dec0283f 및 정확한 main CI44846998303 네 job SUCCESS. 기존 사용자 승인에 따라 2026-11-21 10:48:33 KST 운영 기본 경로를 전환했다.
- 실제 로그인 Test12배치/20언어 조합과 운영8배치, 실제 로그6종 버튼, 기존 세션 연속성, Test 중지 상태에서도 운영 독립 제공 확인. favicon 및 CSS403은 exact public asset 라우팅으로 수정했다.
- 로그5종 정상 조회, FRONTEND는 제거된 v1546 unit 참조로 UNAVAILABLE/OPEN. backend controller/metadata 방어 소스 수정은 병합됐지만 기존 전체 backend runtime 승격은 OPEN. 가짜 정상/0/빈 목록으로 감추지 않는다.
- 전체 Spring570/0fail/0error/0skip 및 native Node81 통과, 별도 PostgreSQL은 main CI 증거로 구분. 기존 Next QA5실패·금융 게이트는 유지한다.
- [운영 전환 영수증](../releases/2026-11-21-admin-read-ui-production.ko.md), [기능 원장](../qa/2026-11-21-admin-functional-ledger.ko.md). 아직 못 한 physical zoom/전문구 언어 교정/다른 관리자 변경 기능은 완료로 표시하지 않는다.
- 최종 문서 독립 리뷰에서 material overclaim/unsafe rollback finding 없음. 운영 FRONTEND에 불일치 필터를 넣어도 unavailable:true/rowCount:null 유지 실측. 마지막 문서 변경에 repository-security/control-byte/diff-check 및 QA 증거 개수·링크 검사 통과.
