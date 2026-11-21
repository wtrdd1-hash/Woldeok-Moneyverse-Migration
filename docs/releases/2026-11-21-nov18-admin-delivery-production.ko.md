# Nov18 관리자 전달 로그 운영 전환

2026-11-21 **13:22:14 KST** `/admin/logs/delivery`를 실제 Nov18 공통 셸로 전환했다. 기존8개 관리자 조회 경로는 e2fb 세대를 그대로 유지한다. **조사한36개 관리자 경로 중9개 조회 UI가 공통 셸이며, 나머지27개와 전체 웹/변경 기능은 OPEN이다.**

## 실제 수정
기존 화면은 `delivery_status`만 요구했지만 실제 인증 API는 `status`를 반환하여30개 실제 기록을 전부 조회 불가로 처리했다. 새 화면은 원천 계약을 검증해 최근 최대30건을 제공한다. 관찰한30행의 상태가 모두 null이므로 미확인30, 명시적 전달 완료0으로 표시한다.2행의 완료 시각만으로 성공을 추정하지 않는다. 이는 Discord 수신 확인·발송 성공·전체 전달률 검증이 아니다. 해당 원천은 전체 outbox 표본으로 모든 행이 Discord 발송 대상이라는 보증도 없다.

중복 UUID·상한 초과·잘못된 시각/시도 횟수·알 수 없는 상태 문자열·누락 상태·alias 충돌은503으로 표시하고 부분 집계를 보여주지 않는다. null 상태만 명시적으로 미확인이다. 명시적 delivered에는 완료 시각이 있어야 하며, 명시적 미완료 상태와 완료 시각이 모순되면 거부한다. 검증된 빈 배열만0건이다.

기존 공통 헤더·사이드바·모바일 drawer/하단 탭·favicon IMG·표·언어·문의 패널을 사용한다. 새로고침, 시스템 로그/감사 로그/Discord 링크를 유지한다. 기존 Discord 설정·발송 테스트를 조회 표로 대체하거나 메시지를 보내지 않았다. 기존 단일 문의 버튼은 지원 안내 패널이며 실제 문의 전송 완료를 뜻하지 않는다.

## 소스와 검증
- [PR3332](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3332) freeze f202aab04cb33d741d2f587b1dd3c07d982f581e. [PR CI44863680840](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/actions/runs/44863680840)4job SUCCESS/required3check PASS 후 일반 병합했다.
- 실제 app main **7d58568e30413e838315a2d5322abfd5366b074a**. freeze→main app source diff가 비어 있다. [정확한 main CI44864420278](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/actions/runs/44864420278) classify/policy/spring-web-check/runtime-check 전부 SUCCESS 후 Test 연결 및 운영 전환했다.
- main JAR SHA256 `be5e888e4c49915da419819154e520b0fb8de5dee6c243854b60b945b884fd42`. 공식 source-manifest/packaged build-info 일치. 새 번역 JS digest는 JAR 내부 bytes에서 산출하고 실제 제공 bytes도 비교했다. 작업 트리 HEAD나 환경 ID만으로 실행 소스를 판정하지 않는다.
- 새7개 실제 HTTP 회귀 RED→구현, 독립 리뷰의24:00 정규화·접근성 언어 결함2개 RED→수정. 최종 전체 Spring589개 실패/오류/skip0·bootJar, native Node82개 통과. 로컬 default test의 제외 PostgreSQL messaging은 포함해 계산하지 않으며 별도 CI의 disposable PostgreSQL/migration/ACL/messaging gate로 구분한다.
- 보안/제어문자/whitespace 검사 통과. 독립 소스 및 별도 운영 스크립트 리뷰. 운영 리뷰의 include inventory·안정된 PID/포트/manifest·packaged/served asset 증거를 강화하고8개 보호 회귀 RED→GREEN.

## 실제 브라우저
- 동일 기존 관리자 세션의 보호 Test **5언어×8너비 =40조합**, source main·30행·공통 배경·IMG2개 로드·문의1개·가로 넘침/조회 오류0.
-720×450 CSS 확대 대응5조합. 물리 브라우저200% 확대나 실기기 검사는 아니다.
-5언어를 실제 dropdown으로 바꾸어 보이는 제목과 navigation/table의 aria-label이 함께 바뀜을 확인했다.
- 실제 새로고침 링크, 시스템 로그 링크/뒤로 이동, 모바일 메뉴 열기/Escape/원 버튼 포커스 복귀, 문의 패널 열기/Escape/포커스 복귀, 표 ArrowRight 가로 스크롤40px와1440×600의 마지막 사이드바 링크 Tab 접근을 확인했다.
- Test4816을 중지하고 선택 cookie가 남아 있는 상태에서 운영5언어×1440/390/320 **15조합**과 main version 정상. 이후 Test를 복원했다.
- 기존8개 경로를 전/후 각각 PC1440/모바일390 **16배치씩** 재확인해 오류/가로 넘침0. 기존8개의 이전320조합 수용과 이번 회귀 관찰을 중복해서 전 사이트 통과 건수로 만들지 않는다.
- 캡처/JSON에는 회원ID·개별잔액·원시로그·세션을 담지 않았다. 전체 페이지 캡처는 맨 위로 이동해 sticky 사이드바/키보드 포커스 상태에 따른 촬영 오차를 피했다.

[40개 Test 케이스](../qa/2026-11-21-nov18-delivery-test-cases.json), [15개 운영 케이스](../qa/2026-11-21-nov18-delivery-production-cases.json), [요약](../qa/2026-11-21-nov18-delivery-acceptance.json).

## 실행·전환·유지
| 구성 | 현재 실행 |
|---|---|
| 전달 Test | moneyverse-native-admin-delivery-test-v20261121.service /4816 |
| 전달 운영 | moneyverse-native-admin-delivery-prod-v20261121.service /4818 |
| 전달 원천 gateway |4817; me/outbox 두 GET/HEAD만4550으로 전달 |
| 기존8관리자 | 운영4814/Test4812/gateway4813; e2fb 소스 유지 |
| 기존 공개 |4792;93a3 소스 유지 |

새 불변 release root는 `/srv/moneyverse-data/releases/{test,prod}-native-admin-delivery-v2026.11.21.2-7d58568e3041`이다. 별도 database-free/stateless unit이며 DB·세션 생성·봇·스케줄러·금융 변경은 import하지 않는다. 실제 cwd·release/source manifest·JAR sha/open inode·생성 이후 시작·source origin·port 소유 PID와 HTTP 조회 뒤 MainPID 재확인을 통과했다. 두 unit은 enabled/active이고13:25관찰 종료까지 cutover 이후 error-priority journal0건이다. 지속 가동 보증은 아니다.

Test13:16:35, 운영13:22:14. full Nginx syntax와 실제 격리 routing114/gateway20건 통과. gateway는 Cookie/고정 Host·Accept·scheme만 전달하며 actor/internal/bearer/본문/redirect를 신원으로 사용하지 않는다. guest/위조401, 다른 경로/변경 method403. admin edge와 renderer가 모두 기존 역할 권위를 검증한다.

주 site/root nginx/기존6개 exact read 경로는 byte-identical이다. auth snippet의 전달 HTML/version/보호 preview와 새 i18n digest만 전환했다. 현재 주요 해시:
- site `c4a19445ab0f1a60dbec3094eebeac82215310ce861074249b79468c76cb6aa0`(불변).
- admin snippet `e133615fd1219f3547dbbeb4d93b3007ca3e6ae403e0dbee8a06698406b48912`.
- assets snippet `b5a8d7fb7fda3c8c1db5aca0406b0cb7635eb21a863f66e5e7804db3e5bac19d`.
- gateway `477eaa709cba9ec26b485c39530358150354214711e428dc7faba20adc826add`.

root0700 `/srv/moneyverse-data/tasks/nov18-admin-delivery-20261121-7d58568e3041`에 script freeze/CI/main manifest/전후 config/phase-bound Test·운영 수용 영수증을 보존한다. 모든 기존 task lock을 비차단 획득하고 실제 include 파일 목록까지 포함해 hash를 교체 전·각 교체/역전환 전에 재확인한다. 동시 변경 발견 시 소유 파일을 되돌리기 전에 중단한다. 자동 실패 역전환 코드를 검토했으며 **성공 이후 수동 live rollback 실행은 하지 않았다**. 비협조 writer의 짧은 read/replace race까지 없앤다는 뜻은 아니다. 오래된 전체 config를 덮어쓰면 안 된다.

이전4808/4782/4792/4814와 기존 gateway는 다른 화면·자산·역전환 의존성이 있어 중지/삭제하지 않는다. Test 선택 cookie는 비자격 UI selector이고 운영 전달 라우팅은 이를 읽지 않는다. 이전 API·금융·가입·actuator·외부Test403 기준선을 유지했다.

## 남은 문제
[현재/역사 경로 원장](../qa/2026-11-21-nov18-frontend-route-ledger.ko.md)과 [실제 추가 결함](../qa/2026-11-21-nov18-unification-open-defects.ko.md)을 따른다. API 관제의 미측정 안내/고정 정상 지표 모순, 계정·문의·채팅403, 에러 로그, 전체 backend source 승격 및 원천 outbox null상태/실제 수신 검증은 OPEN이다. 나머지27관리자·전체 회원/도구/정책/변경 기능·모국어/전체 접근성·실기기 QA도 완료가 아니다.

기존 Next QA5실패·금융·출처·수동346·잔액 projection·백업/복구/출시 게이트를 면제하지 않았다. 운영 SQL/grant/계정/세션/원장/잔액 보정·삭제, 실제 메시지 전송 및 전체 backend 실행 파일 승격은 수행하지 않았다.
