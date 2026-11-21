# 관리자 대시보드·시스템 로그 운영 전환 — 2026-11-21

## 관찰된 현재 상태

2026-11-21 10:48:33 KST, 운영 기본 `/admin`, `/admin/`, `/admin/logs/system`을 11월 18일 네이비·보라 PC 기본/반응형 공통 셸로 전환했다. 사용자가 미리 로그인한 실제 관리자 세션을 유지해 Test와 운영에서 확인했다. 기존 관리자 35개 도구의 변경 작업 전체가 완료된 것은 아니다.

- 소스 PR: [#3328](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3328).
- 실행 소스: `98b5dec0283f77e4e0c488c4d8bfa23bf8c52de1`.
- 정확한 main CI: [44846998303](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/actions/runs/44846998303), classify/policy/runtime-check/spring-web-check 모두 SUCCESS. lint/typecheck/build, 임시 PostgreSQL migration/ACL/native messaging 및 test 게이트 포함.
- main JAR SHA256: `ff8e5cb97e6eed01c16f44b9ab1f6b52b140028cfee1cb42d3aa87aa265316c9`.
- PR artifact와 main artifact의 애플리케이션 class/resource 1,839개 동일; build-info만 별도. 정확한 main을 Test/운영 양쪽에 설치했다. 문서 커밋이 나중에 main을 전진시켜도 실행 소스를 바꾸어 표시하지 않는다.
- 전체 Spring 570건 실패/오류/skip 0, native Node 81건 통과. 기본 Spring task에서 제외되는 postgres-messaging은 로컬 570건에 포함시키지 않고 별도 main CI 성공으로 구분한다.

## 실행 범위와 인증

실행 모드 `admin-presentation`은 명시적으로 import한 조회 전용 구성이다. DB/JPA/세션 생성/금융 쓰기/스케줄러/봇은 실행하지 않는다. 기존 관리자 쿠키로 실제 역할 API가 알려진 관리자 역할을 반환해야 한다. edge와 프로세스 모두 권한 확인을 수행한다. actor/internal/bearer 인증정보를 전달하지 않는다.

| 구성 | 현재 관찰 |
|---|---|
| Test | `moneyverse-native-admin-read-test-v20261121.service`, loopback 4806 |
| 운영 | `moneyverse-native-admin-read-prod-v20261121.service`, loopback 4808 |
| 원천 GET 게이트웨이 | loopback 4807, 관리자 me/users/stocks/controls/logs 5경로만 허용 |
| 원천 권위 | 기존 me/controls/logs 4550, users/stocks 4632; 기존 실제 API 라우팅과 동일 |
| 정적 공통 자산 | 기존 public-presentation 4792, 소스93a3 유지 |
| 운영 세대 | `/srv/moneyverse-data/releases/prod-native-admin-read-v2026.11.21.1-98b5dec0283f` |
| Test 세대 | `/srv/moneyverse-data/releases/test-native-admin-read-v2026.11.21.1-98b5dec0283f` |

두 관리자 unit은 enabled/active, Restart=on-failure, DynamicUser, loopback만 수신한다. 실제 MainPID의 열린 JAR inode·SHA·작업 경로·artifact 이후 시작·소스4807·EnvironmentFile 부재·databaseRequired:false를 검증했다. 운영 재검증 과정에서 Test unit을 잠시 중지해도 기존 미리보기 선택 상태의 실제 관리자 브라우저가 운영 대시보드/버전98b를 정상 수신했고, 이후 Test를 복원했다. 운영은 Test selector나4806에 의존하지 않는다.

## 실제 브라우저 수용 검사

- 정확한 PR artifact의 fixture Chromium: 2화면×8너비×5언어 80배치와 확대 대응 CSS폭/deviceScaleFactor2 재배치20건, 실패0. 실제 물리 브라우저 줌 메뉴 검사가 아니다.
- 로그인한 실제 Test: 2화면×1440/1920/1024/768/390/320 =12배치, 가로 넘침 없음, 실제 favicon IMG 로드. 2화면×1440/390×5언어 =20건에서 언어/제목/배치 및 로그 미전송 입력 유지 확인.
- Test 메뉴 열기/닫기/Escape 포커스 복원, 도움말 열기/닫기, 도구 검색 0/35→보안6/35→초기35/35, 실제 로그 조회 버튼·필터·줄 수 확인.
- 로그인한 실제 운영: 2화면×1440/1024/390/320 =8배치, 가로 넘침/소스 오류 없음(정상 NGINX_ERROR 조회 기준), 두 로고 모두 로드. 한국어 PC·모바일 화면을 별도 캡처했다.
- 대시보드의23/10/7은 점검 순간의 원천 응답 행 수이며 전체 회원/시장 합계가 아니다. 실제 주가가 후속 조회에서 변하는 것을 확인했으며 canonical 정수 문자열을 유지한다.
- 실제 로그 조회 버튼으로 Test/운영 양쪽 6종을 모두 선택했다. NGINX_ERROR10줄, NGINX_ACCESS10줄, SPRING_BACKEND10줄, DISCORD_BOT5줄, FRONTEND_ERRORS3줄을 관찰했다. 이 숫자는 점검 순간이며 고정 값이 아니다.
- 운영에서 FRONTEND에 불일치 필터를 실제 입력해도 unavailable:true/rowCount:null을 유지했다. 새 UI가 필터 전 원천을 검증하므로 원천 장애를 EMPTY로 감추지 않았다.
- **FRONTEND는 조회 불가**: 기존 백엔드 enum이 이미 제거된 `moneyverse-release-v1546-frontend` journal을 참조하며 systemctl LoadState=not-found/ActiveState=inactive. 실패를 빈 목록/0/성공으로 표시하지 않는다. 아래 미해결 항목으로 유지한다.
- 원시 로그/회원 식별자/개별 잔액/세션 쿠키는 증거에 저장하지 않았다. 수치·배치·메타데이터만 [검사 요약](../qa/2026-11-21-admin-ui-release-evidence.json)에 남겼다.

## 원인 수정과 독립 리뷰

1. 실제 DTO는 snake_case인데 초기 fixture가 camelCase였던 계약 불일치, 비정상 회원 객체가 정상 통계로 집계되는 문제, 필터가 원천 읽기 오류를 숨기는 문제를 각각 논리 RED→GREEN으로 수정했다. 실제 DTO 직렬화 fixture를 사용한다.
2. PC 높이600px에서 마지막 사이드바 메뉴 접근 불가를 재현하고 세로 스크롤로 수정했다. 600/768/900px 재검증.
3. 실제 로그인 Test에서 favicon과 기본 CSS가403이었다. 기존 공개4792가 보유한 정확한 6자산(site.css/favicon.ico/money.js/app.js/public.css/public.js)의 승인된 digest만 연결했다. GET/HEAD200, 바이트/MIME 일치, 미지/미버전403, POST405. 오류에 immutable 캐시를 적용하던 제안은 18RED 후 수정, 격리 Nginx30건 GREEN.
4. Production이 Test 선택 쿠키를 따르던 제안은 실제 격리 Nginx RED 후 수정했다. 라우팅42건·원천 게이트웨이29건 GREEN.
5. 독립 소스 리뷰 Important3건과 라우팅/캐시 리뷰를 수정했다. 최종 운영 스크립트 리뷰에서 CAS 검사와 실제 교체 사이 간격을 지적받아 모든 preflight 뒤 및 각 교체 직전에 전체 config hash와 백업 바이트를 다시 확인하도록 보강했다. 기존 moneyverse task lock을 정렬·비차단 획득해 동시 작업과 조정했다. 협조하지 않는 외부 writer에 대한 파일 read/replace의 짧은 race는 남는다.

## 운영 변경과 롤백

전체 Nginx assembly의 syntax와 loopback health/version/실제 JAR를 확인한 뒤 관련 두 snippet만 비교 후 교체하고 graceful reload했다. 기존 root/site/gateway hash는 유지했다. 익명 관리자 거부, 위조 actor/internal 헤더401, 게이트웨이 mutation403, Test 외부403, 공개 frontend 소스93a3 및 signup/actuator/기존 API 응답 기준선이 동일하다. trusted operator actuator/env404는 기존 기준선이며 외부 차단과 혼동하지 않는다.

| 파일 | 운영 설치 SHA256 |
|---|---|
| 관리자 HTML·버전 snippet | `88e092f3790b5827ac817476d8dcd911e1052573d4be7e53f06c4da74509bd13` |
| 자산 snippet | `444aa91211f5e4be7d4d6bfa55019f1d9b1522f4b9f91865478093a7068839bf` |
| 조회 gateway | `b7fa718a365bc4198e9de7278f556bb8c4d9f190221a9348ebb301ebbd16295d` |
| 변하지 않은 site | `45290d6ad96978fcfbbf814f596047331b5c74e146df0d4cb4a40de2e5fdd6b5` |
| 변하지 않은 nginx.conf | `c66fbe205bf46b5d125502e35605938ed37feef6e2b24325b1c088665caaf477` |

운영 준비/적용/롤백 스크립트와 root0700 영수증은 호스트 task 디렉터리 `/srv/moneyverse-data/tasks/admin-read-ui-20261121-98b5dec0283f`에 보존한다. 역전환은 현재 해시가 여전히 이번 설치 해시인지 먼저 확인하고, asset repair가 포함된 직전 정상 Test routing(ece8…/c3c3…)으로 관련 snippet만 되돌린다. 오래된 전체 Nginx config를 덮어쓰지 않는다. 최초 Test 시도의 reload listener 준비 전 probe 실패는 소유 변경만 롤백했고, bounded readiness 후 재시도 성공했다.

기존 공개4792 세대 `prod-native-favicon-v2026.11.21.1-93a3c8dbe8c0`의 application.jar SHA `af0913b0546716871ad57e3fb49b893a4cb662b4a5078882db8707158b6b6cc0`와 기존4782는 자산/롤백 의존성으로 유지한다. 향후4792 교체 시 6개 exact 자산의 digest를 모두 검증하고 경로를 함께 교체해야 한다. 포트만 새 프로세스로 바꾸거나 기존 세대를 수정하면 안 된다.

## 미해결·수용 범위

- FRONTEND journal 원천의 제거된 서비스명: **OPEN**. 활성 frontend는 여러 renderer로 나뉘므로 실제 소유 unit을 명확히 지정하는 후속 백엔드 변경/독립 검증이 필요하다. 제거된 unit을 가짜로 만들거나 임의 journal을 대신 보여주지 않는다.
- SystemLogController의 비어 있지 않은 internal 헤더만으로 controller 인증을 생략하던 분기 제거와 SystemLogService 실패 metadata 보존은 **소스에 반영**됐다. 상위 기존 경계는 실제 위조 요청401을 반환한다. 기존 전체 백엔드 runtime을 이번에 승격한 것이 아니며, 이 방어 수정의 전체 백엔드 운영 반영은 **OPEN**이다.
- 다른 관리자 도구의 공통 셸/조회·변경·정상/실패·권한 수용은 [기능 원장](../qa/2026-11-21-admin-functional-ledger.ko.md)의 OPEN을 유지한다.
- 금액 천 단위 시각 서식, Auto 선택 문구/일부 접근성 레이블의 전언어 정밀 교정과 물리 브라우저 확대는 후속 QA 대상이다. 이번 언어 배치 검사를 모든 문구 교정 완료로 확대하지 않는다.
- 기존 금융/출처/수동346/잔액 projection 및 별도 Next QA5실패를 해결·면제하지 않았다. SQL/grant/원장/잔액/계정/세션 mutation은 수행하지 않았다. 이번 완료는 조회 화면 1차 운영 전환이다.
