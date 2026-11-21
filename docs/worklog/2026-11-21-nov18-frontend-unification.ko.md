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

## Finished — 현재 단계
관리자 조회8경로의 공통 디자인 운영 전환을 완료했다. 전체 프론트엔드 통일 목표는 미완료이며 남은28개 관리자/사용자 경로·기능은 경로 원장에 OPEN으로 유지한다. 전체180디자인 대상과 실제 운영 기능 수용을 구분한다. 원시 로그/쿠키/회원ID/개별잔액은 기록하지 않는다.

### Implementation checkpoint
- 운영 관리자36경로(홈+도구35) 및 사용자/정책13경로를 실제 브라우저로 열어 디자인·언어·오류 상태를 분류했다. 회원 검색 버튼 실제 동작/부분 결과 범위도 확인했다. 개인ID/잔액/원시로그는 저장하지 않았다. [경로 원장](../qa/2026-11-21-nov18-frontend-route-ledger.ko.md).
- 기존 별도 inline/2언어 관리자 조회6개를 공통 Nov18 셸로 이식했다. 추가 DB/쓰기 컴포넌트 없이 실제 GET 원천만 사용하며 경제2경로는 기존 exact approver 조건을 유지한다. 회원 검색/상한/부분 조회 의미, source 오류 및 미검증503, 정수 문자열 정밀도와 화면 그룹 서식을 검증한다.
- 7개 논리 RED403 후 관련27GREEN, 회원 미전송 검색/언어 폼 RED 후 native Node82GREEN. optional 회원 alias 충돌이200으로 숨겨지는 추가 RED를503으로 수정했다.
- 독립 전체 소스 리뷰 Important1건: raw URI와 Spring 매핑 차이로 인코딩된 경제 경로가 추가 권한검사를 건너뛰고 정합성 원천을 읽었다. 실제 HTTP RED로 재현 후 trusted matched mapping+명시적 경제 경로로 수정했다. 관련30GREEN, 리뷰 확인 완료. 이 문제는 아직 미배포 후보에 있었으며 기존 운영 취약점으로 확대하지 않는다.
- 최종 전체 Spring580건 실패/오류/skip0 및 bootJar 성공, native Node82건 통과. 기본 test task 제외 PostgreSQL messaging은 로컬 통과로 보고하지 않으며 CI 게이트를 따른다. repository-security/control-byte/diff-check 통과. source freeze에서 main1d9539 유지 확인.
- 아직 실제 후보 브라우저/Test·CI 아티팩트·운영 승격 전이다. 전체 프론트엔드 통일 목표와 다른 경로/권한·금융·문의/계정403/에러 로그 문제는 OPEN으로 유지한다.

### Scoped release acceptance
- PR3330 정상 병합 main e2fb487a1a7814e74abac1097814881801c4dd13. PR 정본 CI44856831244의4job 및 required3check PASS. 사용하지 않는 별도 컨테이너 build 진행과 native CI artifact를 구분했다.
- main CI44857905769 정확한 JAR5aced41a…를 불변 Test4812/운영4814에 설치했다. main native CI 성공 후 먼저 Test에 배치했으며, main 전체4job SUCCESS와 실제 Test 수용 이후에만 12:02:08 KST 운영 기본8경로를 전환했다. DB/쓰기/스케줄러 import 없음.
- 실제 로그인 Test320개(8경로×8너비×5언어) 및 CSS 확대 대응40개 실패0. 실제 검색/상한1/빈 결과/언어 전환 중 입력 유지/제출 언어, 메뉴·Escape·문의 패널·낮은 PC sidebar Tab 접근 확인. 물리 줌·실기기는 미검증이다.
- 운영24배치와 회원5언어/검색 통과. Test unit 중지 상태에서도 기존 선택 cookie가 남은 같은 세션으로 운영8경로/버전e2를 수신했다. Test 복원, 양 unit enabled/active/openJAR 일치, 관찰 시점 error-priority journal0.
- 실제 격리 Nginx116라우팅/39gateway 통과. source/phase/JAR에 묶인 Test 영수증을 운영 선결로 검사한다. 배포 script 리뷰의 stale receipt 및 부분 inverse 가능성은 binding·전체해시 사전검사·변경 전 거부시 no-reload로 보강했다.
- 신규 gateway4813의 공개 business/catalog guest200과 비공개 관리자 guest401, 모든 mutation/외부 경로403 구분. API권위4550/4632, 이전 공개93a3/자산4792·4782·4808, 기존 holds/외부Test403 보존.
- [상세 운영 영수증](../releases/2026-11-21-nov18-admin-unified-production.ko.md). 계정/문의/채팅403·회원헤더 상태·에러로그 불러오기 실패·FRONTEND journal 원천·기존 금융 게이트·Next QA5실패·다른 관리자 변경 기능은 해결/면제하지 않았다.

### Stable-home correction and exact alias check
- 첫 로딩 guest 링크 관찰만으로 홈 로그인 상태가 계속 잘못된다고 판정하지 않았다. 실제 `.auth-profile`이 visible이 될 때까지 기다린 재검사에서 profile1/login0/logout1/admin-nav2를 확인했다. 직접 auth/session URL 탐색의 same_origin_required는 same-origin fetch의 실패 증거가 아니다. 이 추측으로 code/auth guard를 바꾸지 않았다.
- 안정된 홈에서 실제 프로필 링크를 클릭하면 /account403은 여전히 재현된다. /admin/ 별칭은 같은 새 운영 source의 정상 화면(브랜드IMG2/오류0)을 확인했다.
- 최종 수용 문서 독립 리뷰: material overclaim/unsafe inverse finding 없음. CSV320/24의 개수·유일 조합·통과 필드와 링크 및 repository-security/control-byte/whitespace 검증 통과. 전체 목표 미완료/남은28관리 경로와 backend/금융 게이트를 명시했다.

### Evidence-format CI correction
- 문서 PR3331의 classifier가 exit2/UNKNOWN으로 중단됐다. 실제 로컬 재현에서 신규 QA CSV2개가 기존 문서 허용 형식에 없음을 확인했다. 정책/테스트를 완화하지 않고 같은320/24개 증거를 이미 허용된 docs/qa/*.json 형식으로 보존했다. CSV 원본은 호스트 QA/기존 commit에 남는다. 운영 source/설정은 바꾸지 않았다.


## 후속 조회 화면 — 전달 로그
### 작업 전
- 8경로 운영 반영은 main e2fb487a1a78이며 증거 문서 PR3331은 main fb38940c5529에 일반 병합했다. 문서 분류의 CSV 실패는 같은 내용을 승인된 JSON 형식으로 바꾸어 해결했으며 분류기는 변경하지 않았다. 문서 CI의 runtime 검사는 DOCS_ONLY라 skip이며 새 runtime 통과로 주장하지 않는다.
- 실제 `/admin/logs/delivery`는 조회 불가. 실제 인증 API는30행과 `status`필드를 반환하고 기존 UI는 `delivery_status`만 요구한다. 관찰30행 status는 모두 null이고2행에는 완료 시각만 있다. 성공으로 추정하지 않고 미확인으로 표시할 후속 공통 셸 화면을 구현한다.
- `/account`·`/support`·`/chat`403은 upstream 직접 요청200/edge403으로 경계를 좁혔다. scanner-shield의 숨김파일 regex가 일반 경로도 매칭할 가능성이 있으나 광범위 해제는 기존 비인증 HTML 노출 검증 전 실행하지 않는다. 원인 재현/인증 검토는 OPEN이다.
### 진행 중
- [ ] 전달 로그 실제 DTO·미확인 상태·권한·실패 RED→GREEN
- [ ] Nov18 공통 셸·5언어·반응형·리뷰/전체 테스트
- [ ] exact-main Test→단일 경로 운영 전환 및 기록
### 종료 상태
후속 전달 화면은 아직 미구현·미배포다. 기존8경로 운영은 유지한다.

후속 소스 검증: 실제 HTTP7개 RED(미허용 native 경로403)→37개 focused GREEN, 전체 Spring587개 실패/오류/skip0 및 bootJar 통과. 로컬 default test가 제외하는 PostgreSQL messaging은 별도 CI gate로 남긴다. native Node 전체78개 통과. 번역 JSON/JS 동일성 검사가 키 순서 차이로 한 차례 실패하여 같은 새 키를 같은 순서로 정렬하고 재실행했다. 분류/검사를 완화하지 않았다. 쿼리 lang만으로 언어가 정해진다는 QA 가정을 기존 cookie 기반 UiLocale 계약에 맞게 수정했다. 후속 화면은 아직 Test/운영 미배포다.

독립 후속 소스 리뷰: 24:00 시각이 Instant.parse에서 익일 자정으로 정규화되는 결함을 찾았다. 생성·완료 시각 각각503기대/실제200을 RED로 확인하고 시·분·초 범위를 엄격히 제한했다. 새 화면의 aria 언어 불일치도 사용자5언어 요구에 따라 함께 수정했다. 두 회귀 테스트 RED→전체 Spring589개 실패/오류/skip0·bootJar GREEN. 기본 task에서 제외한 PostgreSQL messaging은 CI 별도 gate다. 미배포 후보에서 수정했으며 기존 운영 취약점으로 소급하지 않는다.
배포 준비는 단일 전달 경로만 후속 세대로 전환하고 기존8개 경로는 수용된 e2fb 세대를 유지한다. 보호된 Test4816/운영4818, 두 GET만 허용하는4817gateway 후보를 별도 root0700에 만들었고 실제 설치/전환은 아직 없다. 전체 Nginx 구문과 격리 라우팅114건 통과. gateway 테스트는 과거7GET 기대를 그대로 재사용해 처음 실패했으며, 두 GET 허용/나머지 기존6GET 거부라는 더 좁은 계획에 맞게 수정해20건 통과했다. gateway를 넓혀 테스트를 맞추지 않았다.

## 전달 로그 배포 준비 체크포인트
- 소스 PR3332는 freeze f202aab04cb3의 classify/policy/spring-web-check/runtime-check4job 모두SUCCESS 및 required3check PASS 후 일반 병합했다. main7d58568e30413e838315a2d5322abfd5366b074a의 app source diff는 비어 있다.
- 정확한 main CI44864420278의 native artifact를 검증했다. JAR SHA256 be5e888e4c49915da419819154e520b0fb8de5dee6c243854b60b945b884fd42, packaged source/main manifest 일치. main 전체 runtime CI는 이 체크포인트에서 아직 진행 중이며 운영 승격 승인이 아니다.
- 별도 root 불변 Test4816/운영4818 unit만 선행 배치했다. active/enabled, 실제 cwd·release/source manifest·JAR sha·open inode·시작 시각·소스4817·포트 소유 PID·HTTP version 이후 MainPID 재확인을 통과했다. 아직 nginx live 변경이나 원천 gateway 설치는 없다.
- 독립 운영 스크립트 리뷰의3개 Important(새 include 파일 검출, 동일 실행 세대 증거, JAR 기반 asset hash)를 수정했다. 보호 회귀8개 RED→GREEN에는 실제 격리 Nginx include 추가 시 변경 전 거부, 재시작/PID·listener·cwd·manifest 불일치 거부 및 packaged source mismatch가 포함된다. JAR에서 번역 digest를 읽고 실제 제공 bytes도 비교한다.
- 최종 main 후보 전체 Nginx syntax 및 격리 routing114/gateway20건 실패0. 새gateway는 me/outbox 두 GET만 허용하고 다른 기존 관리자 GET도 거부한다. 이전8경로·public·API·보안 차단과 과거 asset 세대는 유지한다.
- [추가 실제 결함](../qa/2026-11-21-nov18-unification-open-defects.ko.md): API 관제의 미측정 안내/고정 정상 수치 모순, 숨김파일 regex의 일반경로403을 별도 격리 재현했다. 광범위 규칙 해제나 전체 backend 승격을 하지 않았다.
- 다음: exact-main CI 전부 성공→보호 Test 로그인 QA→단일 전달 경로 운영→증거/문서 종료. 현재는 기존8경로만 운영 수용이며 전달 화면은 미전환이다.
