# 시안 프론트엔드 표시 무결성 복구 — Test/운영 기록

## 현재 상태
**2026-11-21 운영 canonical5개 경로의 표시 무결성 복구 완료. 전체 기능/Nov18 전체 통일 완료가 아니다.** exact-main CI4job SUCCESS, 보호된 Test75조합과 운영10조합의 해당 범위를 수용했다. source PR[3338](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3338), application source `8ba9139b2fcd577253ee83a24040091be218d64b`, main CI[44890241945](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/actions/runs/44890241945).

## 수정 범위

- `/shop`, `/stocks`, `/quests`, `/board`, `/status`의 기존 정적 HTML과 저장소 directory alias5개를 수정했다. root5개의 CSS 닫힘 누락을 바로잡았다. alias는 이미 CSS가 닫혀 있었으며 동일한 데이터 표시 계약을 적용했다.
- 초기 샘플 잔액·변동률·활동 상태를 `—`로 바꾸고 합성 SVG 곡선을 제거했다. 실제 추이 조회 기능을 구현한 것은 아니다. 읽기 중·조회 불가·로그인 필요·API 응답 상태를 구분한다.
- canonical 정수 문자열 최대38자리를 직접 그룹화한다. 잘못된 숫자·안전하지 않은 Number·미인증·소스 실패를 금액0으로 대체하지 않는다. 시장 평균은 검증된 시가/현재가로 BigInt 유리수 계산·정확한 반올림을 사용한다. 시가가 없으면0%를 만들지 않는다.
- 실패한 재조회는 이전 수치를 지운다. 일반 지갑500은 확인된 회원 표시를 유지하고, 더 최신인 지갑 signedIn:false/401은 회원 표시를 지운다. 수동 언어 선택은 document locale을 기준으로 새 상태 문구를 바꾼다.

이 변경은5개 시안 화면의 표시 무결성 복구다. 상품 카탈로그·구매/영수증·종목/포트폴리오·매수/매도·퀘스트 보상·게시물/작성·실제 상태 추이의 전체 구현이 아니다. 기존 mobile 시안 메뉴 카드와 미구현 흐름도 OPEN이다. 관리자mobile 로고10개, 문의 간격/위젯·기존 테마·전 페이지 번역·차단79/동적33 등의 [전체 감사](../qa/2026-11-21-full-frontend-design-functionality-audit.ko.md)도 이 변경으로 종료하지 않는다.

## 소스 검증

초기170검사에서140실패를 직접 관찰한 뒤 GREEN. 독립 리뷰가 찾은 언어40실패, 최신 로그아웃20실패도 각각 RED→GREEN. 최종 native335/335와 Spring605/605,0실패/0error/0skip, bootJar SUCCESS. 이는 실행된 해당 suite의 결과이며 별도로 제외된 PostgreSQL messaging tag, 실제 금융/계정 변경, 전체 웹 QA를 성공으로 표시하지 않는다.

PR CI44889225161의 classify/policy/spring-web-check/runtime-check 네 job은 SUCCESS. main CI44890241945도 classify/policy/spring-web-check/runtime-check 네 job 모두 SUCCESS다. JAR SHA256 `7ba6312babb4aba0cba29fc1f67cf712008fe949d7886884aeef9c9d971d1bf9`,158,336,658byte. 이 CI artifact의 source manifest·packaged build info·JAR hash와 HTML10개=Git source bytes를 확인한 뒤 사용했다.

## 운영 절차 및 롤백 준비

기존 원본이나 전체 release 디렉터리를 덮어쓰지 않고 task 전용 root 소유 `/var/lib/moneyverse-frontend-integrity-20261121` 아래에 source별 정적 bundle과0700 task stage를 준비한다. 새 API·DB·worker·세션 발급·경제 쓰기를 만들지 않는다. 기존 통합26화면 source e45와 DB/API authority를 새 source로 relabel하지 않는다.

정적5개를 별도 scope/source 응답 헤더와 private no-store/noindex로 묶었다. 보호된 `/frontend-ui-preview/prototype/{name}`는 기존 관리자 세션 guard를 재사용하고 GET/HEAD만 허용한다. Test 브라우저는 실제 해당 URI에서 확인하며 authenticated response header를 캡처한 것처럼 꾸미지 않는다. root 소유 routing hash·configured source header·artifact 파일 hash와 실제 DOM/URI를 연결해 기록한다. Test의 기존 외부403 경계는 유지한다.

운영은 public canonical5 alias만 바꾸며 legacy 내부4400·전체 API/회원/관리자 경로·source gateway는 유지한다. 전체 활성 Nginx inventory·파일 hash, 기존 release lock, remote main, 제안 bytes를 단계별 검사한다. 복구는 invalid config를 다시 파싱하지 않고 known hash와 디렉터리 항목을 확인한 뒤 task 소유 변경만 복원한다. 실제 reload가 없었던 실패는 불필요하게 reload하지 않는다.

최종 운영 script SHA256 `033cfb492f433124f12b6b28292468a179b2e7cf658b5f6e7576290b33e35f1f`. 독립 리뷰 시점23ad46 버전 뒤에 응답 준비 조건1개를 보완했다. 독립 리뷰 Important2를 고쳤고 invalid nginx 실패 주입 RED→GREEN을 포함한5개 안전성 검사는 독립 재실행에서도 PASS다. 최종6개 운영 검사(기존5+새 generation 대기1)가 PASS다. 실제 수용은 아래 별도 브라우저/HTTP 증거다.


## 실제 Test / 운영 수용

- 보호된 Test:5경로×1440/390/320px×EN/KO/JA/ZH/VI=75조합. 실제 UI로 언어 메뉴를 선택했다. 전체75에서 wallet/market 읽기 available, 해당 금액/률 형식 정상, 새 상태 문구 언어 일치, 합성 curve 없음, document 가로 넘침0. PC는 hero flex/padding24px28px와 bento grid 복구. mobile은 기존 prototype 메뉴 stack을 유지하며 업무 기능 수용으로 세지 않았다.
- 운영:실제 canonical5×PC1440/mobile390=10조합, 한국어. 모두 해당 표시 계약 PASS, wallet/market available로 기존 로그인 세션의 조회 연속성 확인. 실제 계정명·잔액·API body를 증거에 저장하지 않았다. source-binding을 위해 Test는 root 보호된 활성 alias/configured source header·artifact 파일 hash와 실제 browser URI/DOM을 연결했으며 authenticated HTTP header를 캡처했다고 쓰지 않았다.
- 공개 HTTPS5경로에서 HTTP200, `X-MV-Frontend-Source=8ba9139b2fcd577253ee83a24040091be218d64b`, scope=prototype-integrity, private no-store, Cloudflare DYNAMIC. CSS와 실제 hydration script가 CI artifact와 일치했다. Cloudflare 추가 script로 전체 body hash가 달라질 수 있으므로 공용 edge 전체 byte equality를 주장하지 않는다. loopback의5파일 body hash는 artifact 파일과 같다.
- 보호 preview 비로그인 거부·위조 actor/bearer header 거부·POST405, canonical GET/HEAD/POST405, Test origin 외부403, 기존14개 공개/회원/관리자/API/차단 경로의 status/cache/location 경계가 전후 동일했다. 금융·원장·DB·세션 발급·worker·기존 native26 runtime은 교체하지 않았다.

[집계](../qa/2026-11-21-prototype-integrity-summary.json) / [Test75](../qa/2026-11-21-prototype-integrity-test-cases.json) / [운영10](../qa/2026-11-21-prototype-integrity-production-cases.json) / [public HTTPS proof](../qa/2026-11-21-prototype-integrity-public-proof.json) / [Test routing](../qa/2026-11-21-prototype-integrity-test-routing.json) / [운영 routing](../qa/2026-11-21-prototype-integrity-production-routing.json).

실제 운영의 개인정보 없는 chart crop. 합성 그래프를 지웠으며 아직 실제 추이 source가 없어 조회 불가로 표시한다. 이것을 실제 차트 기능 구현으로 해석하지 않는다.

![운영 카드 복구와 실제 추이 source 미연결 상태](../qa/2026-11-21-prototype-integrity-production-chart.png)

## 실패·미수용 기록

첫 preview 적용 직후의 준비 검사에서 새 경로가403으로 보여 exact owned inverse로 복구했고 원래 config hash를 확인했다. 기존 admin guard 자체는401→302 정상임을 따로 확인했다. 새 worker 응답이 준비되는 조건을 최대10초 확인하도록 보완한 뒤 같은 고정 제안 재적용이 통과했다. 첫 실패/rollback은 root stage의 preview-attempt1-rollback.json에 보존한다. 준비 대기 중403을 성공으로 수용한 것은 아니다.

운영 첫 언어 버튼 자동화 두 번은 초기 조회 완료 전에 클릭한 뒤 모달이 생기지 않아 deadline으로 종료됐다. 조회 완료·새 AX 상태 확인 뒤에는 실제 메뉴 선택과 운영10조합이 통과했다. 제품 초기화/배치 시점과 자동화 타이밍 중 원인을 확정하지 않았으므로 **초기 진입 즉시 클릭 시나리오는 미수용**이다. 준비된 화면 검사 결과로 이 실패를 숨기지 않는다.

작업 중 기존 .worktrees 작업 폴더와 local branch가 외부 정리로 두 차례 사라졌다. 매번 원격 checkpoint로 복구했으며 원인을 특정하지 않았다. root 보호된 runtime/Test 자료와 Windows의 개인정보 없는 QA 증거는 보존됐다. 문서 마무리는 별도 MiniPC 외부 worktree를 사용해 shared main의 타 작업 수정에 손대지 않았다.

전체 구매·매매·보상·게시/상태 추이, mobile 메뉴 실기능, 관리자 로고/문의 위젯/다른 테마, 초기 즉시 클릭, 동적 fixture·전체 번역·접근성·실제 금융/메시지/삭제 변경은 OPEN이다. 현재 data available은 source 응답·표시 계약이며 원장/재무 전체 정확성을 새로 인증한 것이 아니다.

## 보존 및 롤백

root stage `/var/lib/moneyverse-frontend-integrity-20261121/tasks/8ba9139b2fcd`의 source artifact, manifest, before/after3config, preview/production receipts, 첫 rollback, browser acceptance, public proof를 보존한다. source별 root 소유 정적 bundle도 보존한다. 프로세스 추가·중지나 기존 artifact 삭제는 없다.

역변경 전에 전체 현행 inventory·known hash·디렉터리 항목과 task 소유 대상의 installed hash를 재확인하고 정확한 before bytes만 복원한다. 타 작업이나 후속 변경이 있으면 덮어쓰지 않는다. nginx syntax 확인 후 graceful reload와 현재 경계/5경로 상태 검사를 반복한다. 과거 전체 설정을 통째로 복원하거나 DB·잔액을 롤백하는 절차가 아니다.


## 동시 작업의 후속 main
운영 수용 이후 문서 통합 단계에서 PR3339의 v109 mobile/unread-count/icon 변경이 main37053df로 전진했다. 문서 branch는 이를 보존해 충돌 없이 통합했다. 본 기록의 runtime source8ba·CI44890241945·canonical5 수용은 그대로이며, v109 변경의 배포·기능·로고 수용을 대신하지 않는다.
