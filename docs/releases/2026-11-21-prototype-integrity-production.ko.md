# 시안 프론트엔드 표시 무결성 복구 — Test/운영 기록

## 현재 상태
소스 main 통합 완료, exact-main CI와 격리 Test/운영 수용 진행 중이다. 아직 운영 적용 완료가 아니다. source PR[3338](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3338), application source `8ba9139b2fcd577253ee83a24040091be218d64b`, main CI[44890241945](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/actions/runs/44890241945).

## 수정 범위

- `/shop`, `/stocks`, `/quests`, `/board`, `/status`의 기존 정적 HTML과 저장소 directory alias5개를 수정했다. root5개의 CSS 닫힘 누락을 바로잡았다. alias는 이미 CSS가 닫혀 있었으며 동일한 데이터 표시 계약을 적용했다.
- 초기 샘플 잔액·변동률·활동 상태를 `—`로 바꾸고 합성 SVG 곡선을 제거했다. 실제 추이 조회 기능을 구현한 것은 아니다. 읽기 중·조회 불가·로그인 필요·API 응답 상태를 구분한다.
- canonical 정수 문자열 최대38자리를 직접 그룹화한다. 잘못된 숫자·안전하지 않은 Number·미인증·소스 실패를 금액0으로 대체하지 않는다. 시장 평균은 검증된 시가/현재가로 BigInt 유리수 계산·정확한 반올림을 사용한다. 시가가 없으면0%를 만들지 않는다.
- 실패한 재조회는 이전 수치를 지운다. 일반 지갑500은 확인된 회원 표시를 유지하고, 더 최신인 지갑 signedIn:false/401은 회원 표시를 지운다. 수동 언어 선택은 document locale을 기준으로 새 상태 문구를 바꾼다.

이 변경은5개 시안 화면의 표시 무결성 복구다. 상품 카탈로그·구매/영수증·종목/포트폴리오·매수/매도·퀘스트 보상·게시물/작성·실제 상태 추이의 전체 구현이 아니다. 기존 mobile 시안 메뉴 카드와 미구현 흐름도 OPEN이다. 관리자mobile 로고10개, 문의 간격/위젯·기존 테마·전 페이지 번역·차단79/동적33 등의 [전체 감사](../qa/2026-11-21-full-frontend-design-functionality-audit.ko.md)도 이 변경으로 종료하지 않는다.

## 소스 검증

초기170검사에서140실패를 직접 관찰한 뒤 GREEN. 독립 리뷰가 찾은 언어40실패, 최신 로그아웃20실패도 각각 RED→GREEN. 최종 native335/335와 Spring605/605,0실패/0error/0skip, bootJar SUCCESS. 이는 실행된 해당 suite의 결과이며 별도로 제외된 PostgreSQL messaging tag, 실제 금융/계정 변경, 전체 웹 QA를 성공으로 표시하지 않는다.

PR CI44889225161의 classify/policy/spring-web-check/runtime-check 네 job은 SUCCESS. main source는 별도 exact-main CI와 해당 CI artifact/source manifest·JAR 및 packaged HTML=Git source 증명을 통과해야 Test/운영에 사용한다.

## 운영 절차 및 롤백 준비

기존 원본이나 전체 release 디렉터리를 덮어쓰지 않고 task 전용 root 소유 `/var/lib/moneyverse-frontend-integrity-20261121` 아래에 source별 정적 bundle과0700 task stage를 준비한다. 새 API·DB·worker·세션 발급·경제 쓰기를 만들지 않는다. 기존 통합26화면 source e45와 DB/API authority를 새 source로 relabel하지 않는다.

정적5개만 별도 scope/source 응답 헤더와 private no-store/noindex로 묶는 제안이다. 보호된 `/frontend-ui-preview/prototype/{name}`는 기존 관리자 세션 guard를 재사용하고 GET/HEAD만 허용한다. Test 브라우저는 실제 해당 URI에서 확인하며 authenticated response header를 캡처한 것처럼 꾸미지 않는다. root 소유 routing hash·configured source header·artifact 파일 hash와 실제 DOM/URI를 연결해 기록한다. Test의 기존 외부403 경계는 유지한다.

운영은 public canonical5 alias만 바꾸며 legacy 내부4400·전체 API/회원/관리자 경로·source gateway는 유지한다. 전체 활성 Nginx inventory·파일 hash, 기존 release lock, remote main, 제안 bytes를 단계별 검사한다. 복구는 invalid config를 다시 파싱하지 않고 known hash와 디렉터리 항목을 확인한 뒤 task 소유 변경만 복원한다. 실제 reload가 없었던 실패는 불필요하게 reload하지 않는다.

별도 운영 제안 script SHA256 `23ad46cd9067bab917ca1c4e7d7a78cea9109161626df9021717008a276dc5d4`. 독립 리뷰 Important2를 고쳤고 invalid nginx 실패 주입 RED→GREEN을 포함한5개 안전성 검사는 독립 재실행에서도 PASS다. 아직 실제 Test/운영 수용 증거는 후속 기록에서 추가한다.
