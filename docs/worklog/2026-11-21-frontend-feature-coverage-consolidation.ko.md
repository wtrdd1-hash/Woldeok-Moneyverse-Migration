# 전체 기능 지원 확인·사용자 프론트엔드 연결·실행 정리

## 작업 전
사용자는 관리자 모든 기능과 사용자 프론트엔드 지원 여부를 확인하고 구현한 프론트엔드로 연결하며 여러 실행을 정리하도록 지시했다. 이전 구현/운영 승격 승인과 반복 질문 금지 요청을 유지한다. miniPC 기존 clean isolated worktree에서 current main c5c3c9d7c2f73ab6a05c2ab067d94535f328b8b5를 fetch/확인하고 전용 branch fix/frontend-feature-coverage-consolidation-20261121을 만들었다. 공유 dirty main과 다른 작업 폴더는 수정하지 않는다.

현재 운영은 공개5경로93a3/관리자8경로e2fb/전달1경로7d로 나뉘고 이전4782/4808 자산 의존성이 남아 있다. 다수 old Test/preview도 실행되어 MemAvailable 약926MB. 현재 신규 관리자는 조회9개이며 모든 변경 기능 지원이 아니다. 비활성 native stocks/shop/board는 조회 시안이므로 매매·구매 대체로 전환하지 않는다. 사용자 wallet/support/chat 소스와 owner-safe 클라이언트는 있지만 실서비스 연결·API 계약 검증이 필요하다. 계정 설정은 축소된 프로필로 몰래 대체하지 않는다.

## 진행 중
- [ ] 기능/실행/라우팅 기준선과 실제 지원 행렬
- [ ] 미참조·DB-free로 확인된 old Test5개 우선 stop/부팅 해제 및 역전환 증거
- [ ] 단일 frontend-presentation mode와 실제 소유자 사용자 화면 연결
- [ ] 도구 계정 헤더·실제 관리자 원천 점검
- [ ] 구버전 자산 bytes 보존, exact-main Test/운영·잔여 프로세스 정리
- [ ] 코드/브라우저/보안 검증·GitHub 문서/병합/브랜치 정리

## 종료 상태
아직 착수/조사 단계이며 신규 코드·운영 전환·서비스 정리는 실행 전이다. 전체 기능 정상으로 판정하지 않는다. SQL/grant/원장/잔액/세션 보정·메시지 발송·전체 backend 승격은 이 frontend 단계에 포함하지 않는다.

## 진행 체크포인트1
- 미참조 DB-free old Test5개 중지·가능한 부팅 해제 완료. ports4780/4790/4806/4812/4816은 실제 nginx-T 참조 목록에 없고 각 unit의 mode·PID·listener·RequiredBy/TriggeredBy를 확인했다. 전체 include/bytes 및 공개/관리자/사용자/API guest HTTP14경로 전후 동일. release 파일은 삭제하지 않았다.
- 최초 preflight는 IPv4-mapped IPv6 loopback 표기 때문에 변경 전 거부했다. 두 번째는 정상 Java SIGTERM143을 기존unit이 실패로 표시해 원상 복원했다. 정확한 종료143을 기록한 뒤 그 retire 대상만 실패 marker를 정리하여 최종5개 inactive/부팅 비활성으로 확인했다. 다른 failed unit은 reset하지 않았다.
- MemAvailable385656→543888kB, SwapFree12896516→13897348kB. 별도 경제AI 프로세스 약2.3GB RSS도 관찰했지만 기능 소유자/worker이므로 frontend 정리 대상으로 중지하지 않았다. 로컬 대형 빌드는 자원 상태를 보며 제한하고 공식 CI를 필수로 유지한다.
- 기능 원장 helper4개 RED→GREEN, 실제 소스 후보/lexical action/API 참조 원장을 생성했다. 코드 존재를 실행 성공으로 올려잡지 않는다. 운영 연결/나머지 기능 검증은 계속 진행 중이다.

## 진행 체크포인트2 — 단일 프론트엔드 소스
- 신규 frontend-presentation 모드는 기존 공개5/관리자9를 명시적으로 import하며 DB·session 생성·스케줄러·봇을 불러오지 않는다. 미완성 stocks/shop/board와 account 설정은 자동 노출하지 않는다. 두 이전 모드는 호환 보존한다.
- wallet/support/chat 및 기존별칭은 실제 Cookie 기반 fixed GET auth/me에서 signedIn/UUID/alias 일치를 확인한 뒤 기존 owner-bound JS로 연결하는 소스를 추가했다. auth/me의 legacy 숫자 잔액은 절대 HTML에 복사하지 않는다. 신원 실패·모순·RSC·POST·중복 쿠키는 거부하며 서버 userdata를 HTML로 내보내지 않는다. 이체/메시지 API 자체는 기존 권위·CSRF·idempotency·owner-race 방어를 유지한다.
- 새 통합실행6개/회원5개/언어 header1개 RED→GREEN, 기존admin39와 합계 focused51개 실패0·Node86개 실패0. 아직 전체 Spring/실DB/실브라우저/운영 수용은 아니다. 기능 원장 회귀는 기존 CI native glob에서 자동 실행되도록 test 파일을 scripts/native-feature-coverage.test.mjs로 배치했다. CI 분류기를 완화하지 않았다.
- API 관제/도구 계정 헤더·구버전 assets 정적 보존·운영 프로세스 통합 및 전체 기능 미수용 원장은 후속 작업 중이다. 현재 신규runtime는 미배포이며 운영은 기존9/공개5 유지다.

## 진행 체크포인트3 — 실제 세션·관제 원천
- 기존 순수 로그인/인증8개 화면을 같은 DB-free 실행 모드로 구성했다. 기존 인증 API·등록 hold·삭제 권한을 변경하지 않는다.
- 관리자 API 관제는 실제4개 고정 조회의 구조 검증·실측 소요시간·표본 수만 표시한다. 기존118개 endpoint/99.9%/가짜 백업 정상값은 새 화면에 사용하지 않는다. 원천401/403은 전체 접근 실패, malformed/503은 해당 조회 확인불가로 표시한다.
- 도구 화면 계정 헤더는 실제 session proof를 사용하며 실패를 비회원으로 바꾸지 않는다. 언어 전환 시 계산 입력을 유지하고 오래된 계정 응답을 폐기한다. 로그아웃은 현재 소유자와 새 CSRF를 재확인한 뒤 실제 세션 해제까지 확인한다. 운영 로그인 계정에 로그아웃 실험은 하지 않는다.
- 새 관제/인증4개와 도구 헤더7개 RED→GREEN. 전체 native Node93개 실패0·skip0, Spring 전체 test/bootJar BUILD SUCCESSFUL. XML 집계는 다음 체크포인트/PR에 기록한다. Spring H2 fixture에서 기존 스케줄러 missing-table 경고가 있었으며 신규 frontend mode에서는 해당 bean 부재를 테스트한다. 실DB 검사는 이 local suite가 아니다.
- current main c5c3c9d7 재fetch 확인. 실제 관리자 메뉴36경로 현황을 브라우저에서 수집 중이며 상태/입력/버튼 수를 기능 실행 성공으로 간주하지 않는다. 아직 신규 운영 전환 전이다.
