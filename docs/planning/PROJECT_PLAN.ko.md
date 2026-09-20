# 월덕 머니버스 — Living Project Plan

> **문서 상태:** Living specification / 현재 권위 통합기획서
> **최초 기준:** 2026-08-26
> **현재 통합 버전:** v2026.09.20.303
> **구현·증거 동기화:** 2026-09-20
> **영문 기준 문서:** [PROJECT_PLAN.md](PROJECT_PLAN.md)

과거 상세 변경은 Git 이력과 버전별 changelog/worklog에서 복구할 수 있다. 이 문서는 현재 구현을 위한 권위 계약이다. 다른 개발자나 AI가 과거 초안을 현재 사실로 추정하지 않고 이 문서만으로 기능 범위, 권위 경계, 사용자 상태, API, 영속화, 보안, SEO, 사업성, QA, 릴리스 게이트와 롤백 조건을 이해할 수 있어야 한다.


## 기획 회차 — v2026.09.20.303 (2026-09-20)

### 1:1 개인 채팅
- **제품 범위:** 로그인한 회원 간 1:1 개인 채팅을 소셜 기능으로 추가한다. 초기 범위는 텍스트 중심의 개인 대화이며 그룹채팅, 익명채팅, 공개 채팅방, 음성/영상 통화, 종단간암호화는 별도 후속 결정으로 두고 이번 기획에 포함된 것처럼 취급하지 않는다.
- **대화 권위:** 대화방 생성, 참여자, 메시지 순서, 전달상태, 읽음상태, moderation 상태는 백엔드가 최종 권위다. 클라이언트가 제3자를 추가하거나 다른 발신자를 사칭하거나 작성자를 바꾸거나 상대 계정 대신 읽음처리를 할 수 없어야 한다.
- **대화 가능 조건·개인정보:** 1:1 메시지는 설정된 상호작용 정책을 양쪽 계정이 충족하기 전에는 기본 차단한다. 사용자별 DM 허용 설정, 차단목록, 정책 기반 제한을 지원하되 비공개 친구/클럽 관계, 계정보안 상태, 잔액·보유자산 등 민감정보를 상대에게 노출하지 않는다.
- **핵심 UX:** 대화목록, 안 읽은 수, 최근 메시지 미리보기, 대화화면, 전송/재시도 상태, 시간표시, 정책이 허용하는 읽음표시, 차단/이용불가 상태, 모바일 키보드 대응 입력창, 로딩/빈상태/오류/세션만료 상태를 제공한다. 채팅을 온보딩 필수행동으로 강제하지 않는다.
- **안전:** 차단은 즉시 양방향 신규 메시지를 막고 추가 상호작용 유도를 중단한다. 대화화면에서 신고할 수 있어야 하며 검토에 필요한 moderation 증거는 변경불가 형태로 보존한다. 전송 rate limit, 스팸/중복 메시지 제어, 남용 throttling, 링크/멘션 정책, 콘텐츠 필터링은 서버가 강제한다.
- **연령 민감 상호작용:** 개인 메시지 확대와 성인-미성년 접촉 범위 확대는 Production 활성화 전에 별도 연령/개인정보/안전/법무 검토를 통과해야 한다. 검증된 적격성에 따라 DM 시작/수신 범위를 제한할 수 있어야 하며 권한 없는 상대에게 제한 사유의 민감한 세부정보를 노출하지 않는다.
- **데이터/API 방향:** 안정적인 conversation/message ID, 서버 timestamp, 대화별 단조 증가 순서, idempotent send key, pagination cursor, payload 상한, 정규화된 메시지 상태를 사용한다. 사용자 화면에서 숨김/삭제하는 행위와 moderation/audit 보존을 구분한다.
- **실시간·복구:** WebSocket/SSE 등 실시간 전달을 사용할 수 있으나 정확성이 연결 유지에 의존해서는 안 된다. 재연결 시 cursor/order 기준으로 권위 API에서 누락 메시지를 복구하고 중복 이벤트는 idempotent 처리한다. 오프라인/실패 전송은 서버 확인 전까지 성공 전달처럼 보이지 않아야 한다.
- **알림:** 채팅 알림은 기존 알림/개인정보 설정에 통합하고 사용자가 제어할 수 있게 한다. 차단/음소거/세션 상태를 존중하고 잠금화면, 로그, analytics, push provider payload에 민감한 메시지 본문을 불필요하게 노출하지 않는다.
- **관리자/moderation:** 운영 검토는 최소권한·목적제한·감사를 따른다. 관리자 기능은 비공개 대화를 자유롭게 열람하는 형태가 아니라 신고/증거 상태 중심으로 설계한다. 예외적인 메시지 본문 접근은 명시 권한과 변경불가 감사기록을 요구한다.
- **QA/수용:** 계정간 권한/BOLA, 위조 sender/conversation ID, 차단 사용자 전송, 중복 idempotency key, 순서 역전·재생 이벤트, pagination 경계, 재연결 복구, 읽음/안읽음 race, rate limit, 신고 흐름, 세션만료, 320/360/390px 모바일 입력, 접근성, 개인정보 안전 로그를 검증한다. exact-SHA Test에서 백엔드/API/실시간 동작과 설정된 안전정책이 입증되기 전에는 Production 활성화를 금지한다.
- **작업 순서:** v2026.09.20.303-01 스키마/정책 계약 -> -02 백엔드 API·권한 -> -03 실시간/복구 -> -04 반응형 프론트엔드 + 차단/신고/알림 통합 -> -05 exact-SHA Test 보안/남용/접근성 E2E -> -06 최종 기획 재확인 후 모든 릴리스 게이트 통과 시 무중단 Production 승격.
- **이번 변경 성격:** 기획/문서만 변경한다. 이번 회차는 1:1 채팅 런타임이 구현 또는 활성화됐다고 주장하지 않는다.

## 구현 회차 — v2026.09.20.298 (2026-09-20)

### 계정 라우트 재구축 단위
- `/account`를 반복 카드 나열에서 주요 작업 열과 고정 계정 도구 레일로 재구성했습니다.
- 서버 권위의 로그인 수단 연결/해제, 최근 본인 확인, 계정 삭제 흐름을 그대로 유지했으며 API/DB 권위는 변경하지 않았습니다.
- 보안·활성 세션, 알림, 개인정보 센터를 의미론적 내비게이션과 최소 44px 조작 영역으로 직접 접근할 수 있습니다.
- frontend typecheck, 전체 Vitest, Production build, exact-SHA CI와 isolated Test가 병합 전 필수이며 전체 UI 재구축 완료 전 Production 승격은 차단합니다.

## 구현 회차 — v2026.09.20.297 (2026-09-20)

### 프론트엔드 전면 재구축 기반 구현 시작
- **권위:** `feat/frontend-rebuild-v2026.09.20.297` 브랜치는 `main=4dcd2ba112ae57565eed7444fe1d36512b926a3b`에서 시작했습니다. 작업 중간에 권위 기획서와 원격 main을 다시 확인했고 변경이 없었습니다.
- **기반 교체:** 기존의 어두운 그라데이션/글래스 중심 표현층을 제거하고 평면 surface, 강한 정보 계층, 낮은 radius, 작업별 밀도, 더 넓은 앱 캔버스를 사용하는 절제된 제품 UI 체계로 교체했습니다.
- **공통 프리미티브:** page header, card, button, 전역 shell을 다시 만들어 API·인증·원장·권한 권위를 변경하지 않고 모든 라우트에 새 시각 시스템이 적용되도록 했습니다.
- **반응형/접근성:** 기존 320px 최소폭, 모바일 내비게이션, focus-visible, reduced-motion 계약을 유지합니다. finance/member/community/game/admin/utility 라우트군은 하나의 대시보드 템플릿을 강제하지 않고 용도별 밀도 규칙을 유지합니다.
- **검증:** frontend typecheck와 Production build를 통과했습니다. 공용 contract package를 먼저 빌드한 뒤 frontend Vitest 90/90 파일, 681/681 테스트를 모두 통과했습니다.
- **릴리스 게이트:** 이번 회차는 전체 라우트 재구축의 첫 구현 단위이며 완료 선언이 아닙니다. 병합 또는 Production 승격 전에 exact-SHA Test 배포와 런타임 검증을 반드시 통과해야 합니다.

## 즉시 실행 지시 — v2026.09.20.292 (2026-09-20)

### 다음 작업: 지금 프론트엔드 UI 전면 재구축 시작
- **우선순위:** 이 작업을 바로 다음 개발 작업으로 실행한다. 부분적인 화면 꾸미기, 색상/간격 보정, 일부 페이지만 다시 만드는 작업보다 우선한다.
- **시작 조건:** 현재 모든 프론트엔드 라우트를 실제 백엔드/API 구현 및 권위 기획서와 대조한다. 새 UI로 교체하기 전에 누락된 UI, 오래된 기능 가정, 백엔드에만 존재하는 기능, 권한/오류/세션 상태, 모바일 문제를 식별한다.
- **재구축 원칙:** 프론트엔드 UI를 처음부터 다시 만든다. 기존 UI는 필수 동작과 라우트 범위를 확인하는 참고 자료로만 사용하며 새 레이아웃/컴포넌트 구조를 기존 화면에 맞추지 않는다. 단순 테마 교체 작업으로 처리하지 않는다.
- **디자인 품질:** 결과물이 AI 생성 UI처럼 보이지 않도록 실제 제품 설계 기준으로 구성한다. 반복 카드 그리드, 범용 대시보드 형태, 과도한 그라데이션/글래스 효과, 획일적인 섹션, 장식 위주 구성, 페이지 구조 복제를 피하고 각 화면의 실제 사용자 작업과 정보 우선순위에 맞춘다.
- **반응형 필수:** 반응형은 나중에 보정하는 단계가 아니라 첫 구현부터 필수다. 모바일/태블릿/노트북/데스크톱을 계속 검증하며 320/360/390/768/1024/1280/1440 CSS px를 기본 검증 폭으로 사용한다.
- **백엔드 완전성:** 사용자 또는 관리자가 사용해야 하는 기존 백엔드 기능이 모두 적절한 프론트 화면과 연결되는지 확인한다. 노출하지 않는 기능은 이유를 문서화한다. 인증, 권한, 경제/원장, 직업, 주식, 지갑, 관리자 작업 등 보호 상태는 반드시 서버 권한을 따른다.
- **완료 게이트:** 라우트별 기능 QA, API 계약 검증, 반응형/접근성 QA, 시각 회귀, 로그인 세션 유지, 핵심 흐름 E2E 검증을 모두 통과하기 전에는 재구축 완료로 처리하지 않는다.
- **배포 순서:** 구현 브랜치 -> exact-SHA 테스트 서버 배포 -> 테스트 서버 백엔드/프론트/API 검증 -> 병합 -> 병합된 동일 SHA 재빌드 -> 무중단 운영 승격 -> 운영 스모크/헬스/세션 검증. 반응형 오류, 백엔드 기능 누락, 핵심 기능 회귀가 있으면 운영 승격을 차단한다.

## 사이클 델타 — v2026.09.19.286 (2026-09-19)

### 다음 개발 단계: 백엔드 권한 검증을 전제로 한 프론트엔드 전면 재구축
- **범위:** 다음 구현 단계에서는 현재 화면을 부분적으로 꾸미는 방식이 아니라 웹 프론트엔드를 처음부터 다시 구축한다. 기존 화면은 동작/참고 증거로만 활용하며 정보 구조, 페이지 구성, 컴포넌트 구조, 간격, 타이포그래피, 상호작용, 빈 상태/로딩/오류 상태, 반응형 동작을 새로 설계한다.
- **백엔드/API 우선 확인:** 각 라우트를 만들기 전에 해당 화면이 사용하는 실제 백엔드/API 기능을 인증/권한, 검증, 영속화, 페이지네이션, 멱등성, 경제/원장 권한, 관리자 경계, 오류 계약, 실시간/갱신 동작까지 전수 확인한다. 서버 권한과 충돌하는 클라이언트 전용 동작을 만들지 않는다. 백엔드에는 존재하지만 사용 가능한 프론트가 없는 기능은 재구축 백로그에 반드시 연결한다.
- **사람이 설계한 제품 UI 기준:** AI 생성물처럼 보이는 반복 카드 그리드, 과도한 그라데이션/글래스 효과, 범용 대시보드 껍데기, 뻔한 플레이스홀더 문구, 지나치게 획일적인 간격, 페이지마다 반복되는 동일 섹션 템플릿, 제품 의미가 없는 장식을 피한다. UI 결정은 실제 사용자 작업, 콘텐츠 계층, 접근성, 레퍼런스 조사에 근거해야 한다. 시각적 일관성은 하나의 템플릿 복제가 아니라 유지보수 가능한 디자인 시스템에서 만든다.
- **반응형 계약:** 모든 재구축 라우트는 모바일, 태블릿, 노트북, 와이드 데스크톱에서 설계/검증한다. 가로 스크롤, 잘린 컨트롤, 접근 불가능한 다이얼로그, 고정폭 테이블, 깨진 내비게이션, 작은 터치 타깃을 허용하지 않는다. 기본 검증 폭은 320, 360, 390, 768, 1024, 1280, 1440 CSS px이며 필요한 경우 확대/리플로우도 검증한다.
- **컴포넌트/시스템 재구축:** 타이포그래피, 간격, 라운드, 테두리, 입체감, 모션, 밀도 토큰을 새로 정의하고 공통 내비게이션, 폼, 테이블/리스트, 모달/드로어, 피드백, 데이터 시각화, 페이지 셸 프리미티브를 확립한다. 시맨틱 HTML, 키보드 탐색, 명확한 포커스, reduced-motion, 스크린리더 구조를 유지한다.
- **라우트별 완료 조건:** 해당 라우트의 백엔드 계약이 검증되고, 모든 사용자 상태가 표현되며, 로딩/빈 상태/오류/권한 부족/세션 만료 경로가 구현되고, 반응형 QA와 시각 회귀 검사가 통과하며, 모바일/데스크톱이 동일한 서버 권한 데이터에 대해 올바르게 동작해야 완료로 간주한다.
- **개발 순서:** (1) 백엔드/API 전수조사 및 라우트 매트릭스, (2) 디자인 시스템 기반, (3) 전역 셸/내비게이션, (4) 인증/계정, (5) 핵심 경제/직업/주식/지갑, (6) 상점/마켓/커뮤니티/콘텐츠, (7) 관리자/운영, (8) 전체 반응형/접근성/성능 QA 후 기존 무중단 배포 계약에 따라 exact-SHA 테스트 서버 검증과 운영 승격을 수행한다.
- **배포 게이트:** 재구축 작업은 기능 브랜치에서 격리하고 테스트 서버에서 후보 exact SHA가 검증된 경우에만 병합한다. 운영은 병합된 동일 SHA만 무중단 승격하며 인증 세션을 유지해야 한다. 백엔드 동작 미검증, 반응형 깨짐, 오래된 계약 가정, 핵심 흐름 회귀가 하나라도 있으면 운영 승격을 차단한다.

## 회차 변경 — v2026.09.19.279 (2026-09-19)

### 활성 세션 상세 + v279 Test/Production exact-SHA 동기화
- **기준/브랜치:** 구현 기준 `main=3712f7989b7a9441cc0a5f9d45784b4252a2c610`; 문서 동기화 브랜치는 `docs/plan-v279-runtime-sync`다. 작업 시작과 운영 승격 직전 원격 `main`을 다시 확인해 동일 exact SHA임을 검증했다.
- **구현:** migration 213이 사용자 활성 세션 조회 함수 `account_active_sessions(uuid,uuid)`를 추가하고, 계정 → 보안 화면은 개인정보를 최소화한 기기 분류, 최근 활동, 로그인, 만료 시각을 표시한다. 원본 User-Agent/IP/token/CSRF는 사용자 응답에 노출하지 않는다. v278 관리자 지원 화면의 모바일 접근성 보완도 이 SHA에 포함된다.
- **정적/단위 검증:** release helper 회귀, 전체 typecheck, lint 오류 0건(기존 이미지 최적화 warning 11건), API 계약 157 endpoint 일치, backend 888 PASS/360 환경 의존 skip, frontend 667/667 PASS, production build PASS.
- **Test 승격:** Test DB에 migration 211→213 누락분을 checksum 검증 방식으로 적용했고, `/srv/moneyverse-data/releases/test-3712f7989b7a-v279`를 blue/green으로 승격했다. `/api/version`과 `/frontend-version`은 모두 exact SHA를 반환하고 health 200, 핵심 route smoke, 전역 noindex/nofollow, 최근 warning 이상 journal 0건을 확인했다.
- **Production 승격:** 신규 암호화 DB/사진 backup을 생성해 SHA-256 검증 후 Production DB에 migration 213을 적용했다. 동일 빌드를 `/srv/moneyverse-data/releases/prod-3712f7989b7a-v279`로 승격했고 canary→stable 전환 동안 primary 중단 없이 진행했다. 승격 후 `/api/version`, `/frontend-version`, `/health`, 홈/작업/계정보안/관리자지원/상태/주식/카지노/지갑/상점 smoke가 통과했고 backend/frontend/Economy AI/backup timer가 active이며 최근 warning 이상 journal은 0건이다.
- **롤백:** Test/Production Nginx pre-blue-green backup과 이전 immutable release를 유지한다. DB migration 213은 함수 추가형이므로 데이터 이력을 재작성하지 않으며 애플리케이션 rollback 시에도 적용 기록을 보존한다.

## 회차 변경 — v2026.09.19.275 (2026-09-19)

### 최신 빌드 자동 갱신과 반복 가능한 host blue/green 승격
- **기준/브랜치:** 현재 `main`에서 `ops/blue-green-cache-refresh-v2026.09.19.275` 브랜치를 분리했으며 런타임 승격 전에 기획서와 원격 `main`을 작업 중간에 다시 확인했습니다.
- **프론트 최신성:** 기존 stale-tab 감지는 일반 배포에서 사용자의 새로고침 클릭을 요구하지 않습니다. frontend `/frontend-version`이 다른 build를 보고하면 보이는 탭이 `__mv_release=<build>`를 붙여 같은 경로를 한 번 cache-bust 재이동하며 쿠키/로그인 세션과 기존 query/hash는 유지합니다. 중간 캐시가 계속 이전 shell을 주는 경우 sessionStorage 전환 가드가 reload loop를 막고 그때만 수동 fallback을 표시합니다.
- **Host rollout:** 정확한 release backend/frontend canary를 대체 포트에 먼저 기동하고 health/version을 검증한 뒤 선택한 Nginx server block만 전환합니다. canary가 트래픽을 받는 동안 stable systemd 서비스를 재시작하고 exact SHA를 확인한 다음 Nginx를 stable port로 되돌립니다. 실패 시 primary가 비정상이면 canary edge를 유지해 중단을 만들지 않습니다.
- **세션 연속성:** 기존 실 PostgreSQL 인증 세션 repository 재생성 테스트를 필수로 유지하며 Test 승격 전 통과했습니다. 릴리스 환경 생성은 비밀값을 release 밖에 유지하고 runtime identity/routing만 기록합니다.
- **QA/승격:** helper regression, frontend stale-tab regression, frontend typecheck/build, 실 DB session continuity, exact-SHA 격리 Test blue/green 승격, 공개 Test health/version/catalog/noindex/page smoke와 fatal log 확인 후에만 Production 승격합니다. Production도 동일한 merged exact SHA와 무중단 절차를 사용합니다.

## 회차 변경 — v2026.09.19.265 (2026-09-19)

### exact-SHA Test/Production 승격 증거 및 호스트 라우팅 가드
- **권위:** repository `main=6f8ee496173cbf4effffba4527cf01eb2faa3ccf`에서 증거 회차를 시작한다. repository/control-plane identity와 application runtime identity를 분리하며 실제 승격 application source는 `b1b1f7aa63e630bba266c5dcbb72731faccdae8d`이다.
- **Test 복구/증거:** Test DB를 migration 204→208로 올리고 backend/frontend를 하나의 exact application source 및 stable 3100/3101로 통일했다. health 200, catalog 146, noindex, 필수 공개 경로 smoke 모두 200을 확인했다.
- **라우팅 결함 종결:** Test Nginx는 `/health`, `/api/version`만 3100을 보면서 일반 `/`는 폐기 대상 임시 UI 3119를 가리켰다. 현재 live route는 stable 3101이다. `ops/nginx/check-moneyverse-host-routing.sh`가 transient Test UI/candidate port를 거부하고 Test 3100/3101, Production 3000/3001 고정 라우팅을 검증한다.
- **Production 승격:** migration 전에 신규 암호화 운영 backup+checksum을 생성했고 운영 DB를 204→208로 올렸다. 같은 SHA canary backend/frontend를 3003/3202에서 검증한 뒤 기존 listener를 유지한 채 Nginx reload로 전환했다. 이후 persistent 3000/3001을 같은 release로 재기동·검증하고 Nginx를 stable port로 reload했다. 최종 Production exact SHA, health, catalog 146, 필수 공개 경로 모두 통과했고 최근 backend/frontend fatal error scan은 0건이었다.
- **정리 / rollback:** 구형 Test UI, v196 canary, 임시 v263 canary를 모두 중지했다. `systemctl --failed`는 0이며 Moneyverse listener는 stable 3000/3001/3100/3101만 남았다. 이전 unit drop-in, Nginx backup, 이전 release directory는 rollback anchor로 보존한다.

## 회차 변경 — v2026.09.19.263 (2026-09-19)

### 호스트 Test exact-SHA 런타임 복구 및 승격 정합성
- **권위 / 브랜치:** `origin/main=b1b1f7aa63e630bba266c5dcbb72731faccdae8d`에서 `fix/test-runtime-v2026.09.19.263`으로 작업을 시작한다. 영문·한국어 통합기획서 헤더가 서로 다른 버전으로 드리프트한 상태를 v263에서 하나의 권위 버전으로 맞춘다.
- **확인된 릴리스 결함:** v259 임시 backend는 `PORT=3120`을 선언했지만 `PORT=3100`이 든 release-local `.env`도 함께 로드했다. systemd `EnvironmentFile=` 값이 우선해 이미 사용 중인 stable Test 포트 3100 바인딩을 시도했고 `EADDRINUSE`로 실패했다. stable Test unit 역시 서로 다른 과거 release 디렉터리와 오래된 공용 `BUILD_ID`를 섞어 공개 Test가 후보가 아닌 오래된 application SHA를 반환할 수 있었다.
- **런타임 계약:** stable Test 비밀/기본 설정은 `/etc/moneyverse/test-backend.env`, `/etc/moneyverse/test-frontend.env`에 둔다. 릴리스별 identity/routing은 생성된 `/etc/moneyverse/test-backend-release.env`, `/etc/moneyverse/test-frontend-release.env`로 분리하고 검토된 drop-in에서 마지막에 로드한다. 영구 Test unit이 release-local backend `.env` 또는 frontend `.env.local`을 직접 읽으면 안 된다. backend/frontend는 하나의 정확한 40자 Git SHA, 하나의 `test-current` release root, 하나의 backend API origin을 공유해야 한다.
- **자동화:** `ops/systemd/write-test-release-env.sh`가 비밀값 없이 release identity/routing 파일만 생성하고 잘못된 SHA를 거부한다. backend/frontend drop-in 템플릿은 stable secret과 release identity를 분리한다. 회귀시험은 Test backend port, frontend API origin, 동일 BUILD_ID, secret-bearing key 부재를 검증한다.
- **QA / 승격:** helper 회귀시험과 repository lint/typecheck/test/build를 거친 뒤 exact candidate release를 isolated Test에 올리고 공개 `/api/version` exact SHA, backend `/health`, BFF catalog, `noindex`, 핵심 페이지, 치명적 unit log 부재를 확인한다. 작업 중간에 이 기획서와 원격 `main`을 다시 읽는다. Test에서 검증한 동일 SHA만 무중단 Production 승격에 사용하고 이전 release pointer/unit 정의를 rollback anchor로 보존하며 전환 후 Production `/api/version`, health/catalog, 핵심 페이지를 재검증한다.

## 회차 변경 — v2026.09.19.256 (2026-09-19)

### `/work` 배포 오탐 배너 + 가속 초기화 화면 갱신 수정
- **권위:** 구현 시작과 필수 작업중간 재확인 모두 `origin/main=97a301bd39b1f80a3d423b68d16a86d91c4ceb58`였고 코드 변경 전 main/기획 이동은 없었다. 작업은 `fix/work-mobile-reset-v2026.09.19.256` 격리 브랜치에서 진행한다.
- **원인:** 운영 Nginx는 `/api/version`을 백엔드 런타임 identity(3002)로 예약하는데 프론트 stale-tab 감지가 해당 백엔드 SHA를 `NEXT_PUBLIC_BUILD_ID`와 비교했다. 그래서 정상 탭도 오래된 것으로 오판했다. 또한 `/work`에 live refresh가 없어 DB의 현실 10분 일간/70분 주간 경계가 넘어가도 이미 열린 화면은 이전 수치를 유지할 수 있었다.
- **구현:** 프론트 소유 `/frontend-version`을 사용하고 stale-tab 회귀 테스트를 수정한다. `/work`에 visible-tab 10초 `LiveRefresh`를 추가하고 synthetic game-day/week 저장 키를 사용자 날짜처럼 노출하지 않는다. 백엔드/스키마/원장/정책 변경은 없다.
- **QA / 승격:** stale-tab 집중 테스트 5/5, contract build, 프론트 typecheck, Next production build 통과. 브랜치 CI -> exact-SHA 격리 Test -> 프론트/백엔드 identity + 인증 `/work` + backend health 확인 -> merge -> 병합 exact SHA 재빌드 -> 무중단 Production -> 사후 probe 순서로 진행한다.

## 회차 변경 — v2026.09.19.246 (2026-09-19)

### 06:04 경제 정산 CI 실패 + 상태 후보 실패 / 런타임 대조
- **권위 / 동시 작업:** 시작과 필수 중간 재확인 모두 authoritative `main=663330e9e7d3abb84ee9972c78f2fe1a00301e4d`(병합된 v244 기획)이다. 열린 구현 PR은 2개다. PR #509 상태 권위 후보는 exact head `6879b80a3a39e450f3ab65588ddb8165ac78d103`, mergeable이지만 CI run 35394403042가 lint/typecheck/build/DB migration 성공 후 `runtime-check -> Test`에서 **실패**했다. PR #511 작업 보상 정산 후보는 exact head `259ecab60c605f199a2f2d042d5f839b859af649`, 1 file/+90, mergeable이지만 CI run 35390912065도 lint/typecheck/build/migration 성공 후 `runtime-check -> Test`에서 **실패**했다. 둘 다 exact-head 실패 원인을 진단하고 전체 runtime gate가 green이 되기 전에는 병합된 사실이나 Test/Production 승격 가능 구현으로 취급하지 않는다.
- **런타임 / HIGH `OBS-NET-216-01` 06:04 KST 재현:** backend, frontend, backup timer, Economy AI unit은 active이고 backup timer는 enabled, 직전 trigger 00:23:48, 다음 06:22:37 KST다. Canonical `https://woldeok.com/api/version`은 host-local DNS `curl(6)`/HTTP 000으로 계속 실패하며 loopback `127.0.0.1:3002/api/version`은 HTTP 200, `Cache-Control: no-store`, backend id `75e69e77cdc18ef221106a008563151a4c790728`이다. 정상 unit은 유지한다. DNS는 resolver/authoritative record, 독립 외부 vantage 2개, TLS/SNI, HTTP/callback dependency, 실제 alert와 기존 vantage별 30회 연속 성공 조건 전까지 HIGH다.
- **P0 `ECON-233-02` 작업 보상 정산 후보 (backend/API/DB):** #511의 방향—immutable economic command claim, 서버 권위 task/account row lock, ledger + receipt/progression write, command complete를 하나의 DB transaction에 두고 replay는 저장 결과를 반환—은 유지한다. 그러나 exact-head runtime test 실패는 release blocker다. 동작 변경 전에 실패 테스트를 진단한다. Real PostgreSQL 필수 matrix: 동일 command ID 순차 replay, 2/10/50 동시 동일 claim, 동일 task+서로 다른 command ID, 동일 account의 경쟁 task/reward mutation, claim 후/ledger write 후/receipt write 후/command complete 직전 failure injection, deadlock/serialization retry, eligibility 변경/부족, client timeout/retry. 정확히 1개 ledger effect와 1개 receipt/progression effect, immutable command request/result hash, recovery 정책을 넘긴 stranded `processing` 0개, rollback 후 invariant 보존을 검증한다.
- **동시성 설계 / 직접 채택:** PostgreSQL 17에서 Read Committed는 기본이며 같은 transaction의 연속 statement가 서로 다른 committed state를 볼 수 있다. MVCC만으로 business invariant가 충분하지 않으면 row/explicit lock을 사용하고, deadlock은 일관된 lock 순서로 줄이며 abort된 transaction은 재시도한다. 모든 경제 envelope의 canonical lock order를 `command -> user/account -> source task/order -> entitlement/inventory -> ledger aggregate`로 고정하고 SQLSTATE `40001`/deadlock bounded retry를 정의하며 unique constraint를 최종 중복 방어선으로 둔다. persisted command result 밖의 외부 side effect는 자동 재시도하지 않는다.
- **경제 API/App API 계약:** web/App API mutation은 authenticated subject, server-authoritative reward/task lookup, opaque idempotency/command key, request hash, stable replay response를 요구한다. 동일 key를 다른 request hash로 재사용하면 `409`/domain conflict이며 mutation 0건이다. Timeout/reconnect retry는 persisted result를 반환한다. Client가 reward amount, ledger account, settlement state, completion timestamp를 정할 수 없다. Admin correction은 별도 privileged compensating command로 수행하고 reason code, 설정 시 dual control, immutable masked audit를 남기며 history를 rewrite하지 않는다.
- **경제 QA / 승격 / 롤백:** #511 exact head가 먼저 GitHub CI full green이 된 뒤 동일 backend/schema SHA를 isolated Test에서 concurrency/fault matrix와 `economic_command <-> ledger <-> receipt/progression` cardinality reconciliation로 검증한다. Production은 exact tested tuple, 기술적으로 가능한 migration forward/backout rehearsal, duplicate economic effect 0, unresolved processing command 0, 배포 후 replay smoke를 요구한다. Rollback은 forward-only ledger/command history를 보존한 채 마지막 compatible app behavior로 되돌리며 적용된 ledger history를 삭제/재작성하지 않는다. 자산/보상 중복, negative invariant, replay divergence, unreconciled command는 P0 승격차단이다.
- **P1 상태 권위 회귀:** #509 새 exact head도 `runtime-check -> Test` 실패이므로 후보로만 유지한다. v244 stale/future fail-closed 계약을 보존하되 수정 전에 실제 failing test name/output을 증거로 남기고 단순히 CI를 green으로 만들기 위해 assertion을 약화하지 않는다. 완료조건은 exact-head full green + isolated >=3 collector interval, suppressed update/recovery, stale/future 경계, forged source/replay/cross-source, real-DB out-of-order concurrency다.
- **보안 / CI:** OWASP ASVS 5.0.0 stable과 version-qualified control reference를 유지한다. Economic command endpoint는 object/action authorization, replay resistance, resource limit, immutable audit를 요구한다. `CI-ENFORCE-204-01`은 P1 OPEN이다. #509/#511은 runtime CI가 후보 결함을 잡는다는 증거지만 branch protection에서 exact-head classifier/policy/runtime/security를 required로 만들고 실패하는 economy/status/auth/mobile PR이 이름·만료·감사 가능한 bypass 없이 병합 불가함을 별도로 증명해야 한다.
- **P0 연속성 / 순서:** `BAK-RUNTIME-177-01`은 isolated newest-backup restore/reconciliation, 실측 RPO/RTO, off-host immutable retention, 실제 failure alert 전까지 BLOCKED다. 순서: P0 DR restore + AI/economy authority containment -> #511 exact-head test 실패 진단/수정 + 경제 concurrency/replay 증명 -> HIGH DNS 증거 -> #509 status runtime test 진단/수정 -> P1 required-check enforcement -> mobile/App-API security -> SEO/ad probe -> 실측 commerce/growth. Planning-only이며 runtime/DNS/ledger/policy/Production DB를 변경하지 않는다.

## 회차 변경 — v2026.09.19.244 (2026-09-19)

### 05:03 접근성 병합 + 상태 권위 후보 / 런타임 / CI 대조
- **권위 / 동시 작업:** 시작과 필수 중간 재확인 모두 authoritative `main=f1904964ee6f27ec33b29faad092b94d42622b49`이다. Main에는 PR #508 (`fix(frontend): enlarge footer touch targets v2026.09.19.242`)이 병합되어 Terms/Privacy/서비스 상태/운영 소식 footer 링크가 >=44px 세로 터치영역, 360px compact wrapping, 명시적 keyboard focus를 가진다. 이는 병합된 frontend 구현이지 Production 증거가 아니다. 열린 PR #509는 exact head `fd361f5d0b49f924bdb02bfe76c148734b36254f`, base=current main, 4 files/+77/-3의 별도 후보이며 #507 runtime CI 실패 뒤 server-authoritative public/App API status freshness를 복구한다. 관측 시 GitHub CI run 35389255156은 아직 `in_progress`이므로 후보로만 취급한다. Planning PR #506은 v242 이전 증거 기반이라 독립 병합하지 말고 이 통합 회차가 supersede한다.
- **런타임 / HIGH `OBS-NET-216-01` 05:03 KST 재현:** backend, frontend, backup timer, Economy AI unit은 active이고 backup timer는 enabled, 직전 trigger 00:23:48, 다음 06:22:37 KST다. Canonical `https://woldeok.com/api/version`은 host-local DNS `curl(6)`/HTTP 000으로 계속 실패하고 loopback `127.0.0.1:3002/api/version`은 HTTP 200, `Cache-Control: no-store`, backend id `75e69e77cdc18ef221106a008563151a4c790728`이다. 정상 application unit은 재시작하지 않는다. DNS 완료조건은 resolver/authoritative record + 독립 외부 vantage 2개 + TLS/SNI + HTTP/callback dependency, vantage별 30회 연속 성공, false NXDOMAIN/SERVFAIL 0건, 실제 alert 전달이다.
- **P1 접근성 후속 (frontend + QA):** #508의 44px 프로젝트 기준은 WCAG 2.2 AA SC 2.5.8의 24x24 CSS-pixel 최소치보다 엄격하고 44x44 enhanced target과 정렬된다. 비-inline 주요/내비게이션 control의 Moneyverse mobile design-system floor로 유지한다. 장기적으로 source-string 검사만 의존하지 말고 rendered DOM/layout 검증으로 전환한다: 320/360/390/768px reflow, keyboard focus visible/not-obscured, 200% zoom, pointer target bounding box, 한/영 줄바꿈, axe/manual screen-reader landmark. 완료조건은 overlap/가로스크롤 0, footer 4개 링크의 effective hit height >=44px, visible focus, Terms/Privacy/Status/Announcements 이동 회귀 0이다. Production에는 exact tested frontend SHA만 승격하고 layout 회귀 시 footer component/test만 직전 호환본으로 롤백한다.
- **P1 status authority / App API:** #509가 fully green이면 server-owned `StatusFreshnessPolicy{sourceKey,expectedIntervalMs,staleAfterMs,maxFutureSkewMs,policyVersion}`와 sanitized public/App DTO `{observedAt,state,freshnessState,ageMs,policyVersion}`를 유지한다. DB write는 collector identity 인증, source별 monotonic/idempotent observation, `(source_key,observed_at DESC)` index, bounded retention, stale/future replay 거부를 요구한다. `unknown/stale`은 aggregate health를 개선할 수 없다. Admin diagnostics는 RBAC + immutable masked audit를 요구하고 public DTO는 hostname/private address/secret을 노출하지 않는다.
- **Status QA / 승격:** exact #509 head가 lint/typecheck/unit/build/runtime checks를 모두 끝낸 뒤 isolated Test에서 >=3 collector interval, update 1회 의도적 중단과 회복, invalid/missing timestamp, 59,999/60,000/60,001ms stale 경계, +5s/+5,001ms future skew, degraded/outage 전환, forged source key, stale replay, cross-source overwrite, real-DB concurrent out-of-order write를 검증한다. stale false-green, auth bypass, topology leak, duplicate observation corruption, Test SHA 불일치면 Production을 차단한다. 동일 backend/API/frontend/schema tuple만 승격하며 rollback도 stale/unknown fail-closed를 유지해야 한다.
- **CI / P1 `CI-ENFORCE-204-01`:** `main`은 protected지만 branch protection의 required-status enforcement는 `off`, required contexts/checks는 0개이며 exact main에 연결된 PR-triggered workflow run도 없다. Workflow 존재는 enforcement가 아니다. exact-head classifier/policy/runtime/security check를 required로 만들고 의도적으로 실패하는 auth/economy/status/mobile negative-control PR이 named/expiring/audited bypass 없이 병합 불가능함을 증명해야 한다.
- **P0 연속성 / 순서:** `BAK-RUNTIME-177-01`은 newest-backup isolated decrypt+restore, schema/migration equality, auth/session/economy/audit reconciliation, 실측 RPO/RTO, off-host immutable retention, 실제 failure alert 전까지 BLOCKED다. AI/economy authority containment, migration-205 concurrency, authenticated admin/mobile/MASWE evidence도 미완료다. 순서: P0 restore + AI/economy containment → HIGH DNS 증거 → #509 exact-head CI/Test + status authority → 접근성 rendered QA → P1 CI enforcement negative control → mobile/App-API security → SEO/ad probe → 실측 commerce/growth. Planning-only이며 runtime/DNS/ledger/policy/Production DB를 변경하지 않는다.


## 회차 델타 — v2026.09.19.239 (2026-09-19)

### 03:05 상태 신선도 후보·런타임·보안/SEO 백로그 재대조
- **권위 / 병행 작업:** 시작과 필수 중간 재확인 모두 authoritative `main=0747add239da724a85335758fd98a41613841c94`(v238)이다. PR #502는 `auto/hourly-a-status-freshness-repair-v2026.09.19.239`의 exact head `88376ab764e4f5d8fc262aa89372db71bea112d3`로 OPEN이며 `frontend/src/app/status/page.tsx`, 신규 `status-freshness.ts`와 단위테스트만 변경한다. 이는 병합된 사실이 아니라 후보 구현이다. 문서상 30초 collector 주기를 기준으로 누락/잘못된/미래 또는 60초 초과 관측을 `unknown`/“최신 확인 필요”로 낮추는 계약이다. 관측 시 9개 check-run이 있었고 `verify / runtime-check`는 성공했지만 `build`와 별도 `runtime-check`는 진행 중이므로 exact head 전체 green과 Test 증거 전에는 merge/Production 완료로 기록하지 않는다.
- **런타임 / HIGH `OBS-NET-216-01` 03:05 KST 재현:** backend/frontend/backup timer/Economy AI unit은 active이고 backup timer는 enabled다. Canonical `https://woldeok.com/api/version`은 host-local DNS 실패(`curl(6)`, HTTP 000)가 계속되며 loopback `127.0.0.1:3002/api/version`은 HTTP 200, backend id `75e69e77cdc18ef221106a008563151a4c790728`을 반환한다. 상태 신선도 수정은 DNS 해결이 아니라 UX 진실성/fail-safe 표시다. Resolver→authoritative record→독립 외부 2 vantage→TLS/SNI→HTTP/callback dependency와 실제 alert 전달을 HIGH 수용 gate로 유지하고 정상 application unit을 재시작하지 않는다.
- **P1 상태 관측 백로그(frontend + API/backend + QA):** #502가 통과하면 60초 stale demotion은 유지하되 장기적으로 hard-code를 권위로 두지 않는다. 서버 권위 `StatusFreshnessPolicy{sourceKey,expectedIntervalMs,staleAfterMs,maxFutureSkewMs,policyVersion}`를 추가하고 public status API가 내부 hostname/secret 없이 `observedAt`, `state`, `freshnessState`, `ageMs`, `policyVersion`을 반환한다. Collector write는 source별 단조성을 보장해 현저히 오래된 관측을 거부하고 `(source_key, observed_at DESC)` index와 bounded retention을 둔다. Frontend는 `operational/degraded/outage/unknown-stale`을 구분하며 stale 데이터가 aggregate health를 개선해서는 안 된다. Admin/ops source 진단은 RBAC, public은 sanitized evidence만 제공한다.
- **상태 QA / 수용 / 롤백:** 59,999/60,000/60,001ms 경계, missing/invalid timestamp, +5s/+5,001ms future skew, degraded/outage stale transition을 단위테스트한다. API policy/version/age contract, real-DB out-of-order concurrent collector write, 인증 admin source diagnostics E2E, public 360/390px 접근성 및 색상 외 상태표현을 검증한다. Exact PR SHA가 lint/typecheck/unit/build/runtime check를 통과한 뒤 isolated Test에서 최소 3 collector interval 동안 의도적 collector update 중단과 회복을 재현한다. Production은 같은 tested SHA, DNS/health regression 없음, stale이 healthy로 표시되지 않는 smoke가 필요하다. Rollback은 frontend/API policy를 마지막 호환 tuple로 함께 되돌리며 stale/unknown을 operational로 바꾸면 안 된다.
- **보안 / 직접채택:** OWASP ASVS 5.0.0은 최신 stable이며 version-qualified requirement ID 사용을 권장한다. Browser state-changing status/admin 호출에는 해당 시 `v5.0.0-3.5.1/3.5.2` origin/CSRF 통제를, backend component 통신에는 `v5.0.0-13.2.1/13.2.2` 인증·최소권한을 적용한다. Public status는 read-only, rate/resource bounded, DTO allowlist이며 collector/admin mutation은 service/admin identity, object/action authorization, replay resistance, immutable masked audit를 요구한다. forged source key, stale replay, cross-source overwrite, secret/internal-topology leakage를 negative test한다.
- **SEO / 최신 공식지침:** Google Search Central은 2026-09-17 infinite-scroll 지침을 유지관리 문서로 이동했고 지침 자체는 변경하지 않았다. Moneyverse community/catalog/search의 infinite-scroll UX는 crawler scroll/client-only state에 의존하지 않고 crawlable pagination URL/link와 안정적인 canonical/index semantics를 제공해야 한다. Public status는 운영 투명성이지 growth landing page가 아니므로 의도적으로 index할 때만 self-canonical을 쓰고 아니면 SEO authority의 명시적 index policy를 적용한다. Search/ad crawler가 auth를 우회하거나 조작된 health를 받으면 안 된다.
- **P0/P1 연속성과 순서:** `BAK-RUNTIME-177-01`은 최신 backup isolated restore/reconciliation, 실측 RPO/RTO, off-host immutable retention, 실제 failure alert 전까지 P0 BLOCKED다. AI/economy 권한봉쇄, migration-205 concurrency, 인증 admin/mobile 검증, MASWE-linked release evidence와 `CI-ENFORCE-204-01`도 open이다. 순서: P0 restore + AI/economy 봉쇄 → HIGH DNS 증거 → #502 exact-head CI/Test와 status-policy backend contract → P1 required-check negative-control enforcement → mobile/App-API security → SEO crawl probe → 실측 commerce/growth. Planning-only; runtime/DNS/ledger/policy/Production DB 변경 없음.

## 회차 델타 — v2026.09.19.238 (2026-09-19)

### 02:05 모바일 보안·CI·런타임 증거 갱신
- **권위 / 브랜치 상태:** 시작과 필수 중간 재확인 모두 authoritative `main=f5aeec3a6460a209f8617efaa369f7ee5310c5e1`(v237)이며 열린 PR은 관측되지 않았다. Main은 protected지만 required-status enforcement가 `off`, required context/check가 0개이고 exact-main combined status도 0개다. 따라서 `CI-ENFORCE-204-01`은 P1 OPEN이다. Exact-head classifier/policy/runtime/security check를 required로 만들고, 의도적으로 실패하는 auth/economy/AI/mobile-security negative-control PR이 이름·만료·감사기록이 있는 bypass 없이는 실제 merge되지 않는 증명이 완료조건이다.
- **런타임 / HIGH `OBS-NET-216-01` 02:05 KST 재현:** backend/frontend/backup timer/Economy AI service는 active이고 backup timer는 enabled다. Host-local canonical `https://woldeok.com/api/version`은 DNS 실패(`curl(6)`, HTTP 000)가 계속되며 loopback `127.0.0.1:3002/api/version`은 HTTP 200, backend id `75e69e77cdc18ef221106a008563151a4c790728`을 반환한다. 정상 application unit은 재시작하지 않는다. Resolver→authoritative DNS→독립 외부 2 vantage→TLS/SNI→HTTP/callback dependency 증명과 실제 alert 전달을 수용 gate로 유지한다.
- **모바일 보안 / 직접채택:** OWASP MASWE v1.0.0이 2026-08-17 stable로 출시되어 STORAGE/CRYPTO/AUTH/NETWORK/PLATFORM/CODE/RESILIENCE/PRIVACY 8개 범주에 78개 안정 ID를 제공하며 MASTG v2.0.0은 `MASVS control → MASWE weakness → MASTG test` 추적성을 제공한다. App API/mobile 릴리스 증거에 `MobileSecurityEvidence={platform,appVersion,buildSha,masvsControl,masweId,mastgTest,testResult,artifactRef,checkedAt}`를 추가한다. P1 최소 백로그는 로컬 token/session 안전저장, backup/screenshot/clipboard/privacy 유출, TLS/trust와 cleartext negative test, deep-link/intent/custom-scheme 권한, WebView/JS bridge와 exported component 노출, dependency/debuggable/log secret, root/jailbreak/tamper 잔여위험, 개인정보 최소수집이다. 모바일 클라이언트가 payment/entitlement/ledger/reward/bank/loan/stock/casino/admin mutation을 승인하는 권위가 되어서는 안 되며 서버 subject-resource-action authorization과 idempotency가 최종 권위다.
- **모바일 QA / 승격 gate:** 지원 Android/iOS build마다 exact app SHA + backend/API contract SHA를 매핑하고 인증 Test E2E로 login/logout/revocation, deep link, offline/retry, upload, payment/subscription callback, 경제 replay를 검증한다. MASWE-linked negative test는 debug가 아닌 release build에서 실행한다. Cleartext transport, 복구 가능한 secret/token 유출, exported privileged component/deep-link auth bypass, WebView bridge 권한탈출, revoked-session replay, cross-account/BOLA, duplicate economic mutation은 Production 차단이다. Rollback은 마지막 호환 app/backend/schema tuple을 사용하고 revoked session이나 stale entitlement를 되살리면 안 된다.
- **P0/P1 연속성:** `BAK-RUNTIME-177-01`은 최신 backup 격리 restore+reconciliation+실측 RPO/RTO+off-host immutable retention+실제 failure alert 전까지 P0 BLOCKED다. v236 AI/economy 권한봉쇄와 exact-main 인증 admin/mobile/migration-205 concurrency 검증도 P0/P1 후속으로 유지하며 Production `economy_auto_policy`는 기존 증거 gate 통과 전까지 disabled다.
- **SEO/광고 증거 신선도:** Google Search Central의 2026년 9월 최신 변경에는 지역별 Search experience eligibility와 Search profile 문서 추가가 유지된다. Rich-result 가능성을 전역으로 가정하지 않고 engine+market+feature eligibility를 버전화한다. 공개 SSR/ISR canonical/robots/sitemap/hreflang/화면일치와 crawler-family 분리를 유지하고 private/admin/security/transaction은 인증+noindex를 유지한다.
- **순서:** P0 restore + AI/economy 권한봉쇄 → HIGH DNS 증거 → P1 exact-main CI negative-control enforcement → P1 MASWE-linked mobile/App-API 보안증거 + 인증 Test QA → SEO/ad probe → 실측 commerce/growth. Planning-only; runtime/DNS/ledger/policy/Production DB 변경 없음.

## 회차 델타 — v2026.09.19.237 (2026-09-19)

### 01:05 v236 이후 권위·런타임·AI 보안 재대조
- **권위 / CI:** 시작 `main=bbb44cef...`; 필수 작업중간 재확인 중 PR #495가 merge되어 authoritative main이 exact `8fa2bc3a5f4eb067d4d71f5b84234d2b233799f6`(v236)으로 변경됐다. 따라서 stale-base patch를 유지하지 않고 새 exact main에서 v237을 다시 구성했다. Merge 전 main combined status는 0개였으므로 `CI-ENFORCE-204-01`은 P1 OPEN이다. exact-head required classifier/policy/runtime/security check와 의도적 실패 auth/economy/AI negative-control PR이 이름·만료·감사기록이 있는 bypass 없이는 merge되지 않는 증명이 필요하다.
- **v236 구현상태:** PR #495는 이제 후보가 아니라 merge된 구현이다. shadow-health evidence, DB 강제 profession-limit floor, configured/reachable/reviewed/blocked/stale/failed를 구분하는 관리자 AI 상태, mobile card, migration 205와 보고된 lint/typecheck/build, contract 23/23, DB 7/7, backend 1451/1451, frontend 629/629, PostgreSQL 17.11 migration 002–205를 현재 baseline으로 둔다. Production `economy_auto_policy`는 계속 disabled이며 merge 자체가 auto-write 권한을 주지 않는다.
- **런타임 / HIGH `OBS-NET-216-01` 01:05 KST 재현:** backend/frontend/backup timer/Economy AI service active, timer enabled, 직전 00:23:48, 다음 06:22:37 KST. Host-local `woldeok.com` DNS와 canonical HTTPS `/api/version`은 curl(6)/HTTP 000, loopback은 HTTP 200과 backend id `75e69e77cdc18ef221106a008563151a4c790728`. 정상 unit은 재시작하지 않는다. 수용조건은 resolver→authoritative DNS→외부 2 vantage→TLS/SNI→HTTP, vantage별 30회 연속 성공, false NXDOMAIN/SERVFAIL 0, callback dependency 성공, 실제 alert 전달이다.
- **P0 DR:** `BAK-RUNTIME-177-01` BLOCKED 유지. Timer/artifact 정상은 restore 증명이 아니다. 최신 backup 격리 decrypt+restore, migration/schema equality, identity/session/inventory/entitlement/ledger/reward/bank/loan/stock/casino/community/referral/audit reconciliation, 실측 RPO/RTO, off-host immutable retention, 실제 failure alert 전달 전 destructive schema/economy 승격 금지.
- **AI 보안 / 직접채택:** OWASP ASVS 5.0.0과 OWASP AISVS 1.0(최신 stable, 운영 시스템 최소 Level 2 권고)을 재확인했다. exact proposal/model/config SHA마다 `AiSecurityEvidence={modelId,modelDigest,promptPolicyVersion,inputClassification,outputSchemaValidated,toolOrWriteAuthority,proposalHash,reviewFreshness,failClosedTest,promptInjectionTest,sensitiveDataLeakTest,resourceBudgetTest,auditRef,checkedSha}`를 요구한다. AI 출력은 entitlement 부여, ledger balance 변경, auth/RBAC 변경, Production auto-policy 활성화를 직접 할 수 없다. Negative release test는 prompt/context injection, malformed/oversized output, stale/replayed proposal, model timeout/unavailability, sensitive-data exfiltration, cross-user evidence 혼합, write/tool 권한상승이다. 권한탈출·secret/PII 유출·미검토 경제 mutation·fail-open은 P0/P1 차단이다.
- **v236 후속 백로그:** exact merged main으로 인증 Test 관리자 E2E(AI status/auto-policy/member-access/mobile card), production-like snapshot migration-205 upgrade+rollback, concurrent profession-assignment DB-floor, scheduler idempotency와 stale/failed/reachable 상태 진실성, 360/390px touch-target 회귀, shadow-evidence→policy-apply 권한경로 부재를 증명한다. Exact tested SHA만 Test→Production 승격하며 rollback은 feature/policy flag 비활성화와 검증된 app/schema 호환 pair를 사용한다.
- **SEO/광고:** Google은 2026-09-17 `Mediapartners-Google`을 여러 광고 관련 제품 범위로 일반화했다. crawler family는 별도 버전화하고 공개 페이지는 SSR/ISR metadata/canonical/robots/sitemap/hreflang/화면일치 structured data를 유지한다. private/admin/security/transaction은 인증+noindex다. DNS는 SEO/광고 공통 release dependency다.
- **순서:** P0 restore + AI/economy 권한봉쇄 → HIGH DNS 증거 → exact-main Test/real-DB/admin-mobile v236 검증 → P1 CI negative-control enforcement → SEO/ad probe → 실측 commerce/growth. Planning-only; runtime/DNS/ledger/policy/Production DB 변경 없음.

## 회차 델타 — v2026.09.19.236 (2026-09-19)

### AI SHADOW health·적응형 제한 안전장치·모바일 관리자 구현
- **권위:** v235 감사 이후 exact `main=bbb44cef9c77260948806f4828a046bd5eef3526` 위로 재정렬했다. v235 감사를 즉시 운영 기준으로 유지하고 이번 회차에서 해당 AI health/관리자/mobile guardrail을 구현한다.
- **AI SHADOW health:** metric snapshot 이후 매일 `economy.ai_shadow_health`를 실행한다. 결정론 proposal이 부적격이어도 설정된 council 모델을 실제 호출할 수 있지만 결과는 별도 append-only `economy_ai_shadow_reviews`에만 기록한다. 권위 `economy_ai_policy_guard`는 SHADOW 증거를 읽지 않는다.
- **직업 제한 안전장치:** 기본 disabled `economy_job_limit_tightening` switch를 추가한다. 이 switch를 명시 활성화하지 않으면 음수 `jobs.assignment_daily_limit_delta.*`를 DB가 거부하며, 활성화해도 실제 task limit은 최소 2회/일을 보장한다. 운영 근거가 부족한 동안 완화 방향은 유지한다.
- **관리자 상태 정직화:** Economy AI 관리자 데이터에서 feature 설정, 모델 도달성, 권위 review, SHADOW review, 결정론 proposal 적격/차단사유, scheduler 결과를 분리한다. failed/stale/configured-but-unexercised 상태를 명시하고 prompt 본문·endpoint·secret은 노출하지 않는다.
- **모바일 관리자 UX:** AI agent 증거, 접속 추이, 활동 로그는 좁은 화면에서 stacked card를 사용하고 desktop에서는 표를 유지한다. 활동 필터는 모바일 전체폭으로 변경한다.
- **Test 전 검증:** backend AI/scheduler 18/18, frontend AI/mobile 5/5, 격리 PostgreSQL 17.11 migration 002–205 전체 적용 성공, DB-backed 경제/AI/관리자 회귀 24/24, 실패상태 DB 회귀 7/7, backend/frontend typecheck 통과. 전체 저장소 lint/build/parity/CI와 exact-SHA Test 배포는 계속 릴리스 gate다.
- **승격:** branch/main exact CI 통과, 병합 exact SHA의 격리 Test migration 205 적용, 정책 mutation 없는 AI SHADOW 증거, 인증 관리자/mobile QA를 확인하고 동일 SHA를 무중간 Production 절차로 승격해 공개/backend/data-integrity smoke까지 통과하기 전에는 v236을 운영 완료로 판정하지 않는다.

### v236 작업기록
상세는 `docs/worklog/2026-09-19-ai-mobile-admin-fix-v2026.09.19.236.ko.md`, 릴리스 노트는 `docs/releases/v2026.09.19.236.ko.md`를 따른다.

## 회차 델타 — v2026.09.19.235 (2026-09-19)

### AI 런타임·자동조절 범위·모바일 웹·관리자 화면 감사
- **권위/브랜치:** v234 문서 자동정리 merge 이후 exact GitHub `main=f44a87b`에서 격리 브랜치 `audit/ai-auto-mobile-admin-v2026.09.19.235`를 생성했다. 기존 주 checkout과 추적되지 않은 DB compose 파일은 reset/덮어쓰기하지 않았다.
- **AI 실제 작동 증거:** `moneyverse-economy-ai.service`가 active이며 로컬 Ollama에 `gemma3:1b`, `llama3.2:3b`가 있다. journal에는 2026-09-18 23:54 KST 실제 `POST /v1/chat/completions` HTTP 200 완료 기록이 있다. 운영 DB read-only 확인에서 `economy_ai_policy_review=enabled`, 2026-09-16 저장된 AI review 2건(8개 council evidence를 가진 multi-agent agree 1건, test-evidence veto 1건), 관리자 AI 상태 read model/API 존재를 확인했다.
- **자동조절 현재 상태:** 운영 `economy_auto_policy=disabled`. 현재 7일 proposal은 daily metric snapshot 3일, sample-sufficient day 0, 직업 assignment 0/최소 40으로 부적격이다. 최근 `economy.auto_policy` 주간 scheduler는 정상적으로 blocked 결과를 기록했고 정책을 적용하지 않았다. 이번 감사에서는 운영 knob/policy/ledger를 변경하지 않았다.
- **자동조절 범위 재검토:** 구현된 호환 계층은 8개 allowlist `jobs.assignment_daily_limit_delta.<profession>`만 사용하며 기준값 대비 `-1..+2`, 정책 주기당 최대 1 step, soft-control-first tightening, dual-AI high-risk review를 따른다. 운영 auto-write 활성화 전 7일 전체표본, 최소 표본/assignment, exact proposal hash의 최신 AI review, Test shadow/replay, reconciliation 정상, rollback proof를 모두 요구한다.
- **모바일 웹 실측(390×844 CSS px):** `/`, `/login`, `/admin`, `/admin/economy`에서 가로 overflow 없음(`scrollWidth=390`). 다만 44×44 모바일 권장보다 작은 터치 요소가 다수다: header logo 32×32, Sign in 65×36, menu 36×36, 로그인 input/action 높이 36px, footer link 높이 약 16px. 비로그인 모바일에서 admin route는 정상적으로 login으로 redirect한다.
- **관리자페이지 확인:** 경제 관리자 페이지는 `/api/v1/admin/economy/ai-status`를 요청하고 AI status card를 렌더하며, 백엔드는 `admin_economy_ai_status` 기반 guarded `GET admin/economy/ai-status`를 제공한다. 현재 브라우저는 관리자 로그인 세션이 없어 privileged card 실제 값까지 UI에서 확인할 수 없으므로 권한 포함 E2E는 Test 서버 필수 항목으로 둔다.
- **수정 우선순위:** P0 운영 auto-write는 data sufficiency + exact-proposal AI review + rollback gate 전까지 disabled 유지; P1 관리자 AI 카드에 scheduler freshness/staleness를 추가하고 model service health와 review freshness를 분리 표시; P1 모바일 터치 타깃/viewport regression 수정; P1 인증된 Test 관리자 E2E에서 AI status, auto-policy board, 회원 최근접속, 반응형 table/card를 검증; exact tested SHA만 Test→main→Production 무중간 승격 후 사후 probe한다.

### v235 작업기록
상세 내부 기록은 `docs/worklog/2026-09-19-ai-auto-mobile-admin-audit-v2026.09.19.235.ko.md`, GitHub용 변경내역은 `docs/releases/v2026.09.19.235.ko.md`를 따른다.

## 회차 델타 — v2026.09.18.232 (2026-09-18)

### 관리자 사용자 최근 접속 조회
- **구현:** 관리자 회원 목록에서 최근 활동, 마지막 로그인, 관리자 콘솔 접속을 독립 항목으로 표시한다. Asia/Seoul 기준 전체 날짜·시간을 표시하고 최근 접속 순 정렬을 지원한다.
- **권위 재확인:** 작업 시작·중간 GitHub `main=70fcc164fc6b8265975738a9af92ba35345d102c`; 양 권위 기획서는 v231이었고 구현 중 변경되지 않았다.
- **백엔드/데이터 재사용:** DB 스키마·원장 변경 없음. 기존 `activity_user_access_summaries` read model과 요청 활동 로그를 권위 데이터로 유지하며 운영 read-only 점검에서 실제 접속 요약 집계를 확인했다.
- **QA/Test:** 회원목록 집중 회귀 3/3, 프론트 타입체크, workspace contract + 프론트 production build, exact runtime commit `b82f6ca4554cbd81153c1a9aab840ac29556e673`의 격리 Test canary를 통과했다. Test 백엔드 관리자 라우트/가드도 활성 상태이며 비인증 요청을 401로 차단했다.
- **승격:** merge된 exact main이 Test→Production 릴리스 게이트와 운영 공개 사후 검증을 통과하기 전에는 운영 완료로 판정하지 않는다. 기존 Test/Production 서비스는 롤백 앵커로 유지한다.

### v232 작업 기록
브랜치 `feat/admin-user-last-access-v2026.09.18.232`; 상세는 `docs/worklog/2026-09-18-admin-user-last-access-v2026.09.18.232.ko.md`, 릴리스 노트는 `docs/releases/v2026.09.18.232.ko.md`를 따른다.

## 회차 델타 — v2026.09.18.231 (2026-09-18)

### 23:07 OWASP-2025 인증/세션 게이트 + 플랫폼 수수료 unit economics + 런타임/CI 재검증
- **레퍼런스 우선 / 직접채택:** 저장소·런타임 확인 전에 OWASP Top 10:2025/A07 Authentication Failures, Apple App Store Small Business Program/현행 Developer Program 약관, Google Play 현행 service-fee 가이드를 재조사했다. 2026-09-18 확인 출처: https://top10.owasp.org/2025/ ; https://top10.owasp.org/2025/A07_2025-Authentication_Failures/ ; https://developer.apple.com/app-store/small-business-program/ ; https://developer.apple.com/support/terms/apple-developer-program-license-agreement/ ; https://support.google.com/googleplay/android-developer/answer/112622 . 판정: 인증/세션 릴리스 증거는 session fixation/rotation, logout+idle+absolute 만료, JWT issuer/audience/scope, 고위험 관리자·경제행위 MFA/reauth, 계정열거 방지, credential-stuffing throttle+alert를 명시 검증한다. 상거래 예측은 15/30% 고정 수수료가 아니라 시장+스토어+설치 cohort+거래유형별 effective-dated 정책으로 계산한다.
- **권위 / 작업 중간 재확인:** 시작 GitHub `main=7a8563ae73f63e72cf860b515e78c44c05e4cfff`, 양 계획=v230이며 작업 중간에도 동일 exact main을 확인했다. 해당 SHA combined status는 `total_count=0`/pending이라 `CI-ENFORCE-204-01` P1 OPEN 유지. 로컬 주 checkout은 `HEAD=5f8f77a...`, `origin/main=7a8563a...`로 divergence가 있어 reset/덮어쓰기하지 않고 exact `origin/main` 격리 detached worktree에서 이번 문서 변경만 수행한다.
- **HIGH `OBS-NET-216-01` / 23:07 KST 재현:** backend/frontend/backup timer active, timer enabled. loopback `127.0.0.1:3002/api/version` HTTP 200, backend id `75e69e77cdc18ef221106a008563151a4c790728`; host-local `woldeok.com` DNS는 계속 실패하고 canonical HTTPS `/api/version`은 HTTP 000/curl(6)이다. 정상 app unit은 재시작하지 않는다. DNS를 사용자·OAuth/결제 callback·검색/광고 crawler 공통 릴리스 의존성으로 유지하고 resolver→authoritative NS/A/AAAA→UDP/TCP53→외부 2 vantage→TLS/SNI→HTTP 순으로 진단한다. 수용조건은 vantage별 30회 연속 성공, false NXDOMAIN/SERVFAIL 0, callback dependency 성공, 실제 alert 전달이다.
- **P0 인증/경제 보안 계약:** `AuthSecurityEvidence={loginSessionRotated,logoutRevoked,idleExpiryTested,absoluteExpiryTested,issuerChecked,audienceChecked,scopeChecked,mfaOrReauthPolicy,enumerationNegativeTest,stuffingThrottleTest,alertDelivered,checkedSha}`를 둔다. 관리자 고권한 작업, password/email/MFA 변경, payment/refund, entitlement mutation, WLD transfer/reward, bank/loan/stock/casino settlement는 위험도에 따라 recent-auth/step-up을 요구한다. session fixation, revoked-token replay, cross-account/BOLA, issuer/audience 미검증, 무제한 자동 로그인, 경제 mutation 중복, alert 전달 실패는 승격차단이다. unit claim validator, integration rotation/revocation, E2E multi-device logout/reauth, real-DB duplicate/replay/concurrency, security stuffing/enumeration, OAuth/mobile/API 회귀를 필수화한다. 롤백은 위험 feature flag를 끄고 last-known-good auth policy로 복귀하되 revoked session을 부활시키지 않는다.
- **상거래/unit economics 구체 델타:** effective-dated `PlatformFeePolicy{platform,storefront,program,installCohort,transactionType,billingRoute,serviceFeePct,billingFeePct,effectiveFrom,effectiveTo,source,verifiedAt}`와 order/refund 불변 `FeeSnapshot`을 도입한다. Apple Small Business 15%는 **조건부 참고값**이며 보편 수수료가 아니다. Google Play 현행 가이드는 subscription/non-recurring, first-$1M/program 자격, billing route 및 일부 시장의 install cohort에 따라 달라지므로 SKU별 `gross - tax - platform/service - billing - refundReserve - fraudLoss - variableInfra - support = contributionMargin`을 계산한다. 자격 미확인은 `HYPOTHESIS/BLOCKED FOR FORECAST`; 임의 기본값 금지. 관리자 가격 시뮬레이터는 활성화 전 base/conservative/optimistic 수수료·환불·전환 민감도를 표시한다.
- **전체기능 UX/SEO/운영 연결:** auth/profile/security-center/inventory/collection/shop/cart/payment/subscription/ad-removal/progression/business/bank/loan/stock/casino/community/social/notification/search/upload/public/App API/admin/audit/DR/analytics/ads/SEO/incident는 구현상태+근거, loading/empty/error/offline/timeout/permission, 반응형+a11y+i18n, subject-resource-action 권한, DTO allowlist, idempotency/rate/resource budget, DB constraint/index/transaction/concurrency, masked immutable audit, fallback/flag/DR/privacy/abuse, SEO/cache/performance, 분석+재무 KPI, unit/integration/E2E/real-DB/security/regression/exact-SHA 승격·롤백 gate를 유지한다. 공개 SEO는 stable canonical/hreflang/sitemap/화면일치 structured data를 서버 렌더링하고 account/admin/transaction/security/private-upload는 인증+noindex다.
- **사업/UX guardrail:** 실측 전 수익화 수치는 `HYPOTHESIS/TEST TARGET`. 기능/SKU별 gross/net revenue, contribution margin, ARPU/ARPDAU/ARPPU, attach/paid/subscription conversion, renewal/churn/refund, 광고 순효과, CAC/LTV/payback, D1/D7/D30, infra+support cost/user, fraud loss를 측정한다. `kill`: incremental contribution 음수 또는 fraud/refund/retention/fairness/trust 유의 악화; `iterate`: 수요 양수지만 guardrail/payback 미달; `scale`: incremental contribution 양수+payback 허용범위이며 D7/D30/support/latency/fairness 악화 없음. 숨은 갱신·강압적 FOMO·다크패턴·실제금융/도박 오인은 금지한다.

### v231 작업로그
외부 공식자료 조사 -> exact GitHub main/계획 + runtime/QA/CI 대조 -> 인증/세션·수수료정책 전체기능 델타 -> exact-main 중간 재확인 -> 한영 통합 반영. 우선순위는 P0 격리 restore proof+인증/경제 무결성 -> HIGH DNS/dependency 증거 -> P1 CI required-check negative control -> 실측 commerce/SEO/growth다. 기획 전용이며 runtime/DNS/ledger/Production DB는 변경하지 않았다.

## 회차 델타 — v2026.09.18.230 (2026-09-18)

### 23:00 지역별 검색 적격성 + 증거 신선도 + 런타임/CI 재검증
- **레퍼런스 우선 / 직접채택:** Google Search Central 문서 업데이트(2026-09-16 지역별 Search experience 적격성, 2026-09-08 Practice Problem Search appearance 제거), Google Crawling Infrastructure 변경로그(2026-09-17 `Mediapartners-Google` 범위), Naver Search Advisor 사이트 상태/robots/리소스·링크 가이드, OWASP ASVS 5.0.0을 재확인했다. 2026-09-18 확인 출처: https://developers.google.com/search/updates ; https://developers.google.com/crawling/docs/changelog ; https://searchadvisor.naver.com/guide/site-summary ; https://searchadvisor.naver.com/guide/markup-structure ; https://searchadvisor.naver.com/guide/resource-and-link ; https://owasp.org/projects/asvs . 판정: 검색 기능 적격성은 엔진+시장+정책버전별이며 구조화데이터 존재가 노출을 보장하지 않는다. crawler/site-status 증거에는 명시적 신선도를 두고 ASVS version-qualified requirement를 검증 기준선으로 유지한다.
- **권위 / 작업 중간 재확인:** 시작·중간 `origin/main=ba4c0545a93155f68d0a6ea61b30aa86c7d93955`; 양 canonical plan은 v229다. 이 exact main SHA의 GitHub combined status는 0개라 `CI-ENFORCE-204-01` P1 OPEN 유지. 완료조건은 exact-head required classifier/policy/runtime/security check와 의도적으로 실패시킨 auth/economy/SEO negative-control PR이 담당자·만료·감사기록이 있는 bypass 없이는 병합되지 않는 증거다.
- **HIGH `OBS-NET-216-01` / 23:00 KST 재현:** `moneyverse-backend.service`, `moneyverse-frontend.service`, `moneyverse-backup.timer` active, timer enabled, 다음 trigger는 2026-09-19 00:23:37 KST다. host-local `woldeok.com` DNS는 계속 실패하고 canonical HTTPS `/api/version`은 curl(6)/HTTP 000이나 loopback `127.0.0.1:3002/api/version`은 HTTP 200, backend id `75e69e77cdc18ef221106a008563151a4c790728`을 반환하며 직전 1시간 backend warning journal은 비어 있다. 정상 app unit을 재시작하지 않고 resolver -> authoritative NS/A/AAAA -> UDP/TCP 53 -> 외부 2 vantage -> TLS/SNI -> HTTP 순으로 진단한다. 승격은 독립 2 vantage 각각 DNS+TLS+HTTP 30회 연속 성공, false NXDOMAIN/SERVFAIL 0, auth/payment dependency resolution 및 실제 alert 전달을 요구한다.
- **P0 DR / BLOCKED:** timer 정상은 recoverability가 아니다. `BAK-RUNTIME-177-01`은 최신 backup의 격리 decrypt+restore, schema/migration equality, auth/session/inventory/entitlement/ledger/reward/bank/loan/stock/casino/community/referral/audit invariant reconciliation, RPO/RTO 실측, off-host immutable retention, 실제 failure alert 전달 전까지 destructive schema/economy 승격을 차단한다. 롤백은 last-known-good schema/app pair와 ledger reconciliation이며 정산된 경제 이력을 재작성하지 않는다.
- **SEO/SEO 백엔드 구체 델타:** `searchFeatureEligibility`를 `{engine,market,feature,pageType,policyVersion,eligible,reason,sourceUrl,verifiedAt,expiresAt}`, `SeoEvidence`를 `{source,observedAt,expectedRefreshAt,status,artifactRef}`로 확장한다. 지역별 aggregator/supplier/carousel 적격성과 폐기된 Search appearance는 데이터로 관리하고 UI에 하드코딩하지 않는다. Naver 사이트 상태는 약 1~2일 주기로 갱신되므로 실시간 배포 health가 아닌 비동기 보조증거로 취급하며 DNS/TLS/HTTP/render probe가 릴리스 gate다. 공개 profile/community/gallery/catalog/help/durable-search는 stable SSR/ISR URL, 고유 metadata/H1, self-canonical, robots, sitemap, hreflang, 지원되는 visible-content-parity JSON-LD, 실제 `href`를 유지한다. account/admin/transaction/security/private-upload는 인증+`noindex`다. stale eligibility policy, private indexability, 공개 non-200 render, canonical split, 필수리소스 차단, sitemap 실패, schema/화면 불일치, crawler/user material cloaking은 SEO 승격차단이다.
- **보안/QA + 전체기능 구현계약:** auth/profile/security-center/inventory/collection/shop/cart/payment/subscription/ad-removal/progression/business/bank/loan/stock/casino/community/social/notification/search/upload/public/App API/admin/audit/DR/analytics/ads/SEO/incident row는 구현상태와 코드/문서 근거, UX loading/empty/error/offline/permission 상태, subject-resource-action 권한, request/response DTO allowlist, idempotency/rate/resource budget, DB constraint/index/transaction/concurrency, immutable masked audit, fallback/feature flag/DR/privacy/abuse, SEO/cache/performance, 분석+재무 KPI, unit/integration/E2E/real-DB/security/regression/exact-SHA 승격/롤백 gate를 계속 가져야 한다. negative test는 cross-account ID, mass assignment, revoked-session replay, duplicate payment/reward/entitlement, quota race, SSRF/redirect escape, private crawler access, stale SEO-policy fixture를 포함한다. auth bypass, 타계정 노출, 순자산 중복, 복구불능 데이터 경로, private indexing, 통제되지 않은 경제 mutation은 신규기능보다 우선한다.
- **상거래/사업/UX:** shop/payment/subscription/ad-removal의 SKU/order/refund는 effective-dated market/cohort/billing policy와 gross/tax/platform+billing fee/refund reserve/fraud/infra-storage-CDN-notification-support 배부/net revenue/contribution margin immutable snapshot을 유지한다. revenue, net revenue, margin, ARPU, ARPDAU, ARPPU, conversion, retention, churn, refund, CAC, LTV, fraud, infra/support cost, SEO/ad uplift는 실측 전 `HYPOTHESIS/TEST TARGET`이다. `kill`: contribution margin 음수 또는 fraud/refund/D7-D30/support/fairness 유의 악화; `iterate`: 수요는 양수이나 guardrail/payback 미달; `scale`: incremental contribution margin 양수, CAC payback 허용범위, retention/fairness/latency/support 유의 악화 없음. 다크패턴·숨은 갱신·실제금융 오인·강압적 FOMO는 금지한다.

### v230 작업로그
레퍼런스 조사 -> exact-main/runtime/QA/CI 대조 -> 지역별 SEO/증거신선도/보안/수익성 델타 -> 작업 중간 exact-main 재확인 -> 한영 동기화 반영. 우선순위: P0 격리 restore proof -> HIGH DNS/dependency proof -> auth/economy negative controls -> P1 required-check enforcement -> engine/market SEO render probe -> 실측 commerce/growth. 기획 전용이며 runtime/DNS/ledger/Production DB는 변경하지 않았다.

## 회차 델타 — v2026.09.18.229 (2026-09-18)

### 22:06 DNS 릴리스 의존성 + 크롤러/SEO 증거 + CI negative-control 계약
- **레퍼런스 우선 / 직접채택:** 저장소·런타임 점검 전에 Google Crawling Infrastructure 변경로그(2026-09-17: `Mediapartners-Google`이 여러 광고 제품에 적용), Google Search Central 2026 업데이트/Breadcrumb 가이드, Naver Search Advisor robots·리소스/링크 가이드, OWASP ASVS 5.0.0을 재확인했다. 2026-09-18 확인 출처: https://developers.google.com/crawling/docs/changelog ; https://developers.google.com/search/updates ; https://developers.google.com/search/docs/appearance/structured-data/breadcrumb ; https://searchadvisor.naver.com/guide/resource-and-link ; https://searchadvisor.naver.com/guide/seo-basic-robots ; https://owasp.org/projects/asvs . 판정: crawler family는 관측/정책 입력일 뿐 인증수단이 아니며, 공개 리소스 crawl 가능성과 안정적인 실제 링크를 릴리스 요구사항으로 두고 ASVS 5.0을 보안 검증 기준선으로 유지한다.
- **권위 / 작업 중간 재확인:** 시작·중간 `origin/main=cdb4efb88da56358d41e39de37d096c9ad90a2e2`, 양 통합문서는 v228이었다. 해당 exact main SHA의 GitHub combined status는 0개라 `CI-ENFORCE-204-01` P1 OPEN 유지. 완료조건은 exact-head required check가 외부에서 보이고, 의도적으로 실패시킨 auth/economy/SEO negative-control PR이 거절되며, bypass는 담당자·만료시각·감사기록을 가져 조용히 gate를 만족시킬 수 없어야 한다.
- **HIGH `OBS-NET-216-01` / 22:06 KST 재현:** backend/frontend/backup timer는 active이고 다음 backup trigger는 2026-09-19 00:23:37 KST다. host-local `woldeok.com` DNS는 계속 실패하고 canonical HTTPS `/api/version`은 curl(6)/HTTP 000이나 loopback `127.0.0.1:3002/api/version`은 HTTP 200, backend `75e69e77cdc18ef221106a008563151a4c790728`을 반환한다. 직전 1시간 backend warning journal은 비어 있다. 이를 앱 프로세스 장애가 아니라 사용자 트래픽·OAuth/결제 callback·SEO·광고 crawler가 공유하는 DNS 의존성 장애로 취급한다. 정상 unit 재시작 금지. resolver -> authoritative NS/A/AAAA -> UDP/TCP 53 -> 외부 2 vantage -> TLS/SNI -> HTTP manifest 순으로 진단한다. 승격 수용조건은 독립 2 vantage 각각 DNS+TLS+HTTP 30회 연속 성공, false NXDOMAIN/SERVFAIL 0, auth/payment dependency resolution 성공, 실제 alert 전달이다.
- **P0 DR / 릴리스 차단:** `BAK-RUNTIME-177-01` BLOCKED 유지. active timer나 정상 encrypted archive는 restore 증거가 아니다. 최신 backup decrypt -> 격리 restore -> schema/migration equality -> auth/session/inventory/entitlement/ledger/reward/bank/loan/stock/casino/community/referral/audit invariant reconciliation -> RPO/RTO 실측 -> off-host immutable retention 증거 -> 실제 failure alert 전달 순으로 증명한다. 이 증거 전 destructive schema/economy 승격을 차단한다.
- **SEO/SEO 백엔드 구현:** v227-v228의 `SeoDocument`/crawler-policy 증거에 `availabilityEvidence={dnsOk,tlsOk,httpStatus,renderedAt,vantage}`와 `crawlerPolicyFamily={search,ads,userTriggered,unknown}`를 결합한다. 공개 URL index eligibility는 DNS/TLS 도달성과 server-rendered 핵심 콘텐츠를 모두 요구하며 `canonical`, robots meta, hreflang, Breadcrumb JSON-LD, sitemap `lastmod`는 동일한 서버 권위 read model에서 생성한다. 계정/관리자/거래/보안센터/비공개 업로드는 인증을 적용하고 강제 `noindex`; robots.txt로 비밀정보를 보호하지 않는다. `Mediapartners-Google`은 Search crawler와 별도 테스트한다. DNS 실패, private indexability, 공개 non-200 render, canonical split, 필수 리소스 차단, stale sitemap 증거, 화면/schema 불일치는 SEO 승격차단이다.
- **보안 + 전체기능 QA 계약:** auth/profile/security-center/inventory/collection/shop/cart/payment/subscription/ad-removal/progression/business/bank/loan/stock/casino/community/social/notification/search/upload/public/App API/admin/audit/DR/analytics/ads/SEO/incident의 모든 backlog는 구현상태/근거와 전체 UX 상태, RBAC/BOLA, DTO allowlist, API error/idempotency/rate/resource budget, DB constraint/index/transaction/concurrency, audit/observability, fallback/flag/DR/privacy/abuse, SEO, cache/performance, 분석/재무 KPI, unit/integration/E2E/real-DB/security/regression gate를 유지한다. 새 릴리스 증거에는 cross-account ID, mass assignment, replay, duplicate reward/entitlement, quota race, crawler/private-route negative test를 포함한다. auth bypass, 타계정 노출, 순자산 중복, 복구불능 데이터 경로, private indexing은 P0/P1로 신규기능보다 우선한다.
- **사업/UX guardrail:** DNS/SEO는 회복된 organic/ad availability와 CAC·지원비 손실 회피, 보안/DR/CI는 fraud/refund/downtime 손실 회피로 평가한다. 운영 실측 전 conversion, attach, ARPU/ARPDAU/ARPPU, CAC/LTV/payback, eCPM/fill/CTR, churn/refund, fraud/support/infra cost는 `HYPOTHESIS/TEST TARGET`이다. incremental contribution margin이 양수이고 D1/D7/D30·공정성·민원·latency·support·fraud가 유의하게 악화되지 않을 때만 수익화를 scale하며 아니면 iterate/kill한다. 다크패턴·숨은 자동갱신·실제금융 오인·강압적 FOMO는 금지한다.

### v229 작업로그
레퍼런스 조사 -> exact-main/runtime/CI 대조 -> DNS/SEO/보안/수익성/QA 상세 델타 -> 작업 중간 main 재확인 -> 한영 통합 반영 완료. 우선순위는 P0 격리 restore proof -> HIGH DNS/dependency proof -> auth/economy negative controls -> P1 required-check enforcement -> crawler-family SEO probes -> 실측 growth/commerce experiment. 기획 전용이며 runtime/DNS/ledger/Production DB는 변경하지 않았다.

## 회차 델타 — v2026.09.18.228 (2026-09-18)

### 21:08 브랜치 정합성 복구 및 유효 증거 보존
- **정합성 복구 / v227 고유 의도 보존:** 현재 v227 통합 이전 기준에서 독립 생성된 오래된 v227 기획 브랜치 두 개는 각각 CI를 통과했지만 main 진전 후 직접 병합할 수 없다. 현재 main에는 한국어 v225 복구와 공통 DNS/DR/인증/경제 통제가 이미 포함돼 있다. 남은 유효 델타를 여기서 권위 계약으로 보존한다. SEO/광고 크롤 정책은 `crawlerPolicyFamily={search,ads,userTriggered,unknown}`와 엔진별 정책 버전을 분류해야 하며 `Mediapartners-Google`은 Google Search와 독립 평가한다. 크롤러 신원은 인증/RBAC/개인정보 보호를 우회할 수 없다. 렌더 증거는 `{url,httpStatus,rendered,title,canonical,robots,sitemapLastmod,breadcrumbSchema,hreflang,contentHash,checkedAt}`를 기록하고 비공개 페이지 색인 가능, 공개 페이지 non-200 렌더 회귀, canonical 분기, 오래된 sitemap 증거, 화면/스키마 불일치 시 승격을 차단한다.
- **릴리스 상태:** 이번 변경은 기획 정합성 복구만 수행한다. P0 격리 복구/복원 가능성 및 릴리스 신원, HIGH DNS 증거는 계속 승격 차단 조건이며 runtime/DNS/ledger/Production DB 변경을 허가하지 않는다.

### v228 작업 기록
오래된 v227 두 브랜치의 유효한 크롤러/증거 계약을 누락 없이 통합하고 이미 대체된 내용은 Git 이력으로 남겼다. 다음 순서: P0 격리 복구 증명 -> HIGH DNS/dependency 증거 -> 인증/경제 negative controls -> SEO crawler-family probes.

## 회차 델타 — v2026.09.18.227 (2026-09-18)

### 21:06 런타임/권위 + 크롤러 접근성 + API 악용예산 게이트
- **레퍼런스 우선 / 직접채택:** 저장소·런타임 점검 전에 Naver Search Advisor 리소스/링크·robots/meta 가이드와 OWASP API Security Top 10을 최신 확인했다. Naver는 렌더링에 필요한 리소스의 crawl 가능성과 실제 `href` 링크를 요구하며, robots.txt가 비공개 데이터의 접근통제가 될 수 없음을 명시하고 sitemap 및 페이지별 noindex를 안내한다. OWASP는 BOLA, broken authentication/property authorization, unrestricted resource consumption, sensitive-business-flow abuse를 API 릴리스 위험으로 유지한다. 2026-09-18 확인: https://searchadvisor.naver.com/guide/resource-and-link ; https://searchadvisor.naver.com/guide/seo-basic-robots ; https://searchadvisor.naver.com/guide/markup-structure ; https://devguide.owasp.org/en/07-training-education/07-api-top-ten/ .
- **권위 / 작업 중간 재확인:** 시작·중간 `origin/main=3cc021db869875fe44c5c8ee6638b1cd39a7ede7`; 양 통합문서는 v226 선언 상태였다. 현재 main commit status는 0개라 `CI-ENFORCE-204-01` P1 OPEN 유지. 완료는 단순 workflow 존재가 아니라 exact-head required check가 보이고, 의도적으로 실패시킨 negative-control PR이 감사·만료되는 bypass 없이는 merge 불가능함을 증명해야 한다.
- **HIGH `OBS-NET-216-01` / 21:06 KST 재현:** `moneyverse-backend.service`, `moneyverse-frontend.service`, `moneyverse-backup.timer` active, timer enabled, 다음 trigger 2026-09-19 00:23:37 KST. host-local `woldeok.com`은 여전히 resolve 실패, canonical HTTPS `/api/version`은 curl(6)/HTTP 000이나 loopback `127.0.0.1:3002/api/version`은 HTTP 200, `Cache-Control: no-store`, backend id `75e69e77cdc18ef221106a008563151a4c790728`; 직전 1시간 backend warning journal은 비어 있다. 정상 app unit 재시작 금지. resolver → authoritative A/AAAA/NS → UDP/TCP 53 → 외부 2 vantage → TLS/SNI → HTTP manifest 순으로 진단한다. 수용은 독립 2 vantage 각각 DNS+TLS+HTTP 30회 연속 성공, false NXDOMAIN/SERVFAIL 0, auth/payment dependency resolution, 실제 alert 전달이다. authoritative 변경은 TTL을 관찰하며 last-known-good record로 rollback한다.
- **P0 DR / BLOCKED:** runtime 정상과 암호화 artifact 검증은 recoverability 증거가 아니다. `BAK-RUNTIME-177-01`은 최신 backup을 격리환경에서 decrypt+restore하고 schema+migration set 및 auth/session/inventory/entitlement/ledger/reward/bank/loan/stock/casino/community/referral/audit invariant를 대조하며 RPO/RTO 실측, off-host immutable retention, 실제 failure alert를 증명할 때까지 destructive migration/economy 승격을 차단한다.
- **SEO 백엔드 / 구체 구현:** 서버 권위 `SeoDocument` read model `{url,locale,title,description,h1,canonical,indexDirective,updatedAt,image,structuredDataVersion}`과 `SeoRedirect{fromPath,toPath,status,createdAt,reason}`를 둔다. 공개 SSR/ISR은 client hydration 없이도 핵심 콘텐츠를 반환하고 canonical/robots/hreflang/JSON-LD/sitemap `lastmod`를 동일 read model에서 직렬화한다. 계정·관리자·거래·보안센터·비공개 업로드는 robots.txt와 별개로 인증을 적용하고 강제 `noindex`. `seo_render_probe`는 일반 UA와 문서화된 crawler UA를 모두 요청해 private 노출, 필수 JS/CSS 차단, canonical/robots 불일치, sitemap non-2xx, redirect loop, 미지원 structured data, 실질적 cloaking 차이를 승격차단한다. UGC는 moderation+최소 콘텐츠+stable slug 조건 후에만 index; filter/search/query variant는 기본 noindex하고 안정 collection URL로 canonical한다.
- **API/보안 / 구체 악용예산:** 모든 object/economy mutation에 `{authorizationPolicy,idempotencyScope,bodyBytes,pageMax,batchMax,timeoutMs,concurrencyMax,rateBucket,costOwner}`를 선언한다. read/write 전 subject-resource-action 권한검사, request/response DTO allowlist, payment/reward/inventory/bank/loan/referral mutation은 결과 hash와 함께 unique idempotency key를 저장한다. cross-account ID, mass assignment, replay, duplicate reward, pagination amplification, oversized upload/batch, quota race가 타계정 변경이나 순자산 생성을 못함을 negative test로 증명한다. auth bypass·타계정 정보노출·중복 entitlement/asset·무제한 경제 mutation은 HIGH/CRITICAL이며 Test→Production 승격차단이다.
- **수익성 / 비용귀속:** SEO는 `impression→visit→signup→activation→D7→D30→net revenue`의 organic CAC 절감, 보안/QA/DR은 fraud/refund/support/downtime 손실 회피로 평가한다. 실측 전 conversion, CAC/LTV, ARPU/ARPDAU/ARPPU, support/fraud/infra cost와 uplift는 `HYPOTHESIS/TEST TARGET`. incremental contribution margin이 양수이고 D7/D30·민원·fraud·공정성·latency·support guardrail이 악화되지 않을 때만 scale한다.
- **전체기능 backlog 계약:** auth/profile/security-center/inventory/collection/shop/cart/payment/subscription/ad-removal/progression/business/bank/loan/stock/casino/community/social/notification/search/upload/public/App API/admin/audit/DR/analytics/ads/SEO/incident 항목은 구현근거/상태, 전체 UX 상태, RBAC/BOLA, API/error/idempotency/rate limit, DB constraint/index/transaction/concurrency, audit/observability, feature flag/fallback/DR/privacy/abuse, SEO, performance/cache, 분석+재무 KPI, unit/integration/E2E/real-DB/security/regression, exact-SHA Test→main→Production smoke/rollback gate를 계속 필수로 가진다. 증거가 없으면 `UNIMPLEMENTED/PARTIAL/REDESIGN`이며 완료로 추정하지 않는다.

### v227 작업로그
P0 격리 restore proof → HIGH DNS/dependency 증거 → HIGH auth/economy abuse-budget negative control → P1 exact-SHA required-check enforcement → SEO read-model/render probe → 실측 acquisition/commerce experiment. 기획 전용이며 runtime code, DNS, Production DB는 변경하지 않았다.


## 회차 델타 — v2026.09.18.226 (2026-09-18)

### 19:08 권위/런타임 + 한영 동기화 + 커머스 정책 강화
- **레퍼런스 우선 / 직접채택:** Apple Small Business Program(자격 paid app/IAP 15%), Apple 2026 지역별 계약 변경, Google Play 2026 install cohort/transaction별 수수료, OWASP API Security Top 10을 먼저 재확인했다. 플랫폼 경제정책은 `{platform,storefront,market,installCohort,transactionType,programmeEnrollment,billingPath,effectiveAt}`로 effective-dated resolve하며 전역 수수료 상수는 금지한다. 정책 변경은 출처 URL/확인일, 4-eyes 승인, simulation, settlement immutable snapshot, 이미 정산된 주문을 재작성하지 않는 이전 정책버전 rollback을 요구한다.
- **저장소 권위 / P0 문서동기화 결함:** 시작·중간 `origin/main=4497b1fae9a968b4c80cc26f3262feb2bb86a929`(v225). 영문에는 v225 delta가 있으나 한국어는 header만 v225이고 해당 delta가 누락돼 실제 bilingual drift가 확인됐다. `DOC-SYNC-226-01`을 HIGH로 두고 두 문서의 current version과 회차 핵심결정이 동등해야 완료한다. CI는 version header 파싱, planning version bump 시 EN/KO 동시변경, 동일 cycle heading/version 존재를 검사하고 한쪽 delta 누락 시 PR을 실패시킨다.
- **런타임 증거 / HIGH `OBS-NET-216-01`:** canonical unit은 `moneyverse-backend.service`, `moneyverse-frontend.service`이며 둘 다 active/running. `moneyverse-backup.timer` active, 다음 trigger 2026-09-19 00:20:41 KST. host-local `woldeok.com`은 여전히 resolve되지 않고 canonical HTTPS `/api/version`은 curl(6)/HTTP 000이지만 loopback `127.0.0.1:3002/api/version`은 HTTP 200/no-store다. 직전 1시간 backend warning journal은 비어 있다. resolver→authoritative DNS→외부 vantage→TLS/SNI→HTTP 순으로 진단하며 정상 app unit 재시작은 금지한다. 수용조건은 독립 2 vantage 각각 DNS+TLS+HTTP 30회 연속 성공, false NXDOMAIN/SERVFAIL 0, auth/payment dependency resolution, 실제 alert 전달이다.
- **P0 DR:** 18:29:36→18:29:38 KST encrypted backup과 `database.dump`, `photos.tar.zst`, `manifest.txt` 검증은 OK다. 이는 artifact integrity일 뿐 recoverability 증거가 아니다. `BAK-RUNTIME-177-01`은 isolated decrypt/restore, schema+migration equality, auth/session/inventory/entitlement/ledger/reward/bank/loan/stock/casino/community/referral/audit reconciliation, 실측 RPO/RTO, off-host immutable retention, 실제 failure alert 전까지 BLOCKED다.
- **보안/API:** OWASP API Top 10의 BOLA, broken authentication, property authorization, resource consumption, sensitive-business-flow abuse를 전체 route에 적용한다. 모든 object route는 read/write 전에 subject/resource/action 권한검사, response DTO allowlist, request/page/upload/batch/work-unit/time/concurrency budget, payment/reward/inventory/bank/loan/referral mutation idempotency를 갖추고 cross-account ID, mass assignment, replay, reward duplication, quota bypass negative test를 통과해야 한다. 자산중복·타계정 접근·인증우회·무제한 경제 mutation은 HIGH/CRITICAL 승격차단이다.
- **커머스/사업 KPI:** SKU/order/refund마다 gross, tax, platform/service/billing fee, refund reserve, fraud loss allocation, infra/storage/CDN/notification/support allocation, net revenue, contribution margin을 snapshot한다. 실측 전 attach/paid conversion/repeat/renewal/churn/refund/ARPU/ARPDAU/ARPPU/CAC/LTV/payback/D1/D7/D30은 `HYPOTHESIS/TEST TARGET`이다. incremental contribution이 양수이면서 retention/fairness/complaint/fraud/support guardrail을 악화시키지 않을 때만 scale하고 아니면 iterate/kill한다.
- **전체기능 계약:** 기존 auth/profile/security-center/inventory/collection/shop/cart/payment/subscription/ad-removal/progression/business/bank/loan/stock/casino/community/social/notification/search/upload/public/App API/admin/audit/DR/analytics/ads/SEO/incident 명세는 계속 권위다. 각 backlog는 구현상태/근거, UX 상태, RBAC/BOLA, API+error+idempotency+rate limit, DB constraint/index/transaction/concurrency, audit/observability, fallback/flag/DR/privacy/abuse, SEO, performance/cache, 분석+재무 KPI, unit/integration/E2E/real-DB/security/regression, exact-SHA Test→main→Production smoke/rollback gate를 명시한다.

### v226 작업로그
P0 restore proof → HIGH 한영 문서동기화 + DNS/dependency 증거 → HIGH auth/economy negative control → P1 required-check enforcement → SEO render/crawler probe → 실측 commerce/growth experiment. 기획 전용이며 runtime code, DNS, Production DB는 변경하지 않는다.


## 회차 델타 — v2026.09.18.224 (2026-09-18)

### 18:07 권위/런타임 + 수수료 정책 + 인증 게이트
- **권위/조사:** OWASP Top 10:2025 A07, Apple Small Business Program, Google Play 2026 lower-fee 공식자료를 먼저 확인했다. 시작·중간 `origin/main`=`3346216bf035a6905c7212ead7b11e4ec8db1f31`; main combined status 0개로 `CI-ENFORCE-204-01` P1 OPEN 유지. 2026-09-18 확인: https://top10.owasp.org/2025/A07_2025-Authentication_Failures/ ; https://developer.apple.com/app-store/small-business-program/ ; https://support.google.com/googleplay/android-developer/answer/16954621 .
- **HIGH `OBS-NET-216-01` / 18:07 KST:** backend/frontend/backup timer active; host-local `woldeok.com` DNS 실패, canonical HTTPS `/api/version` curl(6)/000, loopback `127.0.0.1:3002/api/version` 200/no-store, backend `75e69e77cdc18ef221106a008563151a4c790728`. 최신 검증 backup 12:22:44→12:22:46 KST, 다음 18:29:25. 수용은 독립 2 vantage 각각 DNS+TLS+HTTP 30회 성공, false NXDOMAIN/SERVFAIL 0, auth/payment dependency resolution, 실제 alert 전달; TLS/HTTP 우회 금지.
- **P0 DR:** archive verify는 restore proof가 아니다. `BAK-RUNTIME-177-01`은 최신 archive isolated decrypt+restore, schema/migration equality, 경제/auth/audit reconciliation, 실측 RPO/RTO, off-host immutable retention, 실제 failure alert 전까지 destructive migration/economy 승격차단.
- **보안 / 직접채택:** A07에 따라 login/권한상승 session 회전, logout/reset/lock server-side revoke, issuer+audience+scope+expiry 검증, short-lived single-use recovery, admin/payment/entitlement/bank/loan 고영향 mutation re-auth/MFA, account+IP+device-risk rate limit와 credential-stuffing 탐지를 요구한다. fixed-session reuse, revoked-token replay, cross-audience token, expired recovery, MFA fallback bypass, credential-stuffing oracle 성공은 승격차단하며 raw credential/token 로그 금지.
- **수익화 / 정책엔진으로 직접채택:** Apple은 자격 Small Business Program paid app/IAP 15%를 현재 문서화하고 Google Play 2026 가이드는 market/program/install cohort/transaction type별 차등 수수료를 둔다. 전역 15%/30% 하드코딩 금지. 각 shop/payment/subscription 거래는 `platform,market,installCohort,transactionType,programmeEnrollment,billingPath,policyEffectiveAt,grossPrice,tax,platformFee,refundReserve,netRevenue,directCost,contributionMargin` snapshot. fee-policy 변경은 effective-date+four-eyes 승인+감사+simulation, settlement 후 불변. Receipt/webhook→order→ledger→entitlement는 server-authoritative+idempotent reconciliation하며 mismatch, duplicate entitlement, unsigned webhook, stale policy, 설명 안 되는 negative settlement variance는 승격차단.
- **사업성/전체기능:** 미실측 conversion/ARPU/ARPDAU/ARPPU/refund/churn/CAC/LTV/ad/support/fraud/infra는 `HYPOTHESIS/TEST TARGET`. SKU cohort는 positive contribution+D7/D30·공정성·민원·refund·fraud guardrail 통과 때만 scale. 모든 현재/계획 기능은 구현근거, UX/error/offline, RBAC/BOLA, API/idempotency/rate-limit, DB constraint/transaction/concurrency, audit/DR/privacy/abuse/SEO/KPI/performance/cache, unit/integration/E2E/real-DB/security/regression, exact-SHA release/rollback gate를 유지하며 증거 없으면 `UNIMPLEMENTED/PARTIAL/REDESIGN`.

### v224 작업로그
P0 restore proof+release identity → HIGH DNS/dependency 증거 → auth/session/economy negative control → fee-policy+settlement reconciliation → P1 CI enforcement proof → SEO probe → growth experiment. 기획 전용이며 runtime/DNS/Production DB는 변경하지 않는다.

## 회차 델타 — v2026.09.18.224 (2026-09-18)

### 18:02 권위/런타임 + 검색기능 적격성 + 의존성/커머스 게이트

- **증거 순서 / 권위:** 기획 전에 Google Search Central 업데이트, Naver Search Advisor, OWASP ASVS 5.0.0 backend communication, Google Play service-fee 최신 공식자료를 다시 조사했다. 시작 및 작업 중간 authoritative `main`은 `3346216bf035a6905c7212ead7b11e4ec8db1f31`이며 동기화된 v223을 포함한다. 2026-09-18 확인 출처: https://developers.google.com/search/updates, https://searchadvisor.naver.com/, https://searchadvisor.naver.com/guide/resource-and-link, https://owasp.org/projects/asvs, https://cornucopia.owasp.org/taxonomy/asvs-5.0/13-configuration/02-backend-communication-configuration, https://support.google.com/googleplay/android-developer/answer/112622.
- **P1 CI enforcement / OPEN:** 현재 main combined status는 0개다. 이는 commit-status 가시성만으로 enforcement를 증명할 수 없다는 증거이며 모든 ruleset 부재를 의미하지 않는다. `CI-ENFORCE-204-01` 완료에는 readable rules/protection, exact head SHA에 연결된 change-classifier + EN/KO docs-sync + runtime/API/DB/security required check, 의도적 실패 required check가 merge를 실제 차단하는 negative-control PR이 필요하다. Bypass는 actor/reason/expiry/audit를 필수로 한다.
- **HIGH `OBS-NET-216-01` / 18:02 KST 재현 / IN PROGRESS:** canonical Debian backend/frontend/backup timer는 `active`, timer는 `enabled`; host-local `woldeok.com`은 여전히 주소를 반환하지 않고 public HTTPS `/api/version`은 `curl(6)` 실패지만 loopback `127.0.0.1:3002/api/version`은 HTTP 200 + `Cache-Control: no-store`, backend id `75e69e77cdc18ef221106a008563151a4c790728`; 직전 1시간 backend warning journal은 없다. 최신 검증 backup은 12:22:44이고 다음 예정 trigger는 18:29:25이므로 아직 18:29 결과를 주장하지 않는다. canonical reachability, auth/payment dependency 증명, SEO crawl 증거가 불안정하므로 HIGH 유지. 수정/롤백/테스트/수용은 resolver→A/AAAA rcode/latency→UDP/TCP53→authoritative NS→외부 2 vantage→TLS/SNI→HTTP manifest; host-only 문제는 정상 앱 unit 재시작 없이 resolver/egress만 복구; authoritative 문제는 last-known-good DNS 복원+TTL 관찰; 2 vantage 각각 DNS+TLS+HTTP 30회 연속 성공, false NXDOMAIN/SERVFAIL 0, auth/payment resolution, 실제 alert 전달이 수용조건이다.
- **P0 DR + release identity:** `BAK-RUNTIME-177-01`은 계속 승격차단이다. artifact verify는 restore proof가 아니므로 최신 archive isolated decrypt+restore, schema/migration-set equality, identity/session/inventory/entitlement/ledger/reward/bank/loan/stock/casino/community/referral/audit reconciliation, 실측 RPO/RTO, off-host immutable retention, 실제 failure alert가 필요하다. `REL-AUTH-184-01`은 component별 source SHA, artifact digest, schema/migration/config revision, deployment ID, rollback identity를 요구한다. 두 게이트 전 destructive DB/economy 승격 금지.
- **SEO / structured-feature eligibility — 직접채택:** Naver Search Advisor는 FAQ 구조화 데이터 노출이 2026-07-08 종료됐다고 현재 공지하며 Google도 지원 Search appearance를 변경하고 rich result 노출을 보장하지 않는다. 따라서 structured data를 일반 ranking toggle이 아니라 engine/version별 eligibility output으로 취급한다. `searchFeatureEligibility(engine, feature, pageType, policyVersion, eligible, reason, verifiedAt)`를 추가하고 `structured-data serializer`는 현재 지원되고 화면의 visible content와 일치하는 schema만 출력한다. Help/FAQ는 rich-result markup이 비활성화돼도 semantic HTML과 crawlable link를 유지하며 검색기능 종료를 이유로 유용한 본문을 삭제하지 않는다. `seo_render_probe`가 current engine policy, canonical/robots/sitemap/hreflang parity와 stale/unsupported markup을 검사하고 실패 시 SEO 승격차단한다. SEO 관리자 화면은 policy version, validation error, last verified date, affected URL count를 표시한다. KPI는 organic impression→visit→signup→activation→D7/D30→revenue이고 rich-result 존재 자체는 보장 KPI가 아니다.
- **보안 / dependency contract — 직접채택(ASVS v5.0.0-13.2.1/2/4/5/6):** outbound OAuth/JWKS/payment/receipt/ads/notification/storage/SEO/analytics/internal-service client마다 필요한 경우 individual service identity, least privilege, destination allowlist, protocol+port, DNS/IP+redirect 재검증, connect/read/overall timeout, max concurrency, bounded jitter retry, idempotency, circuit state를 명세한다. 저장 telemetry는 `{class,hostHash,result,rcode/status,latencyMs,retryCount,circuitState}`처럼 비밀/PII 없는 값만 허용한다. Auth/payment/entitlement/reward/bank/admin은 fail-closed. Private/link-local SSRF, DNS rebinding, redirect escape, timeout/retry amplification, pool exhaustion, revoked/wrong-audience service token, duplicate economic mutation negative gate를 둔다. 경계 우회 또는 asset/payment/reward 중복 성공은 HIGH/CRITICAL 승격차단이다.
- **커머스/unit economics — 정책 버전 고정:** Google Play는 현재 발표된 EEA/UK/US install-cohort fee 모델과 global rollout 전 remaining markets를 구분한다. Pricing authority가 server-trusted `{market,effectiveDate,installCohort,transactionType,programme,billingPath,feePolicyVersion}`를 resolve하고 order/refund마다 gross/platformFee/billingFee/tax/refundReserve를 immutable snapshot한다. 모든 소모성/비소모성/구독/광고제거 SKU는 fraud, infra/CDN/storage/notification, moderation, support를 포함한 보수/기준/낙관 contribution model을 유지한다. 실측 전 revenue/net revenue/margin/ARPU/ARPDAU/ARPPU/conversion/attach/repeat/renewal/churn/refund/CAC/LTV/payback/fraud/D1/D7/D30은 `HYPOTHESIS/TEST TARGET`이다. Positive incremental contribution과 retention/fairness/trust/fraud/support guardrail을 동시에 만족할 때만 scale한다.
- **전체 기능 실행계약:** auth/OAuth/session/security-center, profile, inventory/collection, shop/cart/payment/subscription/ad-removal, progression/quest/job/reward, business/bank/loan, stocks/portfolio/alerts/comparison, casino/chance, community/comments/report/block, friends/clubs/invite/referral, notifications/search/gallery/upload/public content, App API, admin/audit, backup/restore, analytics/experiments, ads, SEO tooling, incident operations는 구현상태/근거, 진입/CTA/loading-empty-error-offline-timeout/복귀 상태, responsive/accessibility/i18n, RBAC/BOLA, request/response/error/idempotency/rate-limit, DB constraints/indexes/transactions/concurrency, audit/observability, feature flag/fallback/DR, privacy/abuse, SEO, 분석+재무 KPI, performance/cache, unit/integration/E2E/real-DB/security/regression, exact-SHA Test→main→Production smoke/rollback 계약을 유지한다.

### v224 worklog / 실행순서
P0 isolated restore proof + component release identity → HIGH DNS/dependency 진단 → outbound/auth/economic negative gate → P1 CI enforcement 증명 → versioned SEO feature eligibility/render probe → commerce 측정 및 growth backlog. 기획 전용 회차이며 runtime code, DNS configuration, Production DB는 변경하지 않는다.

## 회차 델타 — v2026.09.18.223 (2026-09-18)

### 17:00 권위/런타임 + 외부의존성 보안 + Naver AI 출처설명 거버넌스

- **증거 / 권위:** 저장소·런타임 기획 전에 Google Search Central, Naver Search Advisor, OWASP ASVS 5.0.0 최신 공식자료를 조사했다. 직전 v222 PR #478은 exact head `34ae49f828ef4732feccc3b694ba35322cf66327`, CI run `35318256654` `success`, mergeable 상태를 확인한 뒤 exact-head squash merge했다. 따라서 v223 시작 base는 `94a11fededc291ba8360a566e240838e90655eb8`이다. 최종 write/push 전 작업 중간 main도 같은 SHA여야 하며 이동 시 rebase+재검증한다.
- **P1 CI enforcement / OPEN:** main commit-status 가시성만으로 merge enforcement를 증명할 수 없다. v221은 combined status 0개였고 v222 CI는 PR head에서 성공했다. `CI-ENFORCE-204-01` 완료에는 실제 repository rules/protection 조회, change-classifier+docs-sync+runtime/API/DB/security required check, exact-SHA 연결, 의도적으로 실패한 required check가 merge를 차단하는 negative-control PR 증거가 필요하다. Emergency bypass는 명시적 담당자·시간제한·감사를 요구한다.
- **HIGH `OBS-NET-216-01` / 17:00 KST 재현 / IN PROGRESS:** canonical Debian의 backend/frontend/backup timer는 `active`, timer는 `enabled`; host-local `woldeok.com`은 주소가 없고 canonical HTTPS `/api/version`은 `curl(6)`이지만 `127.0.0.1:3002/api/version`은 HTTP 200 + `Cache-Control: no-store`, backend id `75e69e77cdc18ef221106a008563151a4c790728`; 직전 1시간 backend warning journal은 없다. 최신 검증 backup은 12:22:44→12:22:46 KST, 다음 trigger는 18:29:25다. 영향은 canonical reachability/dependency 증거이며 앱 프로세스 장애는 입증되지 않았다. 수용은 독립 2 vantage 각각 DNS+TLS+HTTP 30회 연속 성공, false NXDOMAIN/SERVFAIL 0, auth/payment dependency resolution, 실제 alert 전달이다. TLS 우회/insecure HTTP fallback 금지.
- **P0 DR / release authority:** archive verify는 restore proof가 아니므로 `BAK-RUNTIME-177-01`은 승격차단 유지. 최신 archive isolated decrypt+restore, schema/migration-set equality, identity/session/inventory/entitlement/ledger/reward/bank/loan/stock/casino/community/referral/audit reconciliation, 실측 RPO/RTO, off-host immutable retention, 실제 failure alert가 필요하다. `REL-AUTH-184-01`은 하나의 모호한 application SHA가 아니라 component source SHA, artifact digest, schema/migration/config revision, deployment ID, rollback identity를 요구한다.
- **보안 / dependency egress — 직접채택(OWASP ASVS 5.0.0 V13.2.4–V13.2.6):** 모든 backend outbound integration(OAuth issuer/JWKS, payment/receipt/webhook verification, ads, notification/email/Discord, object storage/CDN, SEO submission/verification, analytics, internal service)에 destination allowlist, protocol+port, DNS/IP 검증정책, connect/read/overall timeout, 최대 병렬연결, jitter 포함 bounded retry, idempotency 요구, circuit-breaker/fail-open-vs-fail-closed 결정, owner를 명시한다. 사용자 입력 URL을 raw egress destination으로 사용하지 않고 connect 전 resolve/validate, redirect 후 재검증하여 SSRF/DNS-rebinding escape를 막는다. Auth/payment/entitlement/reward/bank/admin은 fail-closed, analytics/telemetry만 명시적 bounded buffer/drop 정책을 허용한다. 로그는 secret/PII 없이 dependency class, sanitized host, result/rcode/status, latency, retry count, circuit state를 기록한다. Negative test는 disallowed host/port, private/link-local target, DNS rebinding, redirect escape, timeout storm, retry amplification, connection-pool exhaustion이다. 민감 경계 우회 또는 경제 mutation 중복 성공은 HIGH/CRITICAL 배포차단이다.
- **SEO / Naver AI 출처설명 거버넌스 — 직접채택:** Naver는 페이지 단위 `nosourceinfo`로 AI 자동 출처설명을 제외할 수 있음을 문서화한다. 이를 전역 기본값으로 쓰지 않는다. Server-owned SEO eligibility record에 `naverSourceDescriptionPolicy={allow|deny|review}`, `policyReason`, `contentOwner`, `editorialControl`, `reviewedAt`을 추가한다. Public first-party help/catalog/editorial은 publication+quality review 후에만 `allow`; private/account/admin/transaction은 인증보호+noindex이며 privacy를 `nosourceinfo`에 의존하지 않는다. 분쟁·법적 민감·editorial-control 낮은 sponsored/unreviewed UGC는 owner 결정 전 `deny/review` 가능. `seo_render_probe`는 robots meta와 authority 일치 및 redirect target 정책 보존을 검증한다. KPI는 organic impression→visit→signup→activation→D7/D30→revenue이며 출처설명 오표현/민원을 trust guardrail로 둔다. 순위 상승 효과는 가정하지 않는다.
- **수익화 / 전체 기능 실행계약:** 이번 회차에는 검증되지 않은 fee 변경을 채택하지 않는다. 기존 server-trusted market/effective-date/install-cohort/transaction/programme/billing-path/fee-policy snapshot과 SKU 보수/기준/낙관 contribution model을 유지한다. 모든 현재/계획 auth/profile/inventory/collection/shop/cart/payment/subscription/ad-removal/progression/business/bank/loan/stock/casino/community/social/referral/notification/search/upload/public/App API/admin/audit/DR/analytics/ads/SEO/incident 기능은 구현근거, UX 상태, RBAC/BOLA, API/error/idempotency/rate-limit, DB constraint/transaction/concurrency, audit/fallback/DR, privacy/abuse, KPI/cache/performance, unit/integration/E2E/real-DB/security/regression, exact-SHA Test→main→Production smoke/rollback gate를 유지한다. 미실측 재무/리텐션 수치는 `HYPOTHESIS/TEST TARGET`이다.

### v223 작업로그 / 실행순서
P0 isolated restore proof + component release identity → HIGH DNS/dependency 진단 → outbound allowlist/timeout/retry/SSRF negative control → auth/session/economy negative gate → P1 CI enforcement proof → SEO render/index/source-description 정책 → monetization/growth backlog. 기획 전용 회차로 runtime code, DNS 설정, Production DB는 변경하지 않는다.


## 회차 델타 — v2026.09.18.222 (2026-09-18)

### 16:10 최신 권위/런타임 + 인증·SEO 릴리스 게이트 정교화

- **증거 순서 완료:** Google Search Central, Naver Search Advisor 리소스/robots/사이트상태, OWASP Top 10:2025 A07·ASVS 5.0.0 최신 공식자료 조사 → exact `main`/두 기획서/CI → Debian 런타임 probe → 실행가능 delta → 작업 중간 `main` 재확인 → EN/KO 동기화. 2026-09-18 확인 출처: https://developers.google.com/search/updates, https://searchadvisor.naver.com/guide/resource-and-link, https://searchadvisor.naver.com/guide/seo-basic-robots, https://searchadvisor.naver.com/guide/site-summary, https://top10.owasp.org/2025/A07_2025-Authentication_Failures/, https://owasp.org/projects/asvs.
- **P1 CI 권위 / OPEN:** 시작·중간 `main`=`a622dadaaa68881ed38846ca1d7469d957c4afc2`(v221 동기화), combined status는 계속 **0개**다. 이는 commit-status enforcement 가시성 부재 증거이지 모든 repository rule 부재 증명은 아니다. `CI-ENFORCE-204-01`: change-classifier+docs-sync+runtime/API/DB/security check required, 감사되는 emergency bypass만 허용, 의도적 실패 required check가 merge를 막는 negative-control PR을 증명한다. 수용: exact-SHA check가 visible+required; 잘못된 ruleset만 rollback; bypass/direct-push/missing-context/check latency 관측.
- **HIGH `OBS-NET-216-01` / 16:10 KST 재현 / IN PROGRESS:** backend/frontend/backup timer active, timer enabled. Host-local `woldeok.com`은 주소 없음, canonical HTTPS `/api/version`은 `curl(6)`; loopback `127.0.0.1:3002/api/version`은 HTTP 200 + `Cache-Control: no-store`, backend id `75e69e77cdc18ef221106a008563151a4c790728`; 직전 1시간 warning journal 0건; 다음 backup 18:29:25 KST. 영향은 canonical reachability/dependency 증거이며 앱 프로세스 장애는 입증되지 않았다. Resolver config→A/AAAA rcode+latency→UDP/TCP53→authoritative NS→외부 2 vantage→TLS/SNI→HTTP component manifest 순으로 진단한다. Host-only면 앱 재시작 없이 resolver/egress 복구, authoritative면 promotion 동결→last-known-good DNS→TTL 관측→multi-network smoke. 수용: 두 vantage 각각 DNS+TLS+HTTP 30회 연속 성공, false NXDOMAIN/SERVFAIL 0, auth/payment dependency resolution, 실제 alert 전달. insecure HTTP/TLS 우회 금지.
- **P0 DR 승격차단 유지:** archive verify는 restore proof가 아니다. `BAK-RUNTIME-177-01`은 최신 archive isolated decrypt+restore, schema/migration-set equality, identity/session/inventory/entitlement/ledger/reward/bank/loan/stock/casino/community/referral/audit reconciliation, 실측 RPO/RTO, off-host immutable retention, 실제 failure alert가 완료조건이다. 증거 전 destructive migration/economy release 금지.
- **인증/세션 보안 — 직접채택:** OWASP Top 10:2025 A07은 취약 recovery, MFA 누락/무효, unsafe session-ID 노출, login 후 session ID 미회전, logout/idle session 미무효화, token scope/audience 미검증을 명시한다. Signup/login/OAuth/logout/security-center/admin은 인증·권한상승 시 session rotate, issuer/audience/scope/expiry 검증, logout/password-reset/account-lock 시 server-side revoke, browser session은 HttpOnly+Secure+SameSite cookie, account+IP/device-risk rate limit, single-use short-lived recovery, 민감 account/admin/economy action re-auth/MFA를 요구한다. Negative test: fixed-session reuse, revoked-token replay, cross-audience token, expired recovery token, credential stuffing, MFA fallback bypass. 성공하면 HIGH/CRITICAL 배포차단; raw token/secret 없이 actor/session hash/risk/result 감사로그.
- **SEO/SEO backend — 직접채택:** Google은 non-200 응답이 정상 JavaScript rendering 대상이 아닐 수 있음을 명시하고, Naver는 render-critical resource crawlability, root `robots.txt`의 유효 2xx text 응답, sitemap reachability, HTTPS/certificate health, unique title/description을 요구한다. `seo_render_probe`에 server response의 primary public content+crawlable `<a href>`, critical JS/CSS/image fetchability, robots MIME/status, sitemap 200, HTTPS redirect/certificate, canonical/hreflang/JSON-LD parity, 정확한 200/301/308/404/410을 검증한다. Private/account/admin/transaction은 인증보호+noindex+sitemap 제외이며 robots는 privacy boundary가 아니다. Private indexing, public accidental noindex, critical resource 차단, canonical drift, soft-404, sitemap non-200, mixed HTTP, crawler/user mismatch는 승격차단.
- **전체 기능 계약·사업성:** auth/profile/inventory/collection/shop/cart/payment/subscription/ad-removal/progression/business/bank/loan/stock/casino/community/social/referral/notification/search/upload/public/App API/admin/audit/DR/analytics/ads/SEO/incident 전 기능은 구현근거+UX 상태+RBAC/BOLA+API/error/idempotency/rate-limit+DB constraint/transaction/concurrency+audit/fallback/DR+privacy/abuse+KPI/performance/cache+unit/integration/E2E/real-DB/security/regression+exact-SHA Test→main→Production smoke/rollback을 유지한다. 미실측 revenue/net revenue/margin/ARPU/ARPDAU/ARPPU/conversion/retention/churn/refund/CAC/LTV/payback/fraud/infra/support/D1/D7/D30은 `HYPOTHESIS/TEST TARGET`; SKU unit economics는 market/cohort/fee/tax/refund 가정을 snapshot하고 positive contribution+fairness/privacy/retention/fraud guardrail 통과 시에만 scale한다.

### v222 작업로그 / 개발 순서
P0 restore proof+release identity → HIGH DNS/dependency proof → auth/session negative controls → CI enforcement proof → SEO render/index probe → monetization/feature backlog. 이번 회차는 문서만 변경하며 runtime code, DNS, Production DB는 건드리지 않는다.


## 회차 델타 — v2026.09.18.221 (2026-09-18)

### 16:00 권위·지속 DNS/DR·Naver SEO 렌더링·보안 추적성·수익성 갱신

- **권위 / CI — P1 OPEN:** 시작 및 작업 중간 authoritative `main`은 동기화된 v220을 포함한 `125f29cac0a2a1b2667db4b2b3857d13e80b0639`이다. Commit combined-status는 status 0개이고 integration의 branch-protection read는 403이므로 읽지 못한 rules를 추정하지 않는다. 완료조건은 rules/protection을 실제로 읽고 change-classifier/policy/runtime/security check를 required로 설정하며, 의도적으로 실패시킨 required check가 merge를 실제 차단하는 negative proof를 남기는 것이다. 데이터 마이그레이션 없음; 잘못된 ruleset만 롤백하고 direct-push/bypass, missing required context, check latency를 관측한다.
- **HIGH 네트워크/의존성 — `OBS-NET-216-01`, 16:00 KST 재현 / IN PROGRESS:** `moneyverse-backend`, `moneyverse-frontend`, `moneyverse-backup.timer`는 active이고 timer enabled다. Host-local `woldeok.com`은 계속 주소를 반환하지 않아 canonical HTTPS `/api/version`이 curl(6)으로 실패하지만 loopback `127.0.0.1:3002/api/version`은 HTTP 200 + `Cache-Control: no-store`, backend id `75e69e77cdc18ef221106a008563151a4c790728`을 반환하고 직전 1시간 warning journal은 비어 있다. Resolver config, A/AAAA rcode+latency, UDP/TCP53, authoritative NS, 독립 external vantage 2곳, TLS/SNI, HTTP component manifest를 수집한다. Host-only면 앱 재시작 없이 resolver/egress를 복구하고 authoritative 장애면 promotion 동결→last-known-good DNS 복원→TTL 관측→multi-network smoke를 수행한다. 수용조건은 두 vantage 각각 DNS+TLS+HTTP 30회 연속 성공, false NXDOMAIN/SERVFAIL 0건, auth/payment dependency resolution, 실제 alert 전달이다. TLS 우회/insecure HTTP fallback 금지, auth/payment는 fail-closed다.
- **P0 DR / release authority:** 최신 검증 scheduled backup은 12:22:44→12:22:46 KST의 encrypted archive, `database.dump`, `photos.tar.zst`, `manifest.txt`, 전체 verify OK이며 다음 timer는 18:29:25다. 검증은 복구 증명이 아니므로 `BAK-RUNTIME-177-01`은 P0 유지. 최신 archive isolated decrypt+restore, schema/migration-set equality, identity/session/inventory/entitlement/ledger/reward/bank/loan/stock/casino/community/referral/audit reconciliation, 실측 RPO/RTO, off-host immutable retention, 실제 failure alert 전달이 완료조건이다. `REL-AUTH-184-01`도 component source SHA, artifact digest, migration/schema/config revision, rollback deployment identity를 요구한다.
- **SEO / SEO backend — 직접채택(Naver + Google):** Naver Search Advisor는 render-critical JS/resource 차단이 불완전한 문서 해석을 유발할 수 있음을 명시하고 JavaScript-only link 대신 crawlable `<a href>`를 권장하며, page-level `noindex`/`nofollow`와 HTTPS/certificate/sitemap reachability 진단을 제공한다. 하나의 server-owned SEO eligibility record에서 Google/Naver robots/meta/canonical/sitemap 정책을 생성하는 engine adapter를 둔다. Public profile/community/gallery/catalog/help/durable-search는 blocked critical asset 없이 primary content와 crawlable link가 렌더되어야 하고 private/account/admin/transaction 및 unstable cursor/facet은 noindex+sitemap 제외다. `seo_render_probe`는 HTML+critical-resource reachability, 실제 href discovery, HTTPS redirect/certificate, sitemap HTTP 200, canonical/hreflang/structured-data parity, 정확한 200/404/410/301/308을 검사한다. Redirect target에도 의도한 index policy를 적용한다. Private indexing, public accidental noindex, critical render resource 차단, sitemap non-200, mixed HTTP resource, canonical drift, crawler/user content mismatch는 SEO 승격차단이다.
- **보안 — 직접채택(OWASP ASVS 5.0.0):** backlog/test ID는 `v5.0.0-...`로 version pin한다. V13.2.1은 standard user-session 밖 backend component에 individual service account, short-lived token 또는 certificate를 요구하고 V13.2.2는 least privilege를 요구한다. Auth/profile/inventory/commerce/economy/bank/stock/casino/community/upload/admin threat row마다 공격전제→예방통제→탐지 telemetry→versioned ASVS/API requirement→negative test→잔여위험을 추적한다. Cross-account BOLA/BFLA, revoked-session replay, asset/payment/reward 중복, invalid webhook, privileged mass assignment, service-token issuer/audience/scope/expiry/revocation 우회, DB overreach, injection/upload/SSRF escape, secret/PII logging은 HIGH/CRITICAL 배포차단이다.
- **수익화 / 사업 guardrail:** 현행 Play billing-choice 문서는 EEA/UK의 new-install 경계를 2026-06-30으로 명시하는 등 cohort 규칙을 보편 수수료표와 분리한다. Pricing authority는 server-trusted `{market,effectiveDate,installCohort,transactionType,programme,billingPath,feePolicyVersion}`로 정책을 resolve하고 order/refund마다 gross/platform/billing/tax/refund를 snapshot하며 client locale로 eligibility를 정하지 않는다. 모든 consumable/non-consumable/subscription/ad-removal SKU는 fraud, infra, storage/CDN, notification, moderation, support를 포함한 보수/기준/낙관 contribution model을 유지한다. 미실측 revenue/net revenue/margin/ARPU/ARPDAU/ARPPU/conversion/retention/churn/refund/CAC/LTV/payback/fraud/D1/D7/D30은 `HYPOTHESIS/TEST TARGET`이며 positive contribution과 fairness/privacy/retention/support/fraud guardrail을 함께 통과할 때만 scale한다.
- **전체 기능 실행계약 / QA:** 기존 auth/signup/login/OAuth/logout/session/security-center; profile; inventory/collection; shop/cart/payment/subscription/ad-removal; season/quest/job/level/reward; business/bank/loan; stock/portfolio/alerts/comparison; casino; community/posts/comments/report/block; friends/clubs/invite/referral; notifications/search/gallery/upload/public content; App API; admin/audit; backup/restore; analytics/experiments; ads; SEO tooling; Discord/incident 계약은 구현근거, entry/CTA/loading-empty-error-offline-timeout/recovery, responsive+a11y+i18n, ownership/RBAC/BOLA, endpoint/schema/error/idempotency/rate-limit, DB constraint/transaction/concurrency, immutable audit/observability, admin/flag/fallback/DR, privacy/abuse, analytics+financial KPI, cache/performance, unit/integration/E2E/real-DB/security/regression, exact-SHA Test→main→Production smoke/rollback gate와 함께 계속 권위 계약이다.

### v221 작업로그 / 수용 순서
최신 Google/Naver Search + OWASP ASVS + Google Play 공식조사 → exact main/plans/status → canonical Debian runtime/DNS/version/timer/journal/backup 증거 → 실행 가능한 SEO/security/economics/QA delta → 작업 중간 exact-main 재확인 → EN/KO 동기화 → diff check → 독립 planning branch/PR/CI. 이번 기획 회차는 runtime code, DNS 설정, Production DB를 변경하지 않는다.


## 회차 델타 — v2026.09.18.220 (2026-09-18)

### 14:57 authority, persistent DNS/DR, SEO, security and economics refresh

- **Authority / CI — P1 OPEN:** authoritative `main` is `f125e4791f4757d3d432f470c569e4c72860fc70`, containing synchronized v219. Combined status has zero statuses and no PR-triggered workflow run is attached. This is commit-level evidence only; do not infer unread repository rules. Completion requires readable rules/protection, required classifier/policy/runtime/security checks, and negative proof that a deliberately failing required check blocks merge.
- **HIGH network/dependency — `OBS-NET-216-01`, reproduced 14:57 KST / IN PROGRESS:** backend/frontend/backup timer are active and timer enabled. Host-local `woldeok.com` resolution still fails and canonical HTTPS `/api/version` returns curl(6), while loopback `127.0.0.1:3002/api/version` is HTTP 200 + `Cache-Control: no-store`, backend `75e69e77cdc18ef221106a008563151a4c790728`; prior-hour warning journal is empty. Collect resolver config, A/AAAA+rcode+latency, UDP/TCP53, authoritative NS, two external vantages, TLS/SNI and HTTP manifest. Acceptance: 30 consecutive DNS+TLS+HTTP successes per two vantages, zero false NXDOMAIN/SERVFAIL, auth/payment dependency resolution and delivered alert. Never bypass TLS or restart healthy app units as a DNS workaround.
- **P0 DR / release authority:** latest verified backup remains 12:22:44→12:22:46 encrypted archive + `database.dump` + `photos.tar.zst` + `manifest.txt`; next trigger 18:29:25. `BAK-RUNTIME-177-01` stays P0 until isolated newest-archive decrypt+restore, schema/migration equality, identity/session/inventory/entitlement/ledger/reward/bank/loan/stock/casino/community/referral/audit reconciliation, measured RPO/RTO, off-host immutable retention and delivered failure alert. `REL-AUTH-184-01` requires component-scoped source SHAs, artifact digests, migration/schema/config revisions and rollback deployment.
- **SEO / SEO backend — DIRECT ADOPT:** current Google Search Central updates add Sep-16 Search profile badge, Sep-8 regional Search eligibility and Aug-28 site-reputation enforcement. Treat these as eligibility, never ranking guarantees. One server-owned record `{engine,market,locale,pageType,indexEligibility,canonicalOwner,contentOwner,editorialControl,sponsorType,schemaEligibility,lastVerifiedAt}` drives sitemap/robots/canonical/structured-data eligibility. Public profile/community/gallery/catalog/help/durable-search require publication+moderation+quality; private/account/admin/transaction and unstable facet/cursor URLs stay noindex/excluded. Third-party/sponsored low-control sections remain noindex until site-reputation review passes.
- **Security — DIRECT ADOPT (OWASP ASVS 5.0.0):** backlog/tests pin versioned identifiers (`v5.0.0-...`) to prevent requirement-number drift. V13.2.1/V13.2.2 require individual service accounts/short-lived tokens/certificates and least privilege outside the user-session mechanism. Each feature threat row links prerequisite→preventive control→detective telemetry→versioned requirement→negative test→residual risk. BOLA/BFLA, revoked-session replay, duplicate economic assets, invalid webhook, privileged mass assignment, service-token boundary bypass, DB overreach, injection/upload/SSRF escape or secret/PII logging blocks promotion.
- **Monetization / unit economics:** Google Play still separates updated EEA/UK/US cohorts from remaining markets before global rollout. Orders/refunds immutably snapshot `{market,effectiveDate,installCohort,transactionType,programme,billingPath,feePolicyVersion,gross,platformFee,billingFee,tax,refundReserve}`. All SKU scenarios include fraud, infra, storage/CDN, notification, moderation and support. Unmeasured revenue/net revenue/margin/ARPU/ARPDAU/ARPPU/conversion/retention/churn/refund/CAC/LTV/payback/fraud/D1/D7/D30 remain `HYPOTHESIS/TEST TARGET`; scale only with positive contribution and intact fairness/privacy/retention/support/fraud guardrails.
- **All-feature executable contract / QA:** existing auth, profile, inventory/collection, commerce, progression/economy, business/bank/loan, stock, casino, community/moderation, social/referral, notifications/search/upload/public content, App API, admin/audit, DR, analytics/experiments, ads, SEO and incident contracts remain authoritative with implementation evidence, UX states, RBAC/BOLA, API/error/idempotency/rate-limit, DB constraints/concurrency, audit/fallback/DR, privacy/abuse, KPI/cache/performance, unit/integration/E2E/real-DB/security/regression and exact-SHA Test→main→Production smoke/rollback gates.

### v220 worklog / acceptance order
Fresh Google Search + OWASP ASVS + Google Play official research → exact main/plans/status → Debian runtime/DNS/version/timer/journal/backup evidence → executable delta → mid-work exact-main recheck → synchronized EN/KO → diff check → isolated planning branch/PR/CI. No runtime code, DNS or Production DB change.

## 회차 델타 — v2026.09.18.219 (2026-09-18)

### 14:02 권위·지속 DNS/DR 증거·crawler/광고·보안·수익화 갱신

- **권위 / CI — P1 OPEN (14:02 KST 재현):** authoritative `main`은 동기화된 v218을 포함한 `ee40e59e6648cd2a0c03c6a04a14ec819f21d0d8`이다. Branch는 `protected=true`지만 required status checks는 `enforcement_level=off`, contexts/checks 0개이고 commit combined-status도 status 0개다. `CI-ENFORCE-204-01`은 P1/OPEN 유지. CI/release 담당은 change-class classifier + policy/runtime/security checks를 required로 만들고, 감사되는 emergency bypass 외 direct push를 금지하며, 의도적으로 실패시킨 required check가 실제 merge를 막는 negative proof를 남긴다. 데이터 마이그레이션 없음; 잘못된 ruleset만 롤백하며 bypass/direct-push, missing context, check latency를 관측한다.
- **HIGH 네트워크/의존성 — `OBS-NET-216-01`, 14:02 KST 재현 / IN PROGRESS:** canonical backend/frontend/backup timer는 active이고 timer enabled다. Host-local `getent ahosts woldeok.com`은 주소를 반환하지 않고 canonical HTTPS `/api/version`은 `curl (6)`으로 실패하지만 loopback `127.0.0.1:3002/api/version`은 HTTP 200 + `Cache-Control: no-store`, backend id `75e69e77cdc18ef221106a008563151a4c790728`을 반환하며 직전 1시간 backend warning journal은 비어 있다. 영향은 public evidence/외부의존성 신뢰성이지 application 장애 확정이 아니다. A/AAAA+rcode+latency, UDP/TCP 53, authoritative NS, 독립 external vantage 2곳, TLS/SNI, HTTP component manifest를 수집한다. Host-only면 runtime restart 없이 resolver/egress를 복구하고, authoritative 장애면 promotion 동결→last-known-good DNS 복원→TTL 관측→multi-network smoke를 수행한다. 수용조건은 두 독립 vantage 각각 DNS+TLS+HTTP 30회 연속 성공, false NXDOMAIN/SERVFAIL 0건, auth/payment dependency resolution, 실제 alert 전달이다. TLS 검증 우회/insecure HTTP fallback은 금지하며 auth/payment는 fail-closed, 비핵심 analytics만 bounded queue/drop 정책 아래 fail-open 가능하다.
- **P0 DR / release authority:** 최신 성공 백업은 12:22:44→12:22:46 encrypted archive + `database.dump` + `photos.tar.zst` + `manifest.txt` verify이며 다음 timer는 18:29:25다. `BAK-RUNTIME-177-01`은 archive verify가 restore 증명이 아니므로 P0/IN PROGRESS다. 최신 archive isolated decrypt+restore, schema/migration-set equality, identity/session/inventory/entitlement/ledger/reward/bank/loan/stock/casino/community/referral/audit reconciliation, 실측 RPO/RTO, off-host immutable retention, 실제 failure-alert 전달이 완료조건이다. `REL-AUTH-184-01`도 release metadata/runtime의 `{deploymentId,frontendSourceSha,backendSourceSha,frontendArtifactDigest,backendArtifactDigest,migrationSetHash,schemaVersion,configRevision,rollbackDeploymentId}` 일치 전 P0다. 불일치는 destructive schema/economy promotion을 차단하고 마지막 검증 deployment/restore point로 롤백 후 forward reconciliation한다.
- **SEO / crawler+광고 백엔드 — 직접채택(Google 2026-09-17까지 현행):** 최신 적용 가능한 Search Central 변경은 infinite-scroll 지침을 내용 변경 없이 문서로 이전했고, Crawling 문서는 `Mediapartners-Google`이 여러 광고 관련 Google 제품에 영향을 준다고 명확히 했다. Googlebot/Search indexing, Mediapartners/ad crawling, user-triggered fetcher를 `{engine,crawlerFamily,verifiedIdentity,productScope,routeTemplate,status,robotsDecision,canonicalTarget,contentEncoding,renderLatency,cacheResult}`로 분리하고 개인 query/body는 로그하지 않는다. Infinite-scroll 공개 feed는 안정적인 crawlable pagination URL/link를 제공하며 cursor-only client state를 index surface로 쓰지 않는다. Public profile/community/gallery/catalog/help/durable search landing은 publication+moderation+quality eligibility, SSR/ISR stable URL, unique title/meta/H1, self-canonical, robots/index, 의미 있는 sitemap `lastModified`, hreflang, breadcrumb/internal link, OG/Twitter, 지원되는 visible-content-parity JSON-LD, image metadata, 정확한 200/404/410/301/308을 유지한다. Private/account/admin/transaction 및 불안정 facet/cursor URL은 noindex+sitemap 제외. Private indexing, 의도치 않은 public deindex, crawler-family policy bleed, unsupported schema, canonical/SSR/cache divergence, render-critical asset 차단은 release blocker다.
- **광고 UX / 매출 무결성 — 직접채택(GPT 2026-09-18 현행):** Google Publisher Tag는 2026-09-08부터 bfcache 복귀 시 actively viewed slot을 자동 refresh한다. `pageshow.persisted`를 resume으로 취급하고 slot/listener 중복생성을 금지하며 provider impression ID reconciliation, analytics/revenue dedupe, consent/frequency-cap 보존, CLS 회귀검사를 수행한다. Duplicate revenue, consent drift, layout instability 또는 return-session abandonment가 나타나면 feature flag로 `AutoRefreshConfig.backForwardCache`를 끌 수 있다. 사업판정은 raw impression 증가가 아니라 `검증 incremental ad net revenue - 광고유발 abandonment/session/D1-D7 손실`이다.
- **보안 / 전체 기능 gate — 직접채택(OWASP ASVS 5.0):** V13.2.1/V13.2.2에 따라 user-session 밖 backend component는 individual service account, short-lived token 또는 certificate와 least privilege를 사용하며 privileged static/shared credential을 금지한다. Browser/session은 가능한 HttpOnly+Secure cookie와 적절한 SameSite, 짧은 access lifetime, refresh rotation을 사용하고 logout은 server session/refresh family 폐기 + app-managed browser storage 정리 + 민감 authenticated response `no-store`를 요구한다. Auth/profile/inventory/shop/payment/reward/bank/stock/casino/community/upload/admin mutation은 BOLA/BFLA, fresh re-auth, CSRF/XSS/SQLi/SSRF/path/command/upload 통제, server-authoritative price/value, idempotency/replay, transaction uniqueness/concurrency, immutable masked audit를 유지한다. Cross-account access, stale/revoked session, asset/payment 중복, webhook bypass, privileged mass assignment, service-token issuer/audience/scope/expiry/revocation 우회, DB-role overreach, secret/PII logging은 HIGH/CRITICAL 배포차단이다.
- **수익화 / unit economics / 성장:** 현행 Google Play는 EEA/UK/US updated fee cohort와 global rollout 전 remaining market을 분리하며, 적격 한국 alternative-billing 거래는 otherwise-applicable Play service fee에서 4 percentage points를 차감한다. Pricing authority는 order/refund마다 `{market,effectiveDate,installCohort,transactionType,programme,billingPath,feePolicyVersion,gross,platformFee,billingFee,tax,refundReserve}`를 immutable snapshot으로 저장하고 client locale로 eligibility를 추정하지 않는다. 모든 consumable/non-consumable/subscription/ad-removal SKU는 보수/기준/낙관 gross→platform/billing fee→tax/refund/fraud→infra/storage/CDN/notification/moderation/support→contribution margin, attach/repeat/renewal/cannibalization/discount sensitivity를 계산한다. 미실측 revenue/net revenue/gross+contribution margin/ARPU/ARPDAU/ARPPU/conversion/retention/churn/refund/CAC/LTV/payback/fraud/D1/D7/D30은 `HYPOTHESIS/TEST TARGET`이다. Positive contribution과 fairness/P2W/privacy/support/fraud/retention guardrail을 함께 통과할 때만 scale하고 아니면 iterate/kill한다.
- **전체 기능 실행계약 / QA:** auth/signup/login/OAuth/logout/session/security center; profile; inventory/collection; shop/cart/payment/subscription/ad-removal; season/quest/job/level/reward; business/bank/loan; stocks/portfolio/alerts/comparison; casino; community/posts/comments/report/block; friends/clubs/invite/referral; notifications/search/gallery/upload/public content; App API; admin/audit; backup/restore; analytics/experiments; ads; SEO backend/tooling; Discord/incident 전부 구현상태+code/doc evidence와 entry/CTA/loading-empty-error-offline-timeout/recovery, mobile/tablet/desktop+a11y+i18n, ownership/RBAC/BOLA, endpoint/method/schema/error/idempotency/rate-limit, DB PK/FK/unique/check/index/transaction/concurrency, immutable audit/observability, admin/flag/fallback/DR, privacy/abuse/security, SEO, analytics+financial KPI, cache/performance, unit/integration/E2E/real-DB/security/regression, exact-SHA Test→main→Production smoke/rollback 증거를 유지한다. 우선순위는 P0 DR→P0 release authority→HIGH DNS/dependency→real-DB/economy integrity→HIGH auth/payment/economy/service security→P1 CI enforcement→correctness→monetization→SEO/acquisition→retention/accessibility다.

### v219 작업로그 / 수용 순서
최신 Google Search/Crawling + GPT + OWASP ASVS + Google Play 공식조사 → exact main/protection/status와 동기화 문서 → Debian canonical runtime/DNS/version/timer/journal 증거 → issue/security/SEO/ads/economics/QA delta → 작업 중간 exact-main 재확인 → EN/KO 동기화 → diff check → 격리 planning branch/PR/CI. 이 기획 회차는 runtime code, DNS 설정, Production DB를 변경하지 않는다.

## 회차 델타 — v2026.09.18.218 (2026-09-18)

### 13:01 런타임/DR 증거·AI 검색 SEO·보안·사업성 갱신

- **권위 / CI — P1 OPEN:** 시작과 작업 중간 authoritative `main`은 모두 `5b31612050dcaa68dbdf34e762f345317b8ec2d8`이며 동기화된 v217을 포함한다. 현재 integration은 branch-protection 설정 읽기가 403이라 이번 회차는 보호 상태를 추정하지 않는다. 권위 main combined-status 자체는 status 0개이고 최신 main cleanup run `35302008438`은 skipped다. `CI-ENFORCE-204-01`은 repository rule을 읽을 수 있고 의도적으로 실패시킨 classifier/policy/runtime/security required check가 실제 merge를 차단하는 증거가 생길 때까지 OPEN이다. 증거는 main SHA/Actions run/combined status이며 담당은 CI/release engineering, rollback은 감사 가능한 emergency bypass를 포함한 ruleset revert뿐이다.
- **HIGH 네트워크/외부의존성 — `OBS-NET-216-01`, 13:01 KST 재현 / IN PROGRESS:** canonical `moneyverse-backend`, `moneyverse-frontend`, `moneyverse-backup.timer`는 active이고 timer enabled다. Host-local `getent ahosts woldeok.com`은 계속 주소를 반환하지 않고 public HTTPS `/api/version`은 `curl (6)`으로 실패하지만 loopback `127.0.0.1:3002/api/version`은 HTTP 200, `Cache-Control: no-store`, backend id `75e69e77cdc18ef221106a008563151a4c790728`이며 직전 1시간 warning journal은 비어 있다. 영향은 외부의존성/public evidence 신뢰성이지 애플리케이션 장애가 확정된 것은 아니다. Host와 독립 외부 resolver/vantage 2곳에서 A/AAAA/rcode/latency, authoritative NS, TCP/UDP 53, TLS/SNI, HTTP, component manifest를 기록한다. Host-only면 서비스 restart 없이 resolver/egress를 복구하고 authoritative 실패면 promotion 동결→last-known-good DNS 복구→TTL 실측→multi-network smoke를 수행한다. 수용조건은 독립 2곳에서 DNS+TLS+HTTP 30회 연속 성공, false NXDOMAIN/SERVFAIL 0, auth/payment provider resolution, 실제 alert 전달이다. TLS 검증 해제나 auth/payment의 insecure HTTP 전환은 금지한다.
- **P0 DR — `BAK-RUNTIME-177-01` / IN PROGRESS:** 새 scheduled backup이 실제로 12:22:44→12:22:46 KST 실행되어 encrypted archive와 `database.dump`, `photos.tar.zst`, `manifest.txt` 검증이 모두 성공했고 다음 timer는 18:29:25다. 이는 freshness 증거를 갱신하지만 restore 증거가 아니다. 완료에는 최신 archive isolated decrypt+restore, schema/migration-set equality, identity/session/inventory/entitlement/ledger/reward/bank/loan/stock/casino/community/referral/audit reconciliation, 실측 RPO/RTO, off-host immutable retention, 실제 failure-alert 전달이 필요하다. 불일치는 P0로 destructive migration/economy 승격을 차단하고 마지막 검증 restore point+forward reconciliation으로 rollback한다.
- **SEO / AI 검색 backend — 직접채택(Google 2026-09-18 현행):** Search Central은 `llms.txt`가 Google Search에 필요하지 않고 visibility/ranking에 긍정·부정 효과가 없으며 generative-AI 기능에도 기존 SEO best practice가 계속 적용된다고 명시한다. 따라서 Moneyverse는 `llms.txt` 순위 프로젝트나 별도 “GEO score”를 만들지 않는다. Public profile/community/gallery/catalog/help/search landing은 classic/generative Search 모두 같은 publication+moderation+quality 권위 read-model을 사용해 stable SSR/ISR URL, unique title/meta/H1, self-canonical, robots/index, sitemap+의미 있는 `lastModified`, hreflang, breadcrumb/internal link, OG/Twitter, 지원되는 visible-content-parity JSON-LD, image metadata, 정확한 200/404/410/301/308을 제공한다. SEO backend는 `{engine,pageType,indexEligibility,canonicalOwner,contentOwner,editorialControl,sponsorType,schemaEligibility,lastVerifiedAt}`를 기록하며 지원 종료 FAQ rich-result markup은 계속 비활성화한다. Third-party/sponsored/low-control content는 editorial/site-reputation eligibility 통과 전 noindex+sitemap/internal promotion 제외다. Private indexing, unsupported schema, canonical/SSR/cache divergence, crawler-blocked render asset, sitemap/robots drift는 승격 차단이다. KPI는 organic impression→CTR→visit→signup→activation→D7/D30→net revenue이며 AI feature traffic은 별도 cohort로 측정하고 incremental이라고 가정하지 않는다.
- **보안 / 전체 기능 gate — 직접채택(OWASP ASVS 5.0 V13.2.1/V13.2.2):** 일반 user session 밖 backend 통신은 individual service account, short-lived token 또는 certificate와 least privilege를 사용하며 privileged static/shared credential은 금지한다. Auth/session/profile/inventory/shop/payment/reward/bank/stock/casino/community/upload/admin mutation은 object/function authorization, 민감작업 fresh re-auth, CSRF/XSS/SQLi/SSRF/path/command/upload 통제, server-authoritative value, idempotency/replay 방지, transaction uniqueness/concurrency, immutable masked audit를 유지한다. Cross-account BOLA, privileged mass assignment, revoked-session 사용, entitlement/reward/payment 중복, invalid webhook, service-token issuer/audience/scope/expiry/revocation 우회, DB-role overreach, secret/PII log는 HIGH/CRITICAL 배포차단이다. Authorization denial, replay/duplicate key, service-auth 실패, 비정상 경제 mutation rate를 secret 없이 탐지·알림한다.
- **사업성 / UX / 성장 / QA:** Google Play는 현재 EEA/UK/US updated fee cohort와 global rollout 전 remaining market을 구분하므로 pricing authority는 단일 global rate를 hard-code하지 않고 주문/환불별 `{market,effectiveDate,installCohort,transactionType,programme,billingPath,feePolicyVersion,gross,platformFee,billingFee,tax,refundReserve}`를 resolve+snapshot한다. 모든 consumable/non-consumable/subscription/ad-removal SKU는 fraud, infra, CDN/storage, notification, moderation, support까지 포함한 보수/기준/낙관 unit economics를 유지한다. 미실측 revenue/net revenue/gross+contribution margin/ARPU/ARPDAU/ARPPU/conversion/attach/repeat/renewal/churn/refund/CAC/LTV/payback/fraud/D1/D7/D30은 `HYPOTHESIS/TEST TARGET`이다. Contribution이 양수이고 retention/fairness/P2W/privacy/support/fraud guardrail을 만족할 때만 scale하고 아니면 iterate/kill한다. 모든 현재/계획 기능은 implementation+code evidence, UX states/responsive/a11y/i18n, RBAC, API/error/idempotency/rate-limit, DB constraint/transaction/concurrency, audit/admin/fallback/DR, privacy/abuse/SEO, analytics/financial KPI, cache/performance, unit/integration/E2E/real-DB/security/regression, exact-SHA deploy/rollback gate를 유지한다.

### v218 worklog / 수용 순서
Google Search/AI + OWASP ASVS + Google Play 최신 공식자료 → exact main/동기화 문서 → 최신 Actions/status와 Debian canonical runtime/DNS/backup 증거 → issue/security/SEO/economics/QA delta → 작업 중간 exact-main 재확인 → EN/KO 동기화 → diff check → isolated planning branch/PR/CI. 이 기획 회차는 runtime code, DNS 설정, Production DB를 변경하지 않는다.

## 회차 델타 — v2026.09.18.217 (2026-09-18)

### 12:04 권위·지속 DNS 증거·SEO 적격성·릴리스 게이트 갱신

- **권위 / CI — P1 OPEN:** 시작과 작업 중간 authoritative `main`은 모두 `b8480e0c969de63039f7a4bafdf7a3708717f6cb`이며 동기화된 v216을 포함한다. Main은 protected지만 required status checks는 `enforcement_level=off`, contexts/checks 0개이고 최신 main cleanup run은 skipped다. `CI-ENFORCE-204-01`은 P1/OPEN이다. 완료조건은 classifier+policy/runtime/security required gate, 감사 가능한 emergency bypass, 의도적으로 실패한 required check가 실제 merge를 차단하는 증거다.
- **HIGH 관측성/네트워크 — `OBS-NET-216-01` 12:05 KST 재현 / IN PROGRESS:** canonical backend/frontend/backup timer는 active, timer enabled, 마지막 trigger 06:26:17, 다음 12:22:24이며 직전 1시간 backend warning journal은 비어 있다. 권한 있는 Debian host는 `/etc/resolv.conf`에 `1.1.1.1`, `8.8.8.8`을 명시했는데도 `woldeok.com`을 계속 resolve하지 못해 이 evidence path에서는 fresh HTTPS `/api/version`을 확립할 수 없다. Host/network DNS 가설은 강화되지만 public DNS나 애플리케이션 장애를 증명하지는 않는다. Infra backlog는 UDP/TCP 53 reachability와 `dig @1.1.1.1`/`@8.8.8.8`, authoritative NS 및 독립 외부 resolver를 비교한 뒤 TLS/SNI와 `/api/version`을 검사한다. Host-only 실패면 runtime restart 없이 resolver/egress를 복구하고 service-unaffected로 닫으며, public authoritative 실패면 promotion 동결→last-known-good DNS 복구→TTL 전파 실측→다중 네트워크 smoke를 수행한다. Resolver success ratio, DNS latency/NXDOMAIN/SERVFAIL, TLS/version probe를 관측하고 독립 외부 2개 probe가 의도한 deployment identity를 확인하지 못하면 승격을 차단한다.
- **P0 DR / release authority:** `REL-AUTH-184-01`은 immutable `{deploymentId,frontendSourceSha,backendSourceSha,frontendArtifactDigest,backendArtifactDigest,migrationSetHash,schemaVersion,configRevision,rollbackDeploymentId}`가 release metadata/runtime/version API에서 일치할 때까지 P0다. `BAK-RUNTIME-177-01`은 최신 encrypted archive isolated restore, decrypt/checksum, schema+migration equality, identity/entitlement/ledger balance reconciliation, RPO/RTO 실측, off-host immutable retention, 실제 failure alert 전달 전까지 P0다. 증거 시점에는 12:22 backup이 아직 실행 전이므로 새 backup 성공을 주장하지 않는다.
- **SEO / SEO backend — 직접채택(Google + Naver 2026-09-18 현행):** Google은 2026-05-07부터 FAQ rich result를 Search에서 폐지했고 Naver Search Advisor도 2026-07-08 FAQ 구조화데이터 노출 종료를 공지했다. 따라서 Moneyverse는 노출을 위해 지원 종료된 FAQ markup을 계속 생성하지 않고 eligible schema registry에서 제거한다. 사용자에게 독립적으로 유용한 FAQ/help 본문은 index 가능하다. DiscussionForum/Profile/Breadcrumb 등 다른 schema도 엔진의 현행 지원과 visible-content/ownership/moderation eligibility를 통과할 때만 생성한다. Naver의 crawlable JS/CSS/render-critical resource, root robots, sitemap discovery 요구도 유지한다. SEO backend는 엔진별 `{schemaType,supportedFrom,supportedUntil,eligibility,lastVerifiedAt}`와 metadata/canonical/robots/split-sitemap/redirect/public-read-model serializer를 소유한다. CI는 Google/Naver render, canonical, robots, hreflang, sitemap, schema parity를 snapshot 검사한다. Unsupported schema, private indexing, critical asset crawler 차단, stale canonical, SSR/cache divergence는 SEO 승격 차단 조건이다. KPI는 impression→CTR→organic visit→signup→activation→D7/D30→net revenue다.
- **보안 / 전체 기능 gate — 직접채택(OWASP ASVS 5.0):** V13.2.1/V13.2.2에 따라 backend component 통신은 개별 service account, short-lived token 또는 certificate로 인증하고 least privilege를 적용한다. Auth/session/profile/inventory/shop/payment/reward/bank/stock/casino/community/upload/admin mutation은 object/function authorization, 민감 작업 fresh re-auth, CSRF/XSS/SQLi/SSRF/path/command/upload 통제, server-authoritative price/value, idempotency/replay 방지, transaction uniqueness/concurrency, immutable masked audit, anomaly detection을 유지한다. Cross-account BOLA, privileged mass assignment, stale/revoked session 사용, entitlement/reward/payment 중복, webhook signature 우회, service-token audience/scope/expiry/revocation 우회, DB-role overreach, secret/PII logging은 HIGH/CRITICAL이며 승격을 차단한다.
- **사업성 / UX / 성장 / QA:** 모든 shop/payment/subscription/ad-removal SKU는 market/effective-date/programme/billing-path fee snapshot을 immutable하게 유지하고 보수/기준/낙관 gross→platform/billing fee→tax/refund/fraud→infra/storage/CDN/notification/moderation/support→contribution margin을 계산한다. 미실측 revenue/net revenue/margin/ARPU/ARPDAU/ARPPU/conversion/attach/repeat/renewal/churn/refund/CAC/LTV/payback/fraud/D1/D7/D30은 `HYPOTHESIS/TEST TARGET`이다. 모든 현재/계획 기능은 status+code evidence, screen/CTA/loading-empty-error/offline-timeout/recovery, responsive/a11y/i18n, ownership/RBAC, API contract/error/idempotency/rate limit, DB index/constraint/transaction/concurrency, audit/admin/flag/fallback/DR, privacy/abuse, SEO, analytics/financial KPI, cache/performance, unit/integration/E2E/real-DB/security/regression gate와 exact-SHA rollback을 유지한다. P0/P1 integrity/security/release/DR이 monetization/growth보다 우선한다.

### v217 worklog / 수용 순서
Google Search + Naver Search Advisor + OWASP ASVS 최신 공식자료 → exact main/plan/protection/CI → Debian canonical runtime/DNS/version 증거 → 상세 issue/SEO/security/economics/QA delta → 작업 중간 exact-main 재확인 → EN/KO 동기화 → diff check → planning branch/PR/CI. 이 기획 회차는 runtime code와 Production DB를 변경하지 않는다.

## 회차 델타 — v2026.09.18.216 (2026-09-18)

### 11:04 권위·런타임 증거·네이버 SEO·보안·사업성 갱신

- **권위 / CI — P1 OPEN:** authoritative `main`은 `281dea15b828204508b75aec3ced4c9eb1b38bbb`이고 동기화된 v215를 포함한다. 작업 중간 재확인도 동일하다. Main은 protected지만 required status checks가 `enforcement_level=off`, contexts/checks 0개이고 최신 main cleanup workflow도 skipped다. 따라서 `CI-ENFORCE-204-01`은 P1/OPEN이다. 완료조건은 classifier+policy/runtime/security required gate, 감사 가능한 emergency bypass, 의도적으로 실패한 required check가 merge를 실제 차단하는 증거다.
- **P0 runtime / DR / release authority — 11:05 KST 재현:** canonical `moneyverse-backend`, `moneyverse-frontend`, `moneyverse-backup.timer`는 active, timer는 enabled, 마지막 trigger 06:26:17, 다음 trigger 12:22:24다. 직전 1시간 backend warning+ journal은 비어 있다. 다만 권한 있는 Debian host에서 fresh public `/api/version` probe 시 `woldeok.com` DNS resolve가 실패했다. 애플리케이션 장애로 단정하지 않고 `OBS-NET-216-01`을 **HIGH / IN PROGRESS** evidence-path/DNS 문제로 등록한다. Resolver lookup 후 서로 독립된 최소 2개 네트워크에서 HTTPS version probe를 재현하고 resolver, A/AAAA, TLS/SNI, HTTP status, component manifest를 기록한다. Probe host만 실패하면 host DNS를 복구하고 서비스 영향 없음으로 닫고, authoritative/public DNS도 실패하면 승격 동결→last-known-good DNS 복구→TTL 전파 확인→public smoke를 수행한다. `REL-AUTH-184-01`은 immutable deployment manifest `{deploymentId,frontendSourceSha,backendSourceSha,frontendArtifactDigest,backendArtifactDigest,migrationSetHash,schemaVersion,configRevision,rollbackDeploymentId}`가 runtime/API와 일치할 때까지 P0다. `BAK-RUNTIME-177-01`은 최신 archive isolated restore, checksum/decrypt, schema+migration equality, identity/entitlement/ledger reconciliation, RPO/RTO 실측, off-host immutable retention, 실제 failure-alert 전달 증거 전까지 P0다.
- **SEO / SEO backend — 직접채택(Google + Naver 2026-09-18 현행):** Google 9월 변경의 Search profile/regional feature는 eligibility로만 사용하며 순위 보장을 추정하지 않는다. 네이버는 JS/CSS 등 렌더링 필수 리소스가 robots/IP 차단되면 문서 분석이 달라질 수 있음을 명시하고, root `robots.txt`의 유효한 2xx text 응답과 sitemap 선언을 안내한다. 공개 profile/community/gallery/catalog/collection/durable search landing은 server-renderable stable URL, 고유 title/meta/H1, self-canonical, index/follow, sitemap+의미 있는 `lastModified`, breadcrumb/internal link, OG/Twitter, visible-content-parity 적격 JSON-LD, image dimensions/alt, hreflang, 올바른 200/404/410/301/308, crawler가 접근 가능한 render-critical asset을 요구한다. Private/account/security/admin/transaction은 인증으로 보호하고 강제 noindex+sitemap 제외하며 robots를 기밀성 통제로 사용하지 않는다. SEO backend는 PII query/body 없이 `{engine,crawlerFamily,routeTemplate,status,robotsDecision,canonicalTarget,renderAssetFailures,renderLatency,cacheResult}`를 수집하고 Google Search Console/Naver Search Advisor 상태 수집·알림을 소유한다. Naver `nosourceinfo`는 AI 출처설명에 대한 별도 editorial policy flag이며 noindex 대체물이 아니다. Private 노출, 의도치 않은 deindex, canonical/SSR/cache 불일치, render-critical asset 차단, sitemap/robots parse 실패는 release blocker다. KPI는 impression→CTR→organic visit→signup→activation→D7/D30→net revenue다.
- **보안 — 직접채택(OWASP ASVS 5.0.0):** ASVS 5.0.0이 최신 stable이며 참조는 버전을 고정한다. V13.2.1/V13.2.2에 따라 backend component는 privileged static/shared credential 대신 개별 service account, short-lived token 또는 certificate로 인증하고 least privilege를 적용한다. Auth/session/OAuth/security-center/payment/reward/bank/stock/casino/admin/upload gate는 BOLA/BFLA, CSRF, XSS/SQLi/SSRF/path/command injection, upload validation, replay/idempotency, credential stuffing/bot, service issuer/audience/expiry/scope/revocation, masked immutable audit를 포함한다. Logout/credential/role 변경은 session+refresh family를 폐기하고 민감 identity/payment/admin/high-value economy mutation은 fresh re-auth를 요구한다. Cross-user access, stale re-auth, reward/payment/webhook replay, privileged mass assignment, service-token boundary bypass, DB-role overreach, secret/PII logging은 HIGH/CRITICAL release blocker다.
- **전체 기능 실행계약 / QA:** auth/signup/login/OAuth/logout/session/security center; profile; inventory/collection; shop/cart/payment/subscription/ad-removal; season/quest/job/level/reward; business/bank/loan; stock/portfolio/alerts/comparison; casino; community/post/comment/report/block; friends/clubs/invite/referral; notifications/search/gallery/upload/public content; App API; admin/audit; backup/restore; analytics/experiments; ads; SEO tooling; Discord/incident 각각 구현상태+코드근거, screen/CTA/loading-empty-error-offline-timeout/recovery, mobile/tablet/desktop+a11y+i18n, ownership/RBAC, API request/response/error/idempotency/rate limit, DB constraint/index/transaction/concurrency, audit/observability/admin/flag/fallback/DR, privacy/abuse/security, SEO, analytics/financial KPI, cache/performance, unit/integration/E2E/real-DB/security/regression 수용조건, exact-SHA deploy/rollback을 유지한다. 새 backlog는 `OBS-NET-216-01`을 infra/DNS+release observability에, Naver asset-crawl parity를 frontend/SEO backend/CI에 연결한다.
- **사업성 / 성장 guardrail:** shop/payment/subscription SKU는 market/effective-date/programme/billing-path fee snapshot을 immutable하게 유지하고 보수/기준/낙관 gross→platform/billing fee→tax/refund/fraud→infra/storage/CDN/notification/moderation/support→contribution margin을 계산한다. 미실측 revenue/net revenue/ARPU/ARPDAU/ARPPU/attach/repeat/renewal/churn/refund/CAC/LTV/payback/D1/D7/D30은 `HYPOTHESIS/TEST TARGET`이다. SEO는 organic→signup→activation→retention→net-revenue cohort가 개선될 때 organic CAC 절감으로 평가하고, security/DR/observability는 fraud/downtime/refund/support 손실 회피로 평가한다. Contribution과 retention이 fairness/P2W/privacy/support/fraud guardrail 안에서 함께 개선될 때만 scale하고 아니면 iterate/kill한다.

### v216 worklog / 수용 순서
Google Search + Naver Search Advisor + OWASP ASVS 최신 공식자료 → exact main/plan/protection/CI → Debian canonical runtime/timer/journal 및 public-version 증거 시도 → 이슈/증거 갱신 → 전체 기능 security/SEO/economics/QA delta → 작업 중간 exact-main 재확인 → EN/KO 동기화 → diff check → planning branch/PR/CI. 이 기획 회차는 runtime code와 Production DB를 변경하지 않는다.


## 회차 델타 — v2026.09.18.215 (2026-09-18)

### 10:00 권위·QA·보안·SEO·사업성 갱신

- **권위 / writer 안전:** PR #468 exact head `e5732a15cbb5f3ddfb24c596d724a7630154f58c`는 CI run `35293307722` 성공 및 `mergeable=true` 확인 후 exact-head squash 병합했다. 시작과 작업 중간 `main`은 `d87dfea356485a0b5a751a9c535e4414bf7317a2`, plan v214로 동일하다. 이번 회차는 격리된 `planning/v215-20260918-1000`에서만 작업하며 runtime/DB는 건드리지 않는다. Main은 protected지만 required checks가 강제되지 않고 contexts/checks가 비어 있어 `CI-ENFORCE-204-01`은 **P1 / OPEN**이다. 완료조건은 classifier + policy/runtime/security required checks, 감사 가능한 emergency bypass, 의도적으로 실패한 check가 merge를 실제 차단하는 증거다.
- **P0 runtime / DR / release authority — 10:00 KST 재현:** canonical unit `moneyverse-backend`, `moneyverse-frontend`, `moneyverse-backup.timer`는 active이고 timer는 enabled다. 06:26:17→06:26:19 백업은 encrypted archive, `database.dump`, `photos.tar.zst`, `manifest.txt` verify가 모두 OK이며 다음 trigger는 12:22:24다. Canonical HTTPS `/api/version`은 HTTP/2 200 + `Cache-Control: no-store`, backend identity `75e69e77cdc18ef221106a008563151a4c790728`이고 직전 1시간 backend warning+ journal은 비어 있다. v214 증거상 frontend는 persistent 3001의 v213 exact SHA `24b85df1e0e5f922e461b1dcea82ec291bf54e48`, backend는 변경되지 않았다. `REL-AUTH-184-01`은 component별 `{frontendSha,backendSha,imageDigest,migrationSetHash,deploymentId}`가 권위화될 때까지 P0다. `BAK-RUNTIME-177-01`은 최신 archive isolated restore, decrypt/checksum, schema+migration equality, 전체 state/economy reconciliation, RPO/RTO 실측, off-host immutable retention, 실제 failure alert 전달까지 P0/IN PROGRESS다.
- **QA 증거 정확성:** 폐기된 `woldeok-*` alias로 probe하면 정상 runtime을 inactive로 오판할 수 있다. 모든 운영 증거는 canonical unit inventory를 먼저 resolve하고 host, unit, PID/start time, listener, route/upstream, component SHA, timestamp, command/result를 기록한다. 폐기 alias 실패는 outage가 아니라 `EVIDENCE_INVALID`, canonical-unit failure만 CRITICAL/P0다. 기획 자동화는 서비스 start/restart/rollback을 수행하지 않는다.
- **보안 — 직접채택(OWASP ASVS 5.0.0):** OWASP 권고에 따라 security backlog/test의 ASVS 참조는 `v5.0.0-<requirement>`로 버전을 고정한다. Auth/session/OAuth/security-center/payment/reward/bank/stock/casino/admin/upload는 BOLA/BFLA, CSRF, XSS/SQLi/SSRF/path/command injection, file validation, replay/idempotency, brute-force/bot, service least privilege, immutable masked audit gate를 유지한다. Logout/credential/role 변경은 server session/refresh family를 폐기하고 민감한 identity/payment/admin/high-value economy write는 fresh re-auth를 요구한다. Cross-user access, stale re-auth, revoked-refresh replay, 경제 mutation 중복, invalid webhook, privileged mass assignment, service-token audience/scope bypass, unsafe outbound redirect 성공은 HIGH/CRITICAL release blocker다.
- **SEO / SEO backend — 직접채택(Google 2026-09-17까지 최신):** crawler family와 영향 제품을 분리하고 `Mediapartners-Google`이 여러 광고 제품에 영향을 준다는 최신 문서를 반영한다. 공개 profile/community/gallery/catalog/search landing은 durable server-renderable URL, stable title/H1/meta, self-canonical, 적격 schema, breadcrumb/internal link, OG/Twitter, image dimensions/alt, hreflang, 올바른 200/404/410/301/308, sitemap `lastModified`, SSR/ISR, CWV budget을 갖는다. Private/account/admin/transaction은 강제 noindex+sitemap 제외, cursor/facet/query는 검토된 durable landing이 아니면 index하지 않는다. SEO backend는 metadata/canonical, robots, split sitemap, redirect map, public SEO read-model, schema serializer, privacy-minimized crawler telemetry를 소유한다. gzip/br/plain render 및 canonical/robots/hreflang/schema parity, unintended deindex/private exposure는 release gate다. Sponsored/third-party UGC는 ownership/editorial-control/moderation/quality eligibility 확정 전 index promotion에서 제외한다. KPI는 impression→CTR→organic visit→signup→activation→D7/D30→net revenue다.
- **수익성 / unit economics — 직접채택(Google Play 2026-09-18 현행):** EEA/UK/US updated cohort fee와 remaining-market schedule은 별도 정책이다. 한국에는 applicable rollout 전 10/20/25% cohort 표를 선적용하지 않는다. Pricing authority는 주문별 `{market,effectiveDate,installCohort,transactionType,programme,billingPath,feePolicyVersion,gross,platformFee,billingFee,tax,refundReserve}` immutable snapshot을 남기고 entitlement와 분리한다. 모든 consumable/non-consumable/subscription/ad-removal SKU는 보수/기준/낙관 gross→fee/tax/refund→infra/storage/CDN/notification/moderation/support/fraud→contribution margin, attach/repeat/renewal/cannibalization, discount margin을 계산한다. 미실측 conversion, ARPU/ARPDAU/ARPPU, churn/refund, CAC/LTV/payback, D1/D7/D30은 `HYPOTHESIS/TEST TARGET`이다. Fraud/support/refund/fairness/P2W guardrail 안에서 contribution과 retention이 함께 개선될 때만 scale한다.
- **전체 기능 실행계약:** auth/signup/login/OAuth/logout/session/security center; profile; inventory/collection; shop/cart/payment/subscription/ad-removal; season/quest/job/level/reward; business/bank/loan; stocks/portfolio/alerts/comparison; casino; community/posts/comments/report/block; friends/clubs/invite/referral; notifications/search/gallery/upload/public content; App API; admin/audit; backup/restore; analytics/experiments; ads; SEO tooling; Discord/incident 전체는 구현상태+코드근거, screen/CTA/loading-empty-error-offline-timeout/recovery, responsive+a11y+i18n, ownership/RBAC, API schema/errors/idempotency/rate limit, DB constraints/transaction/concurrency, audit/observability/admin/flag/fallback/DR, privacy/abuse/security, SEO, analytics+financial KPI, cache/performance, unit/integration/E2E/real-DB/security/regression 수용조건, exact-SHA deploy/rollback을 유지한다. P0/P1 integrity/security/release/DR가 monetization·SEO/growth·UX 확장보다 우선한다.

### v215 worklog / 수용 순서
Google Search/Crawling + OWASP ASVS 5.0.0 + Google Play 최신 공식자료 → exact main/plan/protection/PR/CI → Debian canonical runtime/version/journal/backup 증거 → 전체 기능 QA/security/SEO/economics delta → 작업 중간 exact-main 재확인 → EN/KO 동기화 → diff check → planning PR/CI. 결정: ASVS 버전 고정, crawler/product 정책 분리, market/effective-date fee authority 유지, 폐기 unit probe는 invalid evidence로 분류. Runtime 배포/DB 변경 없음.

## 회차 델타 — v2026.09.18.214 (2026-09-18)

### v213 Test → Production 승격 증거 (문서 전용)

- **권위:** runtime 릴리스는 PR #467, CI #1279 / run `35292212685` 성공 후 생성된 v2026.09.18.213 exact main `24b85df1e0e5f922e461b1dcea82ec291bf54e48`을 유지한다. v214는 문서/증거만 변경하며 새 runtime 후보를 만들지 않는다.
- **Test 증거:** exact-main frontend release `/srv/moneyverse-data/releases/test-24b85df1e0e5-ui213`가 `moneyverse-test-ui-v213-main.service` port 3115에서 실행되고 Test Nginx frontend upstream이다. 공개 Test 핵심 route는 200이며 280/320/390px Chromium에서 responsive width, 상점 모바일 입력 16px, title 조합, Gallery CSP를 통과했다. `/data-deletion`의 일시적 `ERR_NETWORK_CHANGED` 1건은 280px에서 3회 재검증해 HTTP 200, viewport 일치, console/request 실패 0건이었다. Test backend PID `1282208`은 2026-09-17 21:55:39 KST부터 그대로 유지됐다. Test Nginx rollback backup은 `/etc/nginx/backups/moneyverse.before-v213-test-20260918-094530`이다.
- **Production 증거:** exact-main frontend release `/srv/moneyverse-data/releases/prod-24b85df1e0e5-ui213`를 먼저 3202 canary에서 검증하고 Nginx를 원자 전환한 뒤, 영구 `moneyverse-frontend.service` port 3001에 같은 exact release를 설치하고 Nginx를 3001로 복귀했다. 공개 핵심 route와 `/health`는 모두 200이다. Browser gate는 3202 canary에서 27/27, 영구 3001 전환 후 다시 27/27 통과했으며 280/320/390px에서 document overflow 0, brand title 중복 없음, 모바일 input 16px, relevant CSP 오류 0건이다.
- **무중단/롤백:** 이전 frontend `moneyverse-frontend-v196-canary.service` port 3201은 `/srv/moneyverse-data/releases/prod-75e69e77cdc1-v196/frontend`에서 계속 실행해 rollback anchor로 유지한다. Production Nginx backup은 `/etc/nginx/backups/moneyverse.before-v213-prod-20260918-094856`, `/etc/nginx/backups/moneyverse.before-v213-persistent-20260918-095200`, 영구 frontend drop-in backup은 `/etc/systemd/system/moneyverse-frontend.service.d/release.conf.before-v213-20260918-095145`이다.
- **Backend 연속성:** Production backend `moneyverse-backend-v196-canary.service` PID `1286971`, 시작 2026-09-17 22:01:38 KST는 재시작하지 않았다. 배포 후 frontend/backend warning journal은 0건이다. 공개 `/api/version`은 Nginx가 backend 3002로 라우팅하므로 의도적으로 backend identity `75e69e77...`을 반환하고, 3001 frontend direct `/api/version`은 exact runtime frontend `24b85df...`을 반환한다.

### v214 수용 조건
문서 전용 evidence branch → diff/CI → merge. v214 때문에 runtime을 다시 배포하지 않으며 Production runtime은 v213 exact SHA `24b85df1e0e5f922e461b1dcea82ec291bf54e48`을 유지한다.

## 회차 델타 — v2026.09.18.213 (2026-09-18)

### Test 게이트 AdSense iframe CSP 보완

- **발견:** v212를 실제 Test edge(`3114`)에 연결한 뒤 280px Chromium에서 반응형 수정은 통과했지만 AdSense iframe 2건이 추가로 차단됐다. `https://ep2.adtrafficquality.google/`, `https://www.google.com/`이 `frame-src`에 없어 거부됐다.
- **수정:** 광고 활성 `frame-src`에만 `https://adtrafficquality.google`, `https://*.adtrafficquality.google`, `https://www.google.com`을 추가한다. v212의 script/connect 정책은 유지하고 광고 비활성 모드는 계속 `frame-src 'none'`이다.
- **보안 근거:** Google은 AdSense 사용 도메인이 변할 수 있어 strict/nonce CSP를 권장한다. 이번 릴리스는 모든 frame에 `https:`를 허용하지 않고 exact Test에서 재현된 origin만 최소 허용한다. strict CSP 전환은 장기 계약으로 남긴다.
- **릴리스 게이트:** GitHub CI → merged-main exact Test edge에서 relevant CSP 오류 0건 + Test backend health → Production frontend canary 무중단 전환 순서를 지킨다. Production backend는 변경하지 않는다.

### v213 수용 순서
Test edge 재현 → 공식 AdSense CSP 지침 재확인 → 최소 frame-src 수정 → 타깃/전체 frontend QA → EN/KO 증거 → PR/CI → exact-main Test → Production canary → Nginx 원자 전환 → 운영 browser smoke.

## 회차 델타 — v2026.09.18.212 (2026-09-18)

### 전체 UI QA: 초소형 overflow, CSP, 모바일 입력 확대, title 조합 수정

- **정확한 기준/브랜치:** `fix/ui-full-qa-v2026.09.18.212`은 권위 main `d6d2798535894c54854135c23e37d972d267baa1` / plan v211 기준이다. 문서 반영 전 작업 중간 재확인에서도 main과 권위 기획서가 그대로임을 확인했다.
- **반응형 정확성:** v201 휴대폰 QA를 280px까지 확장했다. 삭제 요청·약관/개인정보 문서의 CSS grid min-content 확장을 수정하고 공통 `PageHeader`와 상점 page/search를 명시적으로 shrink 가능하게 했다. 상점 검색 입력은 휴대폰에서 16px을 유지해 focus 자동 확대를 막는다.
- **브라우저/보안 정확성:** Gallery에서 실제 재현된 AdSense 보조 스크립트 CSP 차단을 해결하기 위해 기존 광고 경로가 사용하는 검토된 `adtrafficquality.google` script origin만 추가했다. 광고 비활성 CSP는 계속 fail-closed다. 개별 page metadata에서 root title template와 중복되던 사이트명을 제거해 browser title 중복을 없앴고, 홈은 absolute brand title을 사용한다.
- **릴리스 전 QA 증거:** responsive/CSP/title 타깃 회귀 15/15, frontend typecheck, frontend 71개 파일/623개 테스트, Production frontend build가 통과했다. repository lint는 오류 0건이며 동적/사용자 미디어 경계의 의도된 `<img>` 경고 11건만 남는다. Chromium 280/320/390 타깃 재검증과 60 route × 5 width = 300회 전체 순회에서 확인 UI 결함은 0건이며 redirect 탐색 abort 3건은 개별 재실행 통과했다.
- **릴리스 안전:** backend, DB migration, ledger, entitlement, 인증 상태 동작은 변경하지 않는다. 병합 exact SHA를 Test에서 먼저 검증한 뒤 Production frontend만 무중단 승격하며 Production backend는 재시작하지 않고 이전 frontend release를 rollback anchor로 보존한다.

### v212 worklog / 수용 순서
권위 plan/main 재확인 → responsive/dialog/table 정적 감사 → current-main+Test-backend local canary → 300 browser 조합 → 확인 결함 수정+회귀 테스트 → 전체 frontend 검증 → 작업 중간 plan/main 재확인 → EN/KO 기록 → branch PR/CI → exact-SHA Test 공개 QA → 무중단 Production frontend cutover → 사후 증거 기록.

## 회차 델타 — v2026.09.18.211 (2026-09-18)

### 08:07 authoritative 재검증, v210 exact-head 승격, crawler/fetcher·세션·KR unit-economics 계약 강화

- **Exact main / CI / writer — 08:07 KST:** 직전 v210 PR #462의 exact head `76a706ae4329983fce58114af9eb898b7f0290f2`에 CI run `35285115954`가 success이고 PR mergeable=true임을 확인한 뒤 exact-head squash merge했다. 새 authoritative base는 `c451c393000342c7686d7a30fe11f7b8f84db390`; 별도 `planning/v211-20260918-0807` branch에서만 문서를 수정하며 기존 미추적 `backend/src/economy-ai/`는 손대거나 stage하지 않는다. Branch protection은 직전 authoritative read에서 protected=true이나 required checks enforcement=off/0 contexts이므로 `CI-ENFORCE-204-01`은 **P1 / OPEN**: classifier/policy/runtime/security required gate + audited bypass + deliberately-failing merge negative test가 완료조건이다.
- **P0 runtime/DR — 08:07 KST 재현:** Debian backend/frontend/backup timer active, timer enabled; last backup 06:26:17, next 12:22:15. Canonical HTTPS `/api/version`은 HTTP/2 200, `Cache-Control: no-store`, deployed application `75e69e77cdc18ef221106a008563151a4c790728`; 최근 1시간 warning+ backend journal은 0. 따라서 repository main과 Production application identity가 다르고 `REL-AUTH-184-01`은 P0, `BAK-RUNTIME-177-01`도 isolated restore→schema/migration/economic reconciliation→RPO/RTO→off-host immutable copy→실제 alert 전달 전까지 P0/IN PROGRESS다.
- **SEO/SEO backend crawler authority — DIRECT ADOPT:** Google의 2026-09-16 crawler 문서 재구성은 crawler와 user-triggered fetcher가 영향을 주는 제품, robots token, 지원 content-encoding을 명시한다. `Googlebot`/Search indexing, `Mediapartners-Google`/광고, `GoogleProducer` 등 user-triggered fetcher를 동일 bot으로 합치지 않는다. SEO backend에 `{crawlerFamily,verifiedIdentity,productScope,robotsDecision,contentEncoding,status,canonicalTarget,renderLatency,cacheResult}` telemetry를 두되 개인 query/body는 저장하지 않는다. gzip/br/지원 encoding별 SSR body parity, robots allow/disallow, 200/noindex/404/410/301/308, canonical/hreflang/sitemap/structured-data를 crawler-family별 회귀검사한다. 압축 variant가 빈 HTML·오래된 canonical·잘못된 robots를 내면 SEO release blocker다.
- **Security/session + service boundary — DIRECT ADOPT:** OWASP ASVS 5.0은 민감 계정속성 변경 전 full re-auth, re-auth 후 active-session 전체/개별 종료, 고위험 거래의 추가 인증을 요구한다. security center는 `GET /sessions`, `DELETE /sessions/:id`, `POST /sessions/revoke-all`을 소유하고 세션에는 opaque id/device label/createdAt/lastSeenAt/current flag만 노출하며 token/secret은 반환하지 않는다. revoke는 server-side 즉시 무효화 + refresh family replay 차단 + immutable masked audit + notification을 수행한다. 이메일/전화/MFA/recovery 변경, 관리자 권한, 결제수단/고액 경제 작업은 fresh-auth timestamp와 risk policy를 검증한다. BOLA로 타 사용자 session revoke, stale reauth, revoked refresh replay, concurrent revoke/use 성공은 HIGH deploy blocker다. Backend worker는 ASVS V13.2에 따라 개별 service identity/short-lived credential/least privilege를 유지한다.
- **Monetization/KR unit economics — DIRECT ADOPT:** Google Play 현행 remaining-market 정책상 global rollout 전 auto-renew subscription은 15%, 15% tier는 연 $1M까지 15%/초과 30%, 적격 KR alternative-billing 거래는 otherwise-applicable Play service fee에서 4 percentage points 감소한다. 이를 EEA/UK/US new/existing-install 표와 혼합하지 않는다. 주문 시 `feePolicyVersion`, market, eligibility/programme, billingPath, gross, platformFeeBasisPoints, billingFee, tax, refund reserve를 immutable snapshot으로 저장하고 entitlement는 결제수수료 계산과 분리한다. SKU별 base/optimistic/conservative contribution margin과 refund/fraud/support/infra 민감도를 계산하며 미실측 conversion/ARPU/LTV는 가설이다.
- **전체 기능 실행계약 / QA·성장:** auth/profile/security-center/inventory/collection/shop/cart/payment/subscription/ad-removal/progression/business/bank/loan/stocks/casino/community/social/notifications/search/gallery/upload/public content/App API/admin/audit/DR/analytics/experiments/ads/SEO/Discord/incident 전체는 기존 구현상태+코드근거와 screen states, RBAC/BOLA, API schema/errors/idempotency/rate-limit, DB constraints/transaction/concurrency, audit/fallback/privacy/abuse, SEO/KPI/cache/performance, unit/integration/E2E/real-DB/security/regression, exact-SHA Test→main→Production smoke/rollback 계약을 유지한다. 신규 수익화보다 P0/P1 무결성·권한·DR·release authority가 선행한다.

### v211 worklog / acceptance order
Google Search/Crawling + OWASP ASVS + Google Play 공식자료 → exact main/PR/CI → Debian services/version/journal/timer → 전체 기능 security/SEO/economics delta → 중간 main 재확인 → EN/KO 동기화 → diff/CI/PR.

## 회차 델타 — v2026.09.18.210 (2026-09-18)

### 08:03 authoritative 재검증, crawler/ad 분리, KR 대체결제 수익성, service-auth gate

- **Exact main / CI — 08:03 KST 재현:** 시작 및 작업 중간 authoritative `main`은 `2eb8f0065ae429c70b26a68c3def50611552a8b8`(v209)이다. branch는 `protected=true`지만 `required_status_checks.enforcement_level=off`, contexts/checks 0이므로 `CI-ENFORCE-204-01`은 **P1 / OPEN** 유지. 최신 main `Cleanup Merged Branches` run `35281873422`은 success이나 scheduled workflow health 증거일 뿐 merge enforcement 증거가 아니다. severity P1, 최초 v204, 최근 2026-09-18 08:03 재현. 수정대상은 GitHub ruleset/protection이며 change-class classifier + policy/runtime/security required checks, audited emergency bypass 외 direct push 금지, deliberately failing required check의 merge 차단을 negative acceptance로 요구한다. 데이터 migration 없음; 잘못된 rule만 rollback하고 bypass/direct-push/check latency/missing context를 감시한다.
- **P0 runtime / DR / release authority — 08:03 KST 재현:** Debian backend/frontend/backup timer active, timer enabled. 06:26:17→06:26:19 백업은 encrypted archive + `database.dump` + `photos.tar.zst` + `manifest.txt` verify OK, 다음 12:22:15. canonical HTTPS `/api/version` HTTP/2 200, `Cache-Control: no-store`, deployed application `75e69e77cdc18ef221106a008563151a4c790728`; sampled warning+ journal 0. `BAK-RUNTIME-177-01`은 생성/verify가 restore 증명이 아니므로 **P0 / IN PROGRESS**. 최신 archive isolated restore, decrypt/checksum, schema+migration-set equality, identity/session/inventory/entitlement/ledger/reward/bank/loan/stocks/casino/community/referral/audit reconciliation, RPO/RTO 실측, off-host immutable retention, missed-run/verify/replication/restore alert 실제 전달이 수용조건이다. `REL-AUTH-184-01`도 repo main != deployed application이므로 P0이며 immutable `{sourceSha,imageDigest,migrationSetHash,deploymentId}`, exact-SHA Test attestation, session/API/user-flow smoke, journal review, rollback manifest가 필요하다.
- **SEO + Ads crawler authority — DIRECT ADOPT (Google Crawling changelog 2026-09-17):** Google은 `Mediapartners-Google` 문서를 일반화해 이 user-agent 지시가 AdSense만이 아니라 여러 광고 관련 Google 제품에 영향을 준다고 명확히 했다. 이를 일반 Google Search indexing crawler로 분류하지 않는다. SEO/crawler backend는 `crawlerFamily`, 가능한 verified UA/IP classification, route template, status, robots decision, render latency, cache outcome을 저장하되 개인정보 query payload는 남기지 않는다. `robots.txt` 테스트는 Googlebot/indexing과 Mediapartners/ad crawling을 분리한다. 광고 crawler 차단이 공개 페이지 deindex를 유발하거나 Search noindex를 광고 consent 통제로 오인하면 안 된다. Admin crawler dashboard는 family별 2xx/3xx/4xx/5xx, blocked-rate, latency를 표시한다. 잘못된 family rule만 rollback하며 공개 deindex 또는 private/auth route 노출은 release blocker다.
- **Security / backend trust boundary — DIRECT ADOPT (OWASP ASVS 5.0 V13.2.1/V13.2.2):** 일반 사용자 session을 쓰지 않는 auth/payment/reward/bank/stock/casino/admin/background worker는 개별 service account, short-lived token 또는 certificate로 인증하고 privileged static password/API key/shared account를 금지하며 least privilege를 적용한다. Gateway/service middleware는 issuer/audience/expiry/scope/replay를 검증하고 rotation/revocation을 지원하며 secret을 log에 기록하지 않는다. HIGH negative test는 expired/wrong-audience/revoked credential, cross-service scope escalation, replay, missing identity, DB role overreach. 탐지는 masked principal/service/route/result/reason correlation event와 반복 실패 alert를 남긴다. 예방+negative test+alert 전달 전 승격 차단, 임시 예외에는 residual-risk owner 필수.
- **KR monetization correction / unit economics — DIRECT ADOPT (Google Play 현행 service-fee 정책):** updated global fee가 remaining markets에 적용되기 전 현행 schedule은 한국/인도의 alternative billing 거래에 otherwise-applicable Play service fee에서 **4 percentage points 차감**한다고 명시한다. 이를 EEA/UK/US 10%/20%/25% cohort table과 혼합하거나 universal processor discount로 취급하지 않는다. Pricing authority는 order 시 `{market,effectiveDate,installCohort,transactionType,programme,billingPath,feePolicyVersion,tax,refund}`를 확정 저장하고 entitlement는 fee 계산과 분리한다. 모든 shop SKU/subscription은 Play Billing과 eligible KR alternative billing 각각 gross→platform/billing→tax/refund→infra/support/fraud→contribution margin을 계산한다. 미실측 attach/conversion/ARPU/ARPDAU/ARPPU/renewal/churn/refund/CAC/LTV는 `HYPOTHESIS/TEST TARGET`; contribution margin 개선과 fraud/refund/support 및 D7/D30 guardrail을 동시에 통과해야 scale한다.
- **전체 기능 구현계약 / 실행 backlog:** auth/signup/login/OAuth/logout/session/security center; profile; inventory/collection; shop/cart/payment/subscription/ad-removal; season/quest/job/level/reward; business/bank/loan; stocks/portfolio/alerts/comparison; casino; community/posts/comments/report/block; friends/clubs/invite/referral; notifications/search/gallery/upload/public content; App API; admin/audit; backup/restore; analytics/experiments; ads; SEO backend/tooling; Discord/incident 전부 구현상태+코드/문서 근거와 목적/persona/entry/screens/CTA/loading-empty-error-offline-timeout/recovery, responsive+a11y+i18n, 알림연동, ownership/RBAC/BOLA, endpoint/method/schema/error/idempotency/rate-limit, service rule, DB PK/FK/unique/check/index/transaction/concurrency, immutable audit, admin/flag/fallback/DR, privacy/abuse/security residual risk, SEO, 분석+재무 KPI, cache/performance, 완료/QA, exact-SHA deploy/rollback 조건을 유지한다. P0/P1 결함은 신규 monetization/growth보다 우선하며 기획은 runtime/DB를 배포하지 않는다.

### v210 worklog / acceptance order
Google Search Central/Crawling + OWASP ASVS + Google Play 공식자료(2026-09-18) 재조사 → exact main/protection/Actions → Debian service/version/journal/backup 증거 → 전체 기능 security/SEO/ads/economics delta → 작업 중간 exact-main 재확인 → EN/KO 동기화 → diff/CI/PR. 출처: Google Crawling changelog 2026-09-17, Search Central documentation updates 2026-09-17 현재, OWASP ASVS 5.0 V13.2.1/V13.2.2, Google Play Service Fees 2026-09-18 현재. 채택: crawler-family 분리, service-auth least privilege, KR alternative billing `applicable fee - 4pp`; 제외: KR cutover 전 EEA/UK/US cohort fee 적용.


## 회차 델타 — v2026.09.18.209 (2026-09-18)

### 07:07 authoritative 재검증, 세션 캐시 릴리스 게이트, 광고 bfcache lifecycle, 수수료 정책 감사

- **Exact main / CI — 07:07 KST 재현:** 시작 및 중간 authoritative `main`은 `158369cf187baa840cedd893e8159ca898805b6c`(v208)이다. branch는 `protected=true`이나 `required_status_checks.enforcement_level=off`, contexts/checks 0이므로 `CI-ENFORCE-204-01`은 **P1 / OPEN**이다. 최신 main `Cleanup Repeatedly Failing Branches` run `35279844598`은 `skipped`; workflow 상태 증거일 뿐이다. 수용조건은 change-class required classifier/policy/runtime/security checks, audited bypass, deliberately-failing merge-block negative test이며 잘못된 rule만 rollback하고 bypass/direct-push/check latency를 감시한다.
- **P0 runtime/DR — 07:07 KST 재현:** Debian backend/frontend/backup timer active, timer enabled. 06:26:17 실행은 06:26:19 종료하며 encrypted archive, `database.dump`, `photos.tar.zst`, `manifest.txt`, verify 전부 OK; 다음은 12:22:15. canonical HTTPS `/api/version`은 HTTP/2 200 + `Cache-Control: no-store`, deployed application은 `75e69e77cdc18ef221106a008563151a4c790728`; sampled warning+ backend journal 0. `BAK-RUNTIME-177-01`은 artifact verify가 restore 증명이 아니므로 **P0 / IN PROGRESS**: isolated restore→decrypt/checksum→schema/migration-set→identity/session/inventory/entitlement/ledger/reward/bank/loan/stocks/casino/community/referral/audit reconciliation→RPO/RTO 실측→off-host immutable replication/retention→missed-run/verify/replication/restore alert 실제 전달이 필요하다. `REL-AUTH-184-01`도 repository main != deployed application이므로 P0 유지.
- **Security/session privacy — DIRECT ADOPT:** 현행 OWASP frontend/ASVS mapping에 따라 logout은 server session invalidation과 application-managed `localStorage`, `sessionStorage`, IndexedDB, application cookie 삭제까지 완전해야 하며 민감한 authenticated API response는 `Cache-Control: no-store`를 사용한다. 가능한 browser auth token은 JS-readable persistent storage 대신 HttpOnly+Secure cookie와 적절한 SameSite를 사용하고 access lifetime을 짧게, refresh credential은 rotation한다. login/OAuth/logout/security-center/admin/payment/bank/stock/casino에 적용. HIGH negative test는 logout 전 cookie/token 재사용, logout 후 Back/bfcache, shared-device reload, stolen refresh-token replay, CSRF mutation, cached authenticated response recovery이며 logout 뒤 인증/경제 상태가 복구되면 승격 차단.
- **Ads / bfcache lifecycle — DIRECT ADOPT:** Google Publisher Tag release note에 따라 2026-09-08부터 actively viewed slot은 bfcache restore 시 자동 refresh되고 `AutoRefreshConfig.backForwardCache` 기본값은 true다. `pageshow.persisted`를 resume transition으로 취급하고 slot/listener 재생성 금지, provider impression ID reconciliation, analytics/revenue dedupe, consent/frequency cap 유지, CLS 회귀검사를 수행한다. duplicate revenue/layout/consent 문제가 생기면 feature flag로 `backForwardCache=false`. KPI는 raw request/impression이 아니라 검증된 incremental net ad revenue에서 return abandonment/session/D1-D7 악영향을 뺀 값이다.
- **SEO/SEO backend — DIRECT ADOPT:** Google Search Central 최신 update log(2026-09-16 Search profile badge, 2026-09-08 regional Search experience, 2026-08-28 site-reputation)를 ranking 보장이 아닌 eligibility registry로 관리한다. 공개 profile/community/gallery/catalog은 durable URL, publication+moderation+quality eligibility, canonical ownership, visible-content parity 통과 후 sitemap/structured-data 노출; private/account/admin/transaction과 unstable cursor/facet은 noindex/excluded. SEO backend는 metadata/canonical/robots/split-sitemap+lastModified/redirect/read-model/structured-data serializer, 개인정보 query payload 없는 crawler telemetry, Search Console/Naver 상태, 200/noindex/404/410/301/308/hreflang/schema/CWV release test를 소유한다.
- **Monetization/unit economics — DIRECT ADOPT:** Play 현행 정책은 EEA/UK/US updated fee와 global rollout 전 remaining-market schedule을 구분하므로 universal fee table을 금지한다. 모든 order/refund는 `{market,effectiveDate,installCohort,transactionType,programme,billingPath,tax/refund,feePolicyVersion}`을 저장한다. 한국 cutover 전에는 applicable current schedule을 유지하며 alternative billing eligibility는 client locale이 아니라 server policy로 결정한다. 수익성은 `gross-platform/billing/tax/refund-infra/storage/CDN/notification-support/moderation/fraud`; 미실측 revenue/net revenue/margin/ARPU/ARPDAU/ARPPU/conversion/repeat/renewal/churn/refund/CAC/LTV/payback/D1-D30은 `HYPOTHESIS/TEST TARGET`.
- **전체 기능 실행계약 / backlog 연결:** auth/signup/login/OAuth/logout/session/security center; profile; inventory/collection; shop/cart/payment/subscription/ad-removal; season/quest/job/level/reward; business/bank/loan; stocks/portfolio/alerts/comparison; casino; community/posts/comments/report/block; friends/clubs/invite/referral; notifications/search/gallery/upload/public content; App API; admin/audit; backup/restore; analytics/experiments; ads; SEO backend/tooling; Discord/incident 전부 구현상태+코드/문서 근거와 entry/CTA/loading-empty-error-offline-timeout/recovery, responsive/a11y/i18n, ownership/RBAC/BOLA, API schema/error/idempotency/rate-limit, DB PK/FK/unique/check/index/transaction/concurrency, immutable audit, flag/fallback, privacy/abuse, SEO/KPI/cache/performance, unit/integration/E2E/real-DB/security/regression, exact-SHA deploy/rollback 증거를 유지한다. 우선순위는 P0 DR→P0 release authority→real-DB/economy integrity→HIGH auth/payment/economy/upstream/session→P1 CI enforcement/responsive Production proof→correctness→monetization→SEO/acquisition→retention/accessibility. 기획은 runtime/DB를 배포하지 않는다.

### v209 worklog / acceptance order
Google Search Central + GPT + OWASP + Google Play 공식자료 재조사 → exact main/protection/Actions → Debian services/version/journal/backup → 전체 기능/security/SEO/ads/economics delta → 중간 main 재확인 → EN/KO 동기화 → diff/CI/PR.

## 회차 델타 — v2026.09.18.208 (2026-09-18)

### 06:09 authoritative main/runtime 재검증, UGC 평판 경계, KR 결제 수익성 guard

- **Exact main / CI — 06:09 KST 재현:** 시작 및 중간 authoritative `main`은 `5c029a2af1937298e0691f067fc0eaaa32f34250`(v207)이다. branch는 `protected=true`이나 `required_status_checks.enforcement_level=off`, contexts/checks 0이므로 `CI-ENFORCE-204-01`은 **P1 / OPEN**이다. 최신 main `Cleanup Merged Branches` run `35274966220`은 success지만 workflow health 증거일 뿐 merge enforcement 증거가 아니다. 수정은 change-class classifier/policy/runtime/security required check + audited bypass + deliberately-failing negative merge test이며 DB migration 없음, 잘못된 rule만 rollback, bypass/direct-push/check latency를 감시한다.
- **P0 runtime/DR — 06:09 KST 재현:** Debian backend/frontend/backup timer active, timer enabled, last 00:22:17, next 06:26. canonical HTTPS `/api/version`은 HTTP/2 200 + `Cache-Control: no-store`, deployed application `75e69e77cdc18ef221106a008563151a4c790728`; sampled warning+ backend journal 0. 00:22 encrypted archive/`database.dump`/`photos.tar.zst`/`manifest.txt` 검증 OK. `BAK-RUNTIME-177-01`은 최신 archive isolated restore→decrypt/checksum→schema/migration-set→전체 state/economy reconciliation→RPO/RTO 실측→off-host immutable replication/retention→missed-run/verify/replication/restore alert 실제 전달 전까지 **P0 / IN PROGRESS**. `REL-AUTH-184-01`도 repository main != deployed application이므로 P0 유지하며 build/workflow 성공만으로 승격 금지.
- **SEO/UGC reputation — DIRECT ADOPT:** Google Search Central 2026-08-28 site-reputation update는 host의 ranking signal을 이용하려는 목적의 third-party content를 계속 대상으로 한다. Moneyverse community/profile/gallery/public-content SEO는 first-party product/community 가치와 sponsor/partner/affiliate/external-supplied section을 분리한다. `contentOwner`, `editorialControl`, `sponsorType`, `indexEligibility`, `canonicalOwner`, `moderationState`를 저장하고 sponsor/low-control/thin/policy-disputed content는 review 전 기본 `noindex`, sitemap/internal-link promotion 제외. SEO admin은 owner/control/index reason, manual-action/Search Console 상태, reversible index 결정을 표시한다. Moneyverse authority 상속만을 목적으로 partner microsite/UGC landing을 만들지 않는다. KPI는 organic visit→signup→activation→D7/D30→revenue이며 manual-action/index-quality guardrail을 둔다.
- **SEO backend 구현:** public SEO read-model은 publication+moderation+content-quality eligibility 통과 후에만 indexability를 내보내고 sitemap serializer는 raw row가 아닌 이 read-model을 사용한다. canonical generator는 private/account/admin/transaction URL과 unstable cursor/facet URL을 거부한다. redirect map은 permanent+audited. crawler observability는 개인 query payload를 기록하지 않고 user-agent family/route template/status/canonical target/render latency/cache result를 기록한다. release test는 200/indexable, noindex, 404/410, 301/308, duplicate canonical, pagination, hreflang reciprocity, structured-data visible-content parity, sitemap exclusion을 포함한다.
- **Security — DIRECT ADOPT:** OWASP API Security Project는 2023을 latest로 유지하며 BOLA, broken authentication, object-property/function authorization, resource consumption, sensitive-business-flow abuse, SSRF, misconfiguration, inventory, unsafe API consumption을 포함한다. 이를 auth/profile/inventory/shop/payment/reward/bank/stock/casino/community/upload/admin API에 명시 적용한다. 모든 경제 mutation은 server-authoritative amount/price, ownership+role check, idempotency/replay policy, transaction/unique constraint, immutable masked audit, anomaly alert 필수. HIGH negative test는 cross-account object ID, privileged-field mass assignment, duplicate reward/payment webhook, rate-limit exhaustion, SSRF destination bypass, malformed upstream response이며 실패 시 승격 차단.
- **Monetization/unit economics — DIRECT ADOPT:** Google Play 현행 정책은 EEA/UK/US updated fee 예시를 제시하고 나머지 시장은 announced global rollout 전까지 applicable current schedule을 유지한다. 한국 documented cutover 전에는 EEA/UK/US cohort fee를 재사용하지 않는다. pricing/entitlement authority는 `{market,effectiveDate,installCohort,transactionType,programme,billingPath,tax/refund}`를 versioning하고 각 order/refund에 resolved fee-policy version을 보존해 audit/recalculation 가능하게 한다. alternative billing eligibility는 client locale 추론이 아니라 market별 policy gate로 결정한다. SKU 수익성은 `gross - platform/billing/tax/refund - infra/storage/CDN/notification - support/moderation/fraud`; 미실측 ARPU/ARPDAU/ARPPU/attach/repeat/churn/CAC/LTV/payback/D1-D30은 `HYPOTHESIS/TEST TARGET`이며 contribution margin+retention/fairness/refund/fraud/support guardrail 동시 통과 때만 scale.
- **전체 기능 실행계약 / backlog 연결:** auth/signup/login/OAuth/logout/session/security center; profile; inventory/collection; shop/cart/payment/subscription/ad-removal; season/quest/job/level/reward; business/bank/loan; stocks/portfolio/alerts/comparison; casino; community/posts/comments/report/block; friends/clubs/invite/referral; notifications/search/gallery/upload/public content; App API; admin/audit; backup/restore; analytics/experiments; ads; SEO backend/tooling; Discord/incident 전부 구현상태+코드/문서 근거와 전체 screen-state/RBAC/API/DB/audit/fallback/privacy/abuse/SEO/KPI/performance/test/deploy/rollback 계약을 유지한다. 개발순서는 P0 DR→P0 release authority→real-DB/economy integrity→HIGH auth/payment/economy/upstream→P1 CI enforcement/responsive Production proof→correctness→monetization→SEO/acquisition→retention/accessibility. 기획 변경은 runtime/DB를 배포하지 않는다.

### v208 worklog / acceptance order
Google Search Central site-reputation/update guidance + OWASP API + Google Play 공식정책 재조사 → exact main/protection/Actions → Debian services/version/journal/backup → 전체 기능/security/SEO/economics delta → 중간 main 재확인 → EN/KO 동기화 → diff/CI/PR.

## 회차 델타 — v2026.09.18.207 (2026-09-18)

### 06:01 런타임/CI 재검증, 한국 Play 수수료 전환일 명시, ASVS 서비스 인증 게이트

- **Exact main / CI:** 시작 및 중간 재확인 authoritative `main`은 `bf392f69ff49ad0cf4078f763879b3776a5f69a8`(v206)이다. branch는 protected이나 `required_status_checks.enforcement_level=off`, contexts/checks 0이므로 `CI-ENFORCE-204-01`은 **P1 / OPEN**이다. 최신 main scheduled `Cleanup Repeatedly Failing Branches` run `35269984569`는 success지만 required merge gate 증거가 아니다. 수정은 change-class별 required classifier/policy/runtime/security check + audited bypass + deliberately-failing negative merge test이며 DB migration은 없다.
- **P0 runtime/DR — 06:01 KST 재현:** Debian backend/frontend/backup timer는 active, timer enabled, last 00:22:17, next 06:26 KST. canonical HTTPS `/api/version`은 HTTP/2 200, `Cache-Control: no-store`, deployed application `75e69e77cdc18ef221106a008563151a4c790728`; 최근 1시간 warning+ backend journal 0. 00:22 encrypted archive/database.dump/photos.tar.zst/manifest.txt 검증은 모두 OK. `BAK-RUNTIME-177-01`은 **P0 / IN PROGRESS**: 최신 archive isolated restore→decrypt/checksum→schema/migration-set→identity/session/inventory/entitlement/ledger/reward/bank/loan/stocks/casino/community/referral/audit reconciliation→RPO/RTO 실측→off-host immutable replication/retention→missed-run/verify/replication/restore alert 실제 전달 전 destructive schema/ledger/entitlement Production 변경 차단. `REL-AUTH-184-01`도 repository main과 deployed application이 다르므로 immutable candidate binding/exact-SHA Test/migration equality/session+API+user-flow smoke/journal/rollback manifest 전 승격 금지.
- **Security — DIRECT ADOPT:** OWASP ASVS 5.0 V13.2.1/V13.2.2를 backend/API/data-layer 통신에 적용한다. 사용자 session을 공유하지 않는 service-to-service 통신은 개별 service account, short-lived token 또는 certificate 인증을 사용하고 static privileged password/API key/shared account를 금지하며 최소권한을 강제한다. auth/payment/reward/bank/stock/casino/admin worker별 credential scope를 분리하고 issuer/audience/expiry/replay 검증, rotation/revocation, masked audit와 auth-failure alert를 둔다. negative tests는 expired/wrong-audience/revoked token, cross-service privilege, replay를 포함하며 실패 시 HIGH deploy-block. 기존 OWASP API 2023 + Top 10 2025/BOLA/CSRF/XSS/SQLi/SSRF/upload/idempotency/webhook/supply-chain/integrity/exception gates를 유지한다.
- **SEO/SEO backend — DIRECT ADOPT:** Google Search Central은 Breadcrumb, Discussion forum, Profile page 등 지원 structured-data 유형을 현재 명시한다. 실제 공개 community/profile 페이지가 eligibility와 visible-content 일치를 충족할 때만 serializer를 활성화하고 존재하지 않는 rating/author/entity를 합성하지 않는다. canonical/robots/split sitemap+lastModified/hreflang/redirect/read-model/SSR-ISR/CWV/UGC index 정책을 유지하며 Rich Results/schema validation failure를 release gate와 SEO admin crawl/index report에 연결한다. KPI는 organic impression→CTR→visit→signup→activation→D7/D30→revenue이고 structured-data 노출 자체를 매출로 간주하지 않는다.
- **Monetization/unit economics — DIRECT ADOPT, KR date correction:** Google Play 공식 rollout 표는 KR의 updated service fees + expanded billing choice 및 new Apps/Games programme 적용일을 **2026-12-31**로 명시한다. 따라서 2026-09-18 현재 한국 거래에 EEA/UK/US의 10% subscription/20% new-install/25% existing-install 표를 선적용하지 않는다. SKU pricing service는 `{market,effectiveDate,installCohort,transactionType,programme,billingPath,tax/refund}`를 저장/resolve하고 KR 전환 전후 cohort를 분리한다. 모든 revenue/net revenue/gross+contribution margin/ARPU/ARPDAU/ARPPU/conversion/repeat/renewal/churn/refund/CAC/LTV/payback/fraud/infra/support/D1-D30 미실측치는 `HYPOTHESIS/TEST TARGET`; scale/iterate/kill은 cohort margin+retention+fairness+policy+support guardrail 동시 통과가 조건이다.
- **전체 기능 실행계약:** auth/signup/login/OAuth/logout/session/security center; profile; inventory/collection; shop/cart/payment/subscription/ad-removal; season/quest/job/level/reward; business/bank/loan; stocks/portfolio/alerts/comparison; casino; community/posts/comments/report/block; friends/clubs/invite/referral; notifications/search/gallery/upload/public content; App API; admin/audit; backup/restore; analytics/experiments; ads; SEO tooling/backend; Discord/incident 전부에 구현상태+코드/문서 근거, 화면 entry/CTA/loading-empty-error-offline-timeout/recovery, responsive/a11y/i18n, ownership/RBAC, API schema/errors/idempotency/rate-limit, DB PK/FK/unique/check/index/transaction/concurrency, immutable audit/observability, admin/flag/fallback, privacy/abuse, SEO/KPI/cache/performance, unit/integration/E2E/real-DB/security/regression, exact-SHA deploy/rollback 증거를 요구한다. 우선순위는 P0 DR→P0 release authority→real-DB/economy integrity→HIGH auth/payment/economy/upstream/service-auth→P1 CI enforcement/responsive Production proof→correctness→monetization→SEO/acquisition→retention/accessibility. 기획 변경은 runtime/DB를 변경하지 않는다.

### v207 worklog / acceptance order
Google Search Central + OWASP ASVS/API + Google Play 공식자료 재조사 → exact main/protection/Actions → Debian services/version/journal/backup → 전체 기능/security/SEO/economics delta → 중간 main 재확인 → EN/KO 동기화 → diff/CI/PR.

## 회차 델타 — v2026.09.18.206 (2026-09-18)

### 04:05 authoritative protection 증거, OWASP 2025 웹 기준선 추가

- **정확한 main / CI enforcement:** 시작 authoritative `main`은 v204 `5c3286c57b7c0c6a84e6c76f80a7f0339060ceb2`였으나 작업 중 v205 PR #454가 병합되어 중간 재확인 main이 `59d6032d22db9de804438ee8d5b7ca4190326f39`로 이동했다. 동시 writer 작업을 덮지 않고 해당 exact main으로 rebase했다. Branch payload는 `protected=true`, `required_status_checks.enforcement_level=off`, contexts/checks empty를 현재 증거로 제공한다. 따라서 `CI-ENFORCE-204-01`은 **P1 / OPEN**이며 EVIDENCE-STALE이 아니다. `/branches/main` read로 재현하고 change-class별 ruleset/protection을 required로 만든 뒤 의도적 failing check merge 차단과 audited bypass를 negative-test한다. DB migration은 없고 잘못된 rule만 롤백하며 bypass/direct-push/check latency/failure를 감시한다.
- **런타임/DR:** 04:05 Debian에서 backend/frontend/backup timer active, timer enabled, last 00:22:17/next 06:26 KST를 확인했다. 이번 회차 loopback `/api/version`의 새 body는 얻지 못했으므로 v205 canonical-HTTPS deployed-build 관측을 현재 증거처럼 재표기하지 않는다. `BAK-RUNTIME-177-01`은 isolated restore+schema/migration-set+stateful/economic reconciliation+실측 RPO/RTO+off-host immutable replication/retention+실패 alert 전달 전까지 **P0 / IN PROGRESS**다. `REL-AUTH-184-01`도 **P0 / IN PROGRESS**이며 exact-v204 main Auto Integrate and Promote run `35256807085`의 skipped는 planning containment 증거일 뿐이다.
- **보안 기준선 교정/확장 — 직접채택:** OWASP API Security **2023**은 최신 API-specific Top 10이지만 OWASP Top 10 **2025**가 최신 일반 web-application release다. 둘을 병행한다. 기존 BOLA/auth/property/function/resource/sensitive-flow/SSRF/inventory/upstream gate에 2025 Broken Access Control, Security Misconfiguration, Software Supply Chain Failures, Cryptographic Failures, Injection, Insecure Design, Authentication Failures, Software/Data Integrity Failures, Security Logging and Alerting Failures, Mishandling Exceptional Conditions를 매핑한다. Release 증거는 dependency provenance+lockfile/advisory scan, fail-closed integrity/signature, secret/crypto config review, 경제/auth mutation이 예외에서 fail-open하지 않는 structured exception test, alert-delivery test를 포함한다. HIGH는 예방+탐지+negative test+residual-risk owner 전까지 deploy-block이다.
- **SEO/SEO backend 직접채택:** Google Search Central 최신 로그의 2026-09-17 infinite-scroll guidance 이전은 guidance 변경이 없다. Crawlable pagination/server-renderable link, stable ordering, self-canonical/title/H1, 정확한 200/404/410/301/308, durable-only sitemap+`lastModified`, structured data/breadcrumb/hreflang, SSR/ISR/CWV, private/account/admin/transaction noindex, UGC thin/duplicate governance를 유지한다. SEO backend는 metadata/canonical/robots/sitemap/redirect serializer, public read-model, crawler log, Search Console/Naver ingestion을 소유한다.
- **수익성/unit economics 직접채택:** Google Play 현행 정책은 market/effective-date/install-cohort/programme/billing-path별 판정을 요구한다. EEA/UK/US standard 예시는 auto-renew 10%, 기타 new-install 20%, 기타 existing-install 25%, 해당 시 billing fee 5%이며 나머지 시장은 rollout 전 적용 가능한 현행 schedule을 유지한다. Universal fee는 금지한다. Shop/payment/subscription SKU는 authoritative price/entitlement/refund/restore/renewal/economy/fraud rule과 가설 표시된 revenue/net revenue/margin/ARPU/ARPDAU/ARPPU/conversion/churn/refund/CAC/LTV/infra/support를 유지하고 cohort scale/iterate/kill gate로 판정한다.
- **전체 기능 실행계약/우선순위:** auth, profile/security, inventory/collection, commerce, progression/economy, business/bank/loan, stocks, casino, community/social/moderation, notification/search/upload/public content, App API, admin/audit, backup/restore, analytics/experiments, ads, SEO, Discord/incident 전체에 screen state, RBAC/BOLA, API contract/idempotency/rate-limit, DB constraint/transaction/concurrency, audit/fallback/privacy/abuse, KPI/cache/performance, QA/rollback 증거를 유지한다. 우선순위는 P0 DR → P0 release authority → real-DB/economy integrity → HIGH auth/economic/payment/upstream+신규 supply-chain/integrity/exception gate → P1 CI enforcement/responsive Production proof → correctness/monetization/SEO/growth다. Planning은 runtime/DB를 변경하지 않는다.

### v206 작업로그 / 수용 순서
최신 Google Search Central+OWASP API 2023+OWASP Top 10 2025+Google Play 공식자료 → exact main/canonical/Actions/protection → Debian service/timer 증거 → 동시 main 재확인/rebase → 전체 기능·보안·SEO·사업성 delta → EN/KO 동기화 → diff/CI/PR.

## 회차 델타 — v2026.09.18.205 (2026-09-18)

### 03:05 런타임/CI 갱신, v204 종결, 현행 정책 교정 및 실행 게이트

- **정확한 main / writer 종결:** v204 PR #453 exact head `5933878c9f053c6293ddec13d3cc5a605318124d`는 CI run `35256247334` 성공 후 exact-head squash merge되어 authoritative main `5c3286c57b7c0c6a84e6c76f80a7f0339060ceb2`를 만들었다. 이번 회차는 이 main에서 시작한다. 현재 GitHub integration의 branch-protection read는 계속 403이므로 `CI-ENFORCE-204-01`은 접근 불가능한 endpoint의 과거 상태를 단정하지 않고 **P1 / EVIDENCE-STALE**로 둔다. 완료에는 권한 있는 ruleset/protection read와 의도적으로 실패한 required check가 실제 merge를 차단하는 음성 수용증거가 필요하며 green workflow만으로 enforcement를 인정하지 않는다.
- **P0 백업/DR `BAK-RUNTIME-177-01`: IN PROGRESS, 03:05 KST 재현.** 권위 Debian의 backend/frontend/backup timer는 active, timer enabled, last 00:22/next 06:26 KST다. 00:22 archive는 encrypted archive, `database.dump`, `photos.tar.zst`, `manifest.txt` 검증 OK이고 sampled backend warning+ journal은 비어 있다. DONE은 최신 archive → 격리 폐기 가능 restore → decrypt/checksum/schema/migration-set 검증 → identity/session, inventory/entitlement, ledger/reward, bank/loan, stocks, casino, community/referral, audit 불변조건 reconciliation → 실측 RPO/RTO → off-host immutable replication/retention → missed-run/verify/replication/restore-failure alert 실제 전달이다. 불일치는 fail-closed이며 그 전 destructive schema/ledger/entitlement 변경은 Production 차단한다. last-success age, next trigger, archive checksum/size, free space, replication lag, restore reconciliation, alert delivery를 감시한다.
- **Runtime identity / redirect 구분:** loopback HTTP `http://127.0.0.1:3001/api/version`은 의도된 canonical HTTPS 308을 반환하고, canonical `https://easy-scraping.com/api/version`은 HTTP 200, `Cache-Control: no-store`, build `75e69e77cdc18ef221106a008563151a4c790728`을 반환한다. 릴리스 증거는 scheme/host를 함께 기록하고 canonical HTTPS를 사용해야 하며 loopback 308을 backend 장애로 오판하지 않는다. Repository main은 deployed application identity보다 최신이어도 배포 주장으로 사용하지 않는다. `REL-AUTH-184-01`은 **P0 / IN PROGRESS**다.
- **전체 기능 실행계약:** auth/signup/login/OAuth/logout/session/security center, profile, inventory/collection, shop/cart/payment/subscription/ad-removal, season/quest/job/level/reward, business/bank/loan, stocks/portfolio/alerts/comparison, casino/randomized mechanics, community/posts/comments/report/block, friends/clubs/invite/referral, notifications/search/gallery/upload/public content, App API, admin/audit, backup/restore, analytics/experiments, ads, SEO backend/tooling, Discord, incident operations는 entry/CTA/loading-empty-error-offline-timeout/recovery, responsive/a11y/i18n, ownership/RBAC/BOLA, request/response/error/idempotency/rate-limit, service rule, DB PK/FK/unique/check/index/transaction/concurrency, immutable audit/observability, admin/flag/fallback, privacy/abuse, SEO, event/KPI, performance/cache, unit/integration/E2E/real-DB/security/regression, deploy/rollback 증거를 유지한다. Exact-environment 수용증거 없이는 DONE이 아니며 stateful/economic write는 fresh backup/off-host copy/restore proof/deployed identity가 추가로 필요하다.
- **SEO/SEO 백엔드 — 직접채택, 최신 공식자료 재확인:** Google Search Central update log는 2026-09-17 infinite-scroll 지침 이전과 내용 변경 없음 을 기록한다. Public community/catalog/collection/search는 crawlable pagination URL/server-renderable link, stable ordering, page별 self-canonical/title/H1, 정확한 200/404/410/redirect, durable page만 sitemap 포함을 유지한다. Cursor/facet은 SEO read-model이 durable landing으로 승격하기 전 API-only 또는 기본 noindex/canonical이다. Backend는 metadata/canonical/robots/split sitemap+`lastModified`/breadcrumb+structured-data serializer/hreflang/SSR-ISR/image metadata/permanent redirect/crawler log/Search Console+Naver ingestion을 소유하고 private/account/admin/security/transaction은 noindex를 강제한다. KPI는 impression→CTR→organic visit→signup→activation→D7/D30→revenue이며 CWV/thin/duplicate-index를 guardrail로 둔다.
- **보안 — 직접채택, 최신 공식자료 재확인:** OWASP API Security Project latest는 계속 2023이다. BOLA, broken authentication, object-property/function authorization, unrestricted resource consumption, sensitive-business-flow abuse, SSRF, misconfiguration, API inventory, unsafe upstream consumption을 release-block한다. Third-party API는 TLS, 필요한 destination policy, strict schema validation/sanitization, bounded redirect/timeout/body/concurrency, circuit breaker/fallback, masked log가 필요하다. Cookie mutation은 CSRF 방어, 경제/payment/reward write는 replay-safe idempotency/server authority/signed receipt·webhook/DB least privilege/immutable masked audit를 요구한다. HIGH는 예방+탐지 통제, negative test, alert field, deploy-block, residual-risk owner를 둔다.
- **수익성/unit economics — 직접채택 및 시장 guard:** Google Play 현행 문서는 EEA/UK/US standard 예시를 auto-renew subscription 10%, 기타 new-install 20%, 기타 existing-install 25%와 Play Billing 적용 시 5% billing fee로 제시하면서, 나머지 시장은 발표된 global rollout 전까지 기존 fee schedule을 유지한다고 명시한다. 따라서 한국에 EEA/UK/US 표를 적용일 이전 선적용하지 않는다. 각 SKU는 `{market,effectiveDate,installCohort,transactionType,programme,billingPath,tax/refund}`를 resolve한 후 gross→net→contribution margin을 계산한다. 미실측 revenue/margin/ARPU/ARPDAU/ARPPU/conversion/repeat/renewal/churn/refund/eCPM/fill/CTR/CAC/LTV/payback/infra/support/fraud/D1-D7-D30은 `HYPOTHESIS/TEST TARGET`이며 scale/iterate/kill은 cohort와 retention/fairness/policy/support/fraud guardrail로 판정한다.
- **우선순위 / 실행 백로그:** P0 isolated restore + off-host immutable replication + 실제 alert 전달 → P0 release-authority matrix → migration-204 real-DB/economy-integrity → HIGH auth/BOLA/CSRF/idempotency/ledger/payment/webhook/upstream-abuse → P1 required-check 권위증거/enforcement + responsive Production proof → Discord Production smoke → P2 Gallery CSP → core correctness → monetization → SEO/acquisition → retention/accessibility. 기획은 runtime/DB를 변경하지 않는다.

### v205 작업로그 / 수용 순서
최신 Google Search Central/OWASP/Google Play 공식자료 → exact main/canonical/PR+CI 종결 → 권위 Debian services/version/backup/journal → 전체 기능·보안·SEO·사업성·QA delta → 작업 중간 exact-main 재확인 → EN/KO 동기화 → diff/CI/PR.

## 회차 델타 — v2026.09.18.204 (2026-09-18)

### 02:59 런타임/CI 갱신, writer 병합 종결, 릴리스 enforcement 증거

- **정확한 main / writer 상태:** 시작 및 작업 중간 authoritative `main`은 `fd483dd292213cb00abaa8bc77865b50eff83708`이며 v203 PR #452가 병합되어 EN/KO v203이 권위 상태다. Main protection은 enabled지만 `required_status_checks.enforcement_level=off`, contexts/checks 0개다. `CI-ENFORCE-204-01`을 **P1 / OPEN**으로 기록한다. Green workflow는 merge gate 증거가 아니다. 수정은 change-class별 classifier/policy/runtime/security required check를 ruleset/protection에 강제하고 의도적 failing check가 merge를 차단하는 negative acceptance를 요구한다. 잘못된 rule만 롤백하고 review/audit는 보존하며 bypass/direct-push/check latency를 감시한다.
- **CI/release:** 최신 main `Auto Integrate and Promote` run `35251084592`는 v203에서 `skipped` 완료다. Planning-only containment와 일치하지만 release-authority 완료증거는 아니므로 `REL-AUTH-184-01`은 **P0 / IN PROGRESS**다. 남은 CONTROL_PLANE_ONLY/RUNTIME_RELEVANT/MIXED 및 missing/stale/foreign candidate에서 immutable candidate identity, exact-SHA Test attestation, migration equality, session continuity, smoke, journal, rollback manifest를 증명한다.
- **P0 백업/DR `BAK-RUNTIME-177-01`: IN PROGRESS, 02:59 KST 재현.** Debian backend/frontend/backup timer는 active, timer enabled, last 00:22/next 06:26 KST다. `/api/version`은 HTTP 200 + `no-store`, deployed application `75e69e77cdc18ef221106a008563151a4c790728`; sampled backend warning+ journal은 비어 있다. 최근 2시간 backup-service log가 없는 것은 그 구간에 예약 실행이 없기 때문이다. 00:22 verified archive 증거는 유지되지만 DONE은 isolated restore, checksum/schema/migration-set 검증, 모든 stateful/economic domain reconciliation, 실측 RPO/RTO, off-host immutable retention, missed-run/verify/replication/restore alert 실제 전달까지 필요하다. 그 전 destructive schema/ledger/entitlement 변경은 차단한다.
- **전체 기능 실행계약:** auth/profile/security-center/inventory/collection/shop/cart/payment/subscription/ad-removal/season/quest/job/level/reward/business/bank/loan/stocks/casino/community/moderation/social/referral/notification/search/upload/public content/App API/admin/audit/backup/restore/analytics/experiments/ads/SEO backend·tooling/Discord/incident 전체는 화면 entry/CTA/state/recovery, responsive/a11y/i18n, ownership/RBAC/BOLA, API schema/error/idempotency/rate-limit, DB key/index/constraint/transaction/concurrency, immutable audit, fallback/flag, privacy/abuse, SEO, KPI, performance/cache, QA, deploy/rollback 증거를 유지한다. Stateful/economic DONE에는 fresh backup/off-host copy/restore proof/deployed identity가 추가로 필요하다.
- **SEO 직접채택 / 2026-09-18 재검증:** Google Search Central 현행 지침에 맞춰 public community/catalog/collection/search는 durable pagination URL, server-renderable crawlable link, stable ordering, self-canonical/title/H1, 정확한 200/404/410/redirect, sitemap+`lastModified`, structured data/breadcrumb/hreflang, SSR/ISR/CWV를 유지한다. Cursor/facet은 SEO read-model 승격 전 API-only 또는 noindex/canonical이다. SEO backend는 metadata/canonical/robots/sitemap/redirect serializer, crawler log, Search Console/Naver ingestion을 소유하고 private/account/admin/security/transaction은 noindex를 강제한다.
- **보안 직접채택 / 2026-09-18 재검증:** OWASP API Security Project latest는 계속 2023이다. BOLA, broken auth/property/function authorization, resource exhaustion, sensitive-flow abuse, SSRF, misconfiguration, inventory, unsafe upstream consumption을 release-block한다. Third-party 입력은 TLS/destination policy/schema validation·sanitization/bounded redirect·timeout·body·concurrency/circuit breaker가 필수다. Cookie mutation은 CSRF, 경제/payment/reward write는 replay-safe idempotency/server authority/signed receipt·webhook/immutable masked audit를 요구한다. HIGH는 예방+탐지 통제, negative test, alert, deploy-block, residual-risk owner가 필요하다.
- **수익성 직접채택 / 2026-09-18 재검증:** Google Play EEA/UK/US standard 예시는 auto-renew subscription 10%, 기타 new-install 20%, 기타 existing-install 25%이며 해당 시 5% billing fee가 추가된다. Universal fee를 가정하지 않는다. SKU는 market/effective-date/install-cohort/transaction/programme/billing-path/tax/refund별 gross→net→contribution margin을 계산한다. 미실측 revenue/margin/ARPU/ARPDAU/ARPPU/conversion/repeat/renewal/churn/refund/eCPM/fill/CTR/CAC/LTV/payback/infra/support/fraud/D1·D7·D30은 `HYPOTHESIS/TEST TARGET`이며 scale/iterate/kill은 cohort와 fairness/retention/policy guardrail로 판정한다.
- **우선순위:** P0 restore/off-host/alerts → P0 release-authority matrix → migration-204 real-DB/economy integrity → HIGH auth/BOLA/CSRF/idempotency/ledger/payment/webhook/upstream abuse → P1 required-check enforcement + responsive Production proof → Discord smoke → P2 Gallery CSP → correctness → monetization → SEO/acquisition → retention/accessibility. Planning은 runtime/DB를 배포하지 않는다.

### v204 작업로그 / 수용 순서
최신 Google Search Central/OWASP/Google Play 공식자료 → exact main/canonical/latest Actions → Debian runtime/version/timer/journal → 전체 기능·보안·SEO·사업성·QA delta → 작업 중간 exact-main 재확인 → EN/KO 동기화 → diff/CI/PR.

## 회차 델타 — v2026.09.18.203 (2026-09-18)

### v202 writer 종결 복구, 02:02 runtime/CI 갱신, 전 기능 실행 게이트

- **정확한 main / writer 복구:** 시작 및 작업 중간 authoritative `main`은 `7d2809465188406515bf822bf5e1ec8e3a9a47c0`(반응형 v201 병합)이다. 이전 planning PR #450/#451은 병합되지 않고 닫혔으므로 해당 v202 텍스트를 권위 문서로 취급하지 않는다. 이번 회차는 닫힌 head를 덮어쓰지 않고 최신 main에서 델타를 재구성한다. 이 main에서 관측한 최신 scheduled GitHub workflow는 Cleanup Repeatedly Failing Branches run `35249641308`이며 2026-09-18 01:56 KST 성공 완료다. 현재 GitHub integration의 branch-protection read는 403이므로 required-check 상태는 권한 있는 ruleset/protection 재검증 전까지 **P1 / EVIDENCE-STALE**로 둔다. Workflow 성공을 enforcement 증거로 추정하지 않는다.
- **P0 백업/DR `BAK-RUNTIME-177-01`: IN PROGRESS, 2026-09-18 02:02 KST 재현.** 권위 Debian에서 backend/frontend/backup timer는 active, timer는 enabled, 다음 실행은 06:26 KST다. 00:22 run은 encrypted archive, `database.dump`, `photos.tar.zst`, `manifest.txt`를 모두 검증했고 sampled hour의 backend warning 이상 journal은 없다. 이는 backup 생성 증거이지 restore 증거가 아니다. DONE은 최신 archive → 격리 폐기 가능 target restore → decrypt/checksum/schema/migration-set 검증 → identity/session·inventory/entitlement·ledger/reward·bank/loan·stocks·casino·community/referral·audit 불변조건 reconciliation → 실측 RPO/RTO → off-host immutable replication/retention → missed-run/verify/replication/restore 실패 alert 실제 전달 순서다. 불일치는 fail-closed이며 그 전 Production restore와 destructive schema/ledger/entitlement rewrite는 차단한다. Rollback은 last-known-good archive/key를 모두 보존하고 잘못된 자동화만 disable한다. last-success age, next trigger, archive size/checksum, free space, replication lag, reconciliation, alert delivery를 관측한다.
- **Runtime identity / release authority:** 02:02 KST backend 직접 `/api/version`은 HTTP 200, `Cache-Control: no-store`, build `75e69e77cdc18ef221106a008563151a4c790728`이다. Repository main이 더 최신이어도 배포 주장으로 사용하지 않는다. `REL-AUTH-184-01`은 **P0 / IN PROGRESS**이며 남은 control-plane/runtime/mixed/negative candidate class에서 immutable `{applicationSourceSha,imageDigest,migrationSetHash,deploymentId}` binding, exact-SHA Test attestation, migration equality, session continuity, BFF/public smoke, journal, rollback manifest를 증명해야 한다.
- **반응형 UI `UI-RESP-202-01`: MERGED / Production-proof-pending.** Main의 v201에는 drawer/bottom-nav/banking/inventory hardening과 lint 오류 0(기존 image warning 11), typecheck/build, 70 files/619 tests, 320/360/390px 공개경로 21/21 render 및 document-level horizontal overflow 0 증거가 있다. Production-proven에는 exact-main authenticated bank/inventory, loading/empty/error/offline/timeout recovery, keyboard/focus order, 200% zoom/reflow, 긴 KO/EN label, 적용 가능한 >=44px touch target, component-level overflow, real-device Production smoke와 사후 error/CWV 비교가 필요하다. Navigation, 인증 사용자 task completion 또는 접근성 guardrail이 회귀하면 frontend release를 rollback한다.
- **전체 기능 실행계약:** auth/signup/login/OAuth/logout/session/security center, profile, inventory/collection, shop/cart/payment/subscription/ad-removal, season/quest/job/level/reward, business/bank/loan, virtual stocks/portfolio/alerts/comparison, casino/randomized mechanics, community/posts/comments/report/block, friends/clubs/invite/referral, notifications/search/gallery/upload/public content, App API, admin/audit, backup/restore, analytics/experiments, ads, SEO backend/tooling, Discord, incident operations는 화면 entry/CTA/state/recovery, responsive/a11y/i18n, ownership/RBAC/BOLA, endpoint schema/error/idempotency/rate-limit, service rule, DB PK/FK/unique/check/index/transaction/concurrency, immutable audit/observability, admin/flag/fallback, privacy/abuse, SEO, analytics/KPI, performance/cache, unit/integration/E2E/real-DB/security/regression, deploy/rollback을 모두 유지한다. 코드·문서 및 exact-environment 수용증거 없이는 DONE으로 승격하지 않는다. Stateful/economic mutation은 fresh verified backup, off-host copy, restore drill, deployed identity도 필요하다.
- **SEO/SEO 백엔드 — 직접채택(2026-09-18 공식자료 재확인):** Google Search Central update log는 2026-09-17 infinite-scroll 지침 이전을 기록하며 내용 변경은 없다고 명시한다. Public community/catalog/collection/search infinite scroll은 crawlable pagination URL/server-renderable link, stable ordering, page별 self-canonical/title/H1, 정상 200/404/410/redirect, durable independent page만 sitemap 포함을 요구한다. Cursor/facet은 SEO read-model이 승격하기 전 API-only 또는 기본 noindex/canonical이다. Backend는 metadata/canonical generator/robots/split sitemap+`lastModified`/breadcrumb·structured-data serializer/hreflang/SSR·ISR/image metadata/permanent redirect map/crawler log/Search Console·Naver ingestion을 소유한다. Private/account/admin/security/transaction은 강제 `noindex`다. KPI는 impression→CTR→organic visit→signup→activation→D7/D30→revenue이며 CWV/thin/duplicate-index를 guardrail로 둔다.
- **보안 — 직접채택(2026-09-18 공식자료 재확인):** OWASP API Security Project의 최신 API-specific Top 10은 계속 2023이다. BOLA, broken authentication, object-property/function authorization, unrestricted resource consumption, sensitive-business-flow abuse, SSRF, misconfiguration, API inventory, unsafe upstream consumption을 release-block한다. 모든 state-changing endpoint는 cookie-auth CSRF, XSS/SQLi/path/command injection 방어, upload isolation, brute-force/bot/multi-account/referral fraud, replay-safe reward/ledger/payment idempotency, signed receipt/webhook, CORS/CSP/security header, secret/supply-chain, DB least privilege, masked immutable audit를 명세한다. Third-party API는 TLS, 필요한 경우 destination policy, strict response schema/sanitization, bounded redirect/timeout/body/concurrency, circuit breaker/fallback, masked log가 필수다. HIGH 위험은 예방+탐지 통제, 음성 테스트, alert field, deploy-block 판정, residual-risk owner를 가진다.
- **광고/CSP `ADS-CSP-202-01`: P2 / OPEN.** Gallery의 기존 Google ad-quality `sodar2.js` CSP rejection은 exact main/Test에서 response CSP, console, network initiator 증거로 재현한다. CSP를 포괄적으로 완화하지 않고 구성된 광고 제품이 해당 요청을 실제 요구하는지 확인한 뒤 정확한 공식 origin/directive만 허용하고 XSS/security-header 음성 테스트와 Gallery E2E를 다시 수행한다. 사업 수용은 provider impression/revenue에서 abandonment, session loss, D1/D7 악화를 뺀 순효과로 판단하며 request 수 자체는 가치가 아니다.
- **수익성/unit economics — 직접채택:** 현행 Google Play 문서에는 universal fee가 없다. EEA/UK/US standard 예시는 auto-renew subscription 10%, 기타 new-install 20%, 기타 existing-install 25%이며 Play Billing 적용 시 5% billing fee가 더해진다. 모든 SKU는 `{market,effectiveDate,installCohort,transactionType,programme,billingPath,tax/refund assumption}`을 먼저 resolve한 뒤 gross→net→contribution margin을 계산한다. Catalog row는 server-authoritative price, entitlement type, purchase/duplicate/gift/refund/restore/renewal, inventory grant, economy source/sink, P2W/fairness guardrail을 유지한다. 미실측 revenue/net revenue/margin, ARPU/ARPDAU/ARPPU, conversion/attach/repeat, renewal/churn/refund, eCPM/fill/CTR, CAC/LTV/payback, infra/support/fraud cost, D1/D7/D30은 `HYPOTHESIS/TEST TARGET`만 허용하며 scale/iterate/kill은 cohort와 retention/fairness/policy/support/fraud guardrail을 함께 본다.
- **우선순위/실행 백로그:** P0 isolated restore + off-host immutable replication + alert 증거 → P0 잔여 release-authority matrix → migration-204 real-DB/economy-integrity → HIGH auth/BOLA/CSRF/idempotency/ledger/payment/webhook/upstream-abuse → P1 exact-main responsive Test/Production 증거 + required-check evidence refresh/enforcement → Discord Production smoke → P2 Gallery ad-CSP 판정 → core correctness → monetization → SEO/acquisition → retention/accessibility. Planning은 runtime/DB를 배포하지 않으며 구현은 branch → CI/tests → exact-SHA Test → backend/API/DB/user-flow QA → main → Production promotion → smoke/rollback 순서다.

### v203 worklog / 수용 순서
Google Search Central·OWASP·Google Play 최신 공식자료 → exact main/닫힌 v202 writer 상태/latest Actions 확인 → 권위 Debian service/version/backup 재현 → 전체 기능/SEO/보안/수익성/QA delta → 작업 중간 exact-main 재확인 → EN/KO 동기화 → diff/CI/PR.

## 회차 델타 — v2026.09.18.201 (2026-09-18)

### 모바일 반응형 UI QA 및 가로 넘침 방지 강화

- **브랜치/범위:** `fix/ui-responsive-qa-v2026.09.18.201`은 권위 `main` v200 기준이다. 이번 회차는 runtime-relevant 프론트엔드 변경이므로 branch → CI/tests → exact-SHA Test → backend/API/user-flow QA → main/Production 승격 → smoke/rollback 순서를 따른다.
- **반응형 수정:** 전역 모바일 drawer를 viewport 안으로 제한하고, 하단 5개 탭이 고정 최소 폭 없이 좁은 화면을 나눠 쓰게 했다. 은행의 과밀한 헤더·액션·대출 요약은 stack/wrap하고, 480px 미만 은행 요약은 1열이며, 인벤토리 profile/quick-slot은 안전하게 줄어든다.
- **릴리스 전 증거:** repository lint 오류 0건과 기존 이미지 경고 11건, workspace typecheck, frontend Production build, frontend 70개 파일/619개 테스트가 통과했다. Chromium 320/360/390px에서 공개 경로 7개를 점검한 21/21 조합이 HTTP 200이고 document-level 가로 overflow는 0건이다. Gallery의 기존 Google 광고 품질 CSP 거부는 별도 추적한다.
- **릴리스 안전:** DB migration, API contract, ledger, entitlement, authentication 동작 변경은 없다. exact candidate가 Test backend/API/frontend smoke를 통과하기 전 Production은 차단하며, 현재 Debian systemd 권위에서 이전 release를 rollback anchor로 보존한다.

### v201 worklog / 수용 순서
현재 plan/main 재확인 → clean branch/worktree → baseline QA → 반응형 감사·수정 → 회귀 테스트 → Production build → 320/360/390px 브라우저 QA → EN/KO plan/update/worklog → branch push/CI → exact-SHA Test backend/frontend smoke → Production 승격 및 사후 smoke.

## 회차 델타 — v2026.09.18.200 (2026-09-18)

### v199 종결, 자정 runtime/DR 증거 갱신, SEO·수수료 정책 날짜 교정

- **정확한 main / 이전 회차 종결:** v199 PR #446 exact head `d6454a3be479eabacbba1b70b13dacb575a95cbc`는 mergeable이고 CI #1246/run `35231942840`이 성공 완료되어 우회 없이 squash merge했다. 이번 회차 authoritative main은 `08cb420b8770334009033396b8ea9511b5d8cad7`이다. Required status check 강제는 classifier/policy/runtime/security check를 required로 지정하고 의도적 실패 check가 merge를 거부하는 증거 전까지 **P1 / OPEN**이다.
- **P0 백업/DR `BAK-RUNTIME-177-01`: IN PROGRESS, 최신 재현 2026-09-18 00:03 KST.** 권위 Debian의 backend/frontend/`moneyverse-backup.timer`는 active, timer는 enabled이고 다음 실행은 00:22 KST다. 21:22·21:57 encrypted run의 archive, `database.dump`, `photos.tar.zst`, `manifest.txt` 검증 성공도 유지된다. DONE에는 최신 archive isolated restore, decrypt/checksum/schema/migration-set 검증, identity/session·inventory/entitlement·ledger/reward·bank/loan·stocks·casino·community/referral·audit 불변조건 reconciliation, 실측 RPO/RTO, off-host immutable 복제/retention, missed-run/verify/replication/restore 실패 alert 증거가 필요하다. 불일치는 fail-closed다. 이번 planning에는 데이터 migration이 없으며 restore 도구는 격리된 폐기 가능 DB/storage만 생성할 수 있다. Rollback은 잘못된 자동화만 disable하고 모든 last-known-good archive와 암호화 키를 보존한다. last-success age/next trigger/archive size·checksum/free space/replication lag/reconciliation/alert delivery를 관측한다. 그 전 destructive schema/ledger/entitlement rewrite는 Production 차단이다.
- **Runtime identity / release authority:** 00:03 KST backend 직접 `/api/version`은 HTTP 200, `Cache-Control: no-store`, build `75e69e77cdc18ef221106a008563151a4c790728`이고 서비스는 active다. Planning/bot commit 때문에 repository main이 더 최신이어도 runtime rollout을 의미하지 않는다. `REL-AUTH-184-01`은 **P0 / IN PROGRESS**다. DOCS_ONLY containment 3회는 확보했지만 CONTROL_PLANE_ONLY ×3, RUNTIME_RELEVANT exact-candidate ×2, MIXED ×1, missing/stale/foreign candidate 음성 dispatch가 남았다. 승격은 candidate `{applicationSourceSha,imageDigest,migrationSetHash,deploymentId}`, exact Test attestation, `/health`, BFF/public smoke, session continuity, migration equality, journal, rollback manifest가 필수다.
- **전체 기능 실행계약:** auth/signup/login/OAuth/logout/session/security center, profile, inventory/collection, shop/cart/payment/subscription/ad-removal, season/quest/job/level/reward, business/bank/loan, virtual stocks/portfolio/alerts/comparison, casino/randomized mechanics, community/posts/comments/report/block, friends/clubs/invite/referral, notifications/search/gallery/upload/public content, App API, admin/audit, backup/restore, analytics/experiments, ads, SEO backend/tooling, Discord, incident operations는 기존 화면 entry/CTA/loading-empty-error-offline-timeout/recovery, responsive/a11y/i18n, ownership/RBAC, endpoint/request/response/error/idempotency/rate-limit, service rule, DB PK/FK/index/unique/check/transaction/concurrency, audit/observability, admin/flag/fallback, privacy/abuse, SEO, event/KPI, performance/cache, unit/integration/E2E/real-DB/security/regression, deploy/rollback 계약을 유지한다. 코드·문서 근거와 exact-environment 수용증거 없이는 planned/partial/merged에서 DONE으로 승격하지 않는다. 경제적으로 비가역적인 mutation은 fresh verified backup, off-host copy, restore drill, deployed identity도 필요하다.
- **SEO/SEO 백엔드 — 직접채택:** Google Search Central update log의 2026-09-17 infinite-scroll 지침 이전은 내용 변경이 없다. Public community/catalog/collection/search infinite scroll은 crawlable pagination URL, server-rendered link, stable ordering, page별 self-canonical/title/H1, 정상 200/404와 정책 기반 sitemap 포함을 유지한다. Cursor/facet query는 API 내부용 또는 SEO read-model이 durable landing으로 승격하기 전 기본 noindex/canonical이다. Server metadata/canonical generator/robots/split sitemap+`lastModified`/breadcrumb·JSON-LD serializer/hreflang/SSR·ISR/image metadata/redirect map/crawler log/Search Console·Naver ingestion은 독립 backend 책임이다. Private/account/admin/security/transaction은 강제 `noindex`다. KPI는 impression→CTR→organic visit→signup→activation→D7/D30→revenue이고 thin/duplicate index와 CWV를 guardrail로 둔다.
- **보안 — 직접채택:** OWASP API Security 최신 API-specific Top 10은 계속 2023이다. BOLA, broken authentication, object-property/function authorization, resource consumption, sensitive-business-flow abuse, SSRF, misconfiguration, API inventory, unsafe upstream consumption을 release-block한다. 전 기능 교차 gate에는 cookie mutation CSRF, XSS/SQLi/path/command injection, upload isolation, brute-force/bot/multi-account/referral fraud, reward/ledger replay, market/casino manipulation, signed payment receipt/webhook, CORS/CSP/security header, secret/supply-chain, DB least privilege, backup-key separation, immutable masked audit와 retention/deletion을 포함한다. HIGH 위험마다 예방·탐지 통제, 로그/알림 필드, 음성 테스트, 배포차단 여부, 잔여위험 owner가 필요하다.
- **수익성/unit economics — 정책 날짜 교정:** Google Play 현행 문서는 EEA/UK/US 새 모델 예시를 auto-renew 10%, 기타 new-install 20%, 기타 existing-install 25%와 applicable 5% billing fee로 제시한다. 한국 alternative billing은 현재 pre-rollout 조건에서 applicable Play service fee 대비 4%p 감액이며, 더 넓은 새 수수료 모델/expanded billing-choice의 KR rollout은 **2026-12-31 예정**이므로 두 정책을 혼동하지 않는다. 모든 SKU는 `{market,effectiveDate,installCohort,transactionType,programme,billingPath,tax/refund assumption}`을 resolve한 뒤 revenue→net revenue→gross/contribution margin을 계산한다. 미실측 ARPU/ARPDAU/ARPPU, paid conversion, attach/repeat, renewal/churn/refund, CAC/LTV/payback, ad eCPM/fill/CTR/net churn effect, infra/support/fraud cost, D1/D7/D30은 `HYPOTHESIS/TEST TARGET`만 허용한다. Kill/iterate/scale은 cohort 증거와 fairness/retention/policy/support/fraud guardrail을 함께 본다.
- **우선순위/실행 백로그:** P0 isolated restore + off-host immutable replication + alerts → P0 잔여 release-class/candidate-authority matrix → migration-204 real-DB/economy-integrity → HIGH auth/BOLA/CSRF/idempotency/ledger/payment/webhook/abuse → P1 required-check enforcement → Discord Production smoke → core correctness → monetization → SEO/acquisition → retention/accessibility. Planning은 runtime/DB를 직접 또는 암묵적으로 배포하지 않는다. 구현은 branch → CI/tests → exact-SHA Test → backend/API/DB/user-flow QA → main → Production promotion → smoke/rollback이다.

### v200 worklog / 수용 순서
Google Search Central·Google Play·OWASP 최신 공식자료 → v199 exact PR/CI/main 종결 → 권위 Debian service/version/backup 재현 → 전체 기능/SEO/보안/사업성 delta 및 수수료 정책 날짜 교정 → 작업 중간 exact-main 재확인 → EN/KO 동기화 → diff/CI/PR.

## 회차 델타 — v2026.09.17.199 (2026-09-17)

### 세 번째 docs-only containment 증거, runtime/backup 안정 유지, SEO pagination 계약 유지

- **정확한 main / CI 증거:** 시작 및 작업 중간 main은 `81043cc87978b6f9d73d40364f001e0f31fd5a9e`(v198 planning merge)다. Build Production Release #970 / run `35231316419`은 성공했고 `prepare`가 Production/registry 접근 전에 immutable release input을 검증했으며 runtime candidate download/validation, `test-gate`, `build`는 skipped였다. 이를 **세 번째 DOCS_ONLY classifier containment 관측**으로 기록하되 모든 privileged side effect가 불가능하다는 증거로 과대평가하지 않는다. `REL-AUTH-184-01`은 control-plane-only ×3, runtime-relevant exact-candidate ×2, mixed ×1, missing/stale/foreign-candidate 음성 케이스와 audit 증거 완료 전까지 **P0 / IN PROGRESS**다.
- **P0 백업/DR `BAK-RUNTIME-177-01`: IN PROGRESS, 회귀 없음.** 약 23:09 KST 권위 Debian에서 backend/frontend/backup timer는 active, timer는 enabled, 다음 실행은 00:22 KST 예약이며 21:22/21:57 encrypted archive/database/photos/manifest 검증 성공이 유지된다. 샘플 1시간 backend warning 이상 journal은 없었다. DONE에는 isolated restore+domain reconciliation, 실측 RPO/RTO, off-host immutable 복제/retention, alert 증거가 필요하다. decrypt/checksum/schema/migration/invariant 불일치는 fail-closed이며 Production restore와 destructive schema/ledger/entitlement rewrite는 계속 차단한다.
- **Runtime identity:** backend 직접 `/api/version`은 HTTP 200, `Cache-Control: no-store`, build `75e69e77cdc18ef221106a008563151a4c790728`을 유지한다. 저장소 head와 배포 application identity는 의도적으로 별도 권위다. Runtime 승격은 candidate manifest `{applicationSourceSha,imageDigest,migrationSetHash,deploymentId}`, isolated-Test attestation, `/health`, BFF/public smoke, session continuity, migration equality, journal review, rollback manifest가 필요하다.
- **전체 기능 구현/QA 계약:** auth/signup/login/OAuth/logout/session/security center, profile, inventory/collection, shop/cart/payment/subscription/ad-removal, season/quest/job/level/reward, business/bank/loan, virtual stocks/portfolio/alerts/comparison, casino/randomized flow, community/posts/comments/report/block, friends/clubs/invite/referral, notifications/search/gallery/upload/public content, App API, admin/audit, backup/restore, analytics/experiments, ads, SEO backend/tooling, Discord, incident operations의 기존 구현계약을 유지한다. 모든 상태변경 흐름은 ownership/BOLA, validation, idempotency/replay, rate limit, DB transaction/unique/check constraint와 concurrency, immutable audit receipt, offline/timeout/fallback UX, privacy/abuse, analytics guardrail, real-DB/E2E/security regression, rollback을 정의해야 한다. 코드/문서/exact-environment 증거 없이는 DONE 금지다.
- **SEO/SEO 백엔드 — 직접채택:** 이번 회차의 2026-09-17 cutoff 기준 최신 적용 가능한 Google Search Central 문서 delta는 2026-09-17 infinite-scroll JavaScript 지침의 현행 문서 이전이며 지침 변경은 없다. Public community/catalog/collection/search 목록은 crawlable pagination URL, server-renderable link, stable ordering, page별 self-canonical/title/H1, 정상 200/404, 독립 가치 page만 sitemap 포함을 유지하고 cursor는 API 내부용으로 제한한다. Server metadata/canonical/robots/sitemap+lastModified/breadcrumb/JSON-LD/hreflang/SSR-ISR/CWV/permanent redirect, private/account/admin/transaction `noindex`, UGC/sponsored governance, Search Console/Naver 수집, crawler-log 진단, organic→signup→activation→D7/D30→revenue attribution도 계속 권위 계약이다.
- **보안:** OWASP API Security 최신 API-specific Top 10은 계속 2023이다. BOLA, broken authentication, property/function authorization, resource consumption, sensitive-business-flow abuse, SSRF, misconfiguration, inventory, unsafe-upstream consumption은 release-blocking이다. Payment/entitlement/reward mutation은 cookie auth 시 CSRF, signed webhook/receipt 검증, replay-safe idempotency, server-authoritative price/SKU, DB least privilege, immutable audit, fraud/multi-account 탐지가 추가로 필요하다. Merchant SEO metadata는 가격 권위가 될 수 없다.
- **수익성/unit economics:** Google Play은 단일 universal fee가 없다. EEA/UK/US standard 예시는 auto-renew 10%, 기타 new-install 20%, 기타 existing-install 25%와 applicable billing fee이며 한국 alternative billing은 현행 조건상 해당 Play fee에서 4%p 감액된다. `market × effectiveDate × installCohort × transactionType × programme × billingPath`를 먼저 resolve해 net revenue/contribution margin을 계산한다. Sale-price 실험은 SKU별 정상가, 할인폭, attach/conversion lift, cannibalization, refund/churn, fraud, margin guardrail을 요구하며 미실측 ARPU/ARPDAU/ARPPU/CAC/LTV/D1/D7/D30은 `HYPOTHESIS/TEST TARGET`이다.
- **우선순위/실행 백로그:** P0 isolated restore + off-host immutable backup + alert → P0 잔여 release-class/candidate-authority matrix → migration-204 real-DB/economy-integrity → HIGH auth/BOLA/CSRF/idempotency/ledger/payment/webhook → P1 required-check enforcement → Discord Production smoke → correctness → monetization → SEO/acquisition → retention/accessibility. 기획은 runtime/DB를 변경하지 않는다.

### v199 worklog / 수용 순서
Google Search/Play와 OWASP 최신 공식자료 → exact main + Actions #970 + 권위 Debian runtime/backup 대조 → 전체 기능/SEO/보안/사업성 delta → 작업 중간 exact-main 재확인 → EN/KO 동기화 → diff/CI/PR.

## 회차 델타 — v2026.09.17.198 (2026-09-17)

### Production identity 확인, 백업 DR 증거는 P0 유지, 저장소 required-check 강제는 미완료

- **정확한 main / 이전 회차 종결:** v197 PR #444 exact head `9c533c33389995880716489b5bae603da82aeb42`는 CI #1242 성공 후 squash merge됐다. 이번 회차 시작점은 `dfeddd2c680e0f3324abf9149105152e09c2a331`이다. Branch protection은 켜져 있지만 required status check는 `enforcement_level=off`, required context/check 0개이므로 **P1 / OPEN**이다. P0 직후 classifier+policy+runtime/security check를 repository-required로 만들고 실패 check가 merge를 차단하는 음성 테스트가 필요하다.
- **P0 백업/DR `BAK-RUNTIME-177-01`: IN PROGRESS.** 약 23:00 KST backend/frontend/backup timer는 active이고 21:22·21:57 encrypted backup 검증 성공과 다음 timer 예약을 확인했다. DONE에는 최신 archive isolated restore, decrypt/checksum/schema/migration-set 검증, identity/session·inventory/entitlement·ledger/reward·bank/loan·stocks·casino·community/referral·audit reconciliation, 실측 RPO/RTO, off-host immutable 복제/retention, missed-run/verification/replication/restore alert 증거가 모두 필요하다. 불일치는 fail-closed이며 reconciliation 전 Production restore와 destructive schema/ledger/entitlement rewrite를 금지한다.
- **Production runtime identity:** backend 직접 `/api/version`은 HTTP 200과 `Cache-Control: no-store`를 반환한다. 배포 application build와 repository head는 별도 권위이며 docs/bot/planning commit을 application rollout으로 해석하지 않는다. Runtime 승격은 candidate manifest `{applicationSourceSha,imageDigest,migrationSetHash,deploymentId}`, isolated-Test attestation, `/health`, BFF/public smoke, session continuity, migration equality, journal review, rollback manifest가 필요하다.
- **전체 기능 구현/QA 계약:** auth/signup/login/OAuth/logout/session/security center, profile, inventory/collection, shop/cart/payment/subscription/ad-removal, season/quest/job/level/reward, business/bank/loan, virtual stocks/portfolio/alerts/comparison, casino/randomized flow, community/posts/comments/report/block, friends/clubs/invite/referral, notifications/search/gallery/upload/public content, App API, admin/audit, backup/restore, analytics/experiments, ads, SEO backend/tooling, Discord 연동, incident operations의 기존 화면상태·권한/소유권·API error/idempotency/rate-limit·DB key/index/constraint/transaction/concurrency·audit/fallback/privacy/abuse·KPI·performance/cache·unit/integration/E2E/real-DB/security/regression·deploy/rollback 계약을 유지한다. 코드/문서 근거와 exact-environment QA 없이는 DONE 금지다. #441 Discord reset은 **MERGED / production-smoke-pending**이다.
- **SEO/SEO 백엔드:** Google Search Central update log는 2026-09-17 infinite-scroll JavaScript 지침을 현행 문서로 이전했고 지침 변경은 없다고 기록한다. Public community/catalog/collection/search 목록은 crawlable pagination URL, server-renderable link, stable ordering, page별 self-canonical/title/H1, 정상 200/404를 제공하고 독립 가치 page만 sitemap에 포함한다. Cursor는 API 내부용이다. Server metadata/canonical/robots/sitemap+lastModified/breadcrumb/JSON-LD/hreflang/SSR-ISR/CWV/permanent redirect, private/account/admin/transaction `noindex`, UGC/sponsored governance, Search Console/Naver 상태수집, crawler-log 진단, organic→signup→activation→D7/D30→revenue attribution을 유지한다.
- **보안:** OWASP API Security 최신 API-specific Top 10은 계속 2023이다. BOLA, broken authentication, object-property/function authorization, resource exhaustion, sensitive-business-flow abuse, SSRF, misconfiguration, API inventory, unsafe-upstream consumption을 release-blocking QA로 둔다. Cookie mutation CSRF, reward/payment/ledger replay-safe idempotency, DB least privilege, payment/webhook signature, upload isolation, secret/log redaction, immutable audit receipt도 필수다. Backup/release manifest 불일치는 차단한다.
- **수익성/unit economics:** Google Play 수수료는 market/install cohort/transaction/programme/billing path별로 다르다. EEA/UK/US standard 예시는 auto-renew 10%, 기타 new-install 20%, 기타 existing-install 25%와 applicable billing fee이며 한국 alternative billing은 현재 programme terms상 해당 Play fee에서 4%p 감액된다. 모든 SKU는 effective fee policy를 resolve한 뒤 net revenue/contribution margin을 계산한다. Revenue/net revenue/margin, ARPU/ARPDAU/ARPPU, conversion, repeat/renewal/churn/refund, CAC/LTV/payback, 광고 순효과, infra/support/fraud, D1/D7/D30은 실측 또는 `HYPOTHESIS/TEST TARGET`만 허용하고 kill/iterate/scale은 fairness/retention/security guardrail을 함께 본다.
- **우선순위:** P0 isolated restore + off-host immutable backup + alert → P0 release-class matrix/candidate authority → migration-204 real-DB/economy-integrity → HIGH auth/BOLA/CSRF/idempotency/ledger-abuse/payment/webhook → P1 required-check enforcement → Discord Production smoke → correctness → monetization → SEO/acquisition → retention/accessibility. 기획 자동화는 runtime/DB를 배포하지 않는다.

### v198 worklog
Google Search/Play와 OWASP 최신 공식자료 → exact main/PR/CI 및 Debian runtime/backup 대조 → 전체 기능/SEO/보안/사업성 delta → 작업 중간 exact-main 재확인 → EN/KO 동기화 → diff/CI/PR.

## 회차 델타 — v2026.09.17.197 (2026-09-17)

### 운영 backend identity 증명 완료, backup P0 잔여범위 축소

- 작업 중간 main은 bd07f6d8ffd9fb1956c15db9850afe699865f08e다. 권위 Debian backend/frontend는 active이며 backend 직접 /api/version은 HTTP 200, no-store, deployed application build 75e69e77cdc18ef221106a008563151a4c790728을 반환한다. Backend-owned runtime identity는 이 application SHA에 대해 PRODUCTION-PROVEN이다.
- P0 BAK-RUNTIME-177-01은 IN PROGRESS다. 6시간 timer는 enabled/active이고 21:22/21:57 encrypted backup 검증은 성공했다. 남은 gate는 isolated restore+domain reconciliation, 실측 RPO/RTO, off-host immutable replication/retention, failure alert 증거다. 그 전 destructive schema/ledger/entitlement rewrite는 차단한다.
- REL-AUTH-184-01은 전체 release-class 및 invalid-candidate matrix 완료 전까지 P0다. OWASP API Security 최신 API-specific Top 10은 2023이며 BOLA, authentication, authorization, resource exhaustion, sensitive-flow abuse, SSRF, misconfiguration, inventory, unsafe-upstream test를 release blocking으로 유지한다.
- 기존 전체 기능의 화면상태, 권한, API, DB/동시성, 감사, fallback, privacy/abuse, KPI, 성능, QA, rollback 계약은 유지한다. 상태 mutation은 ownership/BOLA, idempotency/replay, transaction/unique constraint, audit receipt, real-DB concurrency test가 필수다.
- SEO: Google Search Central은 2026-09-17 infinite-scroll 지침을 변경 없이 현행 문서로 이전했다. 공개 infinite-scroll 화면은 crawlable paginated URL, server-renderable link, stable ordering, self-canonical, deterministic title/H1, 정상 200/404를 제공하고 cursor는 API 내부용, facet은 승격 전 기본 noindex/canonical로 한다.
- 수익성: Google Play EEA/UK/US standard 예시는 auto-renew 10%, 기타 new-install 20%, 기타 existing-install 25%와 applicable 5% billing fee이며 KR rollout은 2026-12-31 예정이다. SKU economics는 policy-versioned로 계산하고 미실측 지표는 가설/테스트 기준으로만 기록한다.
- Bot/main 델타: 작업 중간 main에는 PR #441도 병합되어 길드 범위 Discord 명령어를 지원 음악 명령 7개로 원자 교체하고 global command는 유지한다. 운영 재시작 후 command/voice smoke 증거 전까지 MERGED / PRODUCTION-POST-RESTART-SMOKE-PENDING으로 분류한다.
- 우선순위: P0 isolated restore/off-host backup → P0 release-class matrix → migration-204 real-DB/economy-integrity → HIGH auth/BOLA/CSRF/idempotency/ledger-abuse → P1 required-check enforcement → correctness → monetization → SEO/acquisition → retention/accessibility.

### v197 worklog
최신 공식자료 → exact main/PR/CI → Debian backup/runtime identity → 전체 기능/SEO/보안/사업성 delta → 작업 중간 main 재확인 → EN/KO 동기화 → diff/CI/PR.

## 회차 델타 — v2026.09.17.196 (2026-09-17)

### 백업 런타임 활성화, backend identity 코드는 병합됐지만 운영 backend는 아직 구버전, 9월 17일 SEO pagination 델타

- **Exact main / 구현 대조:** 회차 시작 main은 `75e69e77cdc18ef221106a008563151a4c790728`이다. PR #442는 backend-owned `GET /api/version`, `Cache-Control: no-store`, E2E를 병합했고 commit에는 isolated Test exact candidate, migration 204, public smoke, noindex, session continuity 증거가 기록돼 있다. 이는 코드/Test 증거이며 Production backend 승격 증거가 아니다.
- **P0 `BAK-RUNTIME-177-01`: 부분 해소 / IN PROGRESS.** 권위 Debian의 `moneyverse-backup.timer`가 이제 enabled+active이며 6시간 주기, Persistent, randomized delay로 예약된다. Service는 oneshot, `UMask=0077`, `NoNewPrivileges=true`, `ProtectSystem=strict`, source read-only, backup destination 단일 write 경계를 가진다. 약 21:22와 21:57 KST 실행에서 encrypted archive 검증, `database.dump`, `photos.tar.zst`, `manifest.txt`가 모두 OK였다. 따라서 기존 “timer 없음/자동 암호화 로컬백업 없음” 결함은 닫지만 **P0 전체는 닫지 않는다.** Isolated restore+domain reconciliation drill, 실측 RPO/RTO, off-host immutable copy/retention, 실패 alert 증거가 남았다. 로컬 암호화 사본만으로 DR로 인정하지 않는다. 그 전 destructive migration/ledger/entitlement rewrite는 계속 차단한다. Rollback은 timer disable + 생성된 good archive 보존이며 마지막 정상 archive를 rollback 과정에서 삭제하지 않는다. last-success age, next trigger, archive size/checksum, decrypt/structure, disk free, retention deletion, off-host replication lag, restore reconciliation을 관측한다.
- **P0 backend runtime identity: MERGED / TEST-PROVEN / PRODUCTION-NOT-PROVEN.** Production `moneyverse-backend`는 active이고 표본 구간 warning 이상 journal은 없지만 직접 `http://127.0.0.1:3000/api/version`은 아직 404다. 즉 main에는 #442가 있어도 운영 backend process는 이전 build다. 승격은 attested exact candidate로만 수행한다. 수용조건은 expected application build ID의 `/api/version=200` + `no-store`, `/health=200`, BFF viewer/wallet/status/announcements/shop smoke, session-count continuity, migration-set equality, 신규 warning/error burst 없음, rollback manifest다. Blind restart는 금지한다.
- **Release/QA 순서:** `REL-AUTH-184-01`은 P0 IN PROGRESS다. Backend identity endpoint는 attestation primitive지만 candidate digest + applicationSourceSha + migrationSetHash + deploymentId 결합을 대체하지 않는다. 기존 docs-only/control-plane/runtime/mixed와 stale/foreign/missing-candidate matrix를 완료해야 DONE이다. GitHub required checks 강제는 P0 데이터안전/release identity 다음 P1이다.
- **전체 기능 계약 델타:** 모든 stateful 기능(identity/session, inventory/entitlement, shop/payment/subscription, jobs/rewards/ledger, business/bank/loan, stocks, casino, community/referral, admin/audit/analytics)은 destructive 또는 경제적으로 비가역적인 변경의 운영승격 선행조건으로 `backup_last_verified_at`, `offhost_replication_at`, `restore_drill_at`, `restore_reconciliation_status`, deployed backend build identity를 요구한다. Admin/incident UI는 stale backup/identity mismatch를 안내 배너가 아니라 blocking 상태로 표시한다. API mutation은 idempotency key, ownership/BOLA, transaction constraint, audit receipt를 유지하며 backup/restore는 사용자 호출 API로 노출하지 않는다.
- **SEO/SEO backend 델타(Google Search Central 2026-09-17): 공개 목록 화면에 직접 채택.** Google은 infinite-scroll 지침을 최신 문서로 이전했고 지침 자체는 변경하지 않았다. Infinite scroll을 쓰는 커뮤니티 feed, 공개 collection/catalog/search landing은 stable ordering의 crawlable paginated URL과 server-renderable link를 제공해야 하며 scroll-only JavaScript discovery를 indexability 계약으로 삼지 않는다. Index 가능한 각 page는 자기 URL self-canonical, 결정적 title/H1 context, 정상 200/404, 정책상 독립 가치가 있을 때만 sitemap 포함을 갖는다. Facet/query 조합은 SEO read-model이 명시적으로 승격하지 않으면 기본 noindex/canonical 정책이다. Cursor token은 API 내부 구현이며 영구 public slug가 아니다. QA는 JS-disabled link traversal, Google-rendered HTML parity, duplicate/canonical, out-of-range 404, sitemap/lastModified, append CWV, crawler-log sampling을 포함한다. KPI는 organic impression/CTR→signup→activation→D7/D30→revenue이며 thin/duplicate index 증가는 guardrail이다.
- **보안 레퍼런스 갱신:** OWASP API Security는 API-specific 최신판을 2023으로 유지한다. BOLA, broken authentication, object-property/function authorization, resource consumption, sensitive-business-flow abuse, SSRF, misconfiguration, inventory, unsafe-upstream을 release-blocking test로 유지한다. Backup key는 release/backup destination 밖에 두고 log 금지, restore는 decrypt/checksum/schema/reconciliation mismatch 시 fail-closed한다. Runtime identity 공개 응답에는 immutable build identity만 두며 secret/host/DB/commit author/environment metadata는 금지한다.
- **수익성/unit economics 갱신:** Google Play는 단일 universal fee가 없음을 명시한다. EEA/UK/US는 2026-06-30부터 standard 예시가 auto-renew subscription 10%, new-install 기타 20%, existing-install 기타 25%이며 해당 Play Billing에는 5% billing fee가 더해질 수 있고 KR rollout은 2026-12-31 예정이다. SKU는 `market × effectiveDate × installCohort × transactionType × programme × billingPath`를 먼저 resolve한 뒤 net revenue/contribution margin을 계산한다. 새 실측 purchase/ad cohort는 없어 ARPU/ARPDAU/ARPPU, conversion, churn/refund, CAC/LTV, fraud, infra/support는 실측 또는 명시적 가설/테스트 기준만 허용한다. Backup/identity 작업의 사업효과는 직접매출이 아니라 expected-loss/downtime/refund/support 감소로 평가한다.
- **우선순위/개발 연결:** P0 isolated restore + off-host immutable backup 증거 → P0 exact-candidate Production backend identity 승격 + release-class matrix → migration-204 real-DB/economy-integrity 증거 → HIGH auth/BOLA/CSRF/idempotency/ledger-abuse gate → P1 required-check enforcement → correctness → monetization → SEO/acquisition → retention/accessibility. 기획 자동화는 runtime 배포나 DB mutation을 하지 않는다.

### v196 worklog / 수용 순서
최신 Google Search/Play·OWASP 공식자료 → exact main/PR/CI·권위 Debian runtime 대조 → backup/identity 증거 재분류 → 전체 기능/SEO/보안/사업성 계약 델타 → 작업 중간 exact-main 재확인 → EN/KO 동기화 → diff/CI/PR.

## 회차 델타 — v2026.09.17.195 (2026-09-17)

### v193 API-cache Production 증거

- **증거 브랜치 / 기준:** `docs/api-cache-production-evidence-v2026.09.17.195`, 정확한 v193 병합 main `4ab9665bc7ae14469575b6bd9c60c2c41b16b083`.
- **Production 증거:** 병합된 v193 helper로 활성 v186 frontend cache를 `root:root`에서 `debian:debian`으로 수정했다. 수정 전 10분에 cache `EACCES` 16건이 있었고 수정 후 검증에서 새 cache 오류는 0건이다.
- **무중단:** frontend PID `1204581`, backend PID `400161`이 유지됐다. backend 직접/공개 health, BFF viewer/wallet summary, status, announcements, shop 모두 HTTP 200이다. backend/DB 변경이나 migration 승격은 없었다.
- **경계 유지:** public NestJS `/api/v1/*` 직접 노출 금지는 그대로이며 browser API 경계는 Next BFF다.

## 회차 델타 — v2026.09.17.193 (2026-09-17)

### API 이상 점검 — frontend 서버 cache 런타임 소유권

- **브랜치 / 정확한 기준:** `fix/frontend-api-cache-permissions-v2026.09.17.193`, 기준 `5d5826b21a9e4ae98fd0dcbe771d57fa8c674c84`. Production NestJS `/health`와 공개 Next BFF JSON 경로는 정상이며 문서화된 edge 예외 외 public `/api/v1/*` 직접 노출 금지는 의도된 경계다.
- **확인된 이상:** Production Next.js가 `.next/cache/fetch-cache` 갱신 중 `EACCES`를 반복 기록한다. v186 Production frontend cache는 `root:root`인데 `moneyverse-frontend.service`는 `debian`으로 실행되고, Test cache는 `debian:debian`이다. backend가 정상이어도 API 기반 ISR/fetch 데이터가 오래된 상태로 남을 수 있다.
- **예방 통제:** `frontend/.next/cache`만 runtime 사용자 소유로 맞추고 release root 밖 경로를 거부하며 runtime 사용자 실제 쓰기를 확인하는 host-mirror helper를 추가한다. release 전체 recursive ownership 변경은 금지한다.
- **릴리스 gate:** helper 회귀 테스트 → exact Test cache 준비 → Test backend health/BFF/revalidation/no-EACCES → 작업 중간 plan/main 재확인 → GitHub CI → Production cache 무중단 수정 → Production smoke/journal 검증. backend 재시작, DB 변경, 사용자 상태 변경, migration 204 승격은 이 수정 범위에 포함하지 않는다.
- **병렬 P0:** v192 backup/runtime identity 복구는 독립 작업이며 기존 안전 gate를 그대로 유지한다.


## 회차 델타 — v2026.09.17.189 (2026-09-17)

### docs-only containment 증거 추가, backup/runtime P0 유지, required-check 공백 지속

- **Exact main / CI 증거:** 시작·중간 재확인 `main=060968b0b7e6ed462fa653fa9e3e50b7f3a84459`(v188 문서 병합)이다. branch protection은 켜져 있지만 required status check는 `enforcement_level=off`, required context/check 0개로 여전히 저장소 강제 gate가 아니다. 이 docs-only main에는 Actions run 6개가 연결돼 있고 cleanup은 예상대로 skipped다. docs-only workflow의 부재/skipped를 runtime 성공 증거로 해석하지 않는다.
- **P0 `REL-AUTH-184-01`: IN PROGRESS.** v188 자체가 `DOCS_ONLY` main이므로 repository head가 바뀌었다는 이유만으로 application/runtime 배포가 허용되지 않는 containment 관측 1건을 추가한다. 전체 matrix 완료는 아니다. docs-only 3회(runtime/DB/registry/Production environment side effect=0), control-plane-only 3회(application build/repository-SHA Test polling=0), runtime-relevant exact-candidate 2회, mixed 1회, missing/stale/foreign candidate 음성 dispatch를 모두 요구한다. required-check enforcement는 P0 backup/release identity 직후 P1로 둔다.
- **P0 `BAK-RUNTIME-177-01`: OPEN / 약 21:00 KST 재현.** 권위 Debian backend/frontend service는 active이나 `moneyverse-backup.timer`는 여전히 없고 backend 직접 `GET /api/version`은 HTTP 404다. 영향은 auth/session, inventory/collection, shop/payment/subscription entitlement, jobs/reward/ledger, business/bank/loan, stocks, casino, community/moderation, referral, audit/analytics 전체 상태영역이다. 원인은 UI가 아니라 운영 capability/evidence 부재다. least-privilege scheduled encrypted backup과 `{backupId,startedAt,completedAt,sourceDbVersion,schemaMigrationSetHash,objectCounts,checksum,encryptionKeyVersion}` manifest, decrypt/checksum/structure 검증, isolated restore, domain reconciliation, off-host immutable retention, restore drill/alerting을 구현한다. RPO/RTO와 restore 증거 전 destructive migration 및 ledger/entitlement rewrite는 운영승격 금지다.
- **전체 기능 구현계약 유지:** auth/signup/login/OAuth/logout/session/security center, profile, inventory/collection, shop/cart/payment/subscription/ad-removal, season/quest/job/level/reward, business/bank/loan, virtual stocks/portfolio/alerts/comparison, casino/randomized mechanics, community/posts/comments/report/block, friends/clubs/invite/referral, notifications/search/gallery/upload/public content, App API, admin/audit, backup/restore, analytics/experiments, ads, SEO backend/tooling, incident operations의 화면 상태, ownership/authorization, API error/idempotency/rate limit, DB key/constraint/transaction/concurrency, audit/fallback/privacy/abuse, analytics/KPI, performance/cache, QA와 deploy/rollback 계약을 유지한다. v187 Bootstrap 격리는 frontend-only Production-proven이고 migration 204 adaptive profession limits는 MERGED / NOT PRODUCTION-PROVEN이다.
- **SEO/성장 최신 판정:** Google Search Central 최신 major 문서 변경은 2026-09-16 Search profile badge이고 9월 8일 regional Search experience, 8월 28일 site-reputation enforcement 변경을 함께 적용한다. 서버권위 metadata/canonical/robots/sitemap/lastModified/breadcrumb/structured data/hreflang/SSR-ISR/CWV/redirect, private/account/admin/transaction `noindex`, crawler-observable SEO read model, UGC/sponsored index governance를 유지한다. SEO backend는 permanent slug/redirect map, sitemap partition, indexability state, Search Console/Naver 상태 수집, crawler-log 진단, organic→signup→activation→D7/D30→revenue attribution을 제공한다. Search profile badge는 선택적 acquisition affordance이지 ranking 보장이 아니다.
- **보안 최신 판정:** OWASP API Security Project의 최신 API-specific Top 10은 2023이다. BOLA, broken authentication, object-property/function authorization, resource exhaustion, sensitive-business-flow abuse, SSRF, misconfiguration, API inventory, unsafe-upstream consumption을 release-blocking 테스트로 유지하고 ASVS 5.0을 검증 baseline으로 둔다. Backup/release manifest, payment receipt, entitlement grant, economy ledger receipt는 보안 민감 integrity 객체이므로 immutable identity, least privilege, replay 방지, audit retention, 로그 마스킹이 필수다.
- **광고/수익화/unit economics:** Google Publisher Tag는 2026-09-08부터 bfcache 복귀 시 actively viewed slot을 자동 refresh할 수 있으므로 provider impression identity로 중복제거하고 `광고매출 - 광고 유발 session/retention 손실` 순효과를 본다. Google Play EEA/UK/US standard 예시는 auto-renewing subscription 10%, new-install non-recurring 20%, existing-install non-recurring 25%이며 Play Billing 적용 시 해당 5% billing fee가 추가될 수 있다. 각 SKU는 market × effective date × install cohort × transaction type × programme × billing path로 fee policy를 resolve한 뒤 net revenue/contribution margin을 계산한다. 새 실측 cohort가 없어 revenue/net revenue/margin/ARPU/ARPDAU/ARPPU/conversion/retention/churn/refund/CAC/LTV/fraud/infra/support는 실측 또는 `HYPOTHESIS/TEST TARGET`만 허용하고 kill/iterate/scale 기준을 사전 정의한다.
- **우선순위/backlog:** P0 scheduled encrypted backup + isolated/off-host verified restore → P0 release-class acceptance matrix → backend-owned Production runtime identity → migration 204 exact-candidate real-DB/economy-integrity QA → HIGH auth/BOLA/CSRF/idempotency/ledger-abuse gate → P1 required-check enforcement → correctness → monetization → SEO/acquisition → retention/accessibility. 이번 회차는 planning-only이며 runtime code/DB/Test/Production을 배포하지 않는다.

### v189 worklog / 수용 순서
최신 Google Search/Play/GPT·OWASP 공식자료 → exact main/CI/runtime 대조 → backup/release-identity/branch-protection 이슈 갱신 → 전체 기능/SEO/보안/사업성 정합 → 작업 중간 exact-main 재확인 → EN/KO 동기화 → PR CI.

## 회차 델타 — v2026.09.17.188 (2026-09-17)

### 릴리스 identity 구현 병합 및 containment 증명, Production runtime은 의도적으로 미변경

- **Exact main / 증거:** 시작·중간 재확인 기준 `main=4c467cff2f2bbfc25eb30d5acd33736a142c74d5`(PR #433)이다. release-control 구현은 `DOCS_ONLY|CONTROL_PLANE_ONLY|RUNTIME_RELEVANT|MIXED` 폐쇄형 분류, immutable `release-input.json`, candidate manifest 검증, application-source identity, CI runtime gating을 추가했다. 이 control-plane-only main의 Production Release #955 / run `35211473275`는 7초 만에 성공해 과거 약 15분 repository-head Test polling false-red가 이 사례에서 차단됐음을 증명했다. 이는 **control-plane 증거**일 뿐 새 application image, migration 204 또는 backend 배포 증거가 아니다.
- **P0 `REL-AUTH-184-01`: IN PROGRESS, DONE 아님.** 원인은 repository head를 runtime authority로 사용한 것이다. 현재 예방통제는 privileged runtime 작업 전에 `repositoryHeadSha`, `applicationSourceSha`, `controlPlaneSha`, classification, changed-path hash, migration-set hash를 분리한다. 남은 수용조건은 docs-only 3회(runtime/DB/registry/environment side effect=0), control-plane-only 3회(application build와 repository-SHA Test poll=0), runtime-relevant 2회(candidate digest + applicationSourceSha + migrationSetHash + Test deployment attestation 일치), mixed 1회, missing/stale/foreign candidate run ID manual-dispatch 음성 테스트다. classification 전 secret 사용, digest/SHA/migration 불일치, 무권한 DB/registry/GitOps 접근, rollback manifest 부재는 Production 차단이다. 롤백은 새 dispatch 경로를 끄고 마지막 attested Production manifest로 복귀하며 repository head로 runtime identity를 추정하지 않는다.
- **P0 backup/runtime 재점검:** 약 20:00 KST Debian에서 backend/frontend active, `moneyverse-backup.timer` 부재, backend 직접 `GET /api/version` HTTP 404가 재현됐다. `BAK-RUNTIME-177-01`은 OPEN이다. v187의 외부 frontend 경로 version 증거와 별개로 backend-owned runtime identity는 불완전하다. scheduled encrypted backup → checksum/decrypt/structure 검증 → isolated restore/reconciliation → off-host immutable copy가 증명되기 전 destructive schema/data/ledger/entitlement 작업은 차단한다.
- **기능/UX/API/DB 정합:** v187 Bootstrap 격리는 frontend-only Production 증거가 있고 backend/DB를 보존했다. migration 204 adaptive profession limit은 merged지만 Production-proven이 아니다. 인증/OAuth/session/security center, profile, inventory/collection, shop/cart/payment/subscription/ad-removal, season/quest/job/level/reward, business/bank/loan, virtual stocks, casino/randomized flows, community/moderation, friends/clubs/referral, notifications/search/upload/public content, App API, admin/audit, backup/restore, analytics/experiments, ads, SEO backend/tooling, incident operations의 기존 상세 계약은 계속 권위다. 코드/문서 근거와 UX 상태, ownership/authorization, API error/idempotency/rate limit, DB constraint/transaction/concurrency, audit/fallback/privacy/abuse, SEO/KPI/performance/cache, QA 및 deploy/rollback 증거가 없으면 `DONE`으로 올리지 않는다.
- **SEO 최신 판정:** Google Search Central 최신 major 문서 변경은 2026-09-16 Search profile badge이며, 9월 8일 regional Search experience, 8월 28일 site-reputation enforcement 변경도 재검증했다. 서버권위 title/meta/canonical/robots/sitemap/lastModified/breadcrumb/JSON-LD/hreflang/SSR-ISR/CWV/redirect, private/account/admin/transaction `noindex`, UGC index governance를 유지한다. Search-profile/preferred-source 기능은 선택적 acquisition 실험이며 ranking 보장으로 사용하지 않는다. FAQ rich-result ROI는 제외한다.
- **보안 최신 판정:** OWASP API Security Project의 최신 API-specific Top 10은 계속 2023이다. BOLA, broken authentication, object-property/function authorization, resource consumption, sensitive-business-flow abuse, SSRF, misconfiguration, inventory, unsafe upstream consumption을 기능별 release gate로 유지하고 ASVS 5.0을 검증 가능한 application-control baseline으로 유지한다. Release manifest/artifact도 보안 민감 control-plane 객체로 취급해 provenance, immutable digest/SHA binding, 최소권한 token, retention, audit를 검증한다.
- **사업성/unit economics:** 새 실측 purchase/ad cohort는 없다. revenue/net revenue/gross·contribution margin/ARPU/ARPDAU/ARPPU/conversion/D1·D7·D30/churn/refund/CAC·LTV/fraud/infra/support는 실측 또는 `HYPOTHESIS/TEST TARGET`만 허용한다. Google Play fee는 market/install cohort/transaction type/program/billing path별 versioned policy를 사용한다. 현재 EEA/UK/US standard 예시는 recurring 10%, new-install non-recurring 20%, existing-install non-recurring 25%에 해당 billing fee가 더해질 수 있다. 모든 shop/payment/subscription SKU는 단일 수수료가 아니라 effective fee policy로 net revenue와 margin을 계산한다. Release-control의 사업효과는 허위 실패 대기시간, Test/DB/registry privileged 사용, engineer/on-call 비용 감소로 측정한다.
- **우선순위/개발 연결:** P0 encrypted backup+isolated/off-host restore 증명 → release-class acceptance matrix 완료 → backend/Production runtime identity → migration 204 exact-candidate Test/real-DB/economy-integrity QA → auth/BOLA/CSRF/idempotency/ledger-abuse HIGH gate → required-check enforcement → correctness → monetization → SEO/acquisition → retention/accessibility. 기획 자동화는 runtime을 배포하지 않는다. 실제 구현은 branch → CI → exact-candidate Test → backend/API/DB/user-flow QA → main → Production → smoke/rollback 순서를 유지한다.

### v188 worklog / 수용 순서
최신 공식자료 → exact main/runtime/QA/CI 대조 → PR #433/#955 release-control 증거 → backup/runtime P0 → 전체 기능/SEO/보안/사업성 정합 → 작업 중간 exact-main 재확인 → EN/KO 동기화 → PR CI, exact base가 유지될 때만 병합한다.

## 회차 델타 — v2026.09.17.187 (2026-09-17)

### v186 UI 핫픽스 운영 승격 증거

- **릴리스 계보:** PR #431이 `fix/ui-bootstrap-collision-v2026.09.17.186`을 exact main `9e1342ca3a30ec9d0fb01d868b13c392231d97a0`로 병합했고 CI run `35210149830`의 secret/lint/typecheck/build/migration/test/Prisma/audit gate가 모두 성공했다.
- **Exact-main Test 증거:** immutable Test release `/srv/moneyverse-data/releases/test-9e1342ca3a30-ui186`가 `9e1342ca3a30ec9d0fb01d868b13c392231d97a0`를 반환했다. backend `/health` 정상, 공개 catalog 146개, 홈 Moonlight/빠른 메뉴 문구 유지, `X-Robots-Tag: noindex, nofollow` 유지, 생성 CSS에서 Bootstrap 전역 `--bs-primary-rgb` signature 없음까지 확인했다.
- **무중단 Production 승격:** immutable Production frontend `/srv/moneyverse-data/releases/prod-9e1342ca3a30-ui186`를 3201 canary에서 먼저 검증했다. nginx를 3001 → 3201로 원자 전환한 상태에서 supervised 3001 frontend release pointer를 교체·재기동했고 exact-SHA/catalog 검증 후 3201 → 3001로 복귀했다. 외부 `/api/version`은 현재 `9e1342ca3a30ec9d0fb01d868b13c392231d97a0`를 반환한다.
- **Production smoke:** `/health` 정상, `/`, `/wallet`, `/casino`, `/shop`, `/guide` HTTP 200, 공개 catalog 146개, 홈 핵심 문구 확인, 렌더링 CSS 5개에서 Bootstrap global signature 없음까지 확인했다.
- **Backend/DB 보존:** backend PID `400161`, 활성 시각 `Thu 2026-09-17 00:57:08 KST`가 승격 전후 동일했다. 이 frontend-only 복구 때문에 backend 재시작이나 DB migration을 수행하지 않았다.
- **Rollback 증거:** nginx backup `/etc/nginx/backups/moneyverse.before-v186-prod-20260917192743`, frontend service drop-in backup `/etc/systemd/system/moneyverse-frontend.service.d/release.conf.before-v186-20260917192743`, exact-main Test nginx backup `/etc/nginx/backups/moneyverse.before-v186-main-test-20260917192645`.

### v187 상태
문서/증거 전용이다. 런타임 대상은 v186 exact main `9e1342ca3a30ec9d0fb01d868b13c392231d97a0`이며 v187은 새 애플리케이션 동작을 추가하지 않는다.

## 회차 델타 — v2026.09.17.186 (2026-09-17)

### 모바일 UI 회귀 수정 — Bootstrap 전역 유틸리티 격리

- **정확한 기준/브랜치:** `fix/ui-bootstrap-collision-v2026.09.17.186`은 `main=17801cab463e9c93490b3f93f03c719f95896cb0`에서 시작했고 작업 중간에도 동일 main을 다시 확인했다. v175 UI 릴리스에서 Tailwind 의미 토큰 기반 앱 셸에 Bootstrap 5.3.8 전체 CSS를 전역 import했다.
- **확정 원인:** 로컬 Bootstrap CSS는 `.bg-primary`, `.text-primary`, `.border-primary` 같은 범용 utility를 `!important`로 정의하고, 프론트는 동일 이름을 테마 토큰 Tailwind utility로 홈·지갑·관리자·지원 등 다수 화면에서 사용한다. 이 전역 네임스페이스 충돌이 제품 색상/표현을 덮어쓰며, 제보된 모바일 화면의 파란 primary pill/control 현상과 일치한다.
- **구현:** Bootstrap 전체 CSS의 전역 Next.js layout import를 제거한다. Bootstrap 5.3.8 원본은 `frontend/src/styles/vendor/` 및 별도 vendor archive 디스크에 그대로 보존하고, 앱 전역 스타일은 제품 소유 `globals.css`, `cosmetics.css`만 사용한다. API/backend/DB/경제/사용자 상태 규칙은 변경하지 않는다.
- **회귀 방지:** `frontend/src/app/ui-style-isolation.test.ts`가 Bootstrap 로컬 자산은 존재하지만 전역 import되지 않는지와 제품 global style 순서를 검사한다. 이후 Bootstrap 구성요소가 필요하면 범용 global utility를 다시 넣지 않고 scope/prefix 방식으로만 도입한다.
- **로컬 QA 증거:** contract build 통과, 변경 파일 ESLint 통과, frontend typecheck 통과, frontend test 69/69 files·616/616 tests 통과, Next.js production build 통과. push 전 `git diff --check`를 추가 gate로 적용한다.
- **릴리스/rollback gate:** exact branch를 isolated Test에 먼저 배포해 frontend render, `/api/version`, backend health, public-catalog/실backend smoke, Test `noindex`를 확인한다. 이후 `main` 병합, exact merged runtime 재빌드, 무중단 Production 전환과 home/wallet/casino/shop/guide 사후 smoke를 수행한다. rollback은 frontend-only로 이전 frontend release pointer/nginx target을 복원하며 이 CSS 격리 변경 때문에 backend/DB를 재시작하지 않는다.

### v186 수용 순서
`exact base + 기획 재확인` → `Bootstrap 전역 충돌 제거` → `회귀테스트 + typecheck + 69/616 tests + production build` → `isolated Test frontend/backend/API/noindex` → `main 병합` → `exact-main 무중단 Production` → `Production UI/API smoke`.

## 회차 델타 — v2026.09.17.185 (2026-09-17)

### 런타임 경제 변경 병합 후 release identity P0 재현

- **정확한 main/상태:** 시작·중간 재확인 `main=8e958e9dcc28c88c0dffeacb6849de94b1cea089`이다. PR #429의 migration 204, 8개 직업별 daily-limit delta knob, baseline-relative 적용, soft-control-first tightening, 회복 relaxation, `dual-economy-council-v3`는 **MERGED / NOT PRODUCTION-PROVEN**이다. PostgreSQL 17.11 migration 002→204, targeted regression 42/42, lint/typecheck/build/diff-check는 로컬 사전증거일 뿐 Test/Production 증거가 아니다.
- **P0 `REL-AUTH-184-01` OPEN:** exact runtime SHA `8e958e9...`의 Production Release #950/run `35205652659`가 18:32~18:47 KST 실패했다. immutable release SHA resolve는 성공했으나 isolated Test exact-SHA/backend/DB gate가 실패했고 build는 skipped됐다. 따라서 repository head와 deployable application candidate 권위 혼동은 docs/control-plane뿐 아니라 실제 runtime 변경도 차단한다.
- **수정설계/rollback/QA:** credential 전 immutable manifest `{repositoryHeadSha,applicationSourceSha,controlPlaneSha,classification,changedPathsHash,classifierVersion,migrationSetHash}`를 만들고 runtime candidate build/push 후 `imageDigest`, Test deploy 후 `{applicationSourceSha,imageDigest,migrationSetHash,deploymentId}`를 attestation한다. 그 다음에만 application-owned identity와 API/catalog/실DB/noindex를 검사한다. docs-only는 privilege 0, control-plane-only는 application build/repository-SHA Test poll 0, mixed는 두 lane 모두 통과한다. manual dispatch도 attested candidate manifest를 요구한다. rollback은 Production dispatch를 끄고 마지막 attested Production manifest를 유지한다. docs/control-plane/runtime/mixed corpus와 docs-only 3회, control-plane 3회, runtime 2회 rehearsal을 요구하며 classification 전 secret, identity mismatch, 무권한 DB/registry/GitOps side effect는 승격 차단이다.
- **P0 backup/runtime:** 약 19:00 KST Debian에서 backend/frontend active, 최근 1시간 warning+ 없음, `moneyverse-backup.timer` 없음, `/api/version` HTTP 404다. `BAK-RUNTIME-177-01` OPEN과 runtime identity UNKNOWN을 유지하며 scheduled encrypted backup→검증→isolated restore/reconciliation→off-host immutable copy 전 destructive DB/ledger/entitlement 작업을 차단한다.
- **직업한도 UX/API/DB/보안:** 사용자는 서버권위 task daily limit/remaining을 보고 loading/error/offline에서 quota를 추정하지 않는다. completion은 인증·서버권위·transaction·idempotency이며 member+task+day 사용량을 동시성 안전하게 검증한 뒤 reward/ledger receipt를 원자 반영한다. policy write는 admin/AI control-plane allowlist/bound 전용이고 before/after·proposal/review·metric-window 감사로그를 남긴다. 당일 tightening은 과거 정상보상을 회수하지 않고 미래 completion만 제한한다. BOLA, replay, concurrent double-completion, stale quota, unauthorized policy write, metric poisoning, multi-account farming, audit integrity를 테스트한다.
- **경제/성장/사업:** 직접 수익이 아닌 economy-integrity/retention 통제이며 실측 cohort가 없어 전부 `HYPOTHESIS/TEST TARGET`이다. profession share, completion/user/day, repeat reward, profession별 WLD issuance, sink/source, blocked-at-limit, abandonment, CS, D1/D7/D30, fraud loss를 추적한다. concentration 개선+retention/completion 악화 없음+reward duplication 0이면 scale, scarcity/CS 증가면 iterate, ledger mismatch/exploit/retention 악화/starvation이면 kill한다. P2W 구매압박에 사용하지 않는다.
- **SEO/보안/수익성:** Google Search Central 최신 major update는 2026-09-16 Search profile badge이며 structured data는 노출을 보장하지 않고 FAQ rich result는 2026-05-07부터 deprecated다. 기존 canonical/robots/sitemap/lastModified/breadcrumb/JSON-LD/hreflang/SSR-ISR/CWV/UGC/private-noindex 계약을 유지한다. OWASP API Security Top 10 2023을 API baseline으로 유지한다. Google Play 수수료는 market/install cohort/transaction type/billing path별 policy-versioned unit economics로 계산하고 실측 없는 값을 확정하지 않는다.
- **전체 기능 parity:** auth/OAuth/session/security, profile, inventory/collection, shop/cart/payment/subscription/ad-removal, season/quest/job/level/reward, business/bank/loan, virtual stock, casino, community/moderation, friend/club/referral, notification/search/upload/public content, App API, admin/audit, backup/restore, analytics/experiment, ads, SEO tooling, incident operation의 기존 상세계약을 유지한다. `DONE`은 코드/문서 근거, UX, 권한, API/idempotency/rate-limit, DB constraint/transaction/concurrency, audit/fallback/privacy/abuse, SEO/KPI/performance/cache, QA/deploy/rollback 증거가 모두 필요하다.

### v185 worklog / 수용 순서
최신 공식 레퍼런스 → exact main/runtime/QA/CI → runtime release #950 실패 → 직업한도 merged/deployed 정합화 → backup/runtime P0 → 전체 기능/SEO/보안/경제성 parity → 중간 main 재확인 → EN/KO 동기화 → PR CI → exact base 불변 시에만 병합. Planning-only.

## 회차 델타 — v2026.09.17.184 (2026-09-17)

### AI 직업 작업횟수 제한 자동조절 정합화

- **정확한 기준/브랜치:** `feat/ai-job-limit-auto-v2026.09.17.184`에서 `main=3f523e6708af2bd9d24b60282f26619263a8c53d`를 정확한 기준으로 구현한다. 작업은 v181에서 시작했지만 작업 중 `origin/main`을 다시 확인해 v182/v183 기획 및 docs-only candidate-build 수정이 반영된 뒤 v184로 재정렬했으며, 미푸시 로컬 v182 시도는 기존 권위 버전을 덮지 않고 폐기한다.
- **해결한 불일치:** 기획은 의미론적 `jobs.assignment_daily_limit`를 `null = 무제한`으로 설명했지만 권위 런타임 migration 189/190/203은 유한 `work_task_catalog.daily_limit`를 강제한다. 기존 AI 레지스트리는 WLD `work.daily_cap`, `work.weekly_cap`, 반복 감쇠만 조절해 실제 작업 횟수 제한을 바꿀 수 없었다. 따라서 기존 문서의 구현상태와 AI 제어범위를 실제 코드와 맞춘다.
- **구현된 호환 계층:** forward-only `204-adaptive-profession-limits.sql`이 작업 기준값을 보존하고 8개 허용 `jobs.assignment_daily_limit_delta.<profession>` knob를 등록한다. 범위는 `-1..+2`, 정책 주기당 최대 이동은 1이며 직전 AI 결과가 아닌 기준값에서 실제 제한을 계산하므로 누적복리가 생기지 않는다. 기존 직업선택·숙련도·assignment 이력·보상 receipt·원장 이력은 재작성하지 않는다.
- **의사결정 계약:** 최신 job-selection snapshot 자체가 7일 구간을 나타낸다. 수요조정은 최소 40건 assignment를 요구한다. 점유율 `<3%`는 `+1` 완화할 수 있고, 점유율 `>60%` 강화는 작업 발행비중 `>50%`와 `work.repeat_decay_percent >=25`를 모두 만족해야 해 반복보상 완화책을 먼저 적용한다. 이전에 변경된 직업이 정상구간으로 회복되면 delta를 기준 `0` 방향으로 한 단계 복원한다. 기존 표본충분성·원장대사·feature switch·cooldown·동일 proposal 이중 AI 검토·rollback gate는 계속 최종권한이며, 근거부족 상태의 baseline 복원 후보도 이 fail-closed gate를 우회하지 않는다.
- **AI 검토:** prompt 계약은 `dual-economy-council-v3`로 올라가며 Jobs 전문 agent가 직업 과부족·적응형 작업제한·완화를 명시 검토한다. 모든 `daily_limit` 제안은 고위험으로 분류해 결정론 엔진 적용 전 선택 도메인의 전체 rebuttal을 수행한다. AI는 여전히 임의 정책키를 만들거나 사용자 진행도를 직접 재작성할 수 없다.
- **QA 증거:** 깨끗한 PostgreSQL 17.11 scratch DB에서 002→204 전체 migration 체인을 적용했다. AI/경제/직업 회귀 테스트 5개 파일 42/42 통과, 전체 lint 오류 0건(기존 `<img>` 경고 11건), workspace 전체 typecheck 및 production build 통과, `git diff --check` 통과를 확인했다. 이는 로컬 사전검증 증거이며 배포 증거가 아니다.
- **릴리스 게이트:** 격리 Test가 exact runtime candidate를 제공하고 backend/API/DB smoke를 통과해야 병합/Production 대상이 된다. Production은 무중단 승격 및 사후 smoke를 요구하며 로컬 성공을 배포 성공으로 해석하지 않는다.
- **백업 경계:** `BAK-RUNTIME-177-01`은 OPEN을 유지한다. 이번 migration은 추가형이며 ledger/data/entitlement를 삭제하지 않지만 예약 백업 런타임 문제가 해결됐다고 간주하지 않고 파괴적 후속작업은 계속 차단한다.
- **브랜치/작업기록:** 내부 worklog와 GitHub용 changelog는 v2026.09.17.184로 기록하고 정확한 branch/base, 정책키, 테스트, Test 증거, 운영 승격 증거를 단계별로 갱신한다.



## 회차 델타 — v2026.09.17.183 (2026-09-17)

### P0 문서 전용 runtime-release 실패 3회 연속 재현

- 정확한 기준 b96d44d61dd11ae7ed1f74ceae3097733ff0cefc는 문서 전용입니다. CI 35192799085와 Test Candidate 35192799677은 성공했지만 Production Release 35193283403 (#944)은 16:11~16:26 KST 실행 후 failure, promotion은 skipped였습니다. REL-DOCS-181-01은 P0 OPEN이며 세 번째 연속 재현입니다.
- 수정계약은 credential 전 merge-base classifier가 repositoryHeadSha와 applicationSourceSha를 분리하는 immutable release-input을 생성하는 것입니다. docs-only는 Test polling, DB/migration, registry, Production secret/environment, GitOps mutation이 모두 0이어야 하고 runtime은 application SHA+image digest+migration-set hash에 결합하며 unknown/mixed는 fail-closed합니다. 데이터 migration은 없고 rollback은 자동 Production dispatch를 끕니다.
- QA는 docs/planning/changelog/worklog negative corpus와 runtime/control-plane positive corpus 100%, docs-only dry-run 3회 privileged side effect=0, runtime rehearsal 2회 exact identity/API/catalog/실DB/Test-noindex, 분류 전 secret=0을 요구합니다. 위반은 승격차단입니다.
- 약 16:57 KST Debian에서 backend/frontend active, 최근 1시간 warning 이상 없음, moneyverse-backup.timer 없음, /api/version HTTP 404를 재확인했습니다. BAK-RUNTIME-177-01은 P0 OPEN이며 scheduled encrypted backup→검증→isolated restore/reconciliation→off-host immutable copy 전까지 파괴적 DB/ledger/entitlement 변경을 금지합니다.
- 전체 기능 상세 matrix는 인증/OAuth/세션/보안, 프로필, 인벤토리/컬렉션, 상점/장바구니/결제/구독, 시즌/퀘스트/직업/보상, 사업/은행/대출, 가상주식, 카지노, 커뮤니티/모더레이션, 친구/클럽/추천, 알림/검색/업로드/공개콘텐츠, App API, 관리자/감사, 백업/복구, 분석/실험, 광고, SEO, 장애대응에 계속 적용하며 코드·UX·권한·API·DB·감사·fallback·privacy/abuse·SEO·KPI·성능·QA·배포/롤백 증거 없이는 DONE 승격 금지입니다.
- 최신 Google Search Central 자료는 ranking 계약 변경 근거가 아니므로 canonical/robots/sitemap/lastModified/breadcrumb/JSON-LD/hreflang/SSR-ISR/CWV/UGC-index 및 private noindex 계약을 유지합니다. 2026-09-17 European Search Dataset Licensing Program은 일반 SEO와 무관해 제외합니다. 보안은 OWASP ASVS 5.0.0, API Security Top 10 2023, Top 10:2025를 유지합니다. 새 실측 구매/광고 cohort가 없어 재무 KPI는 실측 또는 HYPOTHESIS/TEST TARGET만 허용하고 Google Play SKU economics는 fee-policy-versioned로 유지합니다.

### v183 worklog / 수용순서
최신 공식자료 → exact main/runtime/QA/CI → REL-DOCS 3회 재현 → backup/runtime P0 → 전체기능/SEO/보안/수익성 → 중간 main 재확인 → EN/KO 동기화 → PR CI → exact base 유지 시 병합. Planning-only입니다.

## 회차 델타 — v2026.09.17.182 (2026-09-17)

### P0 문서 전용 릴리스 실패 재재현 + 백업/런타임 게이트 유지

- **정확한 기준/CI 증거:** exact base `b03e76816b843404ae7daeedf926b421d56ed05f`는 문서 전용입니다. `Build Test Candidate` run `35188609866`은 성공했지만 downstream `Build Production Release` run `35188947483`은 15:14~15:29 KST에 **failure**로 종료했습니다. 현 main에서도 `REL-DOCS-181-01`이 연속 재현되어 문서 repository identity가 runtime release 경로로 진입합니다. `Auto Integrate and Promote`는 skipped이므로 Production 승격으로 해석하지 않습니다. Severity P0, 최초관측 2026-09-17 14:15 KST, 최신재현 15:14~15:29 KST입니다.
- **영향/원인/담당:** CI release 상태, isolated Test 용량, registry/DB/environment 권한경계, red/green 신호에 대한 운영 신뢰가 영향받습니다. 확정 설계결함은 `repositoryHeadSha == applicationSourceSha` 권위 혼동과 pre-privilege path classifier 이전 runtime-release dispatch입니다. 담당순서 Release/Infra → Security → Backend/DB → QA → Operations. 상태 OPEN이며 반복 BLOCKED/재현은 신규기능보다 우선합니다.
- **구현 가능한 수정:** merge-base classifier만 signed/immutable `release-input.json={repositoryHeadSha,applicationSourceSha|null,classification,changedPathsHash,classifierVersion}`을 생성합니다. `DOCS_ONLY_NO_RUNTIME_RELEASE`는 Test polling, DB 연결/마이그레이션, registry 인증/push, Production environment/secret, GitOps mutation 전에 종료합니다. `RUNTIME_RELEVANT`는 candidate/Test/release를 `applicationSourceSha`+image digest+migration-set hash에 결합하고 migration/control-plane은 명시적 별도 gate를 사용합니다. mixed/unknown은 credential 전에 fail-closed합니다. application-data migration은 없습니다. 롤백은 자동 Production dispatch를 먼저 끄며 repository-head-as-runtime을 정상상태로 되돌리지 않습니다.
- **QA/수용/관측:** path+hash 단위 corpus, docs/planning/changelog/worklog negative corpus, backend/frontend/package/migration/workflow/GitOps positive corpus, docs-only dry-run 3회 privileged side effect=0, runtime rehearsal 2회 exact application SHA+API/catalog/실DB+Test `noindex`, classification 전 secret materialization=0을 요구합니다. `docs_only_privileged_side_effect_total`, unknown/false-positive/false-negative, Test-poll minutes, registry/DB access, environment-secret materialization, release false-red를 관측합니다. runtime false-negative, secret 노출, docs-only privileged side effect는 승격 차단입니다.
- **최신 런타임 증거:** 약 16:00 KST 권위 Debian에서 backend/frontend는 active이고 최근 1시간 warning 이상 journal은 없지만 `moneyverse-backup.timer`는 여전히 not found, backend 직접 `/api/version`은 HTTP 404입니다. `BAK-RUNTIME-177-01`은 P0 OPEN이며 scheduled encrypted backup→checksum/decrypt/구조검증→isolated restore/reconciliation→off-host immutable copy 전까지 파괴적 schema/data/ledger/entitlement 변경을 금지합니다. application-owned version endpoint 또는 동등한 immutable evidence가 source SHA/artifact digest/migration set을 결합하기 전 runtime identity는 UNKNOWN입니다.
- **전체 기능 동등성:** 인증/OAuth/세션/보안센터, 프로필, 인벤토리/컬렉션, 상점/장바구니/결제/구독/광고제거, 시즌/퀘스트/직업/레벨/보상, 사업/은행/대출, 가상주식/포트폴리오/알림/비교, 카지노/확률형, 커뮤니티/모더레이션, 친구/클럽/추천, 알림/검색/업로드/공개콘텐츠, App API, 관리자/감사, 백업/복구, 분석/실험, 광고, SEO 도구, 장애대응의 기존 상세계약을 유지합니다. 코드/문서 근거, UX 상태, 권한/소유권, API 오류·멱등성·rate limit, DB constraint·transaction·concurrency, 감사/fallback/privacy/abuse, SEO/analytics/performance/cache, QA/deploy/rollback 증거 없이는 DONE 승격 금지입니다.
- **SEO/광고:** Google Search Central 최신 주요 문서변경은 2026-09-16 Search profile badge 가이드이며 선택적 공개 프로필 affordance이지 ranking 보장이 아닙니다. server-authoritative canonical/robots/sitemap/lastModified/breadcrumb/JSON-LD/hreflang/SSR-ISR/CWV/redirect/UGC-index와 private-route noindex 계약을 유지합니다. Google Publisher Tag의 2026-09-08 bfcache 자동 refresh는 provider impression identity 기준 analytics 중복제거와 광고 유발 이탈/retention을 차감한 순가치 평가를 요구합니다.
- **보안:** 검증 가능한 통제는 OWASP ASVS 5.0.0, API별 BOLA/auth/property·function authorization/resource exhaustion/sensitive-business-flow/SSRF/config/inventory/unsafe-upstream 시험은 API Security Top 10 2023을 사용합니다. release classifier는 least-privilege/supply-chain 통제이므로 배포차단 항목입니다.
- **수익성/성장:** 새 실측 purchase/ad cohort가 없어 revenue/net revenue/margin/ARPU/ARPDAU/ARPPU/conversion/retention/churn/refund/CAC/LTV/fraud/infra/support는 실측 또는 `HYPOTHESIS/TEST TARGET`만 허용합니다. Google Play 수수료는 market/install cohort/transaction type/programme/billing path에 따라 달라 SKU unit economics는 policy-versioned로 유지합니다. classifier 가치는 Test polling, registry/DB/environment 사용, engineer/on-call 시간과 false-red 조사비용 회피입니다. runtime false-negative=0 및 docs-only privileged side effect=0에서만 scale, false-positive/unknown 비용은 iterate, secret 노출/무단 side effect면 자동승격을 kill합니다.

### v182 worklog / 수용순서
`최신 공식 레퍼런스` → `exact main/runtime/CI 대조` → `REL-DOCS 두 번째 재현` → `backup/runtime P0 유지` → `전체기능/SEO/보안/수익성 동등성` → `작업 중 exact-main 재확인` → `EN/KO 동기화` → `PR CI` → `exact base 유지 시에만 병합`. Planning-only이며 runtime/DB/Test/Production을 변경하지 않습니다.

## 회차 델타 — v2026.09.17.181 (2026-09-17)

### P0 문서 전용 릴리스 분류 실패 + Production 세션 증거 정합화

- **기준/증거:** exact base `198ecc37585deefa8fafecb03a59283d2758bfa5`는 문서 전용이며 v180 Production byte-identical 승격에서 backend PID 유지, 기존 회원 cookie 재발급 없이 유효, 활성 인증세션 집계 동일, health/viewer/catalog 통과를 기록합니다. `SESSION-DEPLOY-181-01`은 **해당 v180 승격에 한해 DONE**이며 향후 backend/session-schema 변경마다 동일-cookie Test 연속성과 Production smoke를 재검증합니다.
- **P0 `REL-DOCS-181-01` — OPEN:** docs-only `198ecc375...`에서 `Build Production Release` run `35185009127`가 실행되어 repository head를 `RELEASE_SHA`로 사용하고 약 15분간 Test `/api/version`에서 문서 SHA를 기다린 뒤 실패했습니다. 최신 재현 2026-09-17 14:15~14:30 KST. 영향은 Production false-red, release/Test capacity 낭비, downstream gate 퇴행 시 불필요한 권한 노출입니다. 확정원인은 `repositoryHeadSha`와 `applicationSourceSha` 혼동입니다.
- **수정설계:** 권한 획득 전 단일 classifier가 merge-base diff로 signed/immutable `release-input.json`=`{repositoryHeadSha, applicationSourceSha|null, classification, changedPathsHash, classifierVersion}`을 생성합니다. `DOCS_ONLY_NO_RUNTIME_RELEASE`, `RUNTIME_RELEVANT`, `MIGRATION_RELEVANT`, `CONTROL_PLANE_RELEVANT`, `MIXED_FAIL_CLOSED`만 허용합니다. docs-only는 Test exact-SHA polling, DB migration/connection, registry login/push, environment secret, GitOps write, Production environment 접근 전에 종료합니다. runtime은 `applicationSourceSha`+image digest+migration-set hash를 권위로 사용하고 unknown/error는 privileged side effect 없이 fail-closed합니다.
- **마이그레이션/롤백:** application-data migration 없음. workflow-only classifier를 release-control flag로 배포하고 이전 YAML은 rollback reference로만 보존합니다. rollback 시 자동 Production dispatch를 먼저 끄며 repository-head-as-runtime 권위로 상시 회귀하지 않습니다.
- **QA/수용:** path/hash 단위시험, docs/planning/changelog/worklog negative corpus, backend/frontend/package/migration/GitOps/workflow positive corpus, docs-only에서 DB connection=0·registry login/push=0·Test exact-SHA poll=0·Production environment access=0, mixed/unknown fail-closed, runtime fixture의 isolated Test exact application SHA+API/catalog/DB+`noindex`를 검증합니다. 분류 전 secret materialization=0이어야 합니다. corpus 100%, docs-only dry-run 3회, runtime rehearsal 2회 후 승격합니다. classification count, `docs_only_privileged_side_effect_total=0`, false-red, Test poll minutes, credential materialization, unknown path를 관측하며 위반 시 배포차단합니다. 작업순서 Release/Infra→Security→Backend/DB→QA→Operations.
- **런타임/백업:** 최신 Debian 확인에서도 backend/frontend active, `moneyverse-backup.timer` not found, backend 직접 `GET /api/version` 404입니다. `BAK-RUNTIME-177-01`은 **P0 OPEN**이며 scheduled encrypted backup→검증→isolated restore/reconciliation→off-host immutable copy 전까지 파괴적 schema/data/ledger/entitlement 작업을 금지합니다.
- **전체 기능 계약:** 인증/가입/로그인/OAuth/로그아웃/세션, 프로필/보안, 인벤토리/컬렉션, 상점/장바구니/결제/구독/광고제거, 시즌/퀘스트/직업/레벨/보상, 사업/은행/대출, 가상주식/포트폴리오/알림/비교, 카지노/확률형, 커뮤니티/댓글/신고/차단, 친구/클럽/초대/추천, 알림/검색/업로드/공개콘텐츠, App API, 관리자/감사, 백업/복구, 분석/실험, 광고, SEO 도구, 장애대응은 기존 상세 matrix를 유지합니다. 코드/문서 근거와 UX 상태, 권한/소유권, API 오류·멱등성·rate limit, DB constraint·transaction·concurrency, 감사/fallback/privacy/abuse, SEO/analytics/performance/cache, QA/deploy/rollback 증거 없이는 DONE으로 올리지 않습니다.
- **보안:** ASVS 5.0.0을 검증 baseline, API Security Top 10 2023을 BOLA/auth/property·function authorization/resource/business-flow/SSRF/config/inventory/upstream 시험에, Top 10:2025를 access-control/supply-chain/authentication/integrity/logging 교차위험에 적용합니다. classifier 증거는 least-privilege/supply-chain 배포 gate입니다.
- **SEO/SEO backend:** Google Search Central 최신 주요 문서 변경은 2026-09-16 Search profile badge 가이드입니다. 공개 profile의 선택적 outbound affordance일 뿐 ranking 보장으로 해석하지 않습니다. 기존 server-authoritative metadata/canonical/robots/sitemap/lastModified/breadcrumb/JSON-LD/hreflang/SSR-ISR/CWV/redirect/UGC-index 계약을 유지하고 account/admin/security/transaction/economy-history는 noindex+sitemap 제외입니다. badge 실험은 visible/accessibility/localization/privacy/feature-flag와 organic profile visit→signup→activation→D7/D30 측정을 요구합니다.
- **수익성/성장:** 새 실측 purchase/ad cohort가 없어 revenue/net revenue/margin/ARPU/ARPDAU/ARPPU/conversion/retention/churn/refund/CAC/LTV/fraud/infra/support는 실측 또는 `HYPOTHESIS/TEST TARGET`만 허용합니다. classifier 가치는 CI/Test-poll/registry/DB/engineer/on-call 비용과 false-red 회피입니다. false-negative=0·docs-only privileged side effect=0일 때만 scale, unknown/false-positive 비용은 iterate, runtime false-negative/secret 노출/무단 side effect면 자동승격을 kill합니다.

### v181 worklog / 수용 순서
`최신 공식 레퍼런스` → `exact main/runtime/CI 대조` → `v180 세션 증거 해당 승격 DONE` → `REL-DOCS-181-01 P0` → `backup/runtime P0 유지` → `전체 기능 parity` → `작업 중 exact-main 재확인` → `EN/KO parity` → `PR CI` → `exact base 유지 시에만 병합`. 기획문서 전용이며 runtime/DB/Test/Production 변경 없음.

## 회차 변경 — v2026.09.18.225 (2026-09-18)

### 19:02 증거 변경
- **권위/CI:** Google Search Central, OWASP ASVS/API Security, Google Play 공식자료를 먼저 갱신했다. 시작/중간 `origin/main=84f4ff298fb5b93bdba3cf2949370d8cc9008e1e`(v224). main은 protected지만 required-status enforcement `off`, contexts/checks/statuses 0개라 `CI-ENFORCE-204-01`은 P1 OPEN이다.
- **HIGH `OBS-NET-216-01`:** 19:02 KST backend/frontend/backup timer active+enabled. Host-local `woldeok.com` DNS와 canonical HTTPS는 계속 curl(6) 실패하지만 loopback `/api/version`은 200/no-store, backend `75e69e77cdc18ef221106a008563151a4c790728`, warning journal은 비어 있다. 수용조건은 독립 vantage 2곳×DNS+TLS+HTTP 30회 성공, false NXDOMAIN/SERVFAIL 0, auth/payment resolution 및 실제 alert이며 TLS 우회/app restart를 해결책으로 금지한다.
- **P0 DR:** 신규 18:29:36→18:29:38 백업은 encrypted archive, `database.dump`, `photos.tar.zst`, `manifest.txt` 검증 성공, 다음은 00:20:41 KST다. Artifact freshness는 restore 증명이 아니다. `BAK-RUNTIME-177-01`은 isolated decrypt/restore, schema/migration 및 경제/auth/audit reconciliation, 실측 RPO/RTO, off-host immutable retention, 실제 failure alert 전까지 차단한다.
- **SEO:** Google Search Central은 2026-09-16 `GoogleProducer` HTTP UA를 변경했다. Crawler identity는 권한이 아니라 버전형 관측 데이터 `{crawlerFamily,documentedToken,policyVersion,verifiedAt}`다. `seo_render_probe`가 user/crawler canonical·robots·sitemap·hreflang·structured data·HTTP semantics를 비교하며 private 노출, critical-resource 차단, cloaking 유사 차이는 SEO 승격차단이다. Unknown UA는 일반 public 동작이다.
- **API 보안:** OWASP API Security 2023이 현재판이다. 모든 route inventory에 API3 response-property allowlist와 API4 resource budget(DTO allowlist, body/upload/page/batch 최대값, query work units, timeout, concurrency/rate quota, cost owner)을 추가하고 ORM entity 직접 직렬화를 금지한다. PII/internal-field leakage 또는 resource-limit 우회는 HIGH 배포차단이다.
- **경제/전체기능:** Google Play EEA/UK/US 2026-06-30 cohort 정책과 remaining markets를 분리하고 order별 server-trusted market/cohort/transaction/programme/billing-path/fee-policy 및 gross/fee/tax/refund/direct cost를 snapshot한다. 미실측 사업 KPI는 `HYPOTHESIS/TEST TARGET`이다. 기존 전체 기능 UX/RBAC/API/DB/audit/fallback/privacy/SEO/KPI/performance/QA/exact-SHA 계약을 유지하며 v225에 crawler-policy와 response/resource-budget 증거 필드를 추가한다.

### v225 worklog
P0 restore 증명 → P0 release identity → HIGH DNS/dependency → HIGH API/auth/economy gate → P1 CI 강제 → SEO probe → 실측 growth. 기획 전용이며 runtime/DNS/Production DB를 변경하지 않는다.


## 회차 변경 — v2026.09.17.180 (2026-09-17)

### 백엔드 세션 연속성 및 무로그아웃 배포 계약

- 일반 회원 로그인 세션은 PostgreSQL `auth_sessions`가 권위이며 쿠키/서버 수명은 30일이다. 정상 백엔드 배포/롤백은 활성 회원 세션을 revoke/truncate/recreate하지 않는다. 관리자 콘솔 단기 세션은 별도 보안 경계로 유지한다.
- Test에서 동일 쿠키가 백엔드 재시작 전후 유지되고 DB 행도 유지되는 런타임 검증을 요구한다. 실 DB 테스트는 로그인 세션이 새 repository/backend 인스턴스에서도 같은 사용자로 해석됨을 고정한다.
- Production host mirror의 DB 자격증명/비밀은 `/etc/moneyverse/backend-production.env`, release 식별자는 `/etc/moneyverse/backend-release.env`, 코드 pointer는 `/srv/moneyverse-data/releases/production-current/backend`로 분리한다.
- byte-identical backend artifact 승격은 live 프로세스를 불필요하게 재시작하지 않는다. 실제 backend 코드가 변경된 후속 승격은 Test 세션 연속성 검증 후 무중단 전환을 사용한다.

## 회차 변경 — v2026.09.17.179 (2026-09-17)

### 로컬 UI 자산 운영 승격 증거 및 런타임 복구

- **릴리스 계보:** UI 브랜치 `feat/ui-local-assets-v2026.09.17.175`, 커밋 `e8f89b482d2d92ed284629e2214f273fb8623302`가 PR #411로 애플리케이션 SHA `faa047fdb637df74b4327ef45c9585be1c15d8c5`에 병합되었다. 현재 main은 이 SHA 이후 backend/frontend/package 런타임 변경이 없고 후속 차이는 문서/복구 workflow뿐이다.
- **로컬 자산 계약:** Bootstrap 5.3.8은 `frontend/src/styles/vendor/bootstrap-5.3.8.min.css`에서 번들된다. 다운로드 원본은 별도 데이터 디스크 `/srv/moneyverse-data/vendor/bootstrap/5.3.8/`에 보관하며 SHA-256은 `3258c873cbcb1e2d81f4374afea2ea6437d9eee9077041073fd81dd579c5ba6b`이다. 운영 HTML에는 Bootstrap/getbootstrap/jsDelivr/unpkg 런타임 자산 참조가 없다.
- **Test 증거:** `test.easy-scraping.com/api/version`은 정확한 SHA `faa047fdb637df74b4327ef45c9585be1c15d8c5`를 반환한다. `/health` 정상, 공개 상점 카탈로그 146개, Test `X-Robots-Tag: noindex, nofollow`를 확인했다. Test 프론트 env/cache 권한은 비밀 파일을 world-readable로 만들지 않고 교정했다.
- **Production 승격:** 기존 Production `18c7a1324013099e47b2d6e22c5108c4d378139c`에서 `faa047f...`까지 backend/DB migration 차이는 0이다. 프론트는 `/srv/moneyverse-data/releases/prod-faa047fdb637`에서 운영 env로 재빌드하고 3201 canary 검증 후 nginx를 원자적으로 canary로 전환했다. 그동안 정식 3001 서비스를 새 release로 교체/재기동하고 검증한 뒤 nginx를 3001로 복귀했다. 외부 Production은 현재 정확한 SHA `faa047f...`를 반환하며 health/home/shop/casino/guide와 카탈로그 146개 검증이 통과했다.
- **롤백 증거:** nginx 백업 `/etc/nginx/backups/moneyverse.before-v175-prod-20260917132435`, 프론트 drop-in 백업 `/etc/systemd/system/moneyverse-frontend.service.d/release.conf.before-v175-20260917132435`. 백엔드 소스/DB migration이 동일하므로 Production 백엔드는 재시작하지 않았다.
- **클러스터 복구 발견사항:** stale Flux 경로는 UI 릴리스 실패와 별개의 제어면 장애다. `kuber-nixos-flakes/keys/admins.pub`가 placeholder만 가진 상태였고 `modules/users.nix`는 비밀번호 로그인을 끄고 이 파일을 선언형 SSH 키로 사용한다. `wtrdd1-hash/kuber-nixos-flakes#1`에서 기존 배포 공개키로 placeholder를 교체했고 `7a0a1438bae0b17b28b0597ea37e759ac1db6530`으로 병합했다. 이미 실행 중인 `192.168.100.186` 노드는 콘솔 또는 out-of-band NixOS 재적용 전까지 직접 SSH/Flux 복구 완료로 간주하지 않는다.
- **보안:** 임시 진단 브랜치 `fix/cluster-ssh-recovery-v2026.09.17.179`는 incident-only이며 병합하지 않는다. 개인 SSH 키는 커밋하지 않았고 NixOS 선언 파일에는 공개키만 저장했다.

## 회차 변경 — v2026.09.17.178 (2026-09-17)

### P0 복구 권한·영구 러너 자격증명·백업 런타임 정합성

- **정확한 기준 / 구현 상태:** 기획 브랜치 `docs/plan-v178-recovery-authority`는 `70565ac9ef88d34f0234e3173fdee98428aa5987` 기준이다. 해당 main 커밋은 `.github/workflows/flux-jump-recovery-v150.yml`에 `direct-recover`를 추가했다. production environment의 `[self-hosted, moneyverse-deploy, debian13]` 러너가 `DEPLOY_SSH_KEY`를 파일로 만들고 대상 host key를 고정한 뒤 GitOps desired state를 clone하고 NixOS 대상에 SSH하여 `ops/recovery/flux-jump-v150.sh`를 실행한다. 이후 공개 Test exact SHA/카탈로그/noindex를 검증하고 `always()` 단계에서 SSH 파일을 삭제한다. 이는 구현 코드이며 실제 복구 성공 증거는 아니다.
- **최신 런타임 증거 (2026-09-17 13:00 KST):** 권위 Debian 호스트에서 backend/frontend는 active지만 `moneyverse-backup.timer`는 여전히 없고 backend 직접 `GET /api/version`도 HTTP 404다. 따라서 `BAK-RUNTIME-177-01`은 계속 **P0 OPEN**, runtime identity는 UNKNOWN이다. 파괴적 DB/data/ledger/entitlement 작업은 승격 금지다.
- **P0 `RECOVERY-AUTH-178-01` — OPEN / 운영 control-plane 보안 게이트:** 새 direct-recovery는 영구 self-hosted runner와 production environment를 사용하며 장기 SSH private key를 `~/.ssh/deploy`에 기록한다. cleanup과 strict host-key checking이 있고 private key 대신 fingerprint만 로그하지만, 사용 후 삭제는 ephemeral credential 발급과 동일한 통제가 아니다. 실행 중 다른 프로세스의 key 읽기, 정상 cleanup 밖의 runner/host 장애 후 잔존, runner 침해, 과도한 production secret 노출, 잘못되거나 stale한 GitOps authority 대상 복구가 위협이다.
- **수정 설계:** direct recovery는 break-glass 전용으로 유지한다. OIDC/broker/certificate 기반의 짧은 수명 stage-scoped credential을 우선하며 audience·target host·command/scope·run-id·TTL을 결합한다. 정적 SSH key가 임시로 필요하면 recovery 전용 제한 계정/key, 가능한 forced-command/source allowlist, agent forwarding 금지, recovery command 외 shell 금지, 일반 deploy secret과 분리, 사용/사고 후 rotation, secret 기록 전 stale identity 파일 제거를 적용한다. 영구 runner는 단일 목적·패치 유지·비대화형이어야 하며 untrusted PR workload를 실행하지 않고 job 간 workspace를 정리하며 비정상 process/network를 감시한다.
- **복구 authority 계약:** immutable evidence는 `{repositoryHeadSha, applicationSourceSha, gitOpsInfraSha, desiredTestSha, deployedTestRuntimeId, imageDigest/packageHash, migrationSetHash, workflowRunId, runnerIdentity, targetHostKeyFingerprint, observedAt}`를 결합한다. repository head 단독은 deployable identity가 아니다. 필드 누락/stale/mismatch는 fail-closed한다. `direct-recover`는 Flux/Test convergence 복구만 허용하며 Production application 승격이나 파괴적 DB 작업 권한이 아니다.
- **QA / 롤백 / 모니터링:** 잘못된/missing host key, wrong target, stale GitOps SHA, candidate SHA 누락/형식 오류, key 누락, credential 만료, 동시 recovery, SSH 중단, runner reboot, cleanup 실패, Test SHA mismatch, catalog 실패, Test `noindex` 누락을 negative test한다. 수용조건은 log/artifact/process args의 secret 값 0, 실행 전후 stale credential file 0, exact GitOps/Test identity 일치, recovery audit event, controlled failure 뒤 cleanup 성공이다. 롤백은 `direct-recover` 비활성화, credential revoke/rotate, audit evidence 보존 후 이전 reviewed recovery path로 복귀하며 application DB data를 변경하지 않는다. recovery 호출/성공/실패/시간, credential age/rotation, runner identity, host-key mismatch, exact-SHA convergence latency, cleanup failure를 관측한다. 설명되지 않는 호출 또는 credential residue는 triage 전 HIGH/P0 보안사고로 취급한다.
- **전체 기능 영향:** auth/session/OAuth, profile/security center, inventory/collection, shop/cart/payment/subscription/ad-removal, season/quest/job/level/reward, business/bank/loan, virtual stock, casino, community/moderation, friend/club/referral, notifications/search/upload/public content, app API/admin/audit/analytics/ads/SEO는 기존 상세 matrix를 계속 따른다. Recovery는 DB constraint, authorization, idempotency, ledger invariant, privacy, abuse control, feature flag를 우회할 수 없다. `PARTIAL/PLANNED → DONE`은 구현과 exact-SHA Test 증거가 필요하다.
- **SEO:** 이번 회차에 새로운 Google ranking contract는 확인되지 않았다. 공개 페이지의 server-authoritative canonical/robots/sitemap/hreflang/SSR/ISR/structured-data 계약을 유지하고 Test는 `noindex`를 유지하며 recovery 성공 전 해당 header를 검증한다. private account/admin/transaction/economy-history는 noindex+sitemap 제외를 유지한다.
- **보안 레퍼런스:** OWASP Top 10:2025 A01 access control, A03 software supply-chain failures, A07 authentication failures, A08 software/data integrity, A09 logging/alerting을 recovery 교차통제로 직접 채택하고, 검증 가능한 요구사항은 ASVS를 사용한다. API authorization/business-flow 시험은 API Security Top 10 2023 mapping을 유지한다.
- **사업성:** 신규 실측 purchase/ad cohort가 없으므로 revenue/net revenue/margin/ARPU/ARPDAU/ARPPU/conversion/retention/churn/refund/CAC/LTV/fraud/infra/support는 실측 또는 `HYPOTHESIS/TEST TARGET`만 허용한다. Recovery 가치는 outage/on-call/rollback/support 손실 회피다. self-hosted runner 고정비, recovery minutes, engineer/on-call minutes, 회피 incident loss를 측정한다. 반복 break-glass drill에서 credential residue=0 및 exact-SHA convergence가 지속될 때만 **scale**, cleanup/convergence miss는 **iterate**, 설명되지 않는 호출·credential leak/residue·wrong-target reachability·authority mismatch는 **kill/disable**한다.

### v178 수용 순서

`최신 공식 레퍼런스` → `exact main/runtime/CI 정합` → `P0 backup gap 유지` → `direct-recovery 위협/authority 계약` → `작업 중 exact-main 재확인` → `EN/KO parity + diff/link 검사` → `PR CI` → `exact base 불변일 때만 병합`.

## 회차 변경 — v2026.09.17.177 (2026-09-17)

### 국제 국가정책·다국어·카지노·유료화 통합 기획

- **작업 브랜치/현재 기준:** `docs/international-jurisdiction-localization-v2026.09.17.177`, 기준 `f7d2087f342a087bc568ffc4abcaac5540f62e5b`. 사용자 범위 확장 후와 선행 로컬 기획 시도 이후 최신 `main`을 다시 확인했다. 이번 회차는 문서/조사 전용이며 런타임·DB·Test·Production 상태를 변경하지 않는다.
- **대체된 로컬 시도:** `docs/casino-legal-safety-v2026.09.17.176` / `faa047fdb637df74b4327ef45c9585be1c15d8c5`는 GitHub에 push/merge되지 않았다. 조사 중 `main`에 권위 v176 런타임 백업 기획이 먼저 반영되어 같은 버전을 경쟁시키지 않고 이 v177 브랜치로 재기준·대체했다.
- **기존 P0 유지:** v176의 `BAK-RUNTIME-176-01`, `BAK-106-01`은 계속 OPEN이며 파괴적 작업·수익화 rollout보다 우선한다. 이번 회차는 scheduled backup, off-host DR, exact-SHA 런타임 관측 공백이 해결됐다고 주장하지 않는다.
- **범위:** `국가 × 주/지역 × 채널 × 연령 × 기능` 정책 엔진, 카지노 국제 규제 게이트, 비-P2W 유료화, Google Play/App Store/Web 결제경로, 미성년자/개인정보/광고, 사이트 언어 확대, 자연스러운 번역 품질, Google 다국어/다지역 SEO를 통합한다.
- **핵심 설계:** `locale != jurisdiction`. 언어선택은 표현/검색만 바꾸고 국가 기능제한은 우회하지 못한다. 고위험 기능은 서버의 버전형 정책에서 `ALLOW/ALLOW_WITH_CONTROLS/BLOCK/REVIEW_REQUIRED/TEMPORARILY_DISABLED`로 판정하고 법률·등급·스토어 증거가 누락/만료되면 fail-closed한다.
- **국가 기본값:** KR/US/GB/EEA/AU/JP/BR을 초기 정책 매트릭스로 만들고, CA/SG/TW는 현지검토 전 REVIEW_REQUIRED, 중국 본토는 별도 인허가 프로젝트 전 기본 미출시다. 미국 카지노는 주별, EEA는 회원국별 판정한다.
- **카지노:** 직접수익 목표 0. 현금 유료화와 공존하기 전 비구매·비양도·비환전 전용 `CSP` 또는 동등한 provenance 격리가 필요하다. KR은 GRAC/19+/스토어/법률 게이트, AU는 simulated gambling R18+, Washington은 별도 승인 전 기본 차단한다. `현금화 없음`은 필수지만 전세계 충분조건으로 보지 않는다.
- **유료화:** 광고제거, 계정귀속 꾸미기, 비경쟁 편의만 P0 후보. WLD 현금판매·유료 랜덤아이템·카지노 베팅재원 판매는 기본 BLOCK. Android/iOS/Web 결제는 국가/스토어 정책별 route를 사용하고 클라이언트 가격/통화/entitlement를 신뢰하지 않는다. 국가별 수익성은 gross revenue가 아니라 스토어/PSP 수수료·세금·환불·차지백·지원·모더레이션·번역·법률/등급비를 차감한 contribution margin으로 본다.
- **언어:** 사이트/앱 P0/P1 locale을 `en`, `ko`, `ja`, `de`, `fr`, `es`, `pt-BR`로 확대한다. 프로젝트 문서 표준은 계속 영문 원문 + 한국어 2순위다. 번역은 source hash, glossary, linguistic/product/legal/SEO review 상태를 가진 버전형 자산으로 관리한다.
- **Google SEO:** 언어별 URL, locale self-canonical, 진짜 대응번역에 상호 hreflang, 유용한 `x-default`, locale sitemap, 한 페이지 한 주언어를 적용한다. IP/브라우저언어 강제 redirect와 검색용 얇은 자동번역 대량생성을 금지한다.
- **세부 권위:** `INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.md`, `INTERNATIONAL_COMPLIANCE_REFERENCE_MATRIX.md` 및 한국어 대응 문서가 세부계약이다. 카지노·수익화·검색 명세에도 v177 통합 델타를 연결한다.
- **승격:** 문서 전용 회차다. runtime/Test/Production 기능 활성화는 하지 않는다. 실제 구현 시 정책엔진 → 번역/SEO → 결제 → 카지노 격리 → isolated Test exact-SHA → 국가별 승인 → 기능 flag 순서를 따른다.
- **추적성/검증:** 초기 문서 commit `af2f359f33a0a73da6b9d5a14d622fc20466058f` / PR #413. GitHub Actions CI run `35173516232`에서 secret scan, install, lint, control-byte 검사, typecheck, production build, DB migration, 전체 test, Prisma schema mutation guard, production dependency audit가 모두 PASS했다. `git diff --check`와 상대 Markdown 링크 검사도 PASS했다.
- **merge/Test/Production 상태:** 최종 기획 동기화 시점 PR #413는 merge 대기다. 이번 회차는 docs-only이므로 isolated Test 런타임 승격과 Production 런타임 승격은 **N/A**이며, 결제/카지노/국가정책 runtime flag는 이 변경으로 활성화되지 않는다.

### v177 수용순서

`권위자료 조사` → `국가/주/채널 정책` → `언어와 관할 분리` → `자연번역 review gate` → `Google 국제 SEO` → `국가별 billing` → `카지노 CSP/유료출처 격리` → `Test matrix` → `국가별 법률/제품 승인` → `Production feature flag`. 적용되는 기존 backup/DR P0 게이트는 계속 선행조건이다.

## 회차 변경 — v2026.09.17.176 (2026-09-17)
## 회차 변경 — v2026.09.17.177 (2026-09-17)

### P0 백업 통제 재재현 + 릴리스/관측 게이트

- **브랜치/작업이력:** `docs/plan-v177-runtime-backup-repro`, exact base `f7d2087f342a087bc568ffc4abcaac5540f62e5b`; 기획 전용이다. runtime unit, DB, Test, GitOps, Production은 변경하지 않는다.
- **최신 증거(2026-09-17 12:01 KST):** 권위 Debian 호스트의 Moneyverse 5개 서비스는 모두 active이고 직전 1시간 backend/frontend warning 이상 journal은 없다. `moneyverse-backup.timer`와 `/var/backups/moneyverse`는 여전히 없고 backend 직접 `GET /api/version`은 HTTP 404다. 따라서 P0은 현재 재현된 결함이다.
- **P0 `BAK-RUNTIME-177-01` — OPEN / 파괴적 릴리스 차단:** 최초 11:03 KST, 12:01 KST 재현. balance, ledger, inventory/entitlement, profile, uploaded photo가 영향 범위다. 저장소 backup 구현은 존재하지만 runtime scheduler/destination은 없다. deployment/configuration drift는 확인됐고 installer 생략의 구체 원인은 UNKNOWN이다.
- **수정/담당:** Infra=exact-SHA 설치/systemd enable, Security=외부 키/restore-role 분리, Backend/DB=dump·migration·ledger 정합성, QA=fault injection/isolated restore, Operations=RPO/RTO dashboard/off-host immutable copy. scheduled backup+구조검증+isolated restore+`BAK-106-01` off-host 증거가 모두 PASS하기 전 destructive migration/data cleanup/ledger rewrite 운영승격을 금지한다.
- **마이그레이션/롤백/시험:** application-data migration은 없다. timer disable/이전 unit 복구로 rollback하되 artifact·audit·마지막 verified backup은 보존한다. same-filesystem, missing-key, permission, disk-full, interrupted-write, retention, reboot persistence, outer/inner hash, `pg_restore -l`, photo archive/manifest, isolated restore의 migration-set·ledger 합계·entitlement uniqueness·sample photo hash 정합성을 시험한다.
- **모니터링/릴리스 권위:** timer 누락/disabled, RPO age, verify failure, destination 여유공간, verified copy 0, off-host copy 노후, release-evidence mismatch를 경보한다. `/api/version`은 non-secret immutable application identity뉼 제공하도록 백로그화하며 404는 runtime identity UNKNOWN으로 처리해 exact-SHA 완료 주장을 차단한다.

### 레퍼런스·보안·SEO·사업성 판정

- **SEO / 직접채택:** Google Search Central 최신 주요 문서 변경은 2026-09-08 regional Search experience다. 현재 canonical/robots/sitemap/hreflang/SSR/ISR 계약을 바꿀 새 ranking 근거는 없다. public SEO read-model은 server-authoritative, private account/admin/transaction/economy-history는 noindex+sitemap 제외, structured data는 visible eligible content에만 출력한다.
- **보안 / 직접채택:** OWASP Top 10:2025는 Broken Access Control, Software Supply Chain Failures, Authentication Failures, Software/Data Integrity Failures, Logging/Alerting Failures를 포함하고 OWASP는 검증 가능한 SDLC 요구에 ASVS를 권고한다. object/function authorization, fail-closed release classification, provenance-bound artifact, least-privilege runtime/restore credential, masked audit log, negative abuse test를 배포차단 통제로 유지한다. API별 BOLA/BFLA/business-flow 시험은 API Security Top 10 2023을 유지한다.
- **전 기능 계약:** auth/session/OAuth, profile/security center, inventory/collection, shop/cart/payment/subscription/ad-removal, season/quest/job/level/reward, business/bank/loan, virtual stock/portfolio/alerts, casino, community/moderation, friend/club/referral, notification/search/upload/public content, app API/admin/audit/backup/analytics/ads/SEO/incident response의 기존 상세 matrix를 계속 권위로 둔다. 화면상태, role/ownership, API request/response/error/idempotency/rate-limit, DB constraint/transaction/concurrency, audit/fallback/privacy/abuse, SEO/analytics/performance/cache, QA, deploy/rollback 증거 없이는 PARTIAL/PLANNED를 DONE으로 바꾸지 않는다.
- **사업성:** 새 실측 purchase/ad cohort는 없다. revenue/net revenue/margin/ARPU/ARPDAU/ARPPU/conversion/retention/churn/refund/CAC/LTV/fraud/infra/support는 실측 또는 `HYPOTHESIS/TEST TARGET`만 허용하고 SKU fee는 거래별 versioning을 유지한다. backup 가치는 data-loss/downtime/refund/support/fraud-reconciliation 손실 회피다. 반복 RPO/RTO PASS+off-host immutable restore에서만 scale, 미달은 iterate, stale/missing backup 또는 runtime identity 미정합은 destructive eligibility kill이다.

### v177 수용 순서

`최신 공식 레퍼런스` → `exact main + runtime + CI 대조` → `P0 재현` → `기능/보안/SEO/사업성 계약 유지` → `작업 중 exact-main 재확인` → `EN/KO parity + diff check` → `PR CI` → `exact base 불변일 때만 merge`.


### P0 런타임 백업 설치 공백 + 권위 정합성

- **작업 브랜치/기준:** `docs/plan-v176-runtime-backup-gap`, 기준 `faa047fdb637df74b4327ef45c9585be1c15d8c5`. 이번 회차는 기획 문서만 변경하며 unit 설치, DB 상태 변경, 런타임 승격을 수행하지 않는다.
- **최신 런타임 증거(2026-09-17 10:58–11:05 KST):** 권위 Debian 호스트에서 `moneyverse-backend`, `moneyverse-frontend`, `moneyverse-discord-bot`, `moneyverse-economy-ai`, `moneyverse-mcp`가 active다. backend는 `127.0.0.1:3000`, frontend는 `:3001`에서 listen한다. 직전 1시간 backend/frontend journal에서 warning 이상 항목은 관측되지 않았다.
- **P0 `BAK-RUNTIME-176-01` — OPEN / 파괴적 작업 배포차단:** repository `main`에는 v174 암호화 정기백업 구현이 존재하지만 권위 런타임에는 `moneyverse-backup.timer` unit file과 `/var/backups/moneyverse` 목적지 디렉터리가 없다. 따라서 merge된 코드/기획 증거를 실제 백업 통제로 간주하면 안 된다. 최초 확인/재현: 2026-09-17 11:03 KST. 영향: DB/사진 DR, 파괴적 migration 안전성, 사고복구, RPO/RTO 주장.
- **원인 상태:** repository 구현과 runtime 설치 사이의 배포/구성 공백은 확인됨. 운영/release 경로가 설치 여부 결정을 기록하기 전에는 의도 여부를 추정하지 않는다.
- **수정설계:** 기획 자동화에서 직접 설치하지 않고 운영 백로그로 연결한다. (1) `/dev/sda1` 용량/소유권 및 source/destination filesystem 분리 확인, (2) 승인된 secret 경로로 외부 암호화 키 공급, (3) exact reviewed application SHA의 script/systemd unit 설치, (4) daemon-reload 후 timer enable/start, (5) 비파괴 backup 1회, (6) outer SHA/decrypt/inner SHA/`pg_restore -l`/사진 archive/manifest 검증, (7) 격리 DB/filesystem restore 후 schema/migration set, ledger/entitlement invariant, 사진 hash sample 정합성 검증, (8) 이후에만 local scheduled backup을 ACTIVE로 판정한다. DR 종료에는 별도 off-host immutable copy가 계속 필요하다.
- **롤백:** timer disable, 생성된 암호화 artifact와 audit evidence 보존, 이전 unit/script가 있었다면 복구하며 rollback 중 마지막 정상 backup을 삭제하지 않는다. Production DB restore는 rollback 절차에 포함하지 않는다.
- **QA/수용조건:** shell/static unit 검사, 동일-filesystem 차단, key 누락/권한/disk-full/interrupted-write, 실제 backup 구조 검증, isolated restore drill, reboot/persistent timer, 유일한 정상 backup을 삭제하지 않는 retention 시험. Test 수용은 timer installed+enabled, RPO 내 최근 성공 backup, verification PASS, isolated restore PASS다. Production/파괴적 migration 게이트는 `BAK-106-01`의 off-host/immutable 증거까지 요구한다.
- **모니터링:** `backup_last_success_timestamp`, `backup_age_seconds`, `backup_verify_failures_total`, `backup_bytes`, `backup_duration_seconds`, `backup_destination_free_bytes`, timer next-run, off-host-copy age를 수집한다. RPO 초과 전 경고하고 검증 실패, timer/key 누락, source/destination filesystem 충돌, verified copy 0개가 되는 retention 상태는 즉시 알림한다.
- **런타임 버전 관측 공백:** backend 직접 `GET /api/version`은 현재 404다. 따라서 repository `main` SHA를 deployed application identity로 동일시할 수 없다. `{repositoryHeadSha, applicationSourceSha, deployedRuntimeId, imageDigest/packageHash, migrationSetHash, environment, observedAt}`을 별도 release evidence로 보존하고 정합성 확인이 불가능하면 exact-SHA 승격 완료 주장을 차단한다.

### 외부 레퍼런스 판정 및 교차 백로그

- **SEO:** Google Search Central 최신 주요 문서 변경은 계속 2026-09-08 regional Search experience 추가다. 2026-08-28 site-reputation 변경은 sponsored/affiliate/third-party/UGC 거버넌스에 계속 적용한다. public SEO read-model, canonical/robots/sitemap/hreflang/SSR/structured-data 계약은 유지하고 private account/admin/transaction은 noindex+sitemap 제외한다.
- **보안:** API별 OWASP API Security Top 10 2023과 application 검증 ASVS를 유지하고 supply-chain/release 권위는 least-privilege+fail-closed로 운영한다. 백업 키는 Git/log/backup metadata에 저장하지 않으며 restore 권한은 일상 application credential과 분리한다.
- **사업성:** 이번 회차 새 실측 구매/광고 cohort는 확인되지 않았다. ARPU/ARPDAU/ARPPU/conversion/churn/CAC/LTV는 `HYPOTHESIS/TEST TARGET`을 유지한다. Google Play fee는 market, transaction 시점/종류, install cohort, programme, billing path별 versioning을 유지한다. 백업/복구 사업효과는 가상의 직접매출이 아니라 data-loss/downtime/refund/support/fraud-reconciliation 비용 회피로 측정한다.
- **우선순위:** `BAK-RUNTIME-176-01`과 `BAK-106-01`은 신규 monetization/growth보다 우선한다. Scale 기준은 verified scheduled local backup + isolated restore + off-host immutable copy가 정의된 RPO/RTO를 반복 충족하는 것이다. RPO/RTO 미달은 iterate, backup 증거 누락/노후화는 파괴적 release eligibility kill/rollback 조건이다.

### v176 수용 순서

`외부 레퍼런스 갱신` → `main/runtime/CI 증거 대조` → `runtime backup 공백 P0 기록` → `증거 누락 중 파괴적 작업 금지` → `EN/KO parity + diff check` → `PR CI` → `동일 exact base에서만 merge`.

## 회차 변경 — v2026.09.17.175 (2026-09-17)

### UI 정돈 + Bootstrap 로컬 자산 계약

- **작업 브랜치:** `feat/ui-local-assets-v2026.09.17.175`; 기준 및 작업 중간 `main` SHA: `57feac0e2f701ed4bba12b868ddf19c2f916a32a`.
- **Bootstrap 출처/보관:** getbootstrap.kr 5.3 다운로드 문서가 가리키는 Bootstrap **5.3.8** compiled distribution을 확인했다. ZIP 원본과 SHA-256은 별도 `/dev/sdb1` 데이터 디스크의 `/srv/moneyverse-data/vendor/bootstrap/5.3.8/`에 보관한다.
- **런타임 자산 규칙:** Bootstrap은 제3자 CDN에서 불러오지 않는다. `frontend/src/styles/vendor/bootstrap-5.3.8.min.css`를 Next.js 빌드에 직접 포함한다.
- **UI 범위:** 공통 앱 배경, sticky header, main spacing, 카드 depth/hover, footer 경계를 정돈하고 desktop 홈 현황 카드와 mobile quick action에 동일 시각 계층을 적용한다. API/DB/사업 규칙은 변경하지 않는다.
- **접근성/성능:** `prefers-reduced-motion`에서는 hover 이동을 제거하고 모바일에서는 fixed background를 해제한다. 새 외부 runtime asset request를 추가하지 않는다.
- **검증 증거:** 공유 contract build 후 frontend typecheck PASS, frontend 68 test files / 614 tests PASS, production build PASS. Test/Production runtime 승격은 아래 게이트를 통과해야 한다.
- **승격 순서:** exact branch → isolated Test frontend/backend/API smoke → main 통합 → exact-main 재검증 → Production 승격 → Production smoke. 게이트 전에는 운영 완료로 기록하지 않는다.

### v175 수용조건

`Bootstrap 원본 별도 디스크 보관 + checksum` → `runtime Bootstrap CDN 0` → `frontend 정적/단위/build PASS` → `isolated Test frontend/backend/API smoke` → `main 통합` → `exact-main Production smoke`.

## 회차 변경 — v2026.09.17.174 (2026-09-17)

### 자동 백업 시스템

- **현재 호스트 증거:** 권위 PostgreSQL 데이터와 운영 사진은 `/dev/sdb1`, 새 백업 목적지 `/var/backups/moneyverse`는 `/dev/sda1`이다. 기존 `/srv/moneyverse-data/backups` dump는 원본과 같은 `/dev/sdb1`이므로 편의/릴리스 롤백 자료이지 독립 디스크 백업이 아니다.
- **구현:** `ops/backup/moneyverse-backup.sh`가 PostgreSQL custom-format dump + zstd 사진 archive, manifest, SHA-256을 만들고 root-only 외부 키로 암호화한다. 암호화 파일에도 SHA-256을 만들고 `moneyverse-backup-verify.sh`로 검증하며 14일 보존한다. 목적지와 DB/사진 원본이 같은 filesystem이면 fail-closed한다.
- **주기:** `ops/systemd/moneyverse-backup.service` + `.timer`가 6시간마다 랜덤 지연을 포함해 실행되며 reboot 후 missed run을 보완한다. CPU/IO 우선순위를 낮추고 systemd filesystem hardening을 적용한다.
- **검증 증거:** `/srv/moneyverse-data/backups` 대상 negative test는 원본과 목적지가 모두 `/dev/sdb1`이라 의도대로 실패했다. `/var/backups/moneyverse-v173-test` positive test는 약 9.4 MiB 암호화 archive를 생성했고 외부 SHA-256, 복호화, 내부 SHA-256, `pg_restore -l`, 사진 zstd integrity, format marker를 모두 통과했다.
- **보안/복구:** 암호화 키는 `/etc/moneyverse`의 root-only `0600`이며 Git/backup metadata에 저장하지 않는다. 운영 restore를 자동 파괴 작업으로 수행하지 않으며 격리 target에서 source/target identity, migration/ledger/entitlement/photo reconciliation, audit evidence를 요구한다.
- **잔여 P0:** `/dev/sda1`과 `/dev/sdb1`은 별도 block device지만 같은 KVM VM 안에 있다. local disk 장애 복구는 개선되지만 off-host/immutable DR은 아니다. 독립 관리 off-host 복사본과 isolated restore drill로 RPO/RTO를 증명하기 전까지 `BAK-106-01`은 OPEN이다.

### v174 백업 수용조건

`주기 암호화 backup` → `별도 filesystem guard` → `외부+내부 checksum` → `DB dump/사진 archive 구조 검증` → `retention` → `restore drill 증거` → `off-host immutable replication` 순이다. 파괴적 schema/data 작업은 backup/restore 증거가 없거나 오래되면 계속 차단한다.

## 회차 변경 — v2026.09.17.173 (2026-09-17)

### 브랜치 및 작업내역 기록 계약

- **작업 브랜치:** `docs/plan-v173-branch-work-history`
- **기준 `main` SHA:** `2d819484d01d54b6d6e35b4e21e94c98c784bb0d`; **최종 재확인 `main` SHA:** `8c236be3d5508925db3c52da2ab8f2f4de1d1a7d` (별도 UI PR #406 반영 후).
- **현재 작업 commit/PR:** `d554c0874c6e1ff71fefd153df68dc8e0970e20c` / PR #407 (최종 문서 갱신 시점 open, 통합 후 merge 상태를 기록).
- **대체된 선행 시도:** `docs/plan-v172-branch-work-history` / `c16d9c86d0d2305532514fd4196a26434c7b53c7` / PR #405. 작업 도중 `main`이 별도 v172 변경으로 전진해 버전 충돌이 발생했으므로 선행 브랜치는 병합하지 않고 대체 상태로 보존했다.
- **범위:** 문서 거버넌스 변경만 수행하며 런타임, DB, API, Test 또는 Production 동작은 변경하지 않는다.
- **작업내역:** 향후 모든 기획서 수정 회차에 작업 브랜치와 실제 수행 내역을 기획서 본문에 의무 기록하도록 규칙을 추가했다. 필수 항목은 브랜치, 기준/현재 main SHA, 확인 가능한 commit/PR, 변경 파일·기능영역, 작업 요약, 검증 근거, merge/Test/Production 상태다.
- **변경 파일:** `docs/planning/PROJECT_PLAN.md`, `docs/planning/PROJECT_PLAN.ko.md` 및 v173 업데이트 문서.
- **검증/상태:** 영문·한국어 내용 동기화와 `git diff --check`를 확인한다. 이 회차는 docs-only이므로 Test/Production 런타임 승격 대상이 아니다.

### v173 결정

Git 이력만 조회해야 작업 맥락을 알 수 있는 상태를 허용하지 않는다. 이 권위 기획서를 수정하는 모든 회차에는 **브랜치 / 작업내역** 기록을 같은 회차에 둔다. 여러 브랜치가 관여하면 각각 작업/PR과 상태를 매핑하고, 병합·대체·폐기된 브랜치도 삭제하지 않고 보존한다. 이 기록이 없는 기획 변경은 완료로 보지 않는다.

## 회차 변경 — v2026.09.17.172 (2026-09-17)

### 현재 소스코드 동기화

- **권위 저장소 기준:** 이번 재분석은 `main` `0eabcc19d8c970689533d6a006c12701a62190fc`(기획 v2026.09.17.171)를 기준으로 한다. v171의 CI/runtime 증거는 그대로 권위가 있으며 이번 회차는 구현 파일 경로 동기화를 추가한다. v171의 release-control 증거를 대체하거나 완화하지 않는다.
- **카지노 브라우저/런타임 복구 (`23ae3608`, #383):** `frontend/src/app/casino/actions.ts`의 `use server` 경계에서 동기 export가 노출되지 않도록 정리했고 client-safe 상태를 `casino-state.ts`로 분리했다. error boundary를 추가하고 casino forms/theme games/loading 경로를 수정했으며 `actions-boundary.test.ts`가 경계 계약의 회귀를 막는다.
- **카지노 플레이 계약 + 주사위 UX (`f6fd3120`, #384):** 프론트 action adapter가 포맷 문자열이 아니라 backend 정수 JSON 계약에 맞는 bounded stake를 전송한다. `casino-forms.tsx`와 `globals.css`에 서버 결과 기반 주사위 표현을 추가하되 RNG, 자격, 베팅 차감/지급, 원장, 멱등성 권위는 서버에 유지한다.
- **직업 일/주 초기화 수렴 (`03a8ae9c`, #388):** backend Work API가 `WorkDashboardResponseDto`를 통해 권위 `game_day_key`, `game_week_key`, `day_ends_at`, `week_ends_at`를 반환하며 `WorkRepository.dashboard()`는 `work_my_dashboard_v2`를 사용한다. `packages/database/migrations/203-work-reset-convergence.sql`이 가속 window와 reward-window 수렴의 DB 권위다. frontend Work 화면과 mobile API contract/schema 문서도 동일 reset 필드를 사용한다. 실DB 테스트는 정확한 가속 경계와 DB session timezone 독립성을 검증한다.
- **경제 AI 운영 활성화 (`e992d44d`, #389):** `ops/systemd/`에 재현 가능한 Debian/systemd service profile이 있고 EN/KO 런타임 운영 문서가 연결되어 있다. 이는 runtime configuration 증거이며 더 최신 application SHA가 승격됐다는 증거로 단독 사용하지 않는다.
- **관리자 내비게이션 수렴 (`7acc3c02`, #390):** 관리자 UI inventory에서 상단 메뉴에 보안·사업/시즌·작업/직업·Discord를, dashboard inventory에 문의·상점을 노출하고 최상위 관리자 영역 누락을 막는 회귀 계약을 추가했다. 메뉴 노출은 backend 권한 확대를 뜻하지 않는다.

### 현재 런타임 플랫폼 (2026-09-17 실측)

- **호스트/OS:** 승인된 런타임 호스트 `debian13`; Debian GNU/Linux 13.6 (`trixie`), `amd64`/x86_64, Linux kernel `6.12.94+deb13-amd64`.
- **초기화/서비스 관리자:** systemd `257 (257.13-1~deb13u1)`. 확인 시점에 `moneyverse-backend`, `moneyverse-frontend`, `moneyverse-discord-bot`, `moneyverse-economy-ai`, `moneyverse-mcp`가 모두 `active`다.
- **호스트에서 관측된 런타임/도구:** Node.js `v24.21.0`, pnpm `10.0.0`, Python `3.13.5`, Docker `29.8.0`. 이는 현재 호스트 실측값이며 지원 애플리케이션 버전 계약을 자동으로 의미하지 않는다. 빌드 권위는 application manifest/lockfile과 CI image에 있다.
- **가상화/플랫폼:** 승인 호스트는 x86-64 KVM 가상화를 보고한다. machine ID, boot ID, product UUID 같은 식별정보는 기획서에서 의도적으로 제외한다.
- **권위 규칙:** 더 최신 exact-SHA release evidence가 런타임 권위 전환을 증명하기 전까지 현재 공개 런타임 권위는 확인된 Debian/systemd 경로다. repository `main`, GitOps desired state, Test runtime, Production runtime은 서로 별도 증거 영역으로 유지한다.

### 기획 반영 결론

- Casino, Work reset, Economy AI 운영, 관리자 내비게이션 기획은 위 커밋과 실제 파일 경로를 현재 구현 증거 baseline으로 사용한다. 이후 기능 기획은 중복 개발을 제안하기 전에 이 경로를 먼저 확인한다.
- 상태는 증거 범위로 구분한다. `main` 구현 증거는 exact-SHA Test 또는 Production 증거와 같지 않으며 기존 isolated Test, DB/API/user-flow, authorization, monitoring, rollback gate를 계속 적용한다.
- v171의 P0 공통 pre-privilege classifier 문제는 미해결이다. v172는 문서 전용 변경이며 runtime 승격을 주장하거나 docs-only CI/DB/registry side-effect 결함이 해결됐다고 보지 않는다.

### v172 백로그/순서 및 수용조건

`P0 독립 암호화 backup + isolated restore/reconciliation` → `P0 stale-status false-green` → `P0 generic CI + candidate/release 공통 pre-privilege classifier` → `P0 docs-only runtime/DB/registry/GitOps side-effect 0` → `P0 단일 release authority와 runtime-id reconciliation` → `P1 Casino/Work/Admin/Economy-AI exact-SHA runtime 증거 검증` → `P1 auth/session/admin/casino/Work/DB authorization+ledger QA` → `P1 required-check enforcement` → core correctness → monetization → SEO/acquisition → retention/accessibility.

## 회차 변경 — v2026.09.17.171 (2026-09-17)

### 증거와 결정

- **저장소/CI/런타임 증거:** 회차 시작 및 중간 `main`은 문서 전용 `d398f6ef1a821496c92ef2916a1b0b36c964f4ec` (`docs: update Moneyverse plan v2026.09.17.170 (#401)`)이다. 브랜치 보호는 활성화되어 있으나 required status-check enforcement는 `off`이고 required context/check는 0개다. 이 docs-only SHA의 CI #1176은 완료 전 이미 runtime dependency 설치, lint/typecheck/application build를 수행하고 `Apply database migrations` 단계에 진입했다. 즉 generic CI도 release-input 분류 전에 runtime/DB 작업을 허용하는 결함이 재현됐다. 별도 Test 실측에서 2026-09-17 09:10 KST `GET /api/version`은 200과 runtime id `18c7a1324013099e47b2d6e22c5108c4d378139c`를 반환했고 `/api/health`, `/api/health/ready`는 404였다. Test는 `X-Robots-Tag: noindex, nofollow`, `robots.txt`의 `Disallow: /`, 빈 sitemap을 반환했다. repository head와 runtime id는 서로 다른 권위이며 상호 대체하지 않는다.
- **P0 `REL-DOCS-171-01` — OPEN / 최근 재현 2026-09-17:** v163-v170의 기존 최초/반복 증거를 유지하며 최신 재현은 `d398f6e...`의 CI #1176이다. 재현은 docs-only 병합 → CI 시작 → runtime dependency/build → migration 시작이다. 영향은 불필요한 DB 권한/비용, 잠재 schema side effect, 잘못된 release identity, 운영자 혼선이다. 원인은 generic CI와 release workflow가 동일한 필수 pre-privilege classifier를 공유하지 않는 것이다. 하나의 재사용 `classify-release-inputs` workflow가 generic CI와 candidate/release 모두를 선행 gate한다. `DOCS_ONLY_NO_RUNTIME_RELEASE`는 markdown/link/secret/static-policy 검사만 실행하고 DB URL, package write token, deployment credential, runtime network secret을 받지 않는다. `RUNTIME_RELEASE_REQUIRED`만 immutable 분류 증거 이후 stage-scoped 단기 credential을 발급한다. 오류/불명은 fail-closed한다. application DB migration은 필요 없고 rollback은 workflow wiring만 되돌린다.
- **런타임 권위/관측 계약:** 운영상 필요할 때만 하나의 내부 readiness 권위와 public-safe liveness를 명시하며 404인 `/api/health*`에 임의 의미를 부여하지 않는다. Release evidence는 `{repositoryHeadSha, applicationSourceSha, deployedRuntimeId, imageDigest, migrationSetHash, environment, observedAt}`를 저장하고 runtime version endpoint와 applicationSourceSha/imageDigest를 reconcile할 수 없으면 승격을 차단한다. Test probe는 status, latency, cache/security header, exact runtime id를 보존하며 stale status page는 direct evidence보다 우선하지 않는다.
- **SEO/SEO 백엔드:** Google Search Central 공식 changelog는 2026-09-08 업데이트가 현재 9월 최신 주요 문서 변경이다. Google은 template/code 변경 후 structured-data 유효성 모니터링과 Search Console/API 관측을 권고한다. 공개 route별 versioned server SEO read-model `{canonicalUrl,indexPolicy,title,description,h1,breadcrumbs,hreflang,updatedAt,imageMeta,structuredDataType,structuredDataVersion}`을 사용하고 rendered-visible content와 JSON-LD 일치를 검증하며 invalid-item 회귀 시 template rollout을 차단한다. Test/staging은 전역 `noindex,nofollow` + `Disallow: /` + 빈 sitemap을 유지한다. Production의 account/admin/transaction/private inventory/bank/casino-history는 noindex 및 sitemap 제외다.
- **보안:** OWASP API Security Top 10 2023을 최신 API-specific 기준으로, ASVS를 application verification baseline으로 유지한다. CI/release classification을 least-privilege supply-chain authorization으로 취급한다. Route inventory는 authn, capability, object ownership/BOLA, function authorization/BFLA, property/schema authorization, idempotency/replay, rate/resource/business-flow limit, SSRF/upstream trust, PII class, audit event를 계속 매핑한다. docs-only job이 DB/GHCR/GitOps mutation capability를 받으면 release-blocking이다.
- **수익성/사업성:** Google Play 현행 공식 수수료는 cohort/transaction/programme/billing-path에 따라 달라 단일 수수료를 가정하지 않는다. SKU unit economics는 `feePolicyVersion`, market, transaction timestamp, install cohort, transaction type, billing path, tax/refund reserve, direct ops cost를 유지한다. 실측 없는 conversion/ARPU/ARPDAU/ARPPU/churn/CAC/LTV는 `HYPOTHESIS`/`TEST TARGET`이다. Release-control 사업효과는 절감된 docs-only CI/DB minutes, registry bytes/storage, orphan-candidate cleanup, support/on-call 시간으로 측정하고 유지 corpus false-negative=0일 때만 scale한다.

### v171 백로그/순서 및 수용조건

`P0 독립 암호화 backup + isolated restore/reconciliation` → `P0 stale-status false-green` → `P0 generic CI + candidate/release 공통 pre-privilege classifier` → `P0 docs-only runtime/DB/registry/GitOps side-effect 0` → `P0 단일 release authority와 runtime-id reconciliation` → `P1 auth/session/admin/casino/Work/DB authorization+ledger QA` → `P1 required-check enforcement` → 핵심 correctness → monetization → SEO/acquisition → retention/accessibility. docs-only 수용조건은 `runtime_dependency_install=0`, `app_build=0`, `db_migration=0`, `registry_login/push=0`, `test_gitops_write=0`, `runtime_exact_sha_poll=0`, `production_mutation=0`이다. Runtime 구현은 별도 branch → CI → exact-SHA Test → API/DB/user-flow QA → main → Production → smoke/rollback 흐름을 유지한다.

## 회차 변경 — v2026.09.17.170 (2026-09-17)

### 근거와 결정

- **저장소/CI 근거:** 회차 시작 및 작업 중간 `main`은 `bd047d9a7b9bd4e3d2b1cde4badbe80b07ae7684` (`docs: integrate Moneyverse plan v2026.09.17.169`)이며 docs-only다. CI #1174는 성공했지만 `Build Test Candidate` #797도 성공했다. `verify / check`는 dependency install, lint, typecheck, app build와 `Apply database migrations`를 성공 수행했고 `build` job은 GHCR login 후 backend/frontend candidate를 모두 build+push했다. `dispatch-production-gate`는 skip됐다. 즉 v169 기획 통합 후에도 P0 privileged side-effect 결함이 재현됐다. workflow 성공을 runtime health 증거로 사용하지 않는다.
- **P0 `REL-DOCS-170-01` — OPEN / 최신 재현 2026-09-17:** docs-only가 계속 DB migration과 registry write surface에 도달한다. 수정은 privilege 이전 분류와 capability isolation이다. classifier/docs job에는 repository metadata read-only만 주고 immutable `RUNTIME_RELEASE_REQUIRED` 뒤에만 DB/GHCR/GitOps OIDC credential을 발급한다. docs-only 수용조건은 runtime install/build/migration/registry/GitOps/poll/production side effect 모두 0이다. rollback은 workflow wiring만 되돌리고 application data 또는 referenced image를 삭제하지 않는다. docs-only CI/DB minute, registry login/push, bytes/storage, orphan candidate, repository/application SHA divergence를 관측한다.
- **SEO 조사:** Google Search Central 공식 changelog는 2026-09-08 regional Search-experience 문서를 9월 최신 주요 변경으로 계속 표시한다. 2026-09-16 Deep Dive Europe 글은 행사/커뮤니티 자료로 ranking/indexing 계약 변경이 아니다. 2026-08-28 site-reputation update는 third-party/sponsored/affiliate/UGC governance에 계속 직접 적용한다. server-authoritative metadata/canonical/robots/sitemap/hreflang/structured-data/SSR/CWV와 moderation/thin-content index gate를 유지한다.
- **보안 조사:** OWASP API Security Project 최신 API-specific Top 10은 계속 2023이다. release eligibility는 least-privilege/supply-chain authorization boundary이며 BOLA, authentication, property/function authorization, resource limit, sensitive-business-flow abuse, SSRF, misconfiguration, API inventory, unsafe upstream consumption을 route-level release gate로 유지한다.
- **사업성:** Google Play 공식 수수료는 cohort/transaction/programme/billing-path별로 달라 단일 요율을 가정하지 않는다. SKU `feePolicyVersion`과 revenue/net revenue/margin/ARPU/ARPDAU/ARPPU/conversion/retention/churn/refund/CAC/LTV/fraud/infra/support 실측을 유지하고 미실측 값은 `가설/테스트 기준`으로 둔다. release-control 비용에는 docs-only CI/DB minute, pushed bytes/storage, cleanup/support burden을 포함한다.

### v170 백로그/수용 순서

`P0 독립 암호화 backup + isolated restore/reconciliation` → `P0 stale-status false-green` → `P0 privilege 이전 release classifier / docs-only DB+registry side-effect 0` → `P0 GitOps/public edge/systemd 단일 release authority` → `P1 auth/session/admin/casino/Work/DB authorization+ledger QA` → `P1 repository required-check enforcement` → core correctness → monetization → SEO/acquisition → retention/accessibility. runtime 구현은 별도 branch/test/release 흐름이며 이 기획 회차에서 runtime code를 배포하지 않는다.

## 회차 변경 — v2026.09.17.169 (2026-09-17)

### 근거와 결정

- **저장소/CI 근거:** 회차 시작 및 작업 중간 `main`은 `cafa12cbd1e9a36487966e3c72bda46b16f9aff7` (`docs: update Moneyverse plan v2026.09.17.168 (#399)`)이며 docs-only다. CI #1172는 성공했지만 `Build Test Candidate` #795도 성공했다. `verify / check`는 dependency install, lint, typecheck, app build와 `Apply database migrations`를 성공 수행했고, 이어 `build` job은 GHCR login 후 **backend/frontend candidate image를 모두 build+push 성공**했다. `dispatch-production-gate`와 `Auto Integrate and Promote` #128은 skip됐다. 즉 downstream promotion은 없었지만 v168 docs-only 수용계약은 DB migration, image build, registry write 경계에서 위반됐다. 이 workflow 증거로 Test/Production runtime 상태를 추정하지 않는다.
- **P0 `REL-DOCS-169-01` — OPEN / 최신 재현 2026-09-17:** docs-only가 단순 orchestration을 넘어 DB와 registry mutation surface를 실제 소비한다. 재현: docs-only v168 merge → CI #1172 success → Test Candidate #795 → migration success → GHCR login → backend/frontend candidate build+push success. 영향은 privileged credential 노출면 확대, registry/storage 비용, candidate identity 오염, 운영자 혼동과 supply-chain blast radius 증가다. 원인은 privileged runtime 작업보다 release eligibility 판정이 늦거나 candidate 생성 전 판정이 없는 control-plane ordering이다.
- **수정/권한경계:** `classify-release-inputs`만 push 직후 최초 실행을 허용하며 repository metadata read-only 외에는 package-registry write token, DB/network secret, GitOps credential을 받지 않는다. signed/immutable `RUNTIME_RELEASE_REQUIRED` 결과가 있어야만 OIDC 기반 단기 stage-scoped credential을 dependency/build DB, GHCR, GitOps 단계에 발급한다. `DOCS_ONLY_NO_RUNTIME_RELEASE`는 docs/static-policy check만 수행하고 `RELEASE_INPUT_CLASSIFICATION_ERROR`는 fail-closed다. candidate tag/digest는 docs-only `repositoryHeadSha`가 아니라 `applicationSourceSha`에 결합한다. unreferenced candidate GC는 어떤 release evidence도 참조하지 않음을 증명한 뒤에만 수행한다.
- **테스트/수용/롤백/관측:** docs-only acceptance를 `runtime_dependency_install=0`, `app_build=0`, `db_migration=0`, `registry_login=0`, `backend_image_build_push=0`, `frontend_image_build_push=0`, `test_gitops_write=0`, `exact_sha_poll=0`, `production_mutation=0`으로 고정한다. classifier/docs job에 privileged secret이 없고 OIDC audience/subject가 stage-scoped인지 negative test한다. rollback은 workflow wiring만 되돌리며 referenced image 삭제나 application data 변경을 금지한다. `docs_only_db_migration_total`, `docs_only_registry_login_total`, `docs_only_image_push_total`, pushed bytes/storage cost, orphan candidate, repository/application SHA divergence를 관측하고 docs-only privileged side effect가 하나라도 발생하면 release engineering alert를 낸다.
- **SEO 조사:** Google Search Central 최신 major-update 페이지는 2026-09-08 regional Search-experience 문서를 9월 최신 주요 변경으로 계속 표시한다. 2026-09-16 Search Central Live Deep Dive Europe는 행사/커뮤니티 자료라 ranking/indexing 계약 변경으로 채택하지 않는다. 2026-08-28 site-reputation update는 third-party/sponsor/affiliate/UGC governance에 계속 직접 적용한다. server-authoritative canonical/robots/sitemap/hreflang/structured-data/SSR/CWV 계약을 유지하고 공개 UGC/affiliate indexability는 domain authority 상속이 아니라 moderation/ownership/thin-content gate를 통과해야 한다.
- **보안 조사:** OWASP API Security Project의 최신 API-specific Top 10은 계속 2023이다. `REL-DOCS-169-01`을 API8/security misconfiguration 및 supply-chain least-privilege 문제와 연결한다. docs-only 변경은 DB/registry mutation capability를 얻어서는 안 된다. BOLA/BFLA/authentication/resource/sensitive-business-flow/SSRF/inventory 통제는 그대로 유지한다.
- **사업성:** Google Play 공식 fee table은 install cohort, recurring/non-recurring, programme, billing path별로 달라 SKU별 `feePolicyVersion`을 유지하고 미실측 conversion/ARPU/churn/CAC/LTV는 가설로 둔다. release-control 비용은 docs-only CI minute, DB minute, registry egress/storage, orphan-candidate cleanup/support time을 별도 측정한다. maintained corpus false-negative=0이고 runtime gate를 약화하지 않을 때만 classifier를 scale하며 runtime-relevant 변경을 skip할 수 있는 최적화는 kill한다.

### v169 백로그/수용 순서

`P0 독립 암호화 backup + isolated restore/reconciliation` → `P0 stale-status false-green` → `P0 privilege 이전 release classifier / docs-only DB+registry side-effect 0` → `P0 GitOps/public edge/systemd 단일 release authority` → `P1 auth/session/admin/casino/Work/DB authorization+ledger QA` → `P1 repository required-check enforcement` → core correctness → monetization → SEO/acquisition → retention/accessibility. runtime 구현은 별도 branch/test/release 흐름이며 이 기획 회차에서 runtime code를 배포하지 않는다.

## 회차 변경 — v2026.09.17.168 (2026-09-17)

### 근거와 결정

- **저장소/CI 근거:** 회차 시작 및 작업 중간 `main`은 `5a5dfdb4c6b83849f5eda7a6b7ef05fcb83b5b35` (`docs: integrate Moneyverse plan v2026.09.17.167`)이다. branch protection은 켜져 있지만 required-status-check enforcement는 `off`이고 required context/check도 없다. 이 커밋은 기획문서만 변경했는데도 push 직후 `Build Test Candidate` #794가 시작됐다. `verify / check` job은 container 초기화, 의존성 설치, lint/typecheck/build를 수행했고 test 단계 전에 **`Apply database migrations`를 성공 수행**했다. 즉 docs-only 변경이 runtime-input eligibility 판정 전에 DB를 사용하는 test-candidate setup까지 실행한다는 직접 증거다. 이 CI 증거만으로 Test/Production runtime 상태를 추정하지 않는다.
- **P0 `REL-DOCS-168-01` — OPEN / 최신 재현 2026-09-17:** 비런타임 변경이 migration/build surface를 불필요하게 실행해 CI/DB/registry/release 자원을 소비하고 release identity를 오인하게 만들 수 있으므로 P0이다. 재현: docs-only `5a5dfdb...` 통합 → `Build Test Candidate` #794 관찰 → job step 확인 → dependency install/build/`Apply database migrations`가 classification 전에 실행. 영향은 release engineering, test DB, CI capacity와 repository SHA를 application SHA로 해석하는 운영자다. 원인은 side effect 이전 runtime-input classifier가 실제 workflow에 구현되지 않은 것으로 한정한다.
- **구체 수정/마이그레이션/롤백:** dependency가 거의 없는 `classify-release-inputs` job을 release-control 최선행으로 둔다. merge-base→head metadata와 versioned `release-inputs.yml`을 읽고 `{repositoryHeadSha, applicationSourceSha, classification, matchedRuntimePaths, classifierVersion, evidenceCreatedAt}` 불변 증거를 생성해 dependency install, app build, migration container, candidate image/registry, Test GitOps write, exact-SHA poll, Production promotion 전체를 gate한다. `DOCS_ONLY_NO_RUNTIME_RELEASE`는 문서/static-policy 검사만 허용하며 DB credential을 받지 않는다. `RELEASE_INPUT_CLASSIFICATION_ERROR`는 fail-closed다. 이 control-plane 변경 자체의 application DB migration은 없다. rollback은 workflow/classifier wiring만 되돌리며 성공 release를 위조하거나 application data를 변경해서는 안 된다.
- **테스트/수용/관측:** unit corpus는 docs-only, FE/BE/shared, lockfile, migration, Docker/build, workflow/GitOps, runtime config/secret reference, mixed, rename/delete, symlink/submodule, merge commit, shallow history, path-normalization/executable-smuggling을 포함한다. docs-only integration acceptance는 `dependency_install_for_runtime=0`, `app_build=0`, `db_migration=0`, `image_build=0`, `registry_push=0`, `test_gitops_write=0`, `exact_sha_poll=0`, `production_mutation=0`이다. runtime 변경은 immutable candidate → isolated exact-SHA Test → real API/DB/user-flow QA → main → Production evidence/smoke를 그대로 거친다. classifier false-negative 또는 evidence 누락 시 promotion 차단. `docs_only_runtime_job_total`, `docs_only_db_migration_total`, `release_classifier_error_total`, CI minute/storage, repository/application SHA divergence를 관측하며 docs-only DB migration은 즉시 alert한다.
- **SEO 조사판정:** Google Search Central 최신 주요 문서 변경 페이지에서 2026-09-08 regional Search-experience 문서가 9월 최신 주요 update로 확인된다. 2026-09-16 Search Central Live Deep Dive Europe 글은 행사/커뮤니티 공지라 ranking/indexing 계약 변경으로 채택하지 않는다. 2026-08-28 site-reputation 정책은 third-party/sponsor/affiliate/UGC governance에 계속 적용한다. 따라서 서버 권위 canonical/robots/sitemap/structured-data/hreflang/SSR/CWV/UGC 계약은 이번 회차 변경하지 않으며 공개 SEO 변경은 행사 글이 아니라 Search Console/Naver 등 검증 증거를 요구한다.
- **보안 조사판정:** OWASP API Security Project는 API Security Top 10 **2023**을 최신판으로 계속 표시한다. BOLA, broken authentication/property/function authorization, resource consumption, sensitive-business-flow abuse, SSRF, misconfiguration, inventory, unsafe upstream consumption을 route inventory와 negative release test에 유지한다. release classifier 자체도 supply-chain authorization boundary이며 docs-only 분류 단계에는 privileged DB/runtime credential을 주지 않는다.
- **사업성:** Google Play 현행 공식 수수료표는 install cohort, recurring/non-recurring, programme, billing path별로 달라 단일 수수료를 가정하지 않는다. SKU별 `feePolicyVersion` 회계를 유지한다. 이번 회차에는 release-control 비용 KPI `docs_only_ci_cost`, `docs_only_db_minutes`, `docs_only_registry_bytes`, 운영/지원 시간을 추가한다. 이는 매출이 아니라 측정 비용이다. classifier false-negative=0을 유지하면서 docs-only CI/release 비용을 유의미하게 줄이면 scale, false-positive는 iterate, runtime-relevant 변경을 skip할 가능성이 있는 최적화는 kill한다.

### v168 백로그/수용 순서

`P0 독립 암호화 backup + isolated restore/reconciliation` → `P0 stale-status false-green` → `P0 side-effect 이전 release classifier / docs-only runtime+DB side-effect 0` → `P0 GitOps/public edge/systemd 단일 release authority` → `P1 auth/session/admin/casino/Work/DB authorization+ledger QA` → `P1 repository required-check enforcement` → core correctness → monetization → SEO/acquisition → retention/accessibility. runtime 구현은 별도 branch/test/release 흐름이며 이 기획 회차에서 runtime code를 배포하지 않는다.

## 회차 변경 — v2026.09.17.167 (2026-09-17)

### 근거와 결정

- **저장소/런타임 근거:** 회차 시작 및 중간 재확인 `main`은 `e9b5743c2305f0d5fc38f3c473d8a7c891561d3f` (`docs: integrate Moneyverse plan v2026.09.17.166`)이다. branch protection은 켜져 있지만 required-status-check enforcement는 `off`이고 required context/check도 없다. CI #1168은 성공했다. 그러나 docs-only SHA에서 `Build Test Candidate` #793도 성공했고 `Build Production Release` #914가 `test-gate`에 진입해 근거 수집 시점에도 실행 중이었다. `Auto Integrate and Promote` #125가 skip됐지만 candidate build와 Production release orchestration이 이미 시작됐으므로 zero-side-effect 계약을 충족한 것은 아니다. 승인된 Debian 장치의 public runtime probe는 DNS 해석 실패로 불가능했으므로 새 Test/Production runtime 상태를 추정하지 않는다.
- **P0 `REL-DOCS-167-01` — OPEN / 반복 재현:** docs-only repository head가 결정론적 runtime-input 분류 전에 Test/release 자원을 소비한다. 최신 재현일은 2026-09-17, SHA는 `e9b5743c...`이다. 재현은 docs-only 통합 → CI green → Test candidate #793 성공 → Production Release #914 `test-gate`다. 영향은 CI/registry/Test 자원 낭비, release identity 오판, 실제 릴리스 지연과 repository head/deployed application 혼동이다. 원인은 control-plane trigger/eligibility 순서로 한정되며 코드 검색에서 제안된 classifier는 아직 기획문서에서만 확인된다.
- **수정 계약:** candidate build, registry write, GitOps mutation, exact-SHA polling, promotion보다 앞서 단일 authoritative classifier를 둔다. merge-base→head diff와 rename/delete/submodule/symlink metadata, versioned `release-inputs.yml`을 입력받아 `{repositoryHeadSha, applicationSourceSha, classification, matchedRuntimePaths, classifierVersion, evidenceCreatedAt}`를 immutable evidence로 출력한다. 허용값은 `RUNTIME_RELEASE_REQUIRED`, `DOCS_ONLY_NO_RUNTIME_RELEASE`, `RELEASE_INPUT_CLASSIFICATION_ERROR`뿐이며 unknown/error는 fail-closed다. frontend/backend/shared runtime, lockfile, generated runtime artifact, DB migration, Docker/build, workflow/GitOps/deploy input, runtime config/secret reference는 runtime-relevant다.
- **마이그레이션/롤백/테스트:** DB migration 없음. rollback은 classifier/workflow wiring만 되돌린다. unit corpus는 docs-only, FE/BE/shared, lockfile, migration, container, workflow/GitOps, mixed, rename/delete, symlink/submodule, merge commit, shallow history, path-normalization trick을 포함한다. docs-only integration acceptance는 `image_build=0`, `registry_push=0`, `test_gitops_write=0`, `exact_sha_poll=0`, `production_mutation=0`이다. runtime 변경은 immutable candidate → isolated exact-SHA Test → API/DB/user-flow QA → main → Production evidence/smoke를 그대로 통과한다. 유지 corpus false-negative 0 전 promotion을 차단한다. `release_classifier_errors`, `docs_only_release_side_effect_total`, docs-only candidate minute/storage, application/repository SHA divergence를 관측한다.
- **SEO:** Google Search Central의 2026-09-17 infinite-scroll 문서 이전은 guidance 변경이 아니다. indexable community/market/collection/search는 안정적인 page/chunk URL과 crawlable link를 유지한다. 2026-08-28 site-reputation 변경은 sponsor/affiliate/third-party/UGC governance에 적용하고 2026-09-16 Search Central Live 게시물은 행사 정보라 ranking/indexing 정책 변경에서 제외한다. 공개 SEO read model `{canonicalUrl,indexPolicy,title,description,h1,breadcrumbs,localeAlternates,updatedAt,imageMeta,structuredDataVersion}`과 pagination metadata를 서버 권위로 유지하며 private/account/admin/transaction은 `noindex`+sitemap 제외, 404/410/redirect/`lastmod` 의미를 서버에서 일관되게 보장한다. KPI는 impression→click→signup→activation→D7/D30→revenue/LTV이고 crawl/index error와 CWV를 guardrail로 둔다.
- **광고/UX:** Google Publisher Tag release note상 2026-09-08부터 bfcache 복귀 시 actively viewed ad slot이 자동 refresh될 수 있고 `AutoRefreshConfig.backForwardCache`로 비활성화할 수 있다. provider impression/event identity로 광고 분석을 중복 제거하고 단순 page restore를 provider의 실제 새 impression 없이 신규 business impression으로 세지 않는다. 실험은 `광고매출 - 광고유발 이탈/리텐션 손실` 순효과로 판단하며 back-button/interstitial은 navigation을 가로채지 않는다.
- **보안:** OWASP ASVS 5.0.0과 API Security Top 10 2023을 유지한다. release classification을 supply-chain authorization boundary로 취급해 docs-path executable smuggling, ambiguous generated artifact, classifier failure를 배포차단한다. economy/admin/payment/reward/casino/referral route는 authn, capability/object authorization, idempotency, rate/business-flow limit, PII class, audit event, datastore inventory와 BOLA/BFLA/sensitive-business-flow negative test를 유지한다.
- **사업성:** Google Play 현행 수수료는 market/install cohort/transaction type/programme/billing path별로 달라 단일 요율을 쓰지 않는다. 실제결제 SKU는 `feePolicyVersion, market, transactionAt, installCohort, transactionType, billingPath, programme, grossPrice, tax, platformFee, paymentFee, refundReserve, directOpsCost`를 보존한다. revenue/net revenue/gross·contribution margin/ARPU/ARPDAU/ARPPU/conversion/renewal·churn/refund/CAC·LTV·payback/fraud/infra·support/D1·D7·D30을 분리 측정하고 미실측 값은 `HYPOTHESIS`/`TEST TARGET`이다. contribution margin과 retention/fairness/security guardrail을 함께 통과할 때만 scale한다.

### v167 백로그/수용 순서

`P0 독립 암호화 backup + isolated restore/reconciliation` → `P0 stale-status false-green` → `P0 release classifier / docs-only side-effect zero` → `P0 GitOps/public edge/systemd release authority 단일화` → `P1 auth/session/admin/casino/Work/DB authorization+ledger QA` → `P1 repository required-check enforcement` → 핵심 correctness → monetization → SEO/acquisition → retention/accessibility 순이다. 런타임 구현은 별도 branch/test/release 흐름으로 수행하며 이 기획 회차에서 runtime code를 배포하지 않는다.

## 0. 유지관리·증거·우선순위 원칙

1. 중요한 기획은 최신 외부 레퍼런스 조사 후 작성한다. 현재 공식 제품/플랫폼 문서, 정부·규제기관, OWASP·보안기관, 실제 런타임 증거를 우선하며 중요한 판단은 가능하면 독립 근거를 비교한다.
2. 계약 변경 전 최신 `main`, 영문·한국어 통합본, 최근 QA/worklog, CI·릴리스 자동화, 열린 incident/PR, 런타임, 관련 코드·migration을 읽는다. 작업 중간과 각 문서 통합 직전 `main`을 다시 확인한다. 문서 자동화는 force-push하지 않는다.
3. 구현 증거는 `IMPLEMENTED`, `PARTIAL`, `UNVERIFIED`, `REDESIGN_REQUIRED`로 표시한다. 기획서·issue·screenshot·성공한 build·오래된 테스트만으로 현재 Production 동작을 증명하지 않는다.
4. CI/Test/runtime 증거가 없으면 `verification unavailable`이다. P0/CRITICAL/HIGH 게이트는 fail-closed다.
5. 적용된 DB migration은 불변이다. 교정은 새 migration으로 한다. 경제 이력은 append-only이고 잘못된 거래는 보정거래로 교정한다.
6. 실측되지 않은 사업 수치는 `가설` 또는 `테스트 기준`으로 표시한다. WLD/WDX 활동은 게임경제 활동이며 실화폐 매출이 아니다.
7. 우선순위는 `P0 데이터손실/보안/인증/권한/자산중복/경제악용/장애/DB무결성/릴리스 진실성` → `P1 주요 정확성/핵심완성도` → `P1 상점/결제/수익화` → `P1 SEO/유입` → `P2 리텐션/성장` → `P2 UX/접근성` → `P3 장기확장`이다.
8. 실제 개발은 별도 흐름 `새 브랜치 → 정적/단위/통합/실DB/보안 테스트 → immutable candidate → isolated exact-SHA Test → backend/API/DB/사용자흐름 QA → main 통합 → exact-main-SHA 재검증 → Production evidence → GitOps 승격 → 운영 smoke/관측 → 필요 시 rollback`을 따른다.
9. 이 권위 기획서를 수정할 때마다 같은 회차의 **브랜치 / 작업내역** 항목에 작업 브랜치, 기준/현재 `main` SHA, 확인 가능한 commit/PR 식별자, 변경 파일 또는 기능영역, 실제 작업 요약, 검증 근거, merge/Test/Production 상태를 기록한다. 여러 브랜치가 관여하면 각 브랜치를 별도로 기록하며 병합·대체·폐기 상태도 감사 추적을 위해 보존한다.

## 1. 제품 및 비협상 경계

Woldeok Moneyverse는 웹+Discord 커뮤니티 가상경제/게임 플랫폼이다. 사용자는 인증하고, 직업·퀘스트를 진행하며, WLD를 획득·소비하고, 아이템을 수집·사용하고, 가상 사업·은행·대출·가상주식·소셜/커뮤니티·확률형 게임 시스템을 이용한다.

WLD, WDX/가상주식, 은행잔액, 대출, 카지노 플레이와 보상은 game/simulation-only 데이터다. 현금환전, 실제 증권·예금, 원금·수익보장, 실제 투자수익, 외부경품, 실제 도박을 약속하지 않는다. 향후 실화폐/실금융/실도박과 연결하려면 별도 법무·제품 재설계가 필요하다.

기술 기준은 Next.js frontend, NestJS API, PostgreSQL 권위 데이터/경제/권한, 민감 DB 경로의 보호된 `SECURITY DEFINER`, 최소권한 application role, append-only 복식부기 원장, 재시도 가능한 가치변경의 idempotency, commit 이후 외부전송을 위한 outbox 방식이다.

### 1.1 경제 불변조건

모든 가치변경은 actor, 권한, 정책, 자격, quota/limit, idempotency를 검증하고 필요한 ledger posting, derived balance, audit/outbox를 하나의 트랜잭션으로 기록한다. 차변/대변은 대사되고 금지된 음수잔액은 트랜잭션 경계에서 차단한다. 금액은 안전한 integer/string 계약을 사용하며 JavaScript `Number`에 의존하지 않는다. 재시도·중복·동시 요청은 중복 가치를 만들 수 없다. 교정은 원거래를 참조한 보정거래로 수행한다.

### 1.2 보안 기준

OWASP ASVS 5.0.0과 OWASP API Security Top 10을 검증 기준으로 사용하되 인증·보증 마크처럼 표현하지 않는다. 공통 통제에는 OAuth/OIDC `state`/`nonce`/PKCE/exact redirect, session rotate/revoke, 최근 재인증, CSRF, BOLA/IDOR negative test, XSS/output encoding, SQLi/SSRF/path traversal/command injection 방어, 업로드 decoded-type 검증, rate/resource/business-flow abuse 통제, DB 최소권한, CORS/CSP/security header, secret 관리, dependency/supply-chain 통제, container/Kubernetes hardening, 독립·암호화·복구검증 백업, append-only audit, 개인정보 최소수집/보존/삭제, secret-safe log를 포함한다.

### 1.3 관리자 경계

현재 모델은 필수 2인 승인제가 아니라 단일 `superadmin` + 보완통제다. 민감작업은 `AdminSessionGuard`, 최근 `ReauthGuard`, TOTP/`SecondFactorGuard`, DB actor 검증, 최소권한, 영향 미리보기, 사유, 필요한 경우 idempotency, append-only audit를 요구한다. superadmin도 보호된 경제/감사 이력을 직접 덮어쓰는 우회권한은 없다.

## 2. 현재 blocker 및 QA register

모든 이슈는 severity, 최초발견, 최근재현, 재현절차, 영향 사용자/기능, 실제 증거, 원인가설/확정원인, FE/BE/API/DB/infra 수정대상, 구체 설계, migration 필요성, rollback, unit/integration/E2E/실DB/security/regression test, Test 수용조건, Production 승격조건, monitoring, 상태, 담당순서를 기록한다. 반복 `BLOCKED`는 원인제거 작업으로 승격한다.

### BAK-106-01 — P0 — OPEN/BLOCKED — 독립백업 + 실제 restore 성공증거 없음

- 최초근거: GitHub issue #139, 2026-09-09. 2026-09-15 현재 OPEN. 마지막 직접 host 점검에서 `/mnt/backup`(`/dev/sda1`)은 read-only였고 별도매체 최신 관측 파일은 2026-09-07, Kubernetes 전환 이후 최신 자동백업은 확인되지 않았다. emergency PostgreSQL custom dump는 SHA-256과 `pg_restore -l`을 통과했지만 같은 host/system disk에 남아 있다.
- 영향: 전체 host/storage 손실 시 identity/session/economy/ledger/audit/inventory/entitlement/content 및 분쟁복구가 위협받는다.
- 증거공백: 승인된 원격 cluster 장비가 현재 모두 offline이라 media health 및 scheduled backup path를 새로 확인했다고 주장하지 않는다.
- 수정대상: backup medium/storage, Kubernetes/GitOps backup job, least-privilege backup identity, encryption/key separation, retention, monitoring, isolated restore, release evidence.
- migration: 백업인프라 복구 자체에는 DB migration이 필요하지 않으나, schema/data 변경 Production 작업은 독립 복구증거 전까지 차단한다.
- 테스트: corrupt/missing archive, wrong key, full disk, PITR 사용 시 WAL gap, wrong source/target, Production credential 거부, full isolated DB/object restore, migration parity, ledger/balance·entitlement/provenance 대사.
- 종료조건: 최신 독립백업 하나가 `VERIFIED_RESTORABLE`, 실제 RPO/RTO 증거, 모니터링 경보, release automation 연동까지 완료된다.
- 사업효과: 직접매출 0, 기대 데이터손실·다운타임·환불·CS·fraud·분쟁비용 회피.

### OPS-107-01 — P0 — OPEN — stale status가 수시간 false-green 유지

- 최초재현 2026-09-15 07:05 KST, 이번 회차 최신재현 약 08:08 KST. 공개 `/status`는 계속 모든 서비스 정상이라고 표시했지만 Web/economy API/ledger DB의 관측시각은 모두 04:06 KST였다. 페이지는 수집주기 30초이고 오래된 기록은 확인중으로 표시한다고 설명하므로 동일 stale snapshot이 4시간 이상 green으로 남았다.
- 저장소 계약: frontend는 revalidate하지만 API state를 신뢰하고, migration 013은 source별 `stale_after_seconds`와 stale row를 `unknown`으로 만드는 `content_public_status()`를 가진다. 초기 migration 값은 180초여서 UI의 고정 30초 설명 역시 권위 stale threshold가 아니다.
- 영향: 실제 장애나 monitoring failure를 숨겨 MTTR, support, release 오판, 신뢰손실을 키울 수 있다.
- 원인: 미확정. Production migration/function/config drift, 오래된 backend/image, collector failure+비권위 read path, cache가 후보다.
- read-only 진단: raw `/api/v1/status` body/header/server clock → frontend/backend SHA+digest → migration checksum → `pg_get_functiondef(content_public_status)` 및 `stale_after_seconds` → latest snapshot vs `clock_timestamp()` → collector attempt/success/schedule/log → isolated exact-SHA Test 재현.
- 설계: source freshness는 server authority, collection interval과 stale threshold는 분리한다. stale/missing required source는 `unknown`, overall은 `operational`이 될 수 없다. collector failure는 `monitoring delayed/checking`이며 임의 target outage나 healthy가 아니다. healthy cache는 freshness를 넘지 못하고 threshold 이후 green에 `stale-if-error`를 쓰지 않는다.
- migration 013은 수정하지 않고 새 migration/검토된 config path로 교정한다.
- QA: threshold -1/0/+1초, source별 threshold, no snapshot, future timestamp, collector stop, API/DB/cache failure, restart, mixed state, timezone, forged writer 거부, app-role write 거부, topology leak 방지.
- Test gate: synthetic collector 중단 후 설정 threshold 안에 API+UI가 checking으로 바뀌고 overall green이 내려가며 alert가 발생해야 한다. trusted fresh snapshot만 green을 복구한다.
- KPI: `status_source_age_seconds`, `collector_last_success_age_seconds`, `public_status_unknown_count`, `status_api_errors`, `stale_operational_violation_count=0`.

### REL-110-01 — P0 — BLOCKED — Test GitOps 선언은 전진했지만 실제 공개 runtime이 다른 candidate를 제공

- 최신근거: PR #332 candidate `b3f28185107a2f6f4a8bd389016de778df08b747`. CI와 immutable backend/frontend `-test` image build는 성공했다. Test infrastructure PR #67은 render check 후 merged되며 candidate label/image/Test source SHA/redeploy token을 갱신한 것으로 기록됐지만 공개 Test probe의 `/api/version`은 기대 SHA가 아니라 `1789391457242`를 반환했다. 따라서 application main merge와 Production promotion은 올바르게 중단됐다.
- 영향: build 성공·GitOps desired state와 실제 Test workload가 달라질 수 있다. 이를 같은 것으로 취급하면 다른 코드를 QA한 뒤 미검증 runtime을 운영으로 승격할 수 있다.
- 원인: 승인 cluster 장비가 offline이라 미확정. Flux source/reconcile lag/stall, Kustomization revision mismatch, Deployment/ReplicaSet rollout failure, old Pod/image digest, image pull/cache, Service/Ingress old endpoint, 잘못된 version metadata, routing/cache layer 등이 후보다.
- cluster 접근 복구 후 read-only 순서: Test GitRepository/OCI source revision → Flux Kustomization `Ready/Reconciling/Stalled`, `lastAppliedRevision`, `lastAttemptedRevision`, history/event → Deployment desired digest/env/label → ReplicaSet/Pod owner+digest+restart/image-pull event → Service endpoint → Ingress/router/cache → pod-local `/api/version` → public `/api/version`.
- 증거계약: `Git commit` ≠ `CI green` ≠ `image built` ≠ `GitOps desired-state merged` ≠ `Flux applied` ≠ `workload rollout` ≠ `Service candidate routing` ≠ `public exact-SHA`. 단계마다 timestamp/source/evidence ID를 가진다.
- 수정대상: infrastructure/GitOps reconciliation, candidate metadata/version endpoint, workload rollout, public route. 진단 자체는 DB/schema mutation이 아니다.
- rollback: Production은 변경되지 않아 Production rollback 불필요. Test 복구가 필요하면 last-known-good immutable Test digest로만 돌아가고 실패증거는 보존한다.
- QA: pod-local+public exact SHA, backend/frontend digest, DB migration checksum, least-privilege DB smoke, login/logout, Work quota UI/API, public catalog, noindex, log/resource, rollback readiness.
- 수용: 동일 candidate SHA/digest가 source commit → image provenance → GitOps applied revision → Deployment/Pod → public `/api/version`으로 연결되고 rollout 종료 후 반복 probe에서도 안정적이어야 한다.
- 상태/순서: cluster root-cause inspection에 `BLOCKED`; infra/Flux 증거 → routing/workload 교정 → exact-SHA Test QA → 그 뒤 application merge 판단.

### AUTH-105-01 — P0 — OPEN / PUBLIC LOCAL-AUTH ROLLOUT HOLD

- local email register/verify/login, Argon2id, normalized email hash/token hash가 코드·계약에 있지만 Production login/guide/privacy는 OAuth 중심이고 별도 Moneyverse password를 만들지 않는다고 설명한다.
- broad rollout 전 privacy notice/version+consent, 처리목적·항목·보유·삭제·credential removal, SMTP/provider 사실, verification-link privacy, account recovery, CS script를 맞춘다.
- credential stuffing/resource abuse, email enumeration, verifier/token log, OAuth/local collision, silent merge는 release blocker다. unknown email/wrong password는 같은 공개 오류군을 사용한다.
- signup/login/verify/recovery는 noindex/sitemap 제외, raw token은 analytics/referrer/log에 남기지 않는다.
- QA: register/verify/login/logout, invalid/expired/reused token, same/cross-browser, session rotate, rate/resource limits, provider collision, deletion, policy-version mismatch, rollback.

### QA-104-01 — P0 — IN PROGRESS, 미종료 — 직업작업 quota 표시/콘텐츠 계약

- Production `/guide`는 아직 직업작업을 일일 제한 없이 반복하며 매번 WLD/EXP 전액을 받는다고 설명하여 `daily_limit`/`taken_today` 권위 동작과 충돌한다.
- 진행상황: PR #332는 authoritative `taken_today / daily_limit` UI를 추가했고 candidate `b3f281...`는 CI 및 immutable Test image build를 통과했다.
- 미종료 이유: REL-110-01로 exact-SHA Test runtime proof가 실패했고 PR #332는 OPEN이며 Production guide 문구도 여전히 잘못됐다.
- 수정범위: Work UI, `/guide`, mobile/App API guide, FAQ/schema example, SEO snippet. `playable`과 `reward eligible`을 구분하고 오래된 문구에 맞추려고 server quota를 약화하지 않는다.
- QA: 0/partial/exact/+1, profession/task isolation, double-submit, idempotency, concurrency, Seoul day boundary, API/web/mobile parity, guide copy, accessibility, SEO metadata.
- 종료: exact-SHA isolated Test → current-main 통합 후 재검증 → Production copy/runtime smoke까지 완료한다.

### REL-104-02 — P0 — OPEN — Production-ready workflow가 규범 release evidence보다 좁음

현재 release path에는 exact-SHA/catalog/noindex check, immutable image, SBOM/provenance가 있으나 Production readiness에는 migration parity/checksum, least-privilege DB, authenticated synthetic flow, 변경기능 abuse/reconciliation, 파괴적 작업의 최신 backup/restore 증거, rollback target, REL-110-01 end-to-end candidate lineage가 필요하다. 누락·stale·wrong-revision evidence는 `BLOCKED`이며 skip-pass할 수 없다.

### AUTH-105-02 — P1 — TODO — verify-email 앱 문서 stale

현재 verify-email은 originating prelogin cookie/CSRF에 의존하지 않는 one-time bearer token cross-browser exchange다. EN/KO app-auth guide, endpoint catalog, schema/example, old-client behavior를 동기화하고 invalid/expired/reused token, arbitrary CSRF, same/cross-browser, session rotate를 시험한다.

### REL-104-03 — P1 — OPEN/CONFIRMED — required status check가 repository에서 강제되지 않음

최신 `main` branch metadata는 protection enabled지만 required-status-check enforcement `off`, contexts/checks empty다. 이제 단순 미확인이 아니라 확인된 상태다. GitHub 공식문서상 required check를 켜지 않으면 check 결과가 merge를 막지 않는다. docs-only direct-main 자동화가 필요하다면 매우 좁게 허용하되 `backend/`, `frontend/`, database/migration, deploy/security workflow는 검토된 통합과 기대 GitHub App/source의 필수 check를 요구한다. docs 예외가 runtime 우회가 되어서는 안 된다.

## 3. Candidate evidence state machine — 권위 릴리스 계약

후보는 다음 단계를 순서대로 통과한다. 뒤 단계가 앞 단계 증거를 대신하지 않는다.

1. `SOURCE_READY`: candidate SHA, base-main SHA, changed files, risk class 확정.
2. `CI_GREEN`: exact candidate의 필수 static/unit/integration/real-DB/security job 성공.
3. `IMAGE_BUILT`: immutable backend/frontend digest 및 적용 가능한 provenance/SBOM 생성.
4. `GITOPS_DECLARED`: Test GitOps desired state가 exact candidate/digest를 참조.
5. `TEST_APPLIED`: Flux source/Kustomization이 expected applied revision 및 healthy reconciliation을 보고.
6. `TEST_WORKLOAD_EXACT`: Deployment/ReplicaSet/Pod가 expected digest와 candidate metadata로 실행.
7. `TEST_PUBLIC_EXACT`: 공개 Test version endpoint가 stale route/cache 없이 expected SHA 반환.
8. `TEST_QA_GREEN`: 해당 exact runtime에 DB/API/auth/변경기능/security/noindex/log/resource/rollback QA 통과.
9. `MAIN_INTEGRATED`: 검토된 candidate가 current main에 통합. main이 이동했으면 compare/reconcile 선행.
10. `MAIN_EXACT_TEST_GREEN`: 통합된 exact main SHA를 immutable Test로 다시 배포하고 같은 gate 반복.
11. `PRODUCTION_READY`: machine-readable evidence에 모든 적용 gate, 필요한 backup/restore, rollback target 포함.
12. `PROD_DEPLOYED`: Production GitOps desired/applied/workload/public lineage가 승인된 exact main SHA/digest와 일치.
13. `PROD_SMOKE_GREEN`: HTTP/API/auth/변경 사용자흐름/log/resource/status-freshness smoke 통과 후 monitor/rollback 판단.

최소 evidence object는 `candidateSha`, `baseMainSha`, `riskClass`, `ciRunIds`, `imageDigests`, `provenanceIds`, `testGitOpsRevision`, `fluxAppliedRevision`, `testWorkloadDigests`, `testPublicVersion`, `migrationChecksum`, `dbSmoke`, `authSmoke`, `featureQa`, `securityQa`, 필요한 경우 `backupEvidenceId`, `rollbackTarget`, timestamp, operator/automation identity, expiry/freshness를 포함한다. 단계 불일치는 다음 단계로 정규화하지 않고 incident/QA blocker로 만든다.

## 4. 모든 기능의 필수 상세기획 템플릿

현재/계획 기능마다 목적·사용자문제, actor/role, 구현상태와 코드/문서근거, user story, 진입경로, 화면요소/CTA, state transition, loading/empty/error/offline/timeout, 최초/재방문/comeback, mobile/tablet/desktop, keyboard/focus/label/contrast/reduced-motion, i18n, email/push/Discord, data model/ownership, read/write permission, endpoint/method/request/response/error, idempotency/rate/resource/business-flow limit, service/business rule, table/index/constraint/transaction/concurrency, audit/metric/admin operation, feature flag/fallback, backup/recovery 영향, security/privacy/abuse, SEO/indexing, analytics/KPI, performance/cache, profitability/cost, 완료조건, unit/integration/E2E/실DB/security/regression, isolated Test 수용, Production promotion/monitoring/rollback을 기록한다.

## 5. 전체 기능 구현·제품 계약 매트릭스

| 기능군 | 증거/상태 | 권위·UX·API/DB 계약 | 보안/개인정보/악용 | SEO/성장/사업성 | 필수 QA/릴리스 게이트 |
|---|---|---|---|---|---|
| 가입/로그인/OAuth/logout/session | `IMPLEMENTED/PARTIAL` | server가 identity linking, consent, session issue/rotate/revoke 권위. local register/login은 prelogin+CSRF, verify-email은 one-time bearer token. | credential stuffing/resource budget, OAuth state/nonce/PKCE/exact redirect, secure cookie, fixation, logout, silent merge 금지. | auth noindex. verified session→activation→D1/D7/D30에서 SMTP/compute/CS/fraud/privacy 비용 차감. | provider collision, replay/fixation/logout, token expiry/reuse/cross-browser, 429, policy/privacy parity. AUTH-105-01이 broad rollout 차단. |
| profile/account/security center | `PARTIAL` | server가 profile/linked method/session 권위, 민감변경 최근 reauth. | account/session BOLA, secret 없는 ATO alert, 최소공개, audit. | private/auth/noindex, ATO/support 손실 절감. | other-user denial, reauth expiry, terminate sessions, provider-loss recovery, responsive/a11y. |
| inventory/collection/marketplace workbench | `PARTIAL`; live P2P 미증명 | DB가 item/owner/provenance/entitlement/serial 권위. 향후 listing은 escrow/cancel/expiry/settlement/fee/reversal 정의. | BOLA/serial leak, duplicate grant, wash trade/collusion, replay. | holdings private/noindex, opt-in public-safe collection만 공개. WLD spend는 sink이지 매출 아님. | ownership concurrency, duplicate entitlement, unauthorized transfer, recovery, private URL leak. |
| WLD shop/catalog | `IMPLEMENTED/PARTIAL` | server가 SKU/effective price/eligibility/limit/window/entitlement 권위. 각 SKU에 category/value/currency/consumability/test price/promo/window/limit/binding/gift/refund/recovery/sink/P2W/KPI/admin lifecycle 기록. | client price 불신, replay/duplicate, fake scarcity/reset timer, hidden personalized pricing, P2W/wealth/casino 압박 금지. | 충분한 editorial collection만 index, 구매이력 private. WLD는 경제/리텐션. | price tamper, time boundary, insufficient balance, concurrent purchase, entitlement repair/cache, admin lifecycle. |
| 실결제 cart/payment/subscription/ad removal | `UNVERIFIED` | provider 선정 후 server order/amount/tax/receipt-webhook/entitlement/refund/cancel/renewal/grace/idempotency 권위. | receipt/webhook replay/forgery, BOLA, chargeback, PCI/provider/secret 경계. | checkout/order/account noindex, 모든 fee/refund/CS/fraud/infra 차감. | provider sandbox, duplicate/out-of-order webhook, refund/regrant, renewal/cancel, legal/privacy, SCALE/ITERATE/HOLD/KILL. |
| jobs/quests/profession/level/rewards | `PARTIAL + P0 IN PROGRESS` | server/DB가 catalog/duration/cooldown/daily quota/reward/EXP/receipt/unlock 권위. UI는 `taken_today/daily_limit`, playable != reward eligible. | bot/macro/multi-account/replay/clock/concurrency, ledger 대사. | 수정된 guide만 game learning으로 index. TTFV/first job/D1/D7/inflation. | QA-104-01 + REL-110-01 exact-SHA. |
| business | `UNVERIFIED/PARTIAL` | inventory/demand/price/cost/fee/tax/management/settlement 정의, 무위험 고정복리 금지, ledger/idempotency. | circular farming, replay/refund, admin manipulation, precision. | public education 가능, private P&L noindex. | 실DB settlement/reconciliation/concurrency/abuse. |
| bank/loans | `UNVERIFIED/PARTIAL` | server가 eligibility/source/principal/interest/accrual/repayment/arrears/purpose/recovery 권위. | double repayment, clock, BOLA, multi-account/loss-chasing, 실제 예금/수익 오인 금지. | public은 simulation 교육, private balance/debt noindex. | accrual boundary, concurrent/idempotent repayment, restart/recovery, ledger. |
| virtual stocks/WDX/watchlist/portfolio/alerts/compare/search | `PARTIAL` | public market read-model과 private holdings 분리, server issuance/pricing/trade/settlement/rule 권위. | holdings BOLA, replay, manipulation/collusion, phishing alerts, integer precision. | public-safe symbol만 index, private holdings/order/alert noindex. | other-user denial, symbol, large integer, concurrency/replay, alert cooldown. |
| casino/probability | `PARTIAL/HIGH-RISK` | server outcome/probability/payout/limit/atomic settlement, 동일 idempotency는 동일 receipt/outcome. | RNG tamper/replay/limit bypass/bot/multi-account/loss chasing/youth. | gameplay/history noindex, 승리 acquisition 금지, 별도 승인 전 실매출 0. | distribution sanity, replay, limits, concurrency, ledger, legal/product review. |
| season/live event | `PARTIAL` | server start/end/grace/reward eligibility, preview는 time authority 아님, catch-up/archive. | reward farming/collusion/deadline manipulation/FOMO. | substantial season/archive만 truthful date/lastModified로 index. | timezone, late entry, duplicate reward, archive, notification cooldown. |
| community/post/comment/report/block | `PARTIAL` | server authorship/edit/delete/mod authority, deleted/locked/report/block 명시. | spam/bot/harassment/impersonation/doxxing/link/XSS/BOLA/mod abuse. | curated board 가능, individual UGC default noindex. | other-user mutation denial, XSS/link, report spam, block, mod audit, 404/410/index removal. |
| friend/club/referral | `UNVERIFIED/PARTIAL` | invite lifecycle/role/leave/kick/ban/visibility/attribution/reward maturity 정의. | invite spam/fake account/referral fraud/collusion/role escalation/private graph leak. | 명시적 public club만 공개, 보상은 cosmetic/prestige/convenience 우선. | referral ring, replay, role escalation, privacy/block. |
| notification/email/push/Discord | `PARTIAL` | server source event/preference/consent/cooldown/dedupe/delivery/deep link 권위. | phishing imitation/webhook abuse/spam/token leak, 민감잔액·부채·보안내용 금지. | noindex, healthy return에서 provider/optout/spam/privacy/support cost 차감. | dedupe/cooldown, stale link, optout, provider outage/outbox, safe logs. |
| search | `UNVERIFIED` | public-safe model만 public search, member/admin 별도 authz, pagination/no-result/timeout. | injection/expensive-query DoS/enumeration/query-log PII. | 일반 result noindex, 의도적 curated landing만 index. | authz, special chars, pagination stability, complexity/rate, relevance. |
| upload/gallery/file | `PARTIAL/spec-level unless linked code` | decode/type/magic, size/dimension, generated name, isolated storage, auth delivery, metadata strip. | malware/polyglot/path traversal/decompression bomb/SSRF/BOLA/EXIF. | private noindex, public은 permission/moderation 후. | malformed/polyglot/oversize/unauthorized/EXIF/storage/restore. |
| public home/guide/status/content | `PARTIAL + P0` | public read-model fail-honest, guide는 server contract와 일치, status freshness server-authoritative. | secret/topology/private state 금지, XSS/phishing, trusted status writer. | `/status` noindex, `/guide`는 quota/local-auth 문구 교정 전 acquisition HOLD. | HTTP/meta/a11y/CWV, guide contract, stale-status fail-closed. |
| App API/mobile gateway | `PARTIAL/COVERAGE DOCUMENTED` | versioned `/app-api/v1`, stable wrapper, breaking change는 compatibility/version 결정. | handoff/token replay, BOLA, resource abuse, PII/log mask. | API noindex, mobile activation/D30에서 support/infra/fraud 차감. | contract snapshot, old client, auth expiry, handoff one-time, error parity, AUTH-105-02. |
| admin/audit | `PARTIAL` | risky write에 current/proposed/target/impact/reason, reauth+TOTP+DB actor+idempotency/audit. | privilege escalation/session theft/CSRF/BOLA/mass action/audit tamper. | private/noindex, incident/operator/support 절감. | lower-role denial, stale reauth, invalid TOTP, mass bound, DB privilege/audit, compensation. |
| backup/recovery | `UNVERIFIED CURRENT EVIDENCE` | independent encrypted backup, source/version/checksum, isolated restore, app/ledger/object validation, measured RPO/RTO. | key theft/shared failure/wrong-env/corruption/WAL gap/shadow retention. | private/noindex, direct revenue 0. | BAK-106-01이 destructive work 차단, full fault-injected drill. |
| analytics/experiments | `PARTIAL/SPECIFIED` | pseudonymous subject, analytics session != auth secret, versioned event schema/retention/assignment/guardrail. | PII/secret leak, reidentification, experiment abuse/sensitive profiling. | safe campaign/content ID만, private SEO payload 금지. | schema/consent/deletion/deterministic assignment/outbound scan. |
| advertising/sponsorship | `IMPLEMENTED/PARTIAL reviewed placements` | 승인된 충분한 public surface만, Test ads off, ad/sponsor와 product action 분리. | invalid traffic/click encouragement/youth/privacy tracking/leak/confusion. | 광고 때문에 thin page 만들지 않음, churn/session/support/privacy/fraud 차감. | route allowlist, Test ads off, CLS/CWV, ad exit, invalid traffic/policy/privacy. |
| SEO backend | `PARTIAL` | configured-origin canonical, public metadata read model, sitemap, robots, redirect, structured data, updatedAt, images, crawler/GSC/Naver. | private leak, Host injection, cache poison, PII sitemap/JSON-LD. | organic→signup→activation→D7/D30→retained net value/CAC saving. | sitemap privacy, canonical injection, redirect loops, SSR, GSC/Naver, CWV. |
| incident/status/operations | `PARTIAL + OPS-107-01 P0` | public-safe status와 internal telemetry 분리, server freshness, collector heartbeat/snapshot age/incident/rollback/postmortem. | false green/forged writer/stale monitor/topology/admin abuse/alert fatigue. | trust/support/MTTR, `/status` noindex. | collector/source stop, cache/API/DB outage, mixed state, stale threshold, alert, exact-SHA smoke. |
| CI/Test/GitOps/Production promotion | `PARTIAL + REL-110-01 P0` | §3 state machine 권위, desired-state merge는 applied/runtime proof 아님. | stale candidate/supply-chain substitution/wrong image-routing/evidence replay. | 실패·rollback·support 비용 절감의 간접가치. | source→CI→image→Flux→Pod→public version lineage exact/fresh. |

## 6. Local first-party authentication 상세계약

| 단계 | endpoint | UX/state | 보안·오류·데이터 계약 |
|---|---|---|---|
| prelogin | `POST /app-api/v1/auth/prelogin-session` | pre-auth resume, retry 가능 | secure prelogin cookie + memory CSRF, secret log 금지 |
| policy | `GET /app-api/v1/auth/policy` | 가입 전 현재 terms/privacy | server version 권위 |
| consent | `PUT /app-api/v1/auth/consent` | 현재 policy/age 명시 동의 | SessionGuard+CSRF, stale version 재검토 |
| register | `POST /app-api/v1/auth/local/register` | email/password/display name → pending verification, SMTP 실패 복구가능 | prelogin+CSRF+current consent, password policy, normalized email/hash/Argon2id/hashed one-time token, abuse budget |
| verify | `POST /app-api/v1/auth/local/verify-email` | cross-browser 허용, 성공 시 sign-in | short-lived one-time bearer, originating cookie 불필요, raw token log 금지, 교환후 clean URL |
| login | `POST /app-api/v1/auth/local/login` | unknown/wrong password 동일 공개 오류군, offline/429/5xx 분리 | prelogin+CSRF, nonexistent dummy work, rate/resource control, session rotate |
| viewer/session | `GET /app-api/v1/auth/viewer`, `GET /app-api/v1/auth/session` | client는 server signed-in 상태만 신뢰 | signed-in cookie 권위 |
| logout | `POST /app-api/v1/auth/logout` | offline에서 원격 logout 성공처럼 표시 금지 | session+CSRF, server revoke/cookie 제거 |

Verification token surface는 noindex/sitemap 제외, `Referrer-Policy: no-referrer` 또는 동등통제, 교환 전 ads/third-party analytics/social pixel 금지, query log 마스킹, GET preview/scanner가 token을 소비하지 않으며 교환 후 token-free URL로 redirect한다. Product analytics에는 email/hash/password/verifier/token/cookie/CSRF/OAuth/recovery secret을 넣지 않는다.

## 7. SEO 및 SEO backend 계약

### 7.1 route policy

- `/`: `PUBLIC_INDEXABLE`, configured-origin self canonical, 고유 title/meta/H1, 사실인 structured data, OG/Twitter, 안정적 image dimension, 충분한 internal link.
- `/guide`: `PUBLIC_INDEXABLE_BUT_ACQUISITION_HOLD`; QA-104-01/AUTH-105-01 문구 교정 전 확대 금지. 실제 투자수익이 아닌 게임 초보 의도 타깃.
- `/status`: `PUBLIC_NOINDEX`, sitemap 제외. transient operational content이며 검색보다 진실성과 freshness 우선.
- news/season/collection/world guide: 독창적·충분·유지관리·public-safe일 때만 stable slug/meaningful lastModified로 index.
- `/stocks/[symbol]`: public-safe fictional market/world read model만 index, holdings/watch/order/alert/portfolio는 anonymous HTML/JSON-LD/shared cache에서 제외.
- UGC는 quality/moderation 기준 전 default noindex, 삭제 public content는 404/410 및 sitemap 제거.
- search/filter/sort/query variant는 의도적 curated landing이 아니면 canonical/noindex, doorway 금지.
- login/signup/verify/recovery/account/security/wallet/transfer/private bank/business/loan/portfolio/watchlist/alerts/checkout/orders/subscription/admin/moderation/backup/recovery는 auth-required 또는 public-noindex+sitemap 제외.
- Test/recovery origin은 global noindex, real ads off, sitemap submission 및 indexable user data 금지.

### 7.2 SEO backend

configured-origin `SeoMetadataReadModel`, Host injection 방어 canonical builder, URL/byte 제한을 지키는 dynamic sitemap index/shards, authoritative `lastModified`, robots generator, structured-data allowlist serializer, loop/conflict 검증 permanent 301/308 redirect map, image metadata/alt/dimension, locale/hreflang, crawler-log 분류, Search Console/Naver verification/status ingest, crawl/index/canonical/sitemap report, operator read dashboard/API를 구현·시험한다. HTML/meta/sitemap/redirect cache는 일관성을 유지하고 private identity/economy/security state는 public cache key나 structured data에 들어가지 않는다.

검색 제외는 crawl 가능한 response의 meta/header `noindex`로 제공하며 robots 차단을 noindex나 canonical 대체수단으로 사용하지 않는다. redirect/sitemap/`rel=canonical`/internal link/hreflang 신호를 일관되게 유지한다.

### 7.3 SEO 성능·사업성

impressions/clicks/CTR는 진단지표다. 사업 funnel은 `organic visit → qualified interest → signup → activation → D1/D7/D30 → retained contribution/real net revenue`. organic CAC에는 incremental organic D30 retained user당 콘텐츠·도구·SEO 운영비를 포함한다. 주요 공개 template 목표는 LCP ≤2.5s, INP <200ms, CLS <0.1이며 mobile/desktop 회귀시험한다.

## 8. 보안 위협·검증 register

| 위험 | Severity | 예방·탐지 | 필수 릴리스 행동 |
|---|---|---|---|
| BOLA/IDOR | HIGH | actor-scoped service/DB authz, client owner ID 불신, denial metric | 모든 object API에 other-user negative test, 실패 시 차단 |
| credential stuffing/session fixation | HIGH | generic error, rate/resource budget, rotate, secure cookie, reauth/logout, OAuth uniqueness | distributed invalid auth, fixation/logout/state/nonce/PKCE, 우회 시 차단 |
| resource/business-flow exhaustion | HIGH where costly | operation limit, timeout, pagination, third-party spend alert, bot signal | burst/concurrency/large-input/provider-cost test, 무제한 email/upload/search/reward 금지 |
| economy replay/duplicate/concurrency | HIGH | idempotency unique, transaction/lock, append-only ledger/reconciliation | parallel/retry/replay/precision/ledger mismatch 차단 |
| admin abuse | HIGH | session+reauth+TOTP+DB actor+least privilege+impact preview+audit | lower-role/stale reauth/TOTP/CSRF/mass/DB privilege 실패 차단 |
| upload/UGC | HIGH | decoded type, isolated storage, encoding/CSP, metadata minimization/moderation | polyglot/malformed/XSS/link/unauthorized delivery |
| analytics/ad/SEO leakage | MEDIUM/HIGH | outbound allowlist/minimization, URL/structured data에 token/balance/debt/security 금지 | payload/schema/sitemap/JSON-LD scan, HIGH leak 차단 |
| supply chain | MEDIUM/HIGH | immutable action/image ref, dependency audit, SBOM/provenance | workflow/dependency/provenance regression severity gate |
| candidate lineage mismatch | HIGH | §3 chain, image digest, Flux revision, Pod/public version probe | desired/applied/workload/public mismatch 시 merge/promotion 차단 |
| release evidence bypass | HIGH | immutable SHA, machine-readable fail-closed evidence, skip-pass 금지 | 각 prerequisite fault injection, Production-ready emission 차단 |
| backup/key compromise | HIGH | encryption/key separation/independent medium/least privilege/audit | unauthorized key/plaintext test, HIGH leak 차단 |
| wrong-environment restore | CRITICAL/HIGH | source/target identity, isolated DB/namespace, separate creds/outbound sink | wrong target/Production credential simulation, prod write 가능성 차단 |
| backup corruption/WAL gap | HIGH | checksum/manifest/full restore/WAL monitoring/reconciliation | corrupt/missing/wrong checksum fail-closed+alert |
| multi-account/referral/market manipulation | HIGH where economy affected | maturity/cap/provenance/anomaly/graph | referral ring/wash trade/collusion/duplicate/replay |
| stale/forged operational health | HIGH | trusted writer/server freshness/collector heartbeat/parity | false-green stale/stop/cache/API/DB/forged writer는 status-dependent release 차단 |

password/verifier/session cookie/OAuth code/client secret/bot token/DB password/backup key/raw verification·recovery token 및 unrestricted request body는 일반 log에 남기지 않는다. 보안 event는 pseudonymous ID와 안전한 classification을 사용한다.

## 9. 수익성·사업성 계약

어떤 기능도 gross revenue만으로 승인하지 않는다. 실결제/광고 기능마다 model, 유료전환경로, 표시·테스트가격, attach/paid conversion/repeat/renewal 가설, refund/churn/cancel, 실제 매출이 있을 때만 ARPU/ARPDAU/ARPPU, eCPM/fill/CTR, platform/payment/tax/refund/chargeback, infra/storage/CDN/notification/LLM, content/CS/moderation/fraud/security 비용, gross/contribution margin, CAC, LTV, LTV/CAC, payback, 낙관/기준/보수 민감도, D1/D7/D30, 신뢰·규제 비용, `SCALE/ITERATE/HOLD/KILL` 기준을 기록한다.

- WLD-only shop/casino/bank/stock은 실매출이 아니다.
- 광고 순기여 = 광고매출 - 광고유발 churn/session 감소 LTV 손실 - ad infra/privacy/support/fraud 비용.
- SEO는 impression이 아니라 incremental organic D30 retained user와 CAC 절감을 본다.
- security/QA/release/backup/status/GitOps는 사고·데이터손실·다운타임·환불·fraud·support 기대비용 회피로 본다. 실측 전 통화금액을 만들지 않는다.
- local auth는 incremental D30 retained contribution에서 SMTP/Argon2/DB/support/fraud/privacy/security 비용을 차감한다.
- status false-green은 HOLD/KILL 신호이며 `stale_operational_violation_count` 목표는 0이다.
- release lineage 실패는 engineering queue, rerun compute, operator time을 증가시킨다. candidate lead time, failed promotion attempt, rerun cost, escaped-defect avoidance를 측정한다.
- 향후 recurring billing은 결제 전 중요조건 공개, affirmative consent, 간단한 해지를 요구한다. provider 선정 전 fee는 가설이다.

## 10. 백업·재해복구

허용 가능한 identity/ledger/content 손실과 복구비용에 기반해 명시적 RPO/RTO를 승인하며 기획 자동화가 숫자를 임의로 만들지 않는다. RPO는 실제 최신 복구가능시점, RTO는 timed full drill로 측정한다. PostgreSQL identity/economy/ledger/audit, migration/schema/version/checksum, inventory/entitlement/content metadata, 필요한 object/photo storage, application/GitOps version을 백업한다. key/secret recovery는 별도 암호화 control plane을 사용한다.

primary host/storage/failure domain 또는 online credential을 공유하는 replica/recovery DB/snapshot/dump는 독립 DR이 아니다. `VERIFIED_RESTORABLE`은 clean isolated target → source identity → decrypt/key/checksum/manifest → full DB restore/PITR proof → migration parity → Production outbound가 꺼진 least-privilege app smoke → referential integrity → ledger/balance → inventory/entitlement/provenance → representative object restore → email/Discord/webhook/ads/indexing off → recoverable point/RTO 측정 → evidence/audit → controlled disposal/retention을 모두 요구한다.

파괴적/schema-changing 작업에는 current candidate SHA, backup ID/source/failure-domain, encryption/key, checksum/manifest, restore drill/time, RPO/RTO, migration parity, reconciliation, object sample, rollback target, operator identity, freshness가 필요하다. missing/stale/corrupt/wrong-key/wrong-env/WAL-gap/reconciliation-failed/untested는 `BLOCKED`다.

## 11. QA·Test·릴리스·관측·롤백

### 11.1 candidate sequence

§3 state machine을 그대로 사용한다. Test는 isolated namespace/DB, indexing off, real ads off다. Test/recovery는 Production email/Discord/webhook을 보내거나 Production data를 변경할 수 없다. CI 성공 또는 image build 성공은 applied/runtime proof를 대체하지 않는다.

### 11.2 monitoring

API 4xx/5xx, auth/ATO, DB pool/transaction, migration parity, ledger reconciliation, duplicate reward/quota denial, entitlement failure, outbox/provider, ad-induced exit/CWV, crawl/index error, backup freshness/restore, release evidence/rollback, Flux source/Kustomization applied revision, rollout replica/digest, public exact-SHA probe, collector heartbeat, status source age, stale-green violation을 관측한다. monitoring data가 없으면 healthy로 보지 않는다.

### 11.3 rollback

rollback은 알려진 immutable application/image/GitOps target과 호환 DB contract를 사용한다. 적용된 migration을 과거로 편집하지 않는다. DB rollback이 안전하지 않으면 backward-compatible schema를 쓰거나 forward corrective migration을 사용한다. cleanup 전 incident evidence를 보존한다.

## 12. UX·접근성·성장·운영

첫 방문은 복잡한 경제 전체보다 하나의 명확한 제품 약속과 game-only 경계를 먼저 설명한다. Activation은 `방문 → 이해 → sample/value → contextual signup → 첫 의미있는 verified action → 결과/보상 → 다음 목표`. D1은 선택 thread 복원, D3는 실제 변화 또는 정직한 no-change, D7은 하나의 progression/collection/project/learning loop 완결, D14는 자발적 breadth, D30은 durable history/identity/collection을 남긴다.

punitive streak, loss-threat FOMO, fake scarcity, 과도한 알림을 피하고 catch-up/comeback을 제공한다. 공유는 public-safe achievement/collection/project/season/learning을 우선한다. 공유 URL에는 session token, private holdings, balance, debt, casino, recovery/security state, PII를 넣지 않는다. referral reward는 fraud-resistant maturity 이후 cosmetic/prestige/convenience 중심이다.

모든 flow는 loading/empty/error/offline/timeout, keyboard/focus/label/contrast/reduced motion, mobile/tablet/desktop, EN/KO copy parity를 다룬다. 고위험 account/economy/admin action은 명시 확인과 anti-phishing UX를 사용한다. Admin/CS는 dispute/refund/report/abuse queue, feature flag, incident messaging, audit를 운영한다.

## 13. 외부 레퍼런스 적용판정 — v2026.09.15.110

- Flux Kustomization 최신 문서: **직접채택**. `Ready`, reconciliation condition/history, `lastAppliedRevision`, `lastAttemptedRevision`, applied origin revision을 Git commit/desired-state merge와 별개의 실제 배포증거로 취급한다.
- GitHub protected branch/status check 문서: **직접채택**. required check는 merge 차단을 강제할 수 있고 strict mode는 최신 base 반영을 요구할 수 있다. 현재 저장소 metadata는 required checks off이므로 REL-104-03은 OPEN이다.
- GitHub artifact attestation: **공급망 증거로 직접채택**. provenance/SBOM은 artifact가 어떻게 빌드됐는지 강화하지만 cluster가 실제 그 artifact를 제공한다는 증명은 아니다.
- OWASP API Security API4/API5/API6: **직접 보안기준**. resource/cost exhaustion, function authorization, 자동화된 sensitive business-flow abuse를 전 기능에 적용한다.
- Google Search Central canonical/noindex: **직접 SEO 채택**. 검색 제외는 crawl 가능한 noindex meta/header로 하고 robots 차단을 noindex/canonical 대체로 사용하지 않는다. canonical 신호는 일치시킨다.
- CISA backup/ransomware 및 PostgreSQL backup/PITR: **직접 복원력 참고**. 실제 full restore evidence가 최종 기준이다.
- 한국 개인정보보호위원회 최신 처리방침 자료: **직접 고지 설계**. local-auth/analytics 실제 처리와 공개 고지를 일치시킨다.
- FTC 2026 negative-option/subscription 집행·검토: **참고 + 제품 guardrail**. 중요 반복결제조건 사전고지, 명시동의, 간단한 해지를 요구하되 관할을 과장하지 않는다.

## 14. 현재 증거 snapshot — v2026.09.15.110

- 시작 application `main`은 `a0b4d656f7bad17ff9ee0acb976358df9466a750`였다. 첫 영문 v110 통합 후 `main`은 `9aeab1f8ad984ec6d081fb5ed9ee95d2defcf5c3`가 되었고 이는 문서-only self change다. 그 사이 외부 동시 main 이동은 확인되지 않았다.
- branch metadata는 `main` protection enabled, required status-check enforcement `off`, contexts/checks empty를 직접 보여준다. REL-104-03은 confirmed open이다.
- Production `/status`는 약 08:08 KST에도 04:06 KST snapshot으로 all-normal을 표시해 OPS-107-01 false-green이 4시간 이상 지속됐다.
- Production `/guide`는 unlimited profession-work/full-reward 문구 및 Discord/Google-only/no-separate-password 문구가 남아 있어 QA-104-01, AUTH-105-01은 OPEN이다.
- Production privacy는 OAuth 중심이며 local credential processing을 설명하지 않아 broad local-auth rollout HOLD를 유지한다.
- issue #139는 OPEN이고 Remote Desktop 승인장비는 모두 offline이라 새로운 backup-media/cluster 증거를 주장하지 않는다.
- PR #332는 OPEN/mergeable. head `b3f28185107a2f6f4a8bd389016de778df08b747`는 CI와 Test Candidate image build를 성공했다. 그러나 infrastructure desired-state 통합 후에도 public Test `/api/version`은 `1789391457242`를 반환해 exact-SHA staging이 실패했고 REL-110-01은 P0/BLOCKED다.
- 해당 candidate는 Production을 변경하지 않았으므로 Production rollback은 필요하지 않다.
- v110은 planning/docs only다. 이 회차에서는 runtime code, API, DB schema/data, migration, infrastructure, collector, backup medium, secret, branch rule을 변경하지 않는다.

### v2026.09.16.1 변경 — 조합 가능한 주식 탐색
`/stocks` 탐색은 URL 기반 `q` 검색과 `sort=change|price|available|name` 정렬을 함께 사용합니다. 한 조건을 바꿀 때 다른 조건을 유지해 결과 화면을 북마크·공유할 수 있어야 합니다. 경제 값은 정수 문자열 정밀도를 유지하고 잘못된 정렬 값은 API 기본순으로 돌아갑니다.

## 2026-09-16 — v2026.09.16.138 적응형 직업/일일 제한 통합

- Moneyverse Economy AI가 주직업 슬롯, 동시 활성 직업 수, 직업별 반복보상, 일일 작업/정상보상 보호한도를 정책 레지스트리에서 함께 분석·조절할 수 있도록 통합한다.
- 일반 일일 제한은 `null = 무제한`이 기본이다. finite cap은 다중 시간창 증거·시뮬레이션·인과평가·결정론적 가드레일을 통과한 한시적 보호조치로만 적용하며 자동 완화/무제한 복귀를 필수로 한다.
- AI는 기존 주직업을 임의 교체·박탈하거나 숙련도를 삭제하지 않는다. 슬롯 축소는 기존 사용자를 grandfathering하거나 별도 사람 승인 migration을 요구한다.
- 주식 가격, 상점 가격, 저위험 상품 생성과 동일하게 직업정책도 다중 에이전트가 후보를 만들 수 있지만 최종 집행권은 versioned deterministic policy gate에 있다.

## 2026-09-16 — v2026.09.16.139 전통 + AI 이중 경제 제어 통합

- 경제 자동화는 동일한 불변 snapshot을 사용하는 전통/결정론 기준 lane과 AI/학습 탐색 lane 두 개를 계속 운영한다.
- 전통 lane은 회계·대사·시장 매칭/가격범위·정책제약·안전의 권위이자 AI 장애 시 운영 fallback이다. AI는 행동 agent, 반사실, RL/MARL simulation, 수요/상품 가설, 적대 분석을 추가한다.
- 두 lane이 크게 충돌하면 평균으로 운영에 넣지 않고 `SHADOW`, `NO_OP`, 사람검토로 내린다. 합의하더라도 결정론 검증을 통과해야 자동적용 후보가 된다.
- 이번 연구에서 OpenAlex+Crossref를 합쳐 중복 제거된 **11,749건** 후보군과 machine-readable 목록, 영문/한국어 검토 문서를 `docs/findings/`에 추가한다. 후보군 규모는 탐색범위이며 운영판단은 핵심 원문·현재 런타임 데이터·적용 후 인과효과를 요구한다.

## 2026-09-16 — v2026.09.16.141 분야별 2중 경제 AI 런타임

- 경제 AI lane을 6개 전문분야와 분야별 독립 설정 가능한 A/B 2개 좌석으로 구현하고 독립판단 → 상호반박, 분야 충돌 시 abstain, 안전 중요 pair-veto를 적용한다.
- 기존 결정론 경제엔진은 항상 사용 가능한 classical lane으로 유지하며 AI 장애가 경제서비스 장애가 되지 않게 한다.
- exact proposal hash, expiry, 집계판정, 최종 12개 좌석 증거를 저장한 뒤 결정론 중재를 수행한다.
- 로컬 AI 모델/cache/dataset은 32GB 시스템 디스크가 아니라 100GB `/srv/moneyverse-data` 디스크에 저장한다.


## 2026-09-16 — v2026.09.16.152 런타임 권위·릴리스·Work clock·교차기능 통합

### 증거 스냅샷과 릴리스 권위

- **통합 시점 application main:** `d6cf13d4236bd1298010ae5f165b15899356a59d`. 저장소가 계속 변경되므로 merge 직전 다시 확인한다.
- `v2026.09.16.151` 런타임 증거는 Kubernetes/Flux가 현재 공개 권위라는 과거 가정을 대체한다. 현재 공개 Test/Production은 승인된 Debian 13 호스트의 분리된 systemd release와 로컬 PostgreSQL 권위 경로에서 서비스된다. NixOS/Kubernetes 노드는 **현재 Production 권위가 아니라 복구 대상**이다.
- 공개 Test/Production과 application/GitOps desired 참조는 application SHA `3d87165f83bcb60903e85d4f3600fdf40074ef40`로 수렴했다고 기록됐다. Production Flux `apps`는 cluster-admin 접근과 DB 대사가 독립적으로 증명될 때까지 suspend 상태를 유지한다.
- `REL-110-01 / P0`은 일반 exact-SHA divergence에서 **RECOVERY_IN_PROGRESS / AUTHORITY_SPLIT_CONTAINED**로 바꾼다. Kubernetes 접근, DB 대사, 통제된 Flux 복귀가 끝나기 전에는 DONE이 아니다.
- current-main `Build Production Release #878`은 확인 시점에 `in_progress`였다. 문서 commit, candidate build, GitOps 선언, 과거 runtime convergence는 더 최신 main SHA가 운영 중이라는 증거가 아니다. 승격 SHA의 exact-main Test, backend/API/DB/user-flow QA, Production smoke가 없으면 fail-closed한다.

### OPS-RUNTIME-152-01 — 이중 control-plane/권위 모호성

- **우선순위/severity/status:** P0 / CRITICAL 운영 무결성 / IN PROGRESS.
- **최초발견:** 2026-09-16 incident recovery, **최근재현:** current main의 v151 runtime-authority 기록.
- **영향:** Debian systemd와 suspend된 Kubernetes를 동시에 권위로 오인하면 deploy/rollback, DB write, backup/restore, 장애대응, version truth가 잘못된 control plane을 향할 수 있다.
- **확정원인:** 의도한 Flux/Kubernetes 제어면의 관리자 접근이 복구되지 않은 상태에서 Debian 호스트로 공개 서비스를 복구했고, 과거 문서는 런타임 권위 이동 뒤에도 Kubernetes를 권위로 설명했다.
- **수정설계:** 운영이 소유하는 machine-readable `runtime-authority.json`을 두고 `environment`, `authority_generation`, `runtime_type`, host/workload identity, `application_sha`, `db_authority_id`, `desired_gitops_sha`, `flux_suspended`, `verified_at`, `evidence_run`, `rollback_target`을 기록한다. release automation은 시작 시 generation을 고정하고 실행 중 바뀌면 권위 변경 작업을 거부한다.
- **DB/마이그레이션:** 권위 기록만을 위한 product-data migration은 하지 않는다. Kubernetes 재활성화 전에 현재 Debian PostgreSQL과 candidate cluster DB의 schema migration/checksum, ledger invariant, 핵심 row count, bounded reconciliation snapshot을 비교한다. 두 DB를 동시에 writable authority로 합치지 않고 하나의 source of truth를 정해 rehearsal된 단방향 migration/cutover를 수행한다.
- **롤백:** Debian이 권위인 동안 rollback은 마지막 verified Debian release와 호환 DB state로 한다. Flux unsuspend를 rollback shortcut으로 사용하지 않는다.
- **테스트/승격게이트:** exact-SHA Test, DB connectivity/schema, 비경제 probe read/write canary, ledger reconciliation, backup restore rehearsal, DNS/tunnel routing, process restart, stale GitOps negative test, authority-generation race test. 권위 모호성·dual writer·stale schema·rollback evidence 누락은 Production 차단이다.
- **모니터링:** public `/api/version`, systemd working directory/release SHA, DB authority fingerprint, GitOps desired SHA, Flux suspend, schema version, backup freshness, reconciliation drift. 둘 이상의 권위 신호가 5분 넘게 다르면 alert한다.

### OPS-FLUX-150-01 — privileged recovery 정리

- jump-host/SSH 복구는 incident 도구이며 영구 deployment backdoor가 아니다. private key, kubeconfig, DB credential, bearer/session secret을 repository/artifact/일반 로그에 남기지 않는다.
- 완료조건은 임시 authorized key/capability 제거, immutable operator/run audit, pinned host-key evidence, 명시적 Flux suspend/resume 결정, normal approval boundary 없이 workflow가 Production을 변경하지 못한다는 사후검증이다.
- controller restart 전후 source revision, last-applied/attempted revision, readiness/event를 저장한다. restart 성공만으로 root cause를 종료하지 않는다.
- 운영 API/자동화에도 OWASP ASVS 5.0 검증 원칙과 API Security 2023 access-control/resource-consumption 경계를 적용해 least privilege, bounded execution, explicit authorization, tamper-evident audit, fail-closed secret handling을 요구한다.

### WORK-CLOCK-149-01 — dashboard/write clock 수렴

- **우선순위/severity/status:** P1 정확성+경제무결성 영향 / HIGH / PR #370 FIX PENDING.
- settlement는 가속 Moneyverse server clock을 사용하지만 legacy `work_my_dashboard` read model은 실제 Asia/Seoul day/week window를 사용할 수 있어 화면의 `daily_paid`/`weekly_paid`와 실제 settlement quota window가 달라질 수 있다.
- migration 202에서 dashboard key를 settlement와 동일한 `server_game_day_key()` / `server_game_week_key()` 권위로 통일한다. 적용된 migration은 immutable이며 migration 번호 중복과 checksum 변경은 CI hard fail이다.
- QA: 경계 -1/0/+1초, 가속 day/week rollover, 동시 completion, idempotent retry, restart, timezone 설정, stale dashboard cache, API/UI parity, real PostgreSQL regression. 모든 시험 시각에서 settlement/dashboard key가 동일해야 통과한다.
- UX는 다음 reset을 server-authoritative time으로 표시하며 loading/error/offline에서 남은 quota를 추측하지 않는다. 접근성은 색상 없이 reset time/quota를 읽을 수 있어야 하고 모바일/데스크톱 의미는 동일하다.
- 사업 KPI는 매출이 아니라 work completion, quota-confusion CS, retry/error, D1/D7/D30 job retention이다. retention이 좋아도 reward authority 불일치는 허용하지 않는다.

### 현재 기능군 공통 구현 계약

- **인증/세션/보안센터:** session actor가 권위다. OAuth/OIDC에는 해당되는 state/nonce/PKCE, session rotation/revocation, 민감변경 recent reauth를 적용한다. profile/admin/stock/bank/business/community/telemetry object에는 BOLA/BFLA negative test가 필수다.
- **경제/인벤토리/상점/결제/구독:** 가치변경은 server-authoritative, integer-safe, transactional, idempotent다. client 표시가격은 settlement authority가 아니다. 실결제 SKU는 receipt/webhook 검증, entitlement reconciliation, refund/revoke/restore state machine, append-only audit가 필요하다. 미실측 conversion/ARPU/ARPPU/refund/churn/CAC/LTV는 `HYPOTHESIS`/`TEST TARGET`이다.
- **직업/퀘스트/레벨/보상:** reward와 quota는 server game clock, durable receipt/idempotency, append-only ledger를 사용하고 client timer는 표시 전용이다.
- **은행/대출/사업/가상주식:** simulated/game-only 표시를 강제한다. 이자, 대출자격, 주식체결, 사업정산, portfolio history는 DB/server 권위이며 실제 증권·예금·수익보장 표현을 금지한다.
- **카지노/확률형:** themed UI는 하나의 typed server action schema에 매핑한다. client RNG/animation은 payout을 결정하지 않는다. eligibility, bet debit, server RNG, payout, ledger, audit, idempotency를 원자적으로 처리하고 retry는 동일 receipt를 반환한다.
- **커뮤니티/친구/클럽/추천:** moderation/block/report, invite/referral anti-replay, rate limit이 필요하다. 추천보상은 server-side idempotent이며 fraud 관측이 가능해야 한다. multi-account signal 하나만으로 비공개 자동제재하지 않고 risk control/review와 조합한다.
- **알림/Discord/email/push:** 외부전송은 post-commit/outbox 기반이다. 전송실패가 이미 commit된 경제 transaction을 rollback시키지 않으며 retry는 bounded/deduplicated다.
- **검색/갤러리/upload/public content:** signature/content-type, size/dimension, generated storage name, 필요한 malware/content 검사, private-by-default ownership, safe download header를 적용한다. 공개 UGC는 publication과 별도의 moderation/index-policy 상태를 가진다.
- **관리자/audit/analytics:** raw telemetry와 aggregate analytics 권한을 분리한다. raw IP/session/user-agent는 recent reauth+purpose+audit를 요구하고 retention/minimization을 적용한다. 가치/정책 변경 admin mutation은 명시적 function authorization과 reason/idempotency가 필요하다.
- **backup/restore/운영:** backup 존재는 recovery 증거가 아니다. independent restore rehearsal, RPO/RTO, encrypted/off-host copy, schema/application compatibility, authority cutover를 검증한다. rehearsal되지 않은 restore는 `UNVERIFIED`다.

### SEO 및 SEO 백엔드

- 이번 회차 최신 Google Search 자료는 핵심 indexing 계약을 바꾸지 않았다. 2026-08-28 site reputation update는 third-party/sponsored/UGC governance에 계속 적용하며 host reputation을 빌리기 위한 제3자 section을 만들지 않는다.
- public SEO read-model은 stable canonical identity, slug/redirect history, `updatedAt/lastModified`, language, ownership/editorial/sponsor/index-policy, image metadata, structured-data input을 제공한다. private/account/admin/transaction/casino-history/payment-callback은 강제 `noindex` + sitemap 제외다.
- dynamic sitemap/robots는 publish/index 상태에서 결정론적으로 생성하고 search-engine limit 이전에 분할하며 stable `lastmod`를 제공하고 private object ID를 유출하지 않는다. 한국 시장 smoke에는 Naver robots 검증+sitemap discovery를 넣고 rendering/index policy 변경 배포 후 Google/Naver 대표 URL 검사를 수행한다.
- 공개 페이지는 SSR/ISR 또는 동등한 crawlable server output, stable canonical, 실제 번역본에만 hreflang, 명확한 title/H1, 필요한 breadcrumb/internal link, OG, image dimensions/alt, visible content와 일치하는 JSON-LD를 사용한다. filter/query 변형은 canonical/noindex 처리하고 삭제는 404/410, 영구이동은 one-hop permanent redirect를 사용한다.
- LCP/INP/CLS를 public template/device별 관측하고 robots/noindex/canonical regression, sitemap private leak, structured-data mismatch는 SEO release blocker다. KPI는 impressions→CTR→visit→signup→activation→D7/D30→payer/ad contribution이다.

### 수익화와 unit economics 게이트

- Google Play 수수료는 market/cohort/transaction에 따라 달라 하나의 고정 store rate를 쓰지 않는다. EEA/UK/US의 2026-06-30 구조에서 표준 자동갱신 subscription은 10%, 기타 new-install transaction은 20%, existing-install은 25%이며 Play Billing 적용 시 5% billing fee가 추가된다. 다른 시장은 실제 rollout 전 해당 기존/program 정책을 적용한다.
- 모든 실결제 SKU는 `market`, effective-date/install cohort, recurring 여부, billing path/program, gross price, platform/billing fee, tax 가정, refund/fraud loss, entitlement/support/infra cost, contribution margin을 모델링한다. discount가 contribution margin/fairness guardrail을 깨면 거부한다.
- 상점/결제/구독 SCALE은 기준 시나리오 contribution margin 양수, refund/fraud/support cost bounded, D7/D30·신뢰 악화 없음이 조건이다. conversion은 있으나 margin/retention 미달이면 ITERATE, 지속적 negative contribution 또는 P2W/dark-pattern/regulatory risk면 KILL한다.
- 광고는 incremental ad net revenue에서 광고 유발 session/retention 감소와 support/privacy cost를 뺀 순효과로 본다. SEO는 CAC 절감과 activation/LTV, 보안/QA/운영은 사고·fraud·refund·downtime·operator cost 회피효과로 평가한다.

### 릴리스/백로그 순서

`P0 runtime authority/exact-SHA truth → P0 independent backup+restore evidence → P0 false-green/status truth → HIGH privileged recovery cleanup → HIGH migration sequence+Work clock convergence → HIGH repository required-check enforcement → HIGH economy/admin/casino authorization+integrity → P1 core correctness → payment/shop unit economics → SEO acquisition → retention/growth → accessibility/장기확장`.

v152 통합은 문서만 변경한다. runtime code, product data/DB schema, Flux suspend, credential, Production을 변경하지 않는다. 실제 구현은 새 branch → tests/CI → exact-SHA Test → backend/API/DB/user-flow QA → main → Production promotion → smoke/rollback evidence 순서를 유지한다.


## 18. 시간별 통합 변경 — v2026.09.16.153

### 18.1 증거 스냅샷·릴리스 진실성

- 증거일: 2026-09-16. 시작 및 작업 중간 기준 `main`은 `9ca10bed71bf0175c146324ee9e6eca111f35ad8`로 동일했고 문서 브랜치 생성 전 source drift는 없었다.
- 해당 exact-main SHA의 `Build Production Release #880`은 확인 시점 `in_progress`였다. 따라서 current-main Production 검증은 `UNVERIFIED`다. 문서 merge, skipped auto-promotion, 진행 중 release는 운영 증거가 아니다.
- `REL-110/REL-133`은 exact Test workload SHA, public Test SHA, backend readiness, 권위 DB path/schema, Production SHA와 smoke evidence가 모두 일치할 때까지 P0다. timeout 연장이나 rerun만으로 incident를 종료하지 않는다.
- 열린 PR #370(`WORK-CLOCK-149-01`)은 새 main 기준 현재 non-mergeable이며 `HIGH / FIX_PENDING`을 유지한다. rebase/update 과정에서 적용 migration의 번호·내용 불변성을 지키고 실제 PostgreSQL 가속 day/week 경계 회귀시험을 다시 통과해야 한다.

### 18.2 구현 가능한 백로그 변경

1. `REL-EVIDENCE-153-01 / P0 / IN_PROGRESS`: 모든 release attempt는 성공/실패와 무관하게 release SHA, desired/applied revision, workload generation, image digest, pod-local/public version SHA, backend readiness, DB authority/schema checksum, 최초 실패계층, probe timestamp/latency, rollback target을 evidence bundle로 남긴다. secret/cookie/Authorization/DSN/private key는 금지한다. 수용조건은 실패 release 중 evidence 누락 0건, exact-SHA/DB assertion 불일치 상태 Production promotion 0건이다.
2. `WORK-CLOCK-149-01 / HIGH / FIX_PENDING`: dashboard와 settlement는 동일한 `server_game_day_key()`/`server_game_week_key()`를 사용한다. 경계 -1/0/+1초, 현실 10분 game-day rollover, 현실 70분 game-week rollover, 동시 completion, retry/idempotency, process restart, DB timezone 변경을 시험한다. rollback은 forward-only corrective migration이며 적용 migration을 수정하거나 renumber하지 않는다.
3. `SEO-153-01 / P1 / ADOPT`: Google Search Central의 현재 9월 8일 변경은 지역별 Search experience 문서를 추가했고 8월 28일 site reputation policy 변경은 계속 중요하다. WDX/가상주식을 실제 금융정보 provider처럼 표현해 finance surface 자격을 노리지 않는다. 공개 SEO read-model은 content owner/editorial control/sponsor/index policy를 유지하고 계정·거래·카지노내역·결제 callback·관리자 화면은 `noindex` 및 sitemap 제외를 유지한다. favicon QA는 안정적인 정사각형 URL과 homepage/favicon crawlability를 검사한다.
4. `MONETIZATION-153-01 / P1 / ADOPT`: Google Play에는 하나의 보편적 수수료율이 없다. unit economics는 market, effective-date/install cohort, recurring/non-recurring, billing path, enrolled program을 key로 한다. EEA/UK/US의 2026-06-30 이후 standard 기준은 auto-renewing subscription 10%, 기타 new-install 20%, existing-install 25%이며 해당 시 5% billing fee를 더한다. 나머지 시장은 새 구조가 실제 적용되기 전 현재 적용 프로그램 규칙을 사용한다. conversion, ARPU/ARPDAU/ARPPU, churn, refund, CAC, LTV는 측정 전 `가설/테스트 기준`이다.

### 18.3 교차영역 완료 게이트

P0/HIGH는 문서 반영만으로 `DONE`이 아니다. 실제 흐름은 branch → 정적/단위/통합/실DB/보안시험 → immutable candidate → isolated exact-SHA Test → backend/API/DB/사용자흐름 QA → main → exact-main 재시험 → Production 승격 → smoke/관측 → 필요 시 rollback이다. 매출·성장 작업은 데이터손실·권한·경제무결성·DB무결성·backup/restore·release-truth gate를 우회하지 않는다.

### 18.4 v153 worklog

외부 근거는 Google Search Central 2026년 9월 변경·8월 28일 site reputation policy, OWASP API Security Top 10/ASVS baseline, Google Play 현재 서비스 수수료 문서를 재확인했다. 저장소 근거는 최신 main, v152 영문/한국어 통합본, Actions 상태, 열린 PR #370을 재확인했다. 결론은 운영승격을 추정하지 않고 P0 release truth를 유지하며 exact release-evidence 수용조건을 추가하고, Work clock 수정은 mergeability/exact-SHA 실DB QA 전까지 blocked로 유지하며, 수익성은 market/cohort별 계산을 유지하는 것이다. 이번 기획 회차에서 runtime code, DB, Flux, Production은 변경하지 않았다.


## v2026.09.16.154 — 시간별 증거 갱신

### 릴리스/CI 증거 — REL-EVIDENCE-154-01 — P0 — IN PROGRESS
- 2026-09-16 확인 시 현재 `main`은 `83f00a978e8e1bed0c5b94a7b4cda81893f4c669` (`docs: integrate Moneyverse plan v2026.09.16.153 (#379)`)이다. 작업 중간 재확인도 동일 SHA여서 기획 중 main drift는 없었다.
- exact-main `Build Test Candidate #740`의 verification job은 lint, typecheck, build, migration, test, Prisma schema mutation 차단, production dependency audit를 통과했다. 관측 시점에는 backend candidate image가 완료되고 frontend candidate image가 빌드 중이었다. 이는 `CI verification green / candidate image build pending`이지 isolated Test 또는 Production 증거가 아니다.
- branch metadata는 protection enabled이나 required-status-check enforcement가 `off`이고 required context/check가 비어 있다. 따라서 `REL-104-03`은 runtime-sensitive path가 저장소 차원에서 강제되기 전까지 confirmed 상태를 유지한다.
- 수용조건은 fail-closed다. 이미지 빌드 완료만으로 `IMAGE_BUILT` 이후 상태로 승격하지 않는다. isolated Test에서 exact SHA/digest, backend/API/DB path, least-privilege DB, 변경기능 QA, noindex를 증명해야 한다. 실패/timeout 회차도 secret 없이 expected/observed evidence를 보존한다.

### Work clock 무결성 — WORK-CLOCK-149-01 — HIGH — FIX PENDING / REBASE REQUIRED
- PR #370은 head `8ff8314a4425f874508b3d8d966e95ae40450b2a`, 기록된 base `3d87165f83bcb60903e85d4f3600fdf40074ef40` 상태로 열려 있고 현재 main은 더 전진했다. 수정 목적은 `work_my_dashboard.daily_paid/weekly_paid`를 `server_game_day_key()` / `server_game_week_key()`와 일치시키고 real-PostgreSQL regression을 추가하는 것이다.
- 병합 전 current main과 rebase/reconcile하고 migration 번호 중복/적용 migration 불변성 및 real-DB 테스트를 다시 수행한 뒤 exact-head isolated Test를 요구한다. 이미 적용된 migration은 수정/rename하지 않고 새 forward migration으로 충돌을 해결한다.
- QA: game-day/week 경계 -1/0/+1초, 현실 10분 day·70분 week rollover, 동시 완료, duplicate/retry idempotency, process restart, DB timezone, stale read-model/cache, settlement 권위와 dashboard counter 동일성을 검증한다.

### SEO/SEO 백엔드 갱신
- 2026-09-08/09-14 Google Search Central 최신 글은 행사 공지이며 crawl/index 계약 변경이 아니다. 2026-08-28 site reputation policy 변경은 계속 적용해 sponsor/affiliate/UGC가 Moneyverse host 평판만 이용하는 구조를 제외한다.
- 공개 SEO read-model은 canonical URL, slug/redirect history, title/description/H1, index policy, content owner/editorial control/sponsor type, locale/hreflang, updatedAt/lastModified, image metadata, structured-data input을 권위 있게 공급한다. 계정/관리자/payment callback/private transaction/casino history는 sitemap 제외 + `noindex`다.
- Naver 공식 가이드는 robots.txt의 sitemap discovery, 페이지별 robots meta, 렌더링 필수 JS/resource crawlability를 요구한다. 따라서 release QA는 robots → sitemap → canonical → server-rendered content/resources → Google/Naver 대표 URL 검사를 수행한다.

### 보안 및 사업/경제성 갱신
- OWASP API Security Top 10을 API 위협 baseline, ASVS를 검증 baseline으로 유지한다. actor-scoped authorization, 민감 관리자 recent reauth, DB least privilege, BOLA/BFLA negative test, CSRF/XSS/SQLi/SSRF/upload 통제, resource/business-flow 제한, idempotency/replay 방지, append-only audit, secret-safe log는 P0/HIGH release gate다.
- Google Play 최신 수수료 문서는 단일 보편 수수료가 없음을 명시한다. EEA/UK/US는 2026-06-30부터 standard auto-renew subscription 10%, 기타 new-install 20%, existing-install 25%이고 Play Billing 적용 시 5% billing fee가 붙는다. AU/JP rollout은 2026-09-30, KR은 2026-12-31이므로 한국 unit economics에 미래 지역 요율을 조기 적용하지 않는다.
- SKU 가정키는 market × effective date/install cohort × transaction type × billing path × programme이며 gross → platform/billing fee → tax/refund/fraud → entitlement/infra/support → contribution margin으로 계산한다. conversion, ARPU/ARPDAU/ARPPU, churn, refund, CAC, LTV는 실측 전 `HYPOTHESIS`/`TEST TARGET`이다.

### v154 worklog
- 조사: Google Search Central 9월 최신 글 및 2026-08 site reputation update, Naver Search Advisor robots/meta/resource, OWASP API/ASVS, Google Play 수수료/rollout, GitHub main/branch protection/Actions/PR #370.
- 채택: exact-main CI 상태 분리, repository enforcement 결함, PR #370 rebase+real-DB gate, SEO crawler/resource 계약, 시장·시행일 기반 수수료 모델.
- 보류: 기획 자동화에서는 runtime/DB/Flux/Production을 변경하지 않았다. `Build Test Candidate #740`이 관측 시 실행 중이므로 Test/Production 통과를 주장하지 않는다.


## v2026.09.16.155 — 시간별 릴리스 진실성·외부근거 갱신

### REL-EVIDENCE-155-01 — P0 — IN PROGRESS
- 기획 시작/중간 권위 `main`은 `a4455ad342fbf66a128c1221c25b45ff4d20d6bf`이다. 이 exact SHA의 `Build Production Release #882`는 현재 `in_progress`이며 immutable SHA 결정은 통과했고 `Wait for exact SHA on isolated test and verify backend/database path` 단계가 실행 중이다. 이는 Test 또는 Production 성공 증거가 아니다.
- 반복 릴리스 게이트 실패는 원인 제거 작업으로 유지한다. test-gate는 성공/실패 모두 expected/observed `release_sha`, GitOps desired/applied revision, Deployment generation, ReplicaSet/Pod image digest, pod-local/public version, backend readiness, DB authority/schema checksum, 최초 불일치 계층, probe timestamp/latency, rollback target을 남겨야 한다. secret header/cookie/DSN/key/token은 evidence에서 금지한다.
- 수용조건: exact-SHA/DB assertion 하나라도 다르면 승격 0건, 실패/timeout에도 비밀 없는 완전한 evidence 보존, 복구 후 동일 candidate의 source→image→desired→applied→workload→public→DB lineage 증명, exact-main 재시험과 Production smoke 통과.

### SEO/SEO 백엔드 결정 갱신
- 2026-09-08/09-14 Google Search Central 글은 행사 공지이므로 crawl/index 계약을 변경하지 않는다. 2026-08-28 site reputation policy 변경은 sponsor/affiliate/UGC 거버넌스에 계속 직접 적용한다.
- favicon QA는 현재 Google 기준에 따라 Googlebot/Googlebot-Image가 홈페이지와 favicon을 수집할 수 있어야 하고, 안정적인 URL과 정사각형 자산(권장 48×48 초과)을 사용한다. public metadata/canonical/sitemap/structured data/private noindex 계약은 유지한다.
- Google European Search Dataset Licensing Program은 SEO 순위 우회수단이 아니므로, Moneyverse가 별도 자격과 독립 assurance/privacy 의무를 수용하는 경우가 아니면 제품 범위에서 제외한다.

### 보안·AI 경계 갱신
- OWASP API Security Top 10은 일반 API baseline, ASVS는 검증 baseline으로 유지한다. OWASP GenAI Security Project의 2026 LLM Top 10/Agent Control Standard는 계획된 economy-AI/agent lane에 한해 추가 적용한다. model/tool 권한, prompt/data provenance, bounded tool permission, output validation, model/dataset supply-chain, secret isolation, auditability, deterministic economy arbitration을 필수화한다. AI는 ledger/balance/entitlement를 직접 변경하거나 classical safety lane을 우회할 수 없다.
- AI 간 불일치, 모델 장애, 잘못된 출력, 만료 proposal, provenance 누락은 `NO_OP`/shadow/human review로 귀결하며 조용히 실경제 동작으로 승격하지 않는다.

### 수익성/사업성 갱신
- Google Play 현재 서비스 수수료는 market/cohort/program 의존적이다. EEA/UK/US 새 요율은 이미 시행 중이고 나머지 시장은 각 rollout 전까지 해당 기존/program 조건을 사용한다. SKU 모델은 market × effective-date/install-cohort × transaction-type × billing-path × programme 키를 유지한다.
- 실측하지 않은 conversion, ARPU/ARPDAU/ARPPU, churn, refund, CAC, LTV는 사실값으로 승격하지 않는다. release-control/backup/status 작업은 임의 매출이 아니라 회피된 downtime/fraud/refund/support/operator 비용으로 평가한다.

### v155 worklog
- 확인 근거: Google Search Central 9월 최신 글과 8월 site reputation 변경, Google favicon 가이드, Google European Search Dataset Licensing Program, OWASP API/ASVS 및 GenAI 2026 기준, Google Play 현재 수수료 문서, 최신 GitHub main/Actions.
- 이번 기획 통합은 runtime code, DB, Flux, Production을 변경하지 않는다. 우선순위는 P0 release truth → 독립 restore 증거 → false-green status → privileged recovery cleanup → migration/Work-clock 무결성 → repository enforcement → economy/admin/casino 권한 → core correctness → monetization → SEO/growth/accessibility 순서를 유지한다.


## v2026.09.16.156 — 카지노 런타임 장애·릴리스 호스트 위생 갱신

### CASINO-RUNTIME-156-01 — HIGH — FIX MERGED / PRODUCTION REVERIFY REQUIRED
- 2026-09-16 운영 증거: 카지노 조작 후 전체 오류 경계로 이동할 수 있었고 digest `3286936712@E352`는 `A "use server" file can only export async functions, found object.`에 대응했다. 원인 수정은 `main` `23ae36082b8a4875797314682efef8e99b8b9484` (#383)에 병합됐다. `CasinoPlayState`/`CASINO_IDLE`을 client-safe 모듈로 이동하고 `use server` 파일의 동기 재내보내기를 제거했으며 non-async runtime export를 차단하는 정적 회귀 테스트를 추가했다.
- 영향은 카지노 브라우저 플레이/복구 UX이며 정산 권위, 원장, 잔액, DB 스키마는 변경하지 않았다. 모호한 브라우저 실패 후 중복 베팅을 유도하지 않는다. 새 제출 전에 서버 권위 최근 게임 기록과 지갑을 읽어 확정 결과를 확인하고 replay는 멱등성으로 방어한다.
- QA: 병합 증거는 카지노 14/14, typecheck 통과, ESLint 오류 0/무관 경고 11, production build 통과다. current-main Build Test Candidate #749는 아직 실행 중이므로 exact-main Test/Production 검증 완료가 아니다. exact SHA Test, API/사용자 흐름, duplicate-submit/idempotency negative case, 공개 runtime SHA, Production smoke와 해당 server-action 오류 0건이 수용조건이다.

### OPS-CACHE-156-01 — HIGH — MITIGATED RUNTIME / PERMANENT FIX TODO
- 활성 Debian frontend는 `debian` 사용자로 실행되지만 `.next/cache/fetch-cache`에 root 소유 파일이 있어 반복 `EACCES`가 발생했다. 운영에서 `debian:debian`으로 소유권을 복구했으며 회원/원장/정산 데이터는 변경하지 않았다.
- 영구 수정: release assembly/service startup이 root 권한으로 writable runtime path를 생성하지 못하게 한다. pre-start에서 uid/gid와 cache/temp/upload writable path를 검증하고 immutable release 파일은 read-only, mutable cache는 명시적 runtime-owned directory로 분리한다. 불일치 시 트래픽 투입 전에 배포 실패 처리한다.
- 테스트/관측: clean-host install, upgrade, rollback, restart, cache rebuild를 검증하고 runtime path `EACCES` 0건을 요구한다. permission-denied/cache-write failure rate를 경보한다. 롤백은 마지막 verified release와 ownership manifest를 복구하며 `chmod -R 777`은 금지한다.

### 외부근거·사업성 결정 갱신
- Google Search Central 2026-09-08/09-14 글은 행사 공지이므로 crawl/index 정책을 변경하지 않는다. 2026-08-28 site reputation policy는 sponsor/affiliate/UGC 거버넌스에 계속 적용한다. favicon은 crawlable homepage/favicon, stable URL, square asset 계약을 유지한다.
- OWASP API Security Top 10은 일반 API baseline이며 계획된 economy-AI lane에는 v155에서 정한 OWASP GenAI 2026 통제를 추가 적용한다.
- Google Play 수수료는 market/cohort/program/effective-date별로 모델링한다. 아직 새 일정이 시행되지 않은 시장에 EEA/UK/US new-install 요율을 선적용하지 않는다. 실측하지 않은 사업 지표는 가설/테스트 기준이다.

### v156 worklog
- 확인: Google Search Central 9월 글과 8월 site-reputation 변경, favicon 가이드, OWASP API/GenAI 최신 기준, Google Play 현재 수수료 문서, 최신 GitHub main, 병합 #383, open #382/#381, exact-main Actions.
- 이번 자동화는 문서만 변경한다. runtime code/DB/Flux/Production 승격은 수행하지 않았다. 우선순위는 release truth/restore/status P0 이후 cache/recovery/migration/authorization HIGH, 그 다음 기능 확장이다.

## v2026.09.16.157 — 카지노 계약 정확성·릴리스 진실성 갱신

### CASINO-CONTRACT-157-01 — HIGH — FIX MERGED / EXACT-SHA REVERIFY REQUIRED
- 최초/최근 증거: 2026-09-16 병합 PR #384, 현재 `main` `f6fd312025dcb9c517edfa2ad4986de0db1df54d`. 포맷된 베팅액이 `wholeAmount()`에서 문자열이 되었으나 카지노 DTO는 의도적으로 JSON 정수만 허용해 10 WLD 같은 정상 베팅도 HTTP 400이 됐다. 병합 수정은 bounded stake를 JSON number로 전송하고 주사위 홀짝/숫자 서버결과 시각 단계를 추가했다. PR 증거는 frontend 609 tests, backend casino E2E 29 tests, typecheck/production build 통과, lint 오류 0(기존 image warning 11)이다.
- 사용자/UX 계약: 카지노 진입 → 게임 선택 → 베팅액 입력 → 명시적 플레이 CTA → 중복 CTA가 비활성화된 pending → 서버 권위 결과 → 지갑/최근 플레이 대사. 빈 값, 비정수, 서버 최소/최대 초과, 잔액부족, timeout, 4xx 검증, 401/403 인증, 409 멱등 충돌, 5xx를 서로 다른 복구 상태로 표시한다. 결과가 모호한 timeout/5xx에서는 최근 권위 플레이와 지갑을 대사하기 전 재베팅을 유도하지 않는다.
- API 계약: numeric JSON 변환은 어댑터 책임일 뿐 서버는 정수/범위/잔액/자격/세션/rate-limit/idempotency의 권위다. API를 의도적으로 versioning하지 않는 한 numeric string은 계속 거부한다. JavaScript safe-integer 범위를 넘는 금액을 `Number`로 변환하지 않으며, 카지노 허용 베팅 상한이 안전범위임을 증명하거나 string-safe money DTO를 versioned 계약으로 종단간 사용한다.
- DB/동시성: 정산은 actor/idempotency uniqueness, balance/ledger invariant, append-only audit를 포함한 하나의 transaction이다. 같은 idempotency key의 동시 중복 요청은 같은 권위 결과를 반환/복구하고, 서로 다른 동시 요청도 서버 잔액·한도 검사를 통해 음수잔액/중복지급을 막는다.
- 보안/악용: 카지노 플레이를 OWASP sensitive business flow로 취급한다. BOLA/BFLA, replay, 자동화/resource abuse, 결과/지급 위조, client odds/stake authority, 로그 누출을 차단한다. 비정상 요청속도, duplicate-key conflict, validation failure 급증, payout/ledger reconciliation mismatch를 탐지한다. 실제 현금·환전·도박수익 표현은 도입하지 않는다.
- 마이그레이션/롤백: 이 어댑터 수정에는 schema migration이 없다. 마지막 verified immutable frontend/backend pair로 rollback하며 계약 불일치가 재발하면 서버 DTO 검증을 약화하지 않고 casino play를 feature flag로 중지한다.
- QA: min-1/min/min+1/max-1/max/max+1, 포맷 입력, 소수/음수/0/초대형 정수, numeric string 직접 API negative, 잔액부족, 세션만료, double click, timeout retry, concurrent bets, 모든 dice 결과, keyboard/screen-reader pending/result 알림, mobile/tablet/desktop, wallet/recent-play 대사, real PostgreSQL ledger invariant를 검증한다.
- 운영승격: current-main CI만으로 부족하다. 캡처 시 exact-main `Build Production Release #888`은 `in_progress`였다. exact `f6fd312...` isolated Test lineage, backend/API/DB/casino QA, public exact SHA, Production smoke 후 예상 밖 casino HTTP-400 contract failure와 settlement reconciliation alert 0건이어야 DONE이다.
- KPI/사업성: 직접매출은 가정하지 않는다. play-start→accepted-play conversion, validation-error rate, ambiguous-result CS, D1/D7 casino return, fraud/reconciliation loss, support cost를 본다. 수익화는 별도 법률/제품 검토이며 정확성을 플레이 빈도 증가와 교환하지 않는다.

### REL-EVIDENCE-157-01 — P0 — IN PROGRESS
- exact current main의 `Build Production Release #888`은 캡처 시 실행 중이다. source commit → CI → immutable image digest → GitOps desired → applied revision → workload digest → pod-local version → public Test version → backend readiness → authoritative DB/schema → changed-feature QA → main exact retest → Production promotion/smoke를 서로 다른 증거 상태로 유지한다.
- 성공/실패 bundle은 expected/observed SHA/digest/revision, workload generation, 최초 불일치 계층, timestamp/latency, rollback target을 기록한다. secret/cookie/Authorization/DSN/private key는 금지한다. P0 증거가 누락·오류·stale이면 pass가 아니라 `BLOCKED`다.
- 저장소 보호도 미충족이다. 현재 `main` metadata는 protection enabled지만 required-status-check enforcement `off`, required contexts/checks 비어 있음이다. runtime 경로는 신뢰된 required checks와 reviewed integration을 저장소에서 강제하되 docs 자동화가 runtime bypass가 되지 않게 한다.

### SEO·보안·수익성 레퍼런스 결정
- Google Search Central 2026-09-08/09-14 글은 행사 공지라 crawl/index 계약을 바꾸지 않는다. 09-08 regional Search experience 문서는 참고용이며 Moneyverse 가상주식/WDX를 EEA finance carousel을 노린 실제 금융정보 provider처럼 표현하지 않는다. 2026-08-28 site-reputation 정책은 sponsor/affiliate/UGC 거버넌스에 계속 직접 적용한다.
- favicon QA는 현재 Google 기준인 crawlable homepage/favicon, stable URL, square asset, 권장 48×48 초과를 따른다. public SEO read-model/canonical/robots/sitemap/lastModified/structured-data/hreflang/SSR 또는 동등 server output/CWV와 private/account/admin/transaction noindex 계약을 유지한다.
- 보안 baseline은 OWASP ASVS 5.0.0 + API Security Top 10이다. 카지노에는 sensitive-business-flow/replay/resource-abuse 통제를 명시하고 인증/session/admin/economy/upload/SSRF/BOLA/BFLA/least-privilege/audit/backup gate는 fail-closed다.
- Google Play 수수료는 단일율이 아니다. unit economics key는 `market × effective-date/install-cohort × transaction-type × billing-path × programme`이다. EEA/UK/US는 2026-06-30부터 현재 standard 예시로 자동갱신 구독 10%, 기타 new-install 20%, 기타 existing-install 25%이며 Play Billing 적용 시 5% billing fee가 붙는다. 아직 rollout 전인 시장은 현재 적용 program 규칙을 사용한다. 실측하지 않은 conversion/ARPU/ARPDAU/ARPPU/churn/refund/CAC/LTV는 `HYPOTHESIS`/`TEST TARGET`이다.

### v157 worklog 및 구현 백로그
- 외부 조사: Google Search Central 9월 update/site-reputation/favicon/regional Search 문서, OWASP baseline, Google Play 현재 수수료. 런타임/코드 증거: current main, PR #384, Actions #888, branch protection.
- 개발순서: P0 exact-SHA/runtime/DB evidence → 독립 restore 가능한 backup → false-green status → HIGH casino contract exact-runtime 검증 → runtime writable-path ownership → privileged recovery → migration/Work-clock integrity → repository enforcement → economy/admin/casino authorization → core completeness → monetization → SEO/growth/accessibility.
- 기획 자동화는 문서만 변경했다. 구현은 `new branch → tests/CI → isolated exact-SHA Test → backend/API/DB/user-flow QA → main → exact-main retest → Production promotion → smoke/monitoring/rollback` 순서를 유지한다.


## v2026.09.16.157 — 카지노 계약 정확성·릴리스 진실성 갱신

### CASINO-CONTRACT-157-01 — HIGH — FIX MERGED / EXACT-SHA REVERIFY REQUIRED
- 최초/최근 증거: 2026-09-16 병합 PR #384, 현재 `main` `f6fd312025dcb9c517edfa2ad4986de0db1df54d`. 포맷된 베팅액이 `wholeAmount()`에서 문자열이 되었으나 카지노 DTO는 의도적으로 JSON 정수만 허용해 10 WLD 같은 정상 베팅도 HTTP 400이 됐다. 병합 수정은 bounded stake를 JSON number로 전송하고 주사위 홀짝/숫자 서버결과 시각 단계를 추가했다. PR 증거는 frontend 609 tests, backend casino E2E 29 tests, typecheck/production build 통과, lint 오류 0(기존 image warning 11)이다.
- 사용자/UX 계약: 카지노 진입 → 게임 선택 → 베팅액 입력 → 명시적 플레이 CTA → 중복 CTA가 비활성화된 pending → 서버 권위 결과 → 지갑/최근 플레이 대사. 빈 값, 비정수, 서버 최소/최대 초과, 잔액부족, timeout, 4xx 검증, 401/403 인증, 409 멱등 충돌, 5xx를 서로 다른 복구 상태로 표시한다. 결과가 모호한 timeout/5xx에서는 최근 권위 플레이와 지갑을 대사하기 전 재베팅을 유도하지 않는다.
- API 계약: numeric JSON 변환은 어댑터 책임일 뿐 서버는 정수/범위/잔액/자격/세션/rate-limit/idempotency의 권위다. API를 의도적으로 versioning하지 않는 한 numeric string은 계속 거부한다. JavaScript safe-integer 범위를 넘는 금액을 `Number`로 변환하지 않으며, 카지노 허용 베팅 상한이 안전범위임을 증명하거나 string-safe money DTO를 versioned 계약으로 종단간 사용한다.
- DB/동시성: 정산은 actor/idempotency uniqueness, balance/ledger invariant, append-only audit를 포함한 하나의 transaction이다. 같은 idempotency key의 동시 중복 요청은 같은 권위 결과를 반환/복구하고, 서로 다른 동시 요청도 서버 잔액·한도 검사를 통해 음수잔액/중복지급을 막는다.
- 보안/악용: 카지노 플레이를 OWASP sensitive business flow로 취급한다. BOLA/BFLA, replay, 자동화/resource abuse, 결과/지급 위조, client odds/stake authority, 로그 누출을 차단한다. 비정상 요청속도, duplicate-key conflict, validation failure 급증, payout/ledger reconciliation mismatch를 탐지한다. 실제 현금·환전·도박수익 표현은 도입하지 않는다.
- 마이그레이션/롤백: 이 어댑터 수정에는 schema migration이 없다. 마지막 verified immutable frontend/backend pair로 rollback하며 계약 불일치가 재발하면 서버 DTO 검증을 약화하지 않고 casino play를 feature flag로 중지한다.
- QA: min-1/min/min+1/max-1/max/max+1, 포맷 입력, 소수/음수/0/초대형 정수, numeric string 직접 API negative, 잔액부족, 세션만료, double click, timeout retry, concurrent bets, 모든 dice 결과, keyboard/screen-reader pending/result 알림, mobile/tablet/desktop, wallet/recent-play 대사, real PostgreSQL ledger invariant를 검증한다.
- 운영승격: current-main CI만으로 부족하다. 캡처 시 exact-main `Build Production Release #888`은 `in_progress`였다. exact `f6fd312...` isolated Test lineage, backend/API/DB/casino QA, public exact SHA, Production smoke 후 예상 밖 casino HTTP-400 contract failure와 settlement reconciliation alert 0건이어야 DONE이다.
- KPI/사업성: 직접매출은 가정하지 않는다. play-start→accepted-play conversion, validation-error rate, ambiguous-result CS, D1/D7 casino return, fraud/reconciliation loss, support cost를 본다. 수익화는 별도 법률/제품 검토이며 정확성을 플레이 빈도 증가와 교환하지 않는다.

### REL-EVIDENCE-157-01 — P0 — IN PROGRESS
- exact current main의 `Build Production Release #888`은 캡처 시 실행 중이다. source commit → CI → immutable image digest → GitOps desired → applied revision → workload digest → pod-local version → public Test version → backend readiness → authoritative DB/schema → changed-feature QA → main exact retest → Production promotion/smoke를 서로 다른 증거 상태로 유지한다.
- 성공/실패 bundle은 expected/observed SHA/digest/revision, workload generation, 최초 불일치 계층, timestamp/latency, rollback target을 기록한다. secret/cookie/Authorization/DSN/private key는 금지한다. P0 증거가 누락·오류·stale이면 pass가 아니라 `BLOCKED`다.
- 저장소 보호도 미충족이다. 현재 `main` metadata는 protection enabled지만 required-status-check enforcement `off`, required contexts/checks 비어 있음이다. runtime 경로는 신뢰된 required checks와 reviewed integration을 저장소에서 강제하되 docs 자동화가 runtime bypass가 되지 않게 한다.

### SEO·보안·수익성 레퍼런스 결정
- Google Search Central 2026-09-08/09-14 글은 행사 공지라 crawl/index 계약을 바꾸지 않는다. 09-08 regional Search experience 문서는 참고용이며 Moneyverse 가상주식/WDX를 EEA finance carousel을 노린 실제 금융정보 provider처럼 표현하지 않는다. 2026-08-28 site-reputation 정책은 sponsor/affiliate/UGC 거버넌스에 계속 직접 적용한다.
- favicon QA는 현재 Google 기준인 crawlable homepage/favicon, stable URL, square asset, 권장 48×48 초과를 따른다. public SEO read-model/canonical/robots/sitemap/lastModified/structured-data/hreflang/SSR 또는 동등 server output/CWV와 private/account/admin/transaction noindex 계약을 유지한다.
- 보안 baseline은 OWASP ASVS 5.0.0 + API Security Top 10이다. 카지노에는 sensitive-business-flow/replay/resource-abuse 통제를 명시하고 인증/session/admin/economy/upload/SSRF/BOLA/BFLA/least-privilege/audit/backup gate는 fail-closed다.
- Google Play 수수료는 단일율이 아니다. unit economics key는 `market × effective-date/install-cohort × transaction-type × billing-path × programme`이다. EEA/UK/US는 2026-06-30부터 현재 standard 예시로 자동갱신 구독 10%, 기타 new-install 20%, 기타 existing-install 25%이며 Play Billing 적용 시 5% billing fee가 붙는다. 아직 rollout 전인 시장은 현재 적용 program 규칙을 사용한다. 실측하지 않은 conversion/ARPU/ARPDAU/ARPPU/churn/refund/CAC/LTV는 `HYPOTHESIS`/`TEST TARGET`이다.

### v157 worklog 및 구현 백로그
- 외부 조사: Google Search Central 9월 update/site-reputation/favicon/regional Search 문서, OWASP baseline, Google Play 현재 수수료. 런타임/코드 증거: current main, PR #384, Actions #888, branch protection.
- 개발순서: P0 exact-SHA/runtime/DB evidence → 독립 restore 가능한 backup → false-green status → HIGH casino contract exact-runtime 검증 → runtime writable-path ownership → privileged recovery → migration/Work-clock integrity → repository enforcement → economy/admin/casino authorization → core completeness → monetization → SEO/growth/accessibility.
- 기획 자동화는 문서만 변경했다. 구현은 `new branch → tests/CI → isolated exact-SHA Test → backend/API/DB/user-flow QA → main → exact-main retest → Production promotion → smoke/monitoring/rollback` 순서를 유지한다.


## v2026.09.16.158 — 반복 릴리스 게이트 실패·크롤러 식별·한국 수수료 시행일 갱신

### REL-EVIDENCE-158-01 — P0 — BLOCKED / 원인 제거 필수
- 최초/최근 재현: isolated Test exact-SHA 게이트 실패가 반복됐고 최신 확정 재현은 2026-09-16 runtime 후보 `f6fd312025dcb9c517edfa2ad4986de0db1df54d`의 Production Release #888이다. immutable SHA 결정은 성공했지만 `https://test.easy-scraping.com/api/version`을 15초 간격 60회 확인한 뒤 13:10:08Z `isolated test never served exact SHA ...`로 종료됐고 Production build는 skipped됐다. 반복 BLOCKED이므로 단순 timeout이 아니라 원인 제거 백로그로 승격한다.
- 영향/severity: 카지노 계약 수정까지 포함한 모든 변경의 P0 승격 차단이다. source/PR test green은 Test Service가 해당 candidate를 실제 라우팅한다는 증거가 아니며, 원인을 제거하지 않은 승격은 stale code/wrong image/wrong DB/false-green 위험이 있다.
- 증거 설계: 매 시도마다 `{release_sha, candidate_backend_digest, candidate_frontend_digest, gitops_desired_revision, flux_applied_revision, deployment_generation, replicaset_uid, pod_uid, pod_image_digest, pod_local_version, service_endpoint_set, ingress_target, public_test_version, backend_ready, db_identity_hash, schema_migration_head, probe_at, latency_ms, first_mismatch_layer}`를 machine-readable로 보존한다. secret/cookie/Authorization/DSN/private key는 금지한다.
- 원인 결정 트리: candidate digest 없음=build/publish, desired stale=GitOps writer, desired!=applied=Flux reconcile/auth/source, applied 정상+workload stale=rollout/imagePull/deployment, Pod 정상+Service stale=selector/readiness, Service 정상+public stale=ingress/CDN/cache/routing, public SHA 정상+catalog/readiness/DB 실패=backend/DB authority 문제로 분류한다. 최종 timeout만 출력하지 말고 최초 실패 계층을 출력한다.
- 수정 백로그: Infra는 reconciliation 전후 probe와 immutable digest assertion, API는 build SHA+DB identity hash에 묶인 비밀 없는 version/readiness, DB는 credential 대신 least-privilege schema/migration-head assertion, observability는 계층별 convergence latency/mismatch counter, workflow는 실패 시에도 evidence bundle upload를 구현한다. evidence 형식 자체는 운영 evidence table을 택하지 않는 한 schema migration이 필요 없으며 우선 immutable workflow artifact/object storage를 사용한다.
- 롤백/fallback: SHA 비교를 약화하거나 timeout만 늘리는 것을 해결책으로 삼지 않는다. Production은 마지막 verified immutable frontend/backend pair를 유지한다. Test 수렴 전 위험 기능은 server-authoritative feature flag로 닫고 authorization/DTO validation/ledger constraint/DB identity 검사를 완화하지 않는다.
- 테스트: evidence serializer/redaction 단위시험, 각 mismatch 계층 synthetic workflow test, desired→applied 통합시험, cluster/service/ingress routing, real PostgreSQL DB identity/schema-head, stale-cache/wrong-selector negative, evidence secret 누출 보안시험, 실패/timeout에도 bundle 생성+Production build 미실행 회귀시험을 수행한다.
- Test 수용: candidate digest 실행, pod-local/public Test SHA=requested release, backend readiness/catalog=권위 Test DB 정상, Test `noindex`, 모든 계층에 fresh timestamp가 있어야 한다. Production 승격은 동일 candidate lineage+current-main exact retest+changed-feature QA+미해결 P0/HIGH gate 없음이 조건이다.

### CI-158-02 — HIGH — IN PROGRESS / 릴리스 증거 아님
- 현재 exact main은 문서 commit `88452f14ca344ee1d060b58b84953599bf657538`. Build Test Candidate #755의 `verify/check`는 secret rejection, lint, raw-control-byte 검사, typecheck, build, DB migration 적용, tests, Prisma schema mutation 차단, production dependency audit까지 성공했다. 캡처 시 backend candidate push는 성공했고 frontend candidate image build는 진행 중이다.
- `VERIFY_GREEN`, `BACKEND_IMAGE_BUILT`, `FRONTEND_IMAGE_PENDING`을 분리한다. 어느 것도 `TEST_APPLIED`, `TEST_PUBLIC_EXACT`, `DB_VERIFIED`, `CHANGED_FLOW_QA_GREEN`, `PRODUCTION_VERIFIED`를 의미하지 않는다. 상태 API/대시보드는 downstream 필수 상태가 없을 때 aggregate green을 만들지 않는다.

### SEO-CRAWLER-158-03 — P1 — 설계 갱신 / 구현 미검증
- 2026-09-16 Google Search Central 문서 변경 로그는 `GoogleProducer` HTTP User-Agent 문자열 갱신을 기록했다. 따라서 crawler 분류를 고정된 전체 UA 문자열에 의존시키지 않는다. crawler identity가 필요한 경우 Google의 공식 검증 방법을 따르며, 일반 익명 HTTP client와 다른 privileged/indexable content를 crawler에게만 제공하지 않는다.
- SEO backend crawler 관측에는 정규화 bot family, 제한 보존/마스킹된 raw UA, verification 결과, canonical URL, HTTP status, robots directive, canonical, render mode, cache status, latency를 저장한다. UA 매칭으로 인증/noindex를 우회하지 않는다. 알려진 crawler 검증의 체계적 실패 또는 rendering-critical asset 차단을 경보한다.
- 공개 페이지 QA는 canonical/robots/sitemap/lastModified/hreflang/structured data/server-rendered primary content/rendering resource/CWV 계약을 유지한다. 계정/관리자/payment callback/private transaction/private casino history는 sitemap 제외+`noindex`다.

### MONETIZATION-158-04 — P1 — 한국 시행일 기반 unit economics
- Google Play 현재 공식 문서상 new install-cohort 수수료 구조의 한국 rollout은 2026-12-31이다. 그 전까지 한국은 기존 규칙을 적용하며 예를 들어 자동갱신 구독은 15%, 15% tier 적격 개발자는 연 USD 1M까지 15%, 초과분 30%다. 한국 alternative billing은 프로그램 조건에 따라 해당 Play 수수료에서 4%p 감소한다. 2026년 9월 전망에 미래 KR 10%/20%/25% cohort 표를 이미 시행된 것처럼 사용하지 않는다.
- unit-economics engine은 모든 유료 SKU를 `market + transaction_at + install_cohort_if_applicable + recurring/nonrecurring + billing_path + enrolled_programme + tax/refund/fraud assumptions`로 계산하고 forecast에 사용한 fee-policy version/effective date를 저장한다. 실측 없는 attach rate/paid conversion/ARPU/ARPDAU/ARPPU/refund/churn/CAC/LTV는 `HYPOTHESIS`/`TEST TARGET`이다.
- guardrail: 해당 시장에서 아직 시행되지 않은 fee regime으로 contribution margin을 계산한 pricing experiment는 출시하지 않는다. KR rollout 시 낙관/기준/보수 시나리오를 재계산하고 매출 증가를 churn/refund/support/trust 비용과 비교한다.

### v158 worklog
- 최신 조사: Google Search Central 2026년 9월 변경/블로그, favicon/site-reputation 기준, Google Play 현재 수수료/rollout, OWASP/ASVS baseline을 재대조했다. 2026-09-16 crawler identity 운영 영향과 한국 수수료 시행일 guardrail을 채택했고 행사 공지는 SEO 알고리즘 변경으로 취급하지 않았다.
- runtime/QA/CI: main `88452f14...`, #888의 exact-Test SHA 실패와 Production build skip, #755 verify/check green 및 frontend candidate build 진행 상태를 확인했다. Production 성공을 추론하지 않는다.
- 개발 연결: P0 release evidence/root-cause 제거가 casino Production 재검증과 신규 기능보다 우선이다. 이번 자동화는 문서만 변경하며 runtime/DB/Flux/Production 승격은 수행하지 않는다.

## v2026.09.16.159 — 직업 일/주간 초기화 권위 수렴

### WORK-CLOCK-149-01 — HIGH — 구현 완료 / exact-SHA Test 필요
- 새 forward migration `203-work-reset-convergence.sql`로 남은 read-model 시간축 분리를 수정한다. 적용된 migration 202는 수정하거나 번호를 바꾸지 않는다.
- Work settlement, task board, reward preview, dashboard가 모두 `server_game_day_*` / `server_game_week_*` 권위를 공유한다. 게임 1일은 현실 600초이며 7게임일 주간은 현실 70분이다.
- `GET /api/v1/work`에 권위 있는 `game_day_key`, `game_week_key`, `day_ends_at`, `week_ends_at`을 추가하고 `/work`는 서버값으로 일/주간 지급 WLD, 잔여 한도, 정확한 다음 초기화 시각을 표시한다.
- task 일일, 회원 일일, 회원 주간 한도 도달 시 실행을 fail-closed한다. reward preview도 settlement와 동일한 현재 게임시간 창과 cap을 사용해 실제 정산에서 거절/감액될 금액을 미리 약속하지 않는다.
- 모바일 API 계약을 `v2026.09.16.159`로 올리고 TypeScript 컴파일러 내부 `__@...` 심볼 속성을 생성 계약에서 제외해 관련 없는 타입 그래프 변경이 공개 JSON 응답 스키마를 흔들지 않게 한다.
- isolated PostgreSQL에서 migration 203과 Work/clock 실DB 15개 테스트를 통과했다. 현실 10분 day, 70분 week rollover, timezone 독립성, task/global cap, 직업 전환, 멱등성/무결성, preview/지급/dashboard 일치를 검증했다. 로컬 DB package 7/7, backend 871, frontend 612, lint 오류 0, typecheck, production build도 통과했다.
- GitHub CI, exact-head Test 수렴, 권위 DB backup/migration, Production smoke 전에는 운영 완료로 선언하지 않는다. v158의 P0 release-evidence gate를 이 수정 때문에 완화하지 않는다.


## v2026.09.16.160 — 로컬 이중 모델 경제 AI 운영 활성화

### ECON-AI-160-01 — IMPLEMENTED / RUNTIME-CONFIG ACTIVATION
- 런타임 권위는 승인된 Debian 13 systemd/PostgreSQL 경로를 유지한다. 이번 작업은 최신 application `main`을 운영에 배포한 것이 아니다. 공개 Production은 이미 이중 경제 AI reviewer를 포함한 application SHA `be218f0403372689dbdf8af9bf8700264f39348f`를 계속 제공했고, 문서 통합만 application main `03a8ae9c5313d0915589691afc6fff022323c305` 위에 rebase했다.
- Production `economy_ai_policy_review`를 감사 가능한 `admin_set_feature_switch` 경로로 enabled 처리했다. 최초 provisional v159 라벨 뒤 동시 작업이 main의 v159를 먼저 사용해 v160으로 버전 정정을 남겼다. 정정 시 상태는 `enabled -> enabled`이며 기존 이력을 덮어쓰지 않고 별도 receipt/audit 사유를 추가했다.
- 로컬 inference는 `127.0.0.1:11434` localhost에만 바인딩하고 runtime/model은 `/srv/moneyverse-data/ai`에 둔다. A 좌석은 `llama3.2:3b`, B 좌석은 `gemma3:1b`이다. `qwen2.5:3b`는 confidence `0..1` 출력 계약을 위반해 운영 프로필에서 제외했다.
- 자원 경계는 병렬요청 1, 최대 상주모델 2, keep-alive 2분, `MemoryHigh=6G`, `MemoryMax=7G`, Ollama cloud 비활성화이며 제한된 시스템 디스크에는 모델 weight를 저장하지 않는다.
- 백엔드는 OpenAI-compatible 로컬 endpoint, 호출당 timeout 180초, concurrency 1, exact-result cache 300초, review TTL 120분을 사용한다. secret은 Git에 넣지 않고 비민감 service/config template만 저장한다.

### Test/Production 증거와 안전 계약
- 기존 economy reviewer 단위시험 10/10 통과. 선택한 두 모델 모두 `decision`, `0..1` confidence, rationale, risks 계약을 만족했다.
- 검증은 배포된 `test-be218f040337` application release와 권위 Test PostgreSQL을 사용했다. 공개 Test route도 `be218f...`를 반환하므로 current-main exact-SHA Test 수렴을 주장하지 않으며 `REL-EVIDENCE-158-01`은 종료하지 않는다.
- 격리 Test에서 실제 모델 호출과 Test PostgreSQL을 사용해 4개 routed domain/8개 seat call, append-only review 저장, scoreboard, exact-hash `dual_agree`, exact-only `ai_veto`, 변경 proposal `ai_missing_classical_fallback`, 모델 미설정 `unconfigured_classical_fallback`을 검증했다. application role의 직접 table read는 계속 거부됐다.
- 활성화 후 첫 Production reviewer 점검은 약 40ms 안에 `no_eligible_classical_proposal`로 끝나 model council, review row, 정책값 변경이 모두 없었다. Production backend/AI service는 active였고 공개 홈은 HTTP 200이었다.
- 결정론/classical 엔진이 회계와 정책 권위다. AI는 review append와 exact matching proposal veto만 가능하다. AI 증거가 누락·만료·불일치·장애·abstain이면 대체값을 만들지 않고 classical lane으로 fallback한다.
- rollback은 fail-safe다. 감사 함수로 switch를 `disabled`로 바꾸고 필요 시 backend AI runtime 변수를 복원/제거한 뒤 backend 재시작, 미사용 시 local inference 중지/비활성화 순서다. AI 가용성을 위해 결정론 검증·원장대사·exact-proposal matching을 약화하지 않는다.
- 모니터링은 feature switch, reviewer outcome, council decision mix, confidence, latency/token, service memory/restart, backend error, economy reconciliation을 본다. 모델 품질저하는 결정론 gate 우회 사유가 아니라 운영 incident다.


## v2026.09.16.161 — 관리자 내비게이션 완전성 및 현재 릴리스 증거

### ADMIN-NAV-161-01 — HIGH — MAIN 구현 / EXACT-SHA TEST 필요
- 증거: 현재 main `7acc3c02e4fc015d6800f2d5a7e51180f2dc02a5`는 PR #390을 통합했다. 원인은 독립 관리되던 두 관리자 목록의 drift다. `AdminSubNav`에는 보안·사업/시즌·작업/직업·Discord가, `ADMIN_AREAS`에는 문의·상점이 누락됐다. 운영도 같은 불완전한 상단 내비게이션을 제공했으므로 백엔드 미구현이 아니라 프론트 탐색/목록 결함이다.
- 사용자/권한 계약: 기존 관리자 권한 경계를 유지한다. 메뉴 노출은 권한 부여가 아니며 각 목적지는 서버에서 관리자 actor/session, 필요한 최근 재인증/2차 인증, function/object authorization, 특권·경제 변경 감사로그를 독립 검증한다. 숨은 URL을 접근통제로 사용하지 않는다.
- UX: `/admin` 대시보드와 상단 메뉴는 하나의 canonical area registry를 공유한다. Dashboard, Users, Security, Economy, Business/Season, Work/Jobs, Shop, Support, Discord 등 현재 등록된 1급 영역은 모두 도달 가능해야 하고 activity/delivery/integrity/AI-news/scenario는 부모 아래 유지한다. 모바일은 접근 가능한 overflow/menu, 데스크톱은 탭을 허용하되 목적지를 누락하지 않는다. 현재 위치, 키보드 포커스, 스크린리더 이름/상태, loading/error/403/404/stale-session 재인증 상태를 명시한다.
- 프론트/백엔드/API/DB: registry는 stable route id, 다국어 label, route, required capability, optional badge source를 가진다. badge API 장애가 메뉴를 숨기면 안 된다. 이번 수정에 DB migration은 없다. capability 판정은 backend 권위이며 client registry에 경제 권한 로직을 복제하지 않는다.
- 보안/악용: 비관리자 direct URL, stale admin session, 부족한 capability, mutation CSRF, BOLA/BFLA, audit actor 무결성을 negative test한다. 내비게이션 telemetry에는 secret/session/private payload를 기록하지 않는다. 관리자 경로는 `noindex` 및 sitemap 제외이며 crawler 신원으로 권한을 우회하지 않는다.
- QA 증거: 병합 업데이트는 local typecheck/build/lint 0 error(기존 image warning 11), frontend 68 files/611 tests, backend non-DB 871 tests를 기록하지만 로컬 DB 환경 부재로 DB 351 tests가 skip됐다. 따라서 registry completeness, route→capability, keyboard/mobile E2E, 403/reauth, DB-backed admin mutation, Test HTML 전체 top-level 목적지 검증이 승격 전 필수다.
- 수용/승격: exact `7acc3c02...` candidate의 DB 포함 CI, isolated Test 동일 SHA/digest, backend/database readiness/catalog, 권한 있는 Test admin의 모든 등록 영역 접근과 권한 비확대가 필요하다. Production smoke에서도 route inventory와 authorization negative를 반복한다. 실패 시 마지막 verified immutable pair로 롤백하거나 해당 관리자 surface만 닫으며 권한을 완화하지 않는다.
- 관측/사업성: `admin_nav_view`, `admin_area_open`, `admin_area_403`, `admin_reauth_required`, route-not-found, badge-failure를 제한된 pseudonymous actor 기준으로 집계한다. 직접 매출 기능이 아니라 운영비/사고대응 효율 기능이다. median time-to-area, navigation failure, admin task completion, support burden, incident-response time을 본다. completeness 100%와 오류/지원비 감소 시 SCALE, 접근성/탐색 마찰은 ITERATE, 권한 확대나 거짓 접근 신호가 생기면 KILL/ROLLBACK한다.

### REL-EVIDENCE-161-02 — P0 — IN PROGRESS
- 확인 시 `Build Production Release #904`는 exact main `7acc3c02e4fc015d6800f2d5a7e51180f2dc02a5`를 대상으로 실행 중이다. immutable SHA resolve는 성공했고 isolated Test exact-SHA/backend/database gate는 진행 중이다. Test/Production 성공으로 판정하지 않는다.
- v158의 candidate digest → GitOps desired/applied → workload generation/digest → Service/ingress → pod-local/public Test SHA → backend readiness → DB identity/schema head → changed-flow QA 증거계약을 그대로 적용한다. 누락 계층은 BLOCKED이고 실패 시 first-mismatch를 보존한다. branch protection의 required-status-check enforcement가 `off`, contexts/checks가 비어 있어 repository enforcement도 HIGH로 유지한다.

### SEO·보안·수익성 결정 — 2026-09-16 재검증
- Google Search Central의 2026-09-14 최신 블로그는 행사 공지이며 crawl/index 알고리즘 변경으로 채택하지 않는다. 9월 문서 변경 로그의 지역별 Search experience와 2026-09-16 `GoogleProducer` UA 변경은 운영계약에 반영한다. full UA 고정 매칭에 의존하지 않고 crawler 신원으로 auth/noindex를 우회하지 않는다. 2026-08-28 site-reputation 정책은 sponsor/affiliate/UGC에 유지하고 favicon은 crawlable homepage/file, stable URL, square asset 계약을 유지한다.
- OWASP API Security Top 10 최신 버전은 2023이며 ASVS를 구현 검증 baseline으로 유지한다. 관리자 내비게이션은 BFLA/BOLA, 인증/세션, CSRF, 감사통제를 적용한다. Economy AI는 OWASP GenAI 2026/Agent Control lane을 추가 적용하되 deterministic 경제 권위를 대체하지 않는다.
- Google Play 수수료는 단일률이 아니므로 market/effective date/install cohort(적용 시)/transaction type/billing path/programme별 unit economics를 유지한다. 실측되지 않은 conversion, ARPU/ARPDAU/ARPPU, churn, refund, CAC, LTV는 `HYPOTHESIS`/`TEST TARGET`이다.

### v161 worklog
- 최신 외부자료: Google Search Central 2026년 9월 blog/update/site-reputation/favicon, OWASP API Security/ASVS 및 GenAI 2026, Google Play 현행 수수료 문서. 행사 공지를 랭킹 변경으로 오인하지 않았다.
- 코드/QA/운영: 최신 main과 v160 EN/KO 문서를 재확인하고 #390 원인·로컬 검증, branch protection, Production Release #904를 대조했다. 통합 직전 main도 재확인한다.
- 작업순서: P0 release truth/evidence → 독립 restore 증거 → false-green 제거 → HIGH 관리자 exact-SHA/authorization QA → casino/runtime/cache/privileged recovery → migration integrity → repository enforcement → core correctness → monetization → SEO/growth/accessibility. 기획 자동화는 문서만 변경한다.


## 통합 증거 — v2026.09.17.162 Production exact-SHA 수렴

- 릴리스 권위: 완료 처리 전에 애플리케이션 `main`, 격리 Test, Production, GitOps Production desired state가 동일 immutable SHA로 수렴해야 한다.
- 검증 릴리스: `18c7a1324013099e47b2d6e22c5108c4d378139c`. Production release workflow `35113806254`와 인프라 reconcile `35117875121`이 성공했다.
- DB 게이트: `203-work-reset-convergence.sql` 적용 전에 Production 백업을 생성했고 migration은 immutable checksum과 함께 기록됐다.
- 현재 공개 edge 제약: Nginx는 아직 host systemd 서비스(Production `3000/3001`, Test `3100/3101`)를 사용한다. GitOps manifest 성공만으로 충분하지 않으며 host runtime과 공개 `/api/version`, catalog/status, SEO probe도 함께 수렴해야 한다.
- 승격 뒤 경제 제어: `economy_ai_policy_review`, `economy_auto_policy`는 enabled를 유지하고 로컬 A/B 추론 서비스는 결정론적 회계 권위를 대체하지 않는 advisory/veto lane으로 유지된다.


## v2026.09.17.163 — 문서 전용 main의 릴리스 자격과 게이트 정확성

### REL-DOCS-163-01 — P0 — OPEN / 근본원인 제거 필요
- 최초/최근 재현: 2026-09-17. 문서 전용 PR #393으로 `main`이 검증된 애플리케이션 SHA `18c7a1324013099e47b2d6e22c5108c4d378139c`에서 문서 커밋 `f3014e67a7cff37eb5c5eb4c92672a93609fbac4`로 전진한 뒤 Build Production Release #907이 `f3014e67...`을 immutable release SHA로 결정했다. 이후 약 15분간 격리 Test가 이 문서 SHA를 제공하기를 기다리다가 exact-SHA gate가 실패했고 Production build는 skip됐다. 이는 신규 CI/릴리스 오케스트레이션 결함이며 기존 `18c7a132...` Production 애플리케이션 런타임 증거를 무효화하지 않는다.
- 영향/severity: 비런타임 커밋만으로 릴리스 자동화가 영구 차단될 수 있고 문서 SHA를 애플리케이션 artifact identity로 잘못 모델링하므로 P0이다. 이를 이유로 exact-SHA 검사를 완화하는 것은 금지한다. 영향 영역은 CI/CD, Test 수렴, Production 승격, 릴리스 증거와 장애대응이며 이번 실패만으로 사용자 런타임 장애가 증명된 것은 아니다.
- 확정 원인 경계: 현재 릴리스 자격 판정이 head가 실제 애플리케이션/runtime build input을 바꾸는지 확인하기 전에 repository `main` head를 배포 identity로 사용한다. 문서 전용 커밋 때문에 이미 실행 중인 Test `/api/version`이 문서 SHA로 바뀌어야 할 정당한 이유는 없다. 즉 repository-history SHA와 deployable application-source SHA라는 서로 다른 identity domain을 비교하고 있다.
- 수정설계: 명시적 `release_source_sha`/`application_source_sha`를 도입한다. 현재 main 이하에서 frontend/backend/shared runtime package, lockfile, migration, container/build 설정 또는 release-relevant infrastructure를 마지막으로 변경한 커밋을 결정론적으로 계산한다. docs/planning/changelog 전용 커밋은 `repository_head_sha`로 추적하되 새 application candidate를 만들지 않는다. path-aware workflow trigger와 별개로 결정론적 eligibility job을 반드시 두고 결과는 `RUNTIME_RELEASE_REQUIRED`, `DOCS_ONLY_NO_RUNTIME_RELEASE`, `RELEASE_INPUT_CLASSIFICATION_ERROR` 중 하나로 한다. 분류 오류는 fail closed다.
- 증거/API/관측성: evidence에는 `repository_head_sha`, `application_source_sha`, changed-path 분류, frontend/backend candidate digest, GitOps desired/applied SHA, 이중 런타임 기간 host-systemd mirror SHA, public `/api/version`, DB migration head/checksum, workflow/run ID를 기록한다. `/api/version`은 애플리케이션 build identity이며 문서 identity가 아니다. dashboard는 docs-head 전진과 runtime freshness를 분리한다. 지표는 `release_docs_only_skip_total`, `release_input_classification_error_total`, `release_source_head_distance`, `test_exact_sha_wait_seconds`, `release_identity_mismatch_total`이다.
- 보안/공급망: path classifier 자체가 repository-controlled security code다. 애매한 경로, lockfile/build tool, migration, secret-reference/config template, container/deployment input 변경은 모두 runtime-relevant로 보고 fail closed한다. 실행 가능한 입력을 docs로 위장해 CI를 우회할 수 없어야 한다. provenance는 candidate digest를 `application_source_sha`에 결합한다. branch protection required-check 문제는 별도 HIGH backlog로 유지한다.
- 마이그레이션/롤백: workflow 수정 자체에는 DB migration이 필요 없다. 이전 workflow로의 롤백은 docs-head deadlock을 재도입하지 않을 때만 허용한다. Production은 마지막 검증 immutable application pair를 유지한다. `/api/version`을 문서 SHA에 맞추려고 의미 없는 rebuild/deploy를 하지 않으며 진짜 runtime release의 equality gate도 완화하지 않는다.
- 테스트: docs/changelog/planning-only, frontend-only, backend-only, shared package, lockfile, migration, Docker/build config, workflow/release config, GitOps config, mixed commit의 unit matrix; merge/multi-commit range, rename/delete, shallow-history fallback; classifier error fail-closed; docs-only main은 Test polling 없이 no-runtime-release evidence로 성공하는 integration; runtime commit은 exact application SHA/digest와 authoritative Test DB를 계속 요구하는 회귀; Test gate 실패 후 build/promotion skip 회귀를 수행한다.
- 수용조건: exact-main docs-only run이 빠르게 `DOCS_ONLY_NO_RUNTIME_RELEASE`로 끝나고 다음 runtime release 승인 전까지 public application SHA `18c7a132...`을 유지하며 완전한 evidence를 남긴다. 이후 synthetic/runtime PR은 여전히 exact `application_source_sha`를 Test → backend/API/DB/user-flow QA → GitOps/host mirror → Production smoke로 증명해야 한다.
- 사업/UX: 직접매출은 0이며 릴리스 차단, 운영자 시간, 불필요 rebuild/deploy, 허위 장애/지원 비용을 줄이는 비용절감 기능이다. test corpus 분류 정확도 100%, docs-only p95 <2분, runtime mutation 0이면 SCALE; 애매한 분류는 ITERATE; runtime-relevant path가 candidate/QA gate를 우회할 수 있으면 즉시 KILL/ROLLBACK한다.

### SEO/보안/수익성 갱신 — 2026-09-17
- Google Search Central의 최신 9월 자료는 새로운 ranking 계약이 아니라 문서/행사 갱신이며 2026-08-28 site-reputation 변경은 sponsor/affiliate/UGC 거버넌스에 계속 직접 적용한다. 공개 SEO 계약은 서버에서 읽을 수 있는 주요 콘텐츠, stable canonical, sitemap/robots 일관성, indexable list의 crawlable pagination, structured-data 검증, 다국어 hreflang, CWV 관측을 유지하고 private/admin/transaction 페이지는 sitemap 제외와 `noindex`를 강제한다.
- OWASP ASVS 5.0은 구현 검증 baseline, API Security Top 10은 API threat discovery baseline으로 유지한다. 새 release classifier는 공급망 보안 영역이므로 애매한 실행 입력은 fail closed하고 provenance가 digest와 application source identity를 결합해야 한다.
- Google Play 현행 수수료는 market/programme/install cohort/transaction type/billing path별로 달라진다. SKU unit economics는 versioned fee policy를 유지하며 실측되지 않은 conversion, ARPU/ARPDAU/ARPPU, churn, refund, CAC, LTV는 `HYPOTHESIS`/`TEST TARGET`이다. 이번 회차에 가격 가정 변경은 없다.

### v163 worklog
- 최신 레퍼런스: Google Search Central 9월 최신 업데이트/site-reputation, OWASP ASVS/API security, Google Play 현행 service-fee 문서를 재확인했다. 근거 없는 ranking·보안인증·매출 주장은 추가하지 않았다.
- 런타임/QA/CI: 시작 및 중간 main은 `f3014e67...`이다. 해당 docs-only exact head의 Build Production Release #907은 `Wait for exact SHA on isolated test and verify backend/database path`에서 실패했고 build는 skip됐다. 이 때문에 REL-DOCS-163-01을 추가하며 기존 `18c7a132...` Production exact-SHA 증거는 유지한다.
- 개발순서: 독립 restore 증거 → false-green 제거 → release identity/classifier 수정 및 dual-runtime 권위 제거 → HIGH auth/admin/casino/Work/DB integrity QA → repository required-check enforcement → 핵심 correctness → 수익화 → SEO/acquisition → retention/accessibility. 이번 기획 변경은 runtime code, DB/Flux, Production을 변경하지 않는다.


## v2026.09.17.164 — docs-head 반복 릴리스 실행 및 crawler/runtime 증거 강화

### REL-DOCS-164-01 — P0 — IN PROGRESS / EXACT MAIN 반복 재현
- 최초 발견: 2026-09-17 REL-DOCS-163-01. 최신 재현: 이번 회차 exact main `4f568afbce37d59612f483ed2c5bf60c6217bf68`. 문서 전용 v163 head인데도 `Build Test Candidate #806`(`35131802624`)이 성공했고, 이어 `Build Production Release #909`(`35132313855`)가 `test-gate`에 진입해 증거 마감 시점에도 exact Test SHA를 기다리고 있었다. CI #1160(`35131803817`)은 성공했다. 즉 현재 workflow에는 release-input classifier/eligibility 수정이 아직 구현되지 않았다는 반복 증거다.
- 재현절차: 변경 경로가 `docs/planning/**`뿐인 commit을 merge → Test candidate workflow가 runtime candidate를 만드는지 확인 → Production Release가 repository head를 application candidate로 해석해 exact-SHA Test polling에 들어가는지 확인한다.
- 영향: 릴리스 처리량, runner/registry 비용, 운영자 alert fatigue, Test 환경 churn, 잘못된 incident 분류, release evidence 무결성. 기존에 검증된 Production application runtime 자체가 장애라는 증거는 아니다.
- 확정 원인: orchestration 동작이 `repository_head_sha == application_source_sha`로 두 identity를 혼동한다. candidate 생성/exact-SHA gate 앞에 권위 있고 테스트된 changed-input classifier가 없다.
- 구현 백로그: (1) FE/BE/shared/lockfile/migration/container/build/deploy/security-config 입력을 버전 관리하는 `release-inputs.yml`; (2) merge-base→head의 rename/delete까지 diff해 `repository_head_sha`, `application_source_sha`, `classification`, `matched_runtime_paths`, `classifier_version`을 내는 결정론적 classifier job; (3) candidate build/Test GitOps/Production Release는 `RUNTIME_RELEASE_REQUIRED`일 때만 실행; (4) `DOCS_ONLY_NO_RUNTIME_RELEASE`는 signed/machine-readable evidence만 남기고 image build/Test mutation/Production promotion 없이 종료; (5) history 부족·unknown path·classifier error는 fail-closed; (6) 운영 UI/evidence에서 문서 freshness와 runtime freshness를 분리한다.
- Evidence/API schema: `releaseEvidence={repositoryHeadSha,applicationSourceSha,classification,classifierVersion,changedPathsHash,backendDigest?,frontendDigest?,testAppliedRevision?,testPublicSha?,productionPublicSha?,dbMigrationHead?,createdAt,workflowRunIds}`. runtime field null은 `DOCS_ONLY_NO_RUNTIME_RELEASE`에서만 허용하며 이유를 명시한다.
- 보안: classifier와 inventory는 supply-chain control이다. CODEOWNERS/review로 classifier/build/deploy workflow/inventory를 보호한다. `.github/workflows/**`, lockfile, Docker/container, migration, runtime config/secret reference, generated runtime artifact, 미분류 executable extension은 runtime-relevant다. docs처럼 보이는 파일명으로 실행 의미를 숨겨 우회할 수 없어야 한다. provenance는 mutable branch가 아니라 `application_source_sha`에 digest를 결합한다.
- migration/rollback: application DB migration 없음. workflow rollback은 runtime input을 계속 fail-closed하는 버전으로만 허용한다. `/api/version`을 docs SHA에 맞추기 위한 synthetic image rebuild/deploy는 금지한다. 실제 runtime candidate가 모든 gate를 통과할 때까지 Production은 마지막 검증 application pair를 유지한다.
- 필수 테스트: docs-only, FE, BE, shared, lockfile, SQL migration, Docker, CI workflow, GitOps, config, mixed, rename/delete, symlink, generated file, merge commit, multi-commit, shallow clone의 table-driven classifier; docs-only에서 registry push/GitOps write/Test polling이 모두 0인 integration fixture; runtime fixture의 exact SHA/digest/DB/user-flow gate; documentation-looking path에 runtime payload를 넣는 security negative fixture.
- Test 수용조건: docs-only p95 <2분, `candidate_images_built=0`, `test_gitops_mutations=0`, `production_mutations=0`, classification evidence 존재, CI 유지. runtime 변경은 exact-SHA/실DB gate를 보존한다. classifier ambiguity면 Production promotion을 차단한다.
- 관측: `release_classification_total{class}`, `release_classifier_error_total`, `docs_only_candidate_build_violation_total=0`, `docs_only_test_poll_violation_total=0`, `release_source_head_distance`, classification별 runner minutes/registry bytes. docs-only runtime mutation은 즉시 alert한다.
- 상태/작업순서: `P0 IN PROGRESS`; release/platform → input inventory security review → classifier unit/integration QA → isolated workflow dry-run → current-main docs-only proof → synthetic runtime proof → REL-DOCS-163/164 동시 종료. 반복 BLOCKED는 신규 기능보다 우선한다.
- 사업효과: 직접매출 0. 절감된 CI runner minute, registry/storage/network, 운영자 시간, release delay를 측정한다. classifier corpus 정확도 100%·bypass 0일 때 SCALE, false-positive는 ITERATE, false-negative/runtime bypass는 KILL/ROLLBACK한다.

### SEO/SEO 백엔드 증분 — crawlable infinite scroll 및 crawler-family 관측
- Google Search 공식 문서는 2026-09-17 infinite-scroll 지침을 현행 문서로 이전했으며 지침 자체는 변경되지 않았다고 밝혔다. indexable Moneyverse community/market/collection/public-search 목록은 사용자 scroll/click을 해야만 검색엔진이 다음 콘텐츠를 발견하는 구조를 금지한다. 각 chunk는 영구·안정 URL(예: bounded absolute `?page=N`), 결정론적 콘텐츠, 순차 crawlable `<a href>` 링크를 갖고 scroll로 주 콘텐츠가 바뀌면 History API로 URL을 갱신한다. 독립 검색가치가 없는 filter는 route policy에 따라 canonical/noindex하고 private/account/admin/transaction은 sitemap 제외+강제 `noindex`다.
- SEO backend는 `{canonicalUrl,page,pageSize,totalPages,prevUrl,nextUrl,updatedAt,indexPolicy}` pagination read-model을 소유하며 hydration 전 SSR HTML에 canonical/robots/breadcrumb/structured-data를 일관되게 출력한다. 범위 초과 page는 empty 200 soft-404가 아니라 canonical 404다. sitemap은 canonical indexable page만 포함하고 `lastModified`는 request 시간이 아니라 의미 있는 공개 콘텐츠 갱신시각을 사용한다.
- Google은 2026-09-16 `GoogleProducer` UA 문자열 변경과 crawler content-encoding 정보도 문서화했다. crawler 분석은 brittle full-UA equality가 아니라 검증된 crawler/fetcher family와 해당되는 공식 token/IP 검증을 사용한다. crawler 분류로 인증·권한·rate safety·`noindex`를 우회하거나 ranking용 primary content를 다르게 제공하지 않는다.
- SEO QA: 대표 pagination route의 JS-off/rendered HTML 및 Search Console URL Inspection, page>1 orphan 0, hydration 전후 canonical 안정성, page-1 alias 중복 0, 불가능 page 404, crawler log에 family/status/canonical/robots/render/cache/latency 기록. KPI는 organic impression→CTR→landing→signup→activation→D7/D30→revenue이며 crawl error/index exclusion/CWV를 guardrail로 둔다.

### 보안·수익성 재검증 — 2026-09-17
- OWASP ASVS 최신 stable은 5.0.0이고 API Security 최신 프로젝트판은 2023이다. API6 sensitive-business-flow abuse는 casino/reward/referral/market/release-control endpoint에 직접 적용한다. 2026 GenAI LLM Top 10/Agent Control Standard는 Economy-AI에 계속 적용하며 모델 출력은 advisory/bounded이고 ledger/balance/entitlement 권위가 될 수 없다.
- Google Play는 단일 보편 수수료가 아니다. 현재 공식표도 시장 rollout, recurring/non-recurring, new/existing install, programme, billing path를 구분한다. 상점/결제/구독 unit economics는 `market × transaction_at × install cohort(if applicable) × transaction type × billing path × programme`별 versioned fee policy를 유지하고 실측 없는 conversion/attach/ARPU/ARPDAU/ARPPU/refund/churn/CAC/LTV는 `가설`/`테스트 기준`이다.

### v164 worklog
- 외부조사 선행: Google Search Central 2026-09-17 infinite-scroll 이전 및 2026-09-16 crawler 변경, OWASP ASVS 5.0.0/API Security 2023/GenAI 2026, Google Play 현행 수수료표를 확인했다. 행사 공지를 ranking 변화로 취급하지 않았다.
- 저장소/runtime/QA: exact main `4f568afb...`, EN/KO v163, 현재 workflow를 읽었다. CI #1160과 Test Candidate #806은 성공했고 docs-only head의 Production Release #909가 exact-SHA test-gate에 진입해 release-identity 결함을 반복 재현했다. Production application 장애 증거로 해석하지 않았다.
- 통합 직전 main을 재확인한다. 우선순위는 독립 restore → stale-status false-green → release classifier/dual-runtime authority → HIGH auth/admin/casino/Work/DB integrity → required-check enforcement → core correctness → monetization → SEO/acquisition → retention/accessibility다. 이번 회차는 문서만 변경하며 runtime/DB/Flux/Production을 직접 변경하지 않는다.


## 19. v2026.09.17.165 증거 동기화 — 문서 전용 변경의 릴리스 부작용이 계속 발생

### 19.1 최신 증거와 적용 판정

- **저장소/런타임 증거(2026-09-17 04:02~04:06 KST):** `main=62c65827b76f6e7d57c66f5954194276aee16d2e`이며 기획문서 전용 커밋이다. main CI `1163`은 성공했지만 `Build Test Candidate #788`과 `Auto Integrate and Promote`는 여전히 `in_progress`였다. 이는 `REL-DOCS-164-01`의 새로운 독립 재현이다. 문서 전용 커밋이 candidate/promotion 자동화에 계속 진입하므로 상태는 **P0 / OPEN / REDESIGN_REQUIRED**이며 CI green을 Test/Production 성공으로 해석하지 않는다.
- **Google Search Central(2026-09-17):** infinite-scroll JavaScript 지침이 현행 문서로 이전됐고 지침 변경은 없었다. **직접채택:** 모든 indexable Moneyverse 목록은 안정적인 chunk/page URL과 crawlable 순차 링크를 제공하며 scroll-only 발견 구조를 금지한다. 2026-09-14 Search Central Live India 글은 행사 공지이므로 ranking/indexing 정책 변경 근거에서 **제외**한다. 2026-08-28 site-reputation 변경은 sponsor/affiliate/UGC 거버넌스에 계속 **직접채택**한다.
- **OWASP(2026-09-17 확인):** ASVS 최신 stable은 5.0.0, API Security Project의 API 전용 최신 Top 10은 2023이다. **직접채택:** ASVS를 검증 가능한 통제 baseline으로 사용하고 API1/BOLA, API2/인증, API5/BFLA, API6/민감 비즈니스 흐름 악용, API7/SSRF, API9/inventory를 해당 API의 필수 negative-test 계열로 둔다.
- **Google Play 수수료(2026-09-17 확인):** 단일 보편 수수료가 없고 EEA/UK/US는 2026-06-30 이후 new/existing install과 거래 유형을 구분하며 나머지 시장은 rollout 전 체계를 사용한다. 한국 alternative billing은 적용 Play 수수료에서 4%p 낮다. **직접채택:** SKU economics를 market/effective date/install cohort/transaction type/billing path/programme별 versioned policy로 계산하고 실측 없는 conversion, ARPU/ARPDAU/ARPPU, refund, churn, CAC, LTV는 `HYPOTHESIS`/`TEST TARGET`으로 유지한다.

### 19.2 REL-DOCS-165-01 — P0 — OPEN — release eligibility 증명 전에 candidate/promotion 부작용이 시작됨

- **최초발견:** 2026-09-16(`REL-DOCS-163-01`). **최근재현:** 2026-09-17 04:02 KST, docs-only `62c65827...`.
- **재현:** `docs/planning/PROJECT_PLAN.md`와 `.ko.md`만 변경한 커밋을 병합 → 정상 CI 확인 → 같은 repository head로 `Build Test Candidate`와 promotion orchestration이 시작되는지 확인한다.
- **영향:** release engineering, Test capacity, registry/storage, GitOps truth, Production promotion 신뢰성, incident triage, 개발 대기시간. 기획문서 전용 커밋은 사용자 런타임을 바꾸면 안 된다.
- **증거/원인:** runtime eligibility가 candidate/promotion workflow 생성의 권위 선행조건이 아니다. 현재 trigger topology는 deployable application input 변경 여부를 증명하기 전에 비용성/상태변경성 릴리스 작업을 예약할 수 있다. 애플리케이션 런타임 결함이 아니라 control-plane correctness 결함이다.
- **수정설계:** image/GitOps/poll/promotion 전에 required `classify-release-inputs` job을 둔다. merge-base→head diff, rename/delete metadata, versioned `release-inputs.yml`을 입력받아 `{repositoryHeadSha, applicationSourceSha, classification, matchedRuntimePaths, classifierVersion, generatedAt}` immutable evidence를 생성한다. `RUNTIME_RELEASE_REQUIRED`만 candidate를 해제한다. `DOCS_ONLY_NO_RUNTIME_RELEASE`는 registry push/Test GitOps write/exact-SHA poll/Production mutation 모두 0건으로 성공 종료한다. `RELEASE_INPUT_CLASSIFICATION_ERROR`는 fail-closed하며 반복 시 release engineering에 경보한다.
- **분류 안전성:** frontend/backend/shared runtime, lockfile, migration, Docker/container/build, artifact에 영향을 주는 reusable workflow, GitOps/deploy manifest, runtime config/schema, secret reference, generated runtime artifact, unknown executable은 runtime-relevant다. rename/delete, symlink/path trick, 대소문자 변경, merge commit, shallow-history fallback, docs+runtime 혼합 커밋을 명시적으로 시험한다. docs 경로에 executable payload를 숨겨도 우회할 수 없어야 한다.
- **마이그레이션:** business-data migration 없음. classifier schema/evidence format은 versioning하며 과거 release evidence는 immutable이다. 이 기획 자동화는 Production DB를 쓰지 않는다.
- **롤백:** classifier/workflow wiring은 unclassified commit의 자동 Production mutation을 다시 허용하지 않는 경우에만 last-known-good로 되돌린다. 그렇지 않으면 promotion을 동결하고 reviewed manual release selection을 요구한다.
- **테스트:** path-class unit corpus, rename/delete·mixed property test, docs-only/frontend/backend/shared/lockfile/migration/Docker/GitOps workflow integration, supply-chain bypass negative, concurrent main advance, rerun/cancel, merge-base 없음, malformed manifest, provenance 검증. docs-only 수용조건은 p95 분류 <2분과 모든 runtime side-effect counter=0. runtime 변경은 exact application SHA/digest가 isolated Test → authoritative backend/API/DB/user-flow QA → Production smoke/rollback gate를 그대로 통과해야 한다.
- **모니터링:** `release_classifier_total{classification}`, `release_classifier_errors_total`, `docs_only_candidate_started_total=0`, `docs_only_registry_push_total=0`, `docs_only_gitops_mutation_total=0`, `release_application_source_mismatch_total=0`, queue/compute minutes avoided. docs-only side effect 1건도 즉시 alert한다.
- **사업성:** 직접매출 0. 절감가치는 CI/registry/Test 비용, false-release/incident 확률, engineer wait time 감소다. 30일 false-negative 0·docs-only side-effect 0이면 **SCALE**, false-positive면 **ITERATE**, runtime input을 놓치는 classifier version은 **KILL/ROLLBACK**한다.

### 19.3 이번 회차 교차 기능 구현 계약

1. **SEO backend/목록 UX:** public community/market/collection/search는 서버 read-model에서 `{canonicalUrl,page,pageSize,totalPages,prevUrl,nextUrl,updatedAt,indexPolicy}`를 제공한다. hydration 전 SSR HTML에 canonical/robots/breadcrumb/structured-data와 crawlable `<a href>` pagination이 존재해야 한다. 범위 밖 page는 empty 200 soft-404가 아니라 404다. filter/sort/query variant는 독립 검색가치가 없으면 canonical parent 또는 `noindex,follow`다. sitemap은 canonical indexable URL과 의미 있는 `lastModified`만 포함한다. private/account/admin/transaction/casino-history는 강제 noindex+sitemap 제외다. cache key는 locale/canonical page/index policy를 포함하고 metadata cache가 content/version보다 오래 살아남지 못한다. JS-disabled/bot/mobile/desktop/hreflang/301·308/404·410/UGC moderation/CWV를 QA한다.
2. **보안/API inventory:** 모든 user/admin/economy endpoint registry row에 owner, authn, authorization capability, object ownership, request/response schema, idempotency, rate/resource limit, PII class, audit event, data store, feature flag, deprecation state를 기록한다. 구현 route가 inventory에 없으면 CI fail이다. casino/reward/referral/shop/payment/admin은 일반 rate limit 외 API6 abuse case가 필수이고 object-ID API는 BOLA, admin은 BFLA+recent reauth/2FA, remote-fetch/upload는 SSRF/content/path negative test를 요구한다. 각 통제에 residual risk와 deploy-block 여부를 기록한다.
3. **수익성/분석:** monetized SKU마다 `feePolicyVersion`, market, currency, gross price, tax assumption, platform/payment fee, refund/fraud, variable infra/support/content cost, net/contribution-margin 식을 저장한다. dashboard는 revenue/net revenue/gross margin/contribution margin/ARPU/ARPDAU/ARPPU/conversion/attach/repeat/renewal/churn/refund/CAC/LTV/payback/fraud loss/infra·support cost/D1·D7·D30을 분리한다. 실측 전 값은 hypothesis/test target이다. 광고 실험은 `ad revenue - incremental churn/session loss/support cost` 순효과로 평가하고 gross ad revenue가 늘어도 사전 guardrail을 넘게 retention/trust가 악화되면 kill한다.
4. **릴리스/운영:** P0 `BAK-106-01`, `OPS-107-01`, release classifier, dual-runtime authority를 신규기능보다 앞에 둔다. CI green은 restorable backup, fresh status telemetry, exact Test runtime, authoritative DB verification, Production smoke와 동치가 아니다. promotion evidence는 각 상태전이를 별도로 보존하고 rollback은 정확한 immutable application source SHA/digest와 DB compatibility boundary를 지목해야 한다.

### 19.4 Worklog / changelog v165

- 외부 조사 우선 수행: Google Search Central documentation updates/infinite-scroll/site-reputation, OWASP ASVS/API Security, Google Play service-fee policy.
- 그 다음 저장소 증거 대조: 최신 main, EN/KO 통합본, main CI와 release workflow. 신규 사실은 docs-only `62c65827...`에서도 CI green과 별개로 Test candidate/promotion 자동화가 시작됐다는 점이다.
- 기획 변경: P0 release classifier를 path taxonomy 수준에서 선행 control-plane gate + side-effect-zero 수용지표로 강화하고 SEO list read-model, API inventory/security, monetization measurement, release evidence 구현계약을 추가했다.
- 통합 직전 main을 다시 확인한다. main이 전진하면 rebase 후 두 통합본을 재확인하고 더 최신 증거를 덮어쓰지 않는다.
- 런타임 배포: **기획 자동화에서 수행하지 않음**. 구현은 별도 branch→tests/CI→exact-SHA Test→backend/API/DB/user-flow QA→main→Production promotion→smoke/rollback 흐름을 따른다.


## 2026-09-17 v166 증거/작업로그 — 릴리스 적격성 P0 지속 및 공개 검색 계약 강화

### 최신 증거와 판정
- **저장소/런타임 증거(2026-09-17):** 시작 기준 protected `main=c2a61cbee88db0f711925f4ebfe898a676ce4d0a`는 `docs: integrate Moneyverse plan v2026.09.17.165`인 문서 전용 커밋이다. 그런데 required status check enforcement는 여전히 `off`, contexts/checks는 비어 있고, 이 exact 문서 SHA에 대해 `Build Production Release #913`이 다시 시작되어 증거 수집 시 `in_progress`였다. 이는 배포 앱 변경 증거가 아니라 `REL-DOCS-*`의 신규 재현이다. **P0 / OPEN.**
- **원인 경계:** 신뢰 가능한 배포 적격성 분류보다 release orchestrator가 먼저 시작되어 repository head identity가 application release identity처럼 소비되고 있다. 수정 전까지 docs-only merge가 build/Test/promotion 자원을 소비하고 잘못된 release evidence를 만들 수 있다.
- **구체 수정:** 모든 candidate build/registry push/GitOps write/Test polling/promotion보다 `classify-release-inputs`를 먼저 실행한다. merge-base→head diff의 rename/delete/symlink/submodule 의미까지 판정하고 `{repositoryHeadSha, applicationSourceSha, classification, matchedRuntimePaths, classifierVersion, evidenceCreatedAt}`를 불변 증거로 남긴다. 결과는 `RUNTIME_RELEASE_REQUIRED`, `DOCS_ONLY_NO_RUNTIME_RELEASE`, fail-closed `RELEASE_INPUT_CLASSIFICATION_ERROR`만 허용한다. frontend/backend/shared 실행코드, package/lock, migration, Docker/build, runtime에 영향을 주는 workflow/GitOps, generated runtime artifact, runtime config/secret reference 및 영향 불명 executable은 runtime-relevant다.
- **재현/수용:** 알려진 application SHA 뒤 docs/planning-only commit을 merge한다. 수정 후 CI/docs validation은 가능하지만 registry push=0, Test GitOps mutation=0, exact-SHA runtime polling=0, Production mutation=0이어야 한다.
- **롤백/마이그레이션:** DB migration 없음. classifier/orchestrator 롤백은 release를 막는 fail-closed 상태로만 허용하며 unconditional promotion으로 복귀하지 않는다. workflow/classifier evidence ID는 감사용으로 보존한다.
- **테스트:** path table corpus, rename/delete, symlink/submodule/path-normalization trick, merge/multi-commit range, shallow-history failure, docs+runtime mixed, lockfile/migration/container/workflow/GitOps, generated artifact, 문서처럼 보이는 경로에 숨긴 executable payload. 공격자가 경로 선택으로 release를 우회할 수 없어야 한다.
- **모니터링/종료:** docs-only side effect=0, runtime false-negative=0, classifier error는 release 차단, docs-only 분류/evidence p95 <2분(`TEST TARGET`). `release_classification_total`, `docs_only_runtime_side_effect_total=0`, `classifier_error_total`, `release_application_source_mismatch_total=0`을 관측한다. Production 승격에는 exact application SHA/digest, authoritative Test DB/API/user-flow, GitOps/public-edge identity, Production smoke/rollback 증거가 별도로 필요하다.

### 공개 SEO/SEO 백엔드 계약 증분
- 2026-09-17 확인 기준 Google Search Central 업데이트 로그의 2026-09-08 변경은 지역별 Search experience 문서 추가다. 2026-09-16 Search Central Live 글은 행사/커뮤니티 공지이므로 ranking/indexing 계약 변경 근거에서 제외한다. Breadcrumb structured data는 계속 hierarchy signal로 사용 가능하며 Rich Results Test/URL Inspection 검증 후 확대한다.
- indexable 공개 route family(community, 공개 collection, 공개 market/catalog, 개인정보 정책상 허용된 공개 profile/content)는 서버 SEO read-model `{canonicalUrl,indexPolicy,title,description,h1,breadcrumbs,localeAlternates,updatedAt,imageMeta,structuredDataVersion}`을 사용한다. account/admin/transaction/private inventory·bank·casino history/personalized search는 `noindex`이며 sitemap에서 제외한다.
- 공개 entity는 canonical 1개만 가진다. slug 변경은 불변 redirect map을 쓰고 영구 method-preserving redirect는 308을 기본으로 한다. 의도적 영구 삭제는 410, 그 외 부재는 404. filter/sort/query variant는 별도 승인된 고유 검색의도/콘텐츠 landing contract가 없으면 base canonical/noindex다. sitemap `lastmod`는 실제 의미 있는 콘텐츠 변경시각이다.
- structured data는 visible SSR과 같은 authoritative read-model에서 직렬화한다. `BreadcrumbList` URL은 canonical이고 화면 hierarchy와 일치해야 한다. template validation 실패는 해당 SEO rollout을 막는다. crawler 식별은 관측용일 뿐 auth/authorization/rate/privacy/`noindex` 우회에 쓰지 않는다.
- SEO KPI chain은 `eligible/indexable URL → crawl/index health → impressions → CTR → organic session → signup → activation → D7/D30 → net revenue/LTV`다. 금전 효과는 관측 전 `HYPOTHESIS/TEST TARGET`; thin/duplicate/unsafe UGC index 증가, crawler error 악화, moderation/support economics 악화 시 iterate/kill한다.

### 보안/API inventory 증분
- OWASP API Security Project는 현재 API-specific 최신판을 2023으로 표시한다. 모든 구현 API route는 owner/domain, authn, capability, object ownership, request/response schema, idempotency, rate/resource/business-flow limit, PII class, audit event, datastore, feature flag, deprecation을 inventory에 등록하며 미등록 runtime route는 CI 실패다.
- 사용자 object에는 BOLA negative test, privileged admin에는 BFLA + recent reauth/2FA, casino/reward/referral/shop/payment/loan/market/recovery에는 sensitive-business-flow abuse test가 필수다. 예방은 서버 권한/트랜잭션 불변식/idempotency/quota, 탐지는 append-only audit/anomaly metric으로 구성한다. scanner green만으로 종료하지 않고 CRITICAL/HIGH 실패는 승격을 막는다.

### 수익성/unit economics 증분
- Google Play 현행 공식자료는 단일 보편 service fee가 없음을 명시한다. EEA/UK/US의 2026-06-30 이후 standard 예시는 자동갱신 구독 10% + 해당 시 5% billing fee, 기타 new-install 20% + 해당 fee, 기타 existing-install 25% + 해당 fee로 구분되고 다른 시장은 rollout 전 각 적용 모델을 따른다. 따라서 실제결제 SKU/구독은 `feePolicyVersion, market, transactionAt, installCohort, transactionType, billingPath, programme, grossPrice, tax, platformFee, paymentFee, refundReserve, directOpsCost`를 보존한 뒤 net revenue/contribution margin을 계산한다.
- SKU dashboard는 units, gross/net revenue, gross/contribution margin, attach/repeat/subscription conversion, renewal/churn/refund, ARPU/ARPDAU/ARPPU, CAC/LTV/LTV:CAC/payback, fraud loss, infra/support cost/user, D1/D7/D30을 분리한다. 미실측값은 `HYPOTHESIS` 또는 `TEST TARGET`이다. contribution margin과 retention/trust guardrail이 통과해야 scale하며 P2W/economy abuse, 유의한 refund/fraud/support 손실 또는 D7/D30 악화가 발생하면 kill한다.

### 개발 순서/상태
1. **P0:** 독립 암호화 backup + 격리 full restore/reconciliation 증거(`BAK-106-01`).
2. **P0:** stale public-status false-green 원인 제거와 freshness 회귀(`OPS-107-01`).
3. **P0:** release-input classifier 구현 및 docs-only runtime side effect=0 증명(`REL-DOCS-166-01`, OPEN, 최신 재현 Release #913).
4. **P0:** GitOps desired workload와 public edge/systemd runtime/public version·digest를 단일 release authority로 수렴.
5. **P1/HIGH:** auth/session/admin/casino/Work/DB authorization·idempotency·ledger/reconciliation 증거.
6. **P1:** protected-main required checks/ruleset을 실제 machine-enforced gate로 전환.
7. core correctness → shop/payment/subscription unit economics → SEO/acquisition → retention/growth → accessibility/장기확장. 런타임 구현은 별도 branch/test/exact-SHA/QA/promotion/smoke/rollback 흐름을 따른다.

**v166 사업효과:** release classifier의 직접매출은 0이며 CI/registry/Test/운영 낭비와 잘못된 application identity 승격·감사 위험 감소가 가치다. SEO는 acquisition/CAC 효율 투자, API/security/backup/status는 사고·다운타임·환불·fraud·support 기대손실 감소다. 관측되지 않은 금액은 실제값으로 단정하지 않는다.\n\n### v2026.09.19.261 — AI 주식 시나리오 자동 생성·게시

가상 주식시장에 opt-in 시간별 AI 뉴스룸 자동화 경로를 추가한다. AI는 제한된 이벤트 시나리오를 만들고 실제 주가 권위는 기존 결정론적 market-event 로직이 유지한다. 자동 게시는 전체시장·강도 3 충격을 제외하고 한 시나리오의 변동 종목을 최대 2개, 기간을 최대 24시간으로 제한한다. 자격증명, 감사 actor 또는 안전 후보가 없으면 fail-closed로 아무 이벤트도 게시하지 않는다. 브랜치: feat/ai-stock-auto-scenarios-v2026.09.19.261.

### v2026.09.19.271 — 사람 제작 UI 기준

- 일반적인 AI 생성 UI 템플릿처럼 보이는 페이지는 검수 실패로 처리한다.
- 정보구조와 무관한 bento grid 반복, 네온/보라 glow, 전 화면 glass card, 의미 없는 KPI 4개 묶음, 동일 radius/spacing 반복, 장식 아이콘 타일, 가짜 insight 패널, 과도한 대칭 dashboard를 금지한다.
- 모든 route를 별도 제품 화면으로 보고 정보계층, 밀도, 읽기순서, primary action, empty/error/loading 상태, 모바일 구성을 각각 검수한다.
- 레퍼런스는 패턴 분석용이며 특정 제품이나 디자이너를 그대로 복제하지 않는다.
- 각 route가 여전히 synthetic/template-generated처럼 보이는지 명시적으로 기록하고, 하나라도 해당되면 전체 완료로 처리하지 않는다.


### v2026.09.19.271 — 1,000+ 실제 UI 레퍼런스 기반 전 페이지 재설계

- 완료 기준은 공통 theme 변경이 아니라 현재 70개 page route 전부의 개별 검수 및 페이지 파일 직접 추적이다.
- 구현 전/중간/PR 직전에 통합 기획서를 다시 확인한다.
- 실제 사람이 설계했거나 실제 출시 제품에서 수집된 UI 레퍼런스 1,000개 이상을 포함하는 코퍼스를 조사한다. 2026-09-19 확인 기준 Mobbin은 1,428 apps / 621,500+ screens / 323,900 flows, SiteInspire는 1,000개 이상인 복수 큐레이션 카테고리, Gummble은 1,500+ apps/sites / 300,000+ screens / 21,000+ flows를 공개한다. SaaSFrame의 170 dashboard 사례는 집중 비교용 부분집합으로 사용한다.
- 레퍼런스는 특정 화면 복제용이 아니라 정보계층, 밀도, 타이포그래피, 표/차트, 폼, 오류/빈 상태, 모바일 재배치 패턴 분석용이다.
- AI 생성 UI 템플릿처럼 보이는 route는 실패다. 동일 bento grid, 네온/보라 glow, 전 화면 glass card, 의미 없는 KPI 4개 묶음, 동일 radius/spacing, 장식 아이콘 타일, 가짜 AI insight, 과도한 pill/badge, 정보구조와 무관한 완전 대칭 dashboard를 금지한다.
- 화면군은 finance terminal, member workspace, community/editorial, gameplay, operations console, utility/auth/legal로 나누되 각 route의 읽기 순서와 primary action을 별도로 설계한다.
- 모바일은 데스크톱 축소판이 아니라 재구성한다. 최소 44px touch target, keyboard/focus, reduced-motion, 403/404/loading/empty/error/reauth 상태를 유지한다.
- API/backend/auth/ledger 권위는 시각 작업 때문에 약화하지 않는다.
- 브랜치: feat/frontend-full-rebuild-v2026.09.19.271.


### v2026.09.19.273 — 모바일 홈 실제 화면 재설계 체크포인트

- v271의 route-family 기준선만으로는 실제 재설계 완료 증거가 되지 않는다. 운영 캡처에서 모바일 홈이 여전히 큰 둥근 hero card, 반복 rounded surface, glow, pill action, 떠 있는 둥근 하단 navigation 구조를 유지하는 것이 확인됐다.
- v273에서는 실제 렌더링 구조 자체를 변경한다. 큰 rounded/glow hero를 제거하고 잔액 영역을 평면 원장형 header로 바꾸며, 오늘의 동선을 card가 아닌 rule 기반 선형 list로 변경한다. secondary action/공지도 평면화하고 하단 navigation은 떠 있는 둥근 panel 대신 화면 폭 전체의 flat tab bar로 변경한다.
- 검수 기준: screenshot 비교에서 CSS token이나 marker만 달라진 것이 아니라 정보 구조가 명확하게 달라 보여야 한다.
- 이번 버전은 70개 route 전체 재설계의 첫 번째 실제 가시적 구현 checkpoint이며, 나머지 페이지별 작업이 끝났다는 의미는 아니다.
- 브랜치: feat/mobile-home-human-redesign-v2026.09.19.273.


## 사이클 델타 — v2026.09.20.292 (2026-09-20)

### 다음 작업 필수 AI 전수 재감사·재구축

다음 AI 작업은 신규 기능 구현 전에 AI_ECONOMY_CONTROLLER_SPEC.ko.md v2026.09.20.292에 정의한 전수 재감사·재구축 게이트를 반드시 먼저 완료한다. 문서나 feature switch만 확인하는 것이 아니라 지금까지 만든 모든 AI 구현과 실제 런타임 동작을 대조한다. 요구사항이 수정됐거나 부분구현·stale·중복·호환패치 누적·기획 충돌 상태인 영역은 기존 코드를 기본 유지하지 않고 최신 요구사항을 기준으로 다시 설계·재구축한다.

강제 순서: AI 전체 인벤토리 -> 최신 기획/main/사용자 지시 재확인 -> 구현·런타임 계약 감사 -> 변경·취약 영역 재구축 -> 시스템 전체 회귀 -> 정확한 SHA로 Test 런타임·fail-closed·rollback 입증 -> 최종 기획 재확인 -> 모든 증거 통과 시에만 무중단 Production 승격. 이 게이트가 끝나거나 남은 제외범위가 명시적으로 승인되기 전에는 신규 AI 기능 작업을 시작하지 않는다.
