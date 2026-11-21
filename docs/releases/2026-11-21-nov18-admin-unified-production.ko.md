# Nov18 관리자 공통 프론트엔드 8경로 운영 전환

2026-11-21 12:02:08 KST 운영 기본 경로를 전환했다. **이번 수용은 관리자 조회 UI 8경로이며 전체 웹·모든 관리자 기능 통일 완료가 아니다.** 사용자 지시에 따른 전체 전환 작업은 남아 있다.

## 현재 수용 범위

| 경로 | 유지한 실제 기능 |
|---|---|
| `/admin` (`/admin/` 별칭 포함) | 원천 회원·시장·스위치 행 수와 주가, 기존35도구 검색/이동 |
| `/admin/users` | 실제 회원 조회,1–200개 상한, 조회 결과 내 이름/ID/상태 검색 |
| `/admin/market` | 실제 종목·가격·거래 상태 조회 |
| `/admin/controls` | 실제 기능 스위치·상태·사유 조회 |
| `/admin/enterprises` | 기존 화면과 같은 사업장 카탈로그·구매 비용·일일 추정값 조회 |
| `/admin/economy` | 기존 approver 권한을 추가 확인한 정합성 스냅샷 조회 |
| `/admin/economy/scenario-lab` | 같은 최신 스냅샷 조회; 시뮬레이션 실행 기능은 아님 |
| `/admin/logs/system` | 실제 로그 원천/줄 수/필터 조회 및 실패 상태 구분 |

헤더·사이드바·모바일 메뉴/하단 탭·카드·표·폼·언어 선택·문의 버튼이 같은 Spring MVC/Thymeleaf 셸을 사용한다. 실제 favicon을 사이드바/모바일 drawer의 IMG로 사용한다. API 필드·원천 이름·사유는 원천 데이터이며 허위 번역이나 임의 수치로 대체하지 않는다. 시장/사업장/정합성 금액은 canonical 정수 문자열을 유지하고 문자열로 천 단위를 구분한다.

회원 검색은 조회된 최대N개에서만 수행한다. 점검 순간23회원/10종목/7스위치/9사업장 유형은 실제 응답 행 수이며 전체 합계 또는 고정 정보가 아니다. 사업장 카탈로그 조회를 전체 공기업 지배구조 기능 완료로, 정합성의 원천 보고를 금융 출시 승인으로 확대하지 않는다.

## 소스·CI·실행 신원

- 소스 [PR3330](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3330), freeze `c2a2bcbdf13ad51a1f05b9d20a5161648a7de76c`.
- 실행 main `e2fb487a1a7814e74abac1097814881801c4dd13`. 원본 PR과 main의 애플리케이션 source diff가 비어 있음을 확인했다.
- PR 정본 [CI44856831244](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/actions/runs/44856831244) 4job SUCCESS 및 required3check PASS 후 일반 병합. 사용하지 않는 별도 TestCandidate 컨테이너 image build는 당시 진행 중이었으며 native artifact 수용과 혼동하지 않았다.
- 정확한 main [CI44857905769](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/actions/runs/44857905769) classify/policy/spring-web-check/runtime-check **모두 SUCCESS** 후 운영 전환.
- main native JAR SHA256 `5aced41aebe87e325792bcab55977743edec4e1d811fdfc8f90e91d8decce8c5`; 공식 CI source-manifest와 packaged build-info의 main source 일치.
- 로컬 전체 Spring580건 실패/오류/skip0 및 bootJar, native Node82건 통과. 기본 test task의 제외 PostgreSQL messaging은580건에 포함하지 않으며 별도 CI PostgreSQL/migration/ACL/messaging 검증으로 구분한다.
- 정적 보안/제어문자/whitespace 통과. 독립 전체 소스 리뷰 및 변경된 배포 스크립트·라우팅의 별도 리뷰를 완료했다.

| 구성 | 실제 실행 |
|---|---|
| 보호된 동일 origin Test | `moneyverse-native-admin-unified-test-v20261121.service`,127.0.0.1:4812 |
| 운영 | `moneyverse-native-admin-unified-prod-v20261121.service`,127.0.0.1:4814 |
| 조회 전용 원천 gateway |127.0.0.1:4813 |
| 불변 세대 | `/srv/moneyverse-data/releases/{test,prod}-native-admin-unified-v2026.11.21.1-e2fb487a1a78` |

DB·JDBC·JPA·세션 생성·스케줄러·봇·금융 쓰기 컴포넌트를 import하지 않는다. 두 unit은 enabled/active, DynamicUser, Restart=on-failure 및 loopback 제한이다. 실제 MainPID/open JAR inode·SHA·artifact/manifest 이후 시작·소스4813·고정 packaged source를 확인했다. 운영 전환 이후 두 unit의 error-priority journal은0건(관찰 종료 시점)이다.

## 인증·원천·권한

실제 세션 쿠키를 edge와 renderer에서 기존 관리자 역할 원천에 검증한다. 위조 actor/internal/bearer 헤더를 원천 신원으로 전달하지 않는다. host-cookie 우선/중복 거부·redirect 거부·고정 IPv4 loopback·2MiB 제한을 유지한다. 경제 두 경로는 기존 HTML처럼 **정확한 approver 역할**을 추가 요구한다. superadmin만 있다고 대신 승인하지 않는다.

gateway는 GET/HEAD7경로만 허용한다: me/controls/logs/reconciliation은4550, users/stocks/business catalog는 실제 공개 API 권위4632. 카탈로그는 기존 공개 원천이므로 guest200이 정상이고, 나머지 관리자 원천은 guest/위조401이다. POST/PATCH/DELETE 및 allowlist 밖 경로는403이다. 캐시·access log를 끄고 다른 요청 헤더/본문을 전달하지 않는다.

독립 리뷰에서 미배포 후보의 raw URI와 Spring 매핑 차이로 인코딩된 경제 URL이 추가 권한 검사를 건너뛰는 문제를 실제 HTTP로 재현했다. trusted matched mapping의 정확한 allowlist와 명시적인 두 금융 case로 수정했다. financial default 분기는 제거했다. RED→focused30GREEN→full580GREEN 및 리뷰 확인. 기존 운영에서 이 우회가 입증됐다고 소급하지 않는다.

## 실제 브라우저 검증

- 사용자 기존 로그인으로 보호된 Test8경로×8너비(1440/1920/1024/768/430/390/360/320)×5언어(en/ko/ja/zh/vi) = **320조합**, 가로 넘침/조회 오류/누락 IMG/중복 문의 버튼0.
- 720×450 CSS viewport의 확대 대응 재배치40조합 통과. **물리 브라우저의200% 줌 조작 또는 실기기 검사는 아님**.
- 실제 회원 검색 버튼/상한50/빈 결과/상한1의 원천1행과 화면1행,5언어 중 미전송 검색 유지 및 실제 GET 제출 언어 일치 확인.
- 모바일 메뉴 열기·Escape 닫기·원래 버튼으로 포커스 복귀, 문의 패널 열기/닫기,1440×600에서 마지막 사이드바 링크 Tab 포커스/스크롤 접근 확인.
- 사이드바/도구 링크를 실제 클릭해 추가7화면으로 이동. 홈페이지 링크는 브랜드/내비 두 개여서 최초 QA locator가 모호했던 것은 더 구체적인 내비 selector로 해결했으며 제품 결함으로 세지 않았다.
- 홈은 최초 guest 표시 이후 프로필 요소가 나타날 때까지 기다리자 같은 세션의 프로필/로그아웃/관리자 메뉴가 정상 제공됐다. 지속적인 로그인 오류로 판정하지 않는다. 직접 API 탐색의 same_origin_required는 same-origin fetch 실패의 증거가 아니다. 프로필 링크 실제 클릭의 계정403은 별도 재현했다. 관리자 `/admin/` 별칭도 실제 정상 화면을 확인했다.
- 운영 전환 후8경로×1440/390/320 = **24배치**, 회원5언어/검색 제출 재확인. Test4812를 잠시 중지한 상태에서도 기존 선택 cookie가 남아 있는 동일 세션으로 운영8경로·version main을 정상 수신했다. Test는 복원했다.
- 회원 화면 캡처는 QA 검색어의 실제 빈 결과를 사용해 회원ID·개별잔액을 노출하지 않았다. 원시 로그/세션/개인정보를 증거에 남기지 않았다.
- 일부 viewport-only 캡처가 도구의 화면 맞춤 축소로375×360에 잘리는 문제가 있어 최종 모바일 증거는 전체 페이지 캡처로 대체하고 실제 CSS width/font15px/내부 입력 폭을 별도로 확인했다. 이를 UI 결함 또는 실기기 증거로 혼동하지 않는다.

[320개 Test 케이스](../qa/2026-11-21-nov18-admin-test-cases.csv), [운영24개 케이스](../qa/2026-11-21-nov18-admin-production-cases.csv), [수용 요약](../qa/2026-11-21-nov18-admin-acceptance.json).

## 변경·역전환

Test는 보호된 entry에서900초짜리 비자격 UI 선택 cookie로만 새8경로를 선택하고 기본 운영을 유지했다. 정확한 main native artifact를 먼저 Test에 배치해 브라우저 검증했으며, 모든 main CI 완료와 같은 source/JAR/phase의 Test 영수증 확인 후에만 운영 전환했다. Production은 선택 cookie를 읽지 않는다.

실제 운영 server는 server_name으로 이름 붙인 블록이 아니라 default_server80이다. 해당 블록의6개 exact 경로만 교체했고, loopback4400·다른 host/Test server와 기존 APIs/금융/가입/actuator holds를 보존했다. 기존 public frontend 소스93a3은 그대로다. 전체 assembly syntax와 격리 실제 Nginx 라우팅116건/gateway39건을 통과했다. 실제 guest/status·위조·method·Test 외부403 및 공개 버전 전/후 기준선도 같다.

| 운영 설치 | SHA256 |
|---|---|
| site | `c4a19445ab0f1a60dbec3094eebeac82215310ce861074249b79468c76cb6aa0` |
| admin snippet | `780120e7e6b4df7b2d18a12577b6f15ecc371af163143cce6a18ef1bc1071021` |
| assets snippet | `90ec7186f4bb26aa72bed0693fa334606fd16f2ef2a34339a2d4d29cfb61657d` |
| new source gateway | `476c0c07be8cd460da0835c466ca1f01b4bb46c8259cf752394bed64be616550` |

root0700의 `/srv/moneyverse-data/tasks/nov18-admin-unified-20261121-e2fb487a1a78`에 전체 후보·전/후 백업·영수증을 보존했다. 모든 기존 moneyverse task lock을 정렬/비차단 획득하고 preflight 이후·백업·각 파일 교체 직전에 전체 해시를 재확인했다. 역전환도 **모든 기대 해시가 일치하는지 먼저 확인한 뒤** 파일별 재확인·소유 파일만 복원한다. 소유 변경 전 거부는 reload하지 않는다. 비협조 writer의 짧은 read/replace race는 별도로 남는다.

직전 정상 Test routing 해시(site2636…/admin892f…/assets8e64…)가 역전환 대상이다. 오래된 전체 config를 덮어써서 동시 보안 변경을 지우면 안 된다. 기존4808은 이전 admin 자산 버전과 변하지 않은 admin CSS/live CSS/tools JS 원천이다. 공개4792/기존4782 및 old gateway4807도 자산·롤백 의존성으로 유지한다.

## 전체 목표의 미완료 항목

[전역 경로 원장](../qa/2026-11-21-nov18-frontend-route-ledger.ko.md)은 남은 범위를 그대로 OPEN으로 유지한다. 이번에 조사한36관리자 경로 중8개 조회 UI만 공통 셸이며, 나머지28개 관리 경로의 기존 Next/동작·권한·오류·언어 전환은 별도 작업이다.

- 실제 로그인 후 프로필 링크 클릭에서도 계정403. 문의/채팅403과 관리자 에러 로그 불러오기 실패. 다른 페이지의 계정 헤더는 별도 검증 대상이다.
- 전체 공기업 지배구조·시나리오 실행·스위치 변경 등 조회 UI 이상의 기능. 기존 기능을 읽기 전용 표로 몰래 대체하지 않았다.
- FRONTEND journal의 제거된 서비스명, 이전 SystemLog controller/metadata 방어 수정의 전체 backend runtime 반영.
- 다른 회원/금융/게임/커뮤니티/도구/정책 화면의 공통 셸 전환 및 전체 문구/접근성/실기기·물리 확대 QA.
- 이전 별도 Next QA5실패 기록(이번 수용 범위에서 해결·재수용하지 않음)과 금융·출처·수동346·잔액 projection·복구/출시 게이트. 해결·면제하지 않았다.

운영 DB에 직접 SQL/grant/원장/잔액/계정/세션 보정·삭제를 실행하거나 메시지를 전송하지 않았으며, 기존 전체 backend 실행 파일을 승격하지 않았다.
