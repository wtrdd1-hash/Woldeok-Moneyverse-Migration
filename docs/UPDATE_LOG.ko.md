# 업데이트 로그

## v2026.09.20.305 — 4단계: 헤더 및 홈 화면 인체공학 쇄신 및 운영 콘솔 고도화

- 적용 브랜치: `feat/frontend-admin-v2026.09.20.305`, 기반 커밋: `feat/frontend-community-v2026.09.20.304`.
- 전역 헤더 반응형 공간 최적화 및 회원 드롭다운 메뉴 (`components/site-header.tsx`): 1024px~1440px 데스크톱 해상도에서 '내 지갑' 버튼이 '내'로 잘리고 로그아웃 버튼이 밀려나던 오버플로우 현상을 원천 해소. 내 계정/보안/지갑/운영 콘솔/로그아웃을 하나의 세련된 회원 드롭다운 메뉴로 통합하고, 내 지갑 버튼을 컴팩트 칩으로 정돈하며 서버 시계를 1440px 이상(`hidden 2xl:inline-flex`)에서만 노출하여 어떤 뷰포트에서도 잘림 없는 무결성 레이아웃 확보.
- 메인 홈 빠른 대시보드 2x2 핀테크 카드 개편 (`components/mobile-home-view.tsx`): 데스크톱 와이드 화면에서 과도하게 늘어나던 '오늘의 동선' 단일 리스트를 2열 핀테크 액션 카드 그리드(`grid grid-cols-1 lg:grid-cols-2 gap-3.5`)로 재구성. 고유 번호 배지(01~04), 아이콘, 서브 라벨 및 호버 인터랙션을 적용하고, 우측의 의미 불명 텍스트 '04'를 '4개 동선' 정규 배지로 정돈하였으며 하단 보조 링크를 클린 칩 스타일로 개선.
- 운영 콘솔 및 관리자 패널 정비 (`app/admin/...`): AI 경제 에이전트 모바일 카드, 트래픽 활동 대시보드, 유저 디렉터리 제재 2단계 확인 및 거시 경제 Faucet/Sink 실시간 관제 게이지의 무결성 검증 완료.
- 품질 검증 및 무중단 배포: Vitest 91개 테스트 스위트 전수 통과 (683/683개 100% 통과), TypeScript 정적 타입 검사 0에러, Next.js Turbopack 빌드 검증; 테스트 서버(`test.easy-scraping.com`) 및 운영 서버(`easy-scraping.com`) 무중단 블루-그린 승격 완료 및 활성 세션(816건) 100% 무손실 보존.

## v2026.09.20.304 — 3단계: 커뮤니티, 사업체, 카지노 및 성장 화면군 전면 고도화

- 브랜치: `feat/frontend-community-v2026.09.20.304`, 기준 `feat/frontend-economic-v2026.09.20.303`.
- 커뮤니티 및 갤러리 고도화 (`board/board-forms.tsx`, `gallery/submit/submit-forms.tsx`): 드래그 앤 드롭 및 카메라 연동을 지원하는 모바일 최적화 미디어 업로드 폼을 구축하고, 캔버스 기반 클라이언트 사전 WebP 압축(20MB 이상 원본을 1.5MB 이하로 실시간 최적화)과 파일 매직 바이트 검증을 적용함. 게시판 작성창에 실시간 마크다운 미리보기 탭과 퀵 서식 툴바(굵게, 기울임, 인용, 코드, 목록, 링크) 및 44px+ 터치 타깃을 완비함.
- 사업체 포트폴리오 총괄 대시보드 (`businesses/page.tsx`, `businesses/business-forms.tsx`): 토스 스타일의 사업체 종합 현황 배너를 신설하여 일일 총 매출, 운영비 소각액, 순수익 및 미정산 대기 건수를 한눈에 시각화함. 사업권 인수, 일일 정산, 부스트 장착, 라이선스 설립 버튼 전반에 44px+ 터치 규격(`min-h-11`)을 전면 적용함.
- 카지노 암호학적 공정성 및 편의성 (`casino/page.tsx`, `casino/casino-forms.tsx`): 백엔드 100만 회 난수 시행 결과(관측 승률 50.00% vs 이론 승률 50.00%, 정규분포 Z-Score 신뢰구간 일치)를 증명하는 Provably Fair 통계 검증 보고서 카드를 전면 노출함. 동전·홀짝·숫자 게임에 1-탭 퀵 베팅 금액 버튼(+1,000, +5,000, +10,000, +50,000, MAX)을 탑재함.
- 성장 단계 로드맵 및 시즌 명예의 전당 (`progression/page.tsx`, `seasons/page.tsx`): 단계별 해금 상태(완료, 활동 중, 잠김)를 직관적으로 파악할 수 있는 타임라인 로드맵을 구축함. 시즌 이벤트 순위표에 1~3위 메달 뱃지(🥇, 🥈, 🥉)를 추가하고 44px+ 터치 타깃을 보장함.
- 품질 검증 및 무중단 배포: Vitest 91/91개 테스트 스위트 (683/683개 단위 및 회귀 테스트 100% 통과), TypeScript 타입 검사 오류 0건 (`tsc --noEmit`), Next.js 프로덕션 빌드 통과; 테스트 서버(`test.easy-scraping.com`) 검증 후 운영 서버(`easy-scraping.com`) 무중단 블루그린 승격 완료 및 유저 세션 100% 보존.

## v2026.09.20.303 — 2단계: 핵심 경제 화면군 전면 재구축 (/work, /stocks, /wallet, /bank)

- 브랜치: `feat/frontend-economic-v2026.09.20.303`, 기준 `feat/frontend-rebuild-v2026.09.20.302`.
- 가상 주식 거래소 및 주문 편의성 (`stocks/layout.tsx`, `stocks/page.tsx`, `stocks/trade-form.tsx`): 거래소 상단 도구 모음에 거래 내역(History) 탭을 통합 연결하고 중복 정렬 내비게이션을 제거하여 UI를 간소화함. 모바일 주문 폼에 1-탭 퀵 수량 버튼(+1, +5, +10, +50, MAX)과 44px+ 터치 타깃을 제공하여 로빈후드형 기동성을 극대화함.
- 지갑 및 뱅킹 연동성 (`wallet/page.tsx`, `wallet/wallet-forms.tsx`, `wallet/actions.ts`): 지갑·은행·활동기록 간 상호 전환 퀵 내비게이션을 신설하고, 활동 원장 내역을 즉시 내보낼 수 있는 UTF-8 BOM 지원 CSV 다운로드 기능을 탑재함. 송금 시 이중 출금을 차단하는 분산 멱등성 키 연동 및 퀵 금액 버튼(+1,000, +5,000, +10,000, +50,000 WLD)을 완비함.
- 품질 검증 게이트: Vitest 91/91 테스트 스위트 (683/683개 단위 및 회귀 테스트 100% 통과), TypeScript 타입 검사 오류 0건 (`tsc --noEmit`), exact BUILD_ID Next.js 프로덕션 빌드 완료.
- 무중단 배포: 격리 테스트 서버(`test.easy-scraping.com`) 헬스체크 200 검증 후 운영 서버(`easy-scraping.com`) 무중단 블루그린 승격 완료 및 유저 세션 100% 연속성 보존.

## v2026.09.20.302 — 1단계: 전역 셸, 반응형 인증 플로우 및 계정 센터 전면 재구축

- 브랜치: `feat/frontend-rebuild-v2026.09.20.302`, 기준 `421353c84852c93d93bf7c32bf28a8677eb9319b`.
- 모바일 하단 내비게이션 (`mobile-bottom-nav.tsx`): 5대 핵심 핀테크 탭(홈, 작업, 거래소, 지갑, 계정/로그인)으로 전면 개편. 햅틱 피드백 크기 애니메이션, 상단 활성 인디케이터 바, 하단 safe-area 패딩 및 세션 상태에 따른 계정/로그인 동적 라우팅 완비.
- 인증 및 가입 화면 (`login-providers-view.tsx`, `/register`): 토스/로빈후드형 중앙 집중식 단일 핀테크 카드로 개편. WCAG 44px(min-h-11) 터치 타깃 준수, 고대비 입력 폼, 소셜 원클릭 로그인(Discord, Google) 분리 및 320px~1440px 무결점 반응형 구현 (AI 냄새 전면 배제).
- 계정/보안 센터 (`account/page.tsx`, `account/security/page.tsx`): 직관적인 리스트형 대시보드로 재구축. 접속 디바이스(스마트폰/노트북) 시각화, 원격 세션 개별 종료, 현재 세션 보호 기반 일괄 종료, 15분 본인 재인증 및 보안 활동 감사 로그 연동.
- 품질 검증 게이트 통과: Vitest 테스트 91/91개 파일 (683/683개 단위 및 회귀 테스트 100% PASS), TypeScript 타입 검사 통과 (`tsc --noEmit`), exact BUILD_ID 주입 Next.js 프로덕션 빌드 완료.
- 무중단 배포 및 검증: 격리 테스트 서버(`test.easy-scraping.com`) 및 운영 서버(`easy-scraping.com`) 모두 무중단 블루그린 승격 완료, 헬스체크 200 및 세션 연속성 완벽 보존 확인.

## v2026.09.20.297 — 프론트엔드 재구축 기반

- 브랜치: `feat/frontend-rebuild-v2026.09.20.297`, 기준 `4dcd2ba112ae57565eed7444fe1d36512b926a3b`.
- 백엔드 권위를 변경하지 않고 전역 시각 기반, shell 간격, page heading, card, button을 다시 만들었습니다.
- frontend typecheck/build와 테스트 90/90 파일, 681/681 테스트를 통과했습니다.
- 이번 회차는 재구축 기반이며 전체 라우트 구성을 계속 다시 만든 뒤에만 완료로 처리합니다.

## v2026.09.19.275 — Blue/green 연속성 및 최신 빌드 자동 갱신

- 브랜치: `ops/blue-green-cache-refresh-v2026.09.19.275`.
- 로그인 상태를 지우지 않는 cache-bust stale-build 자동 갱신과 canary-first host blue/green 배포 helper를 추가했습니다.
- 승격 전 helper 회귀시험, frontend 7/7, typecheck, 실 DB 인증 세션 연속성 검증을 통과했습니다.

## v2026.09.19.274 — 배포 연속성·캐시 최신화 표준

- 브랜치: ops/deployment-continuity-v2026.09.19.274.
- 프론트엔드/백엔드 무중단 전환, PostgreSQL 기반 회원 세션 유지, 최신 shell 자동 재검증을 필수 릴리스 게이트로 고정했습니다.
- 문서 전용 릴리스이므로 런타임 코드와 Production 서비스는 변경하지 않습니다.

## v2026.09.19.265 — Test 라우팅 가드 및 무중단 Production 승격

- Test split-brain 라우팅을 종결해 backend identity/health와 frontend/BFF가 하나의 exact application SHA 및 stable 3100/3101을 사용하도록 맞췄습니다.
- 임시 Test UI 포트를 거부하고 Test/Production stable upstream을 확인하는 Nginx 라우팅 회귀검사를 추가했습니다.
- 신규 암호화 운영 backup 후 Test/Production schema를 migration 208까지 적용하고 application `b1b1f7a…`를 canary + Nginx reload 방식으로 공개 중단 없이 승격했습니다.
- 최종 Test/Production version, health, catalog 146개, 필수 공개 경로 smoke를 통과했고 구형 canary를 종료해 failed unit 0을 확인했습니다.

## v2026.09.19.263 — exact-SHA Test 런타임 복구

- stable secret과 release-local `.env`를 섞지 않도록 Test systemd release 템플릿을 backend/frontend로 분리했습니다.
- 비밀값을 기록하지 않고 Test backend/frontend를 동일 exact Git SHA와 API origin으로 고정하는 release-env 생성기를 추가했습니다.
- v259 후보가 의도한 후보 포트 대신 stable 3100 포트에 바인딩하려다 실패한 `EnvironmentFile` 우선순위 문제를 기록하고 차단했습니다.
- 승격은 Test 우선입니다. 공개 exact-SHA version, backend health, catalog, noindex, 핵심 페이지 smoke 통과 후에만 무중단 Production으로 승격합니다.
[English](UPDATE_LOG.md) | **한국어** | [문서 색인](INDEX.ko.md)

## v2026.09.18.215 — Debian 부팅 연속성 및 Discord 음성 자동 시작 계약

- 문서 전용 버전이며 애플리케이션 SHA 또는 런타임 릴리스는 변경하지 않았습니다.
- 승인된 Debian 13 호스트에서 backend, frontend, Discord bot, Economy AI, MCP gateway, Docker, Nginx, GitHub Actions runner가 모두 enabled/active인지 재검증했고, 호스트 5433의 Production PostgreSQL 컨테이너가 Docker restart policy `unless-stopped`로 실행 중임을 확인했습니다.
- 서버 부팅 시 Discord 봇을 자동 시작하고 대상 음성 채널 `1536572442422550538`에 자동 연결해야 한다는 운영 계약을 기록했습니다. 음성 연결 해제 시 기존 voice watchdog이 자동 재입장을 담당합니다.
- 핵심 런타임과 Nginx/runner에 `systemctl enable --now`를 다시 적용했고 공개 Production/Test HTTP 200 및 backend `/health` HTTP 200을 확인했습니다.

## v2026.09.18.214 — v213 Production 승격 증거

- 문서 전용 버전이며 runtime은 v213 exact main `24b85df1e0e5f922e461b1dcea82ec291bf54e48`을 유지합니다.
- PR #467 / CI #1279 통과 후 Test exact-main responsive/CSP/backend 게이트를 통과했고, Production은 canary 후 영구 3001로 무중단 승격했습니다.
- 운영 browser QA는 canary 27/27, 영구 전환 후 27/27 통과했고 backend는 변경하지 않았으며 기존 3201 frontend를 rollback anchor로 유지합니다.

## v2026.09.18.213 — AdSense iframe CSP Test 게이트 보완

- v212 실제 Test edge Chromium에서 `ep2.adtrafficquality.google`, `www.google.com` iframe 차단을 추가 확인했습니다.
- 광고 활성 `frame-src`에 재현된 AdSense origin만 최소 추가하며 광고 비활성은 계속 `frame-src 'none'`입니다.
- v213 merged-main Test browser QA에서 relevant CSP 오류 0건을 확인하기 전까지 Production 승격을 차단합니다.

## v2026.09.18.212 — 전체 UI QA 및 브라우저 호환성 강화

- 브랜치: `fix/ui-full-qa-v2026.09.18.212`, 정확한 기준 `d6d2798535894c54854135c23e37d972d267baa1`.
- 삭제/법적 문서/상점의 280px grid min-content overflow, 모바일 상점 검색 focus 확대, site brand title 중복, Gallery AdSense 보조 script CSP 차단을 수정했습니다.
- QA: 타깃 회귀 15/15, frontend 71개 파일/623개 테스트, typecheck/build 통과, lint 오류 0건. 300개 반응형 browser 조합에서 redirect race 재검증 후 확인 UI 결함 0건입니다.
- Runtime 승격은 Test 우선 frontend-only이며 backend/DB는 변경하지 않습니다.

## v2026.09.18.201 — 모바일 반응형 UI QA 및 가로 넘침 방지 강화

- 브랜치: `fix/ui-responsive-qa-v2026.09.18.201`, v200 권위 기획/main 기준에서 작업했습니다.
- 전역 모바일 메뉴, 5개 하단 탭, 은행 카드·액션, 인벤토리 quick-slot의 고정 폭/과밀 배치를 수정했습니다.
- 모바일 반응형 회귀 테스트를 추가했고 frontend 70개 파일/619개 테스트, workspace typecheck, Production build, repository lint 오류 0건을 통과했습니다. 기존 이미지 경고 11건은 유지됩니다.
- Headless Chromium 320/360/390px에서 공개 경로 21개 렌더링 조합 모두 document-level 가로 overflow 0건을 확인했습니다. Gallery의 기존 Google 광고 품질 스크립트 CSP 거부는 별도 추적합니다.
- DB migration 및 API/auth/ledger/entitlement 계약 변경은 없습니다. Production 전 exact-SHA Test backend/frontend smoke를 반드시 통과합니다.

## v2026.09.17.195 — v193 Production 증거

- v193 Next.js API-cache 권한 수정의 무중단 Production 적용 증거를 기록했습니다.
- 활성 cache 소유권은 `debian:debian`이며 frontend/backend PID는 그대로 유지됐습니다.
- health/BFF/공개 화면 probe가 통과했고 수정 후 구간에 새 cache 또는 backend 치명/DB 오류가 없었습니다.

## v2026.09.17.194 — 디스코드 길드 명령어 동기화

- 브랜치: `fix/discord-command-sync-v2026.09.17.194`, 현재 `main` 기준으로 재정렬했습니다.
- 시작 로그에는 7개 등록으로 보였지만 실제 등록 로직은 fetch/edit/create 방식이라 길드 명령어 집합을 초기화하지 않는 계약 불일치를 확인했습니다.
- 길드 명령어를 지원 음악 명령어 7개로 원자적으로 교체하도록 수정했으며 애플리케이션 글로벌 명령어는 변경하지 않습니다.
- 회귀 테스트와 봇 테스트 스크립트를 보강했고 로컬 `npm ci`, `npm test`가 취약점 0건 및 회귀 테스트 1/1로 통과했습니다.

## v2026.09.17.193 — Frontend API 캐시 런타임 권한 보호

- 브랜치: `fix/frontend-api-cache-permissions-v2026.09.17.193`, 기준 `5d5826b21a9e4ae98fd0dcbe771d57fa8c674c84`.
- API 점검에서 NestJS/BFF 경로는 정상이었지만 Production Next.js의 `.next/cache/fetch-cache`에서 반복 `EACCES`를 확인했습니다.
- release root 안의 mutable Next.js cache만 준비하고 runtime 사용자 실제 쓰기를 검증하는 helper와 회귀 테스트를 추가했습니다.
- EN/KO host-mirror 배포 절차를 보강했으며 backend, database, migration 204는 변경하지 않습니다.

## v2026.09.16.151 — 런타임 및 GitOps 수렴

- 애플리케이션 `main`, 공개 Test, 공개 Production, GitOps desired Test/Production 참조를 정확한 SHA `3d87165f83bcb60903e85d4f3600fdf40074ef40`로 수렴했습니다.
- exact-SHA Test를 먼저 승격하고 공개 backend/API/SEO 경계 QA를 통과한 뒤 Production을 승격했습니다.
- exact-SHA Production 승격 전 신규 DB 백업을 생성하고 이전 Test/Production 릴리스 디렉터리를 롤백 기준으로 보존했습니다.
- GitHub Production Release를 다시 성공시켜 정확한 SHA의 immutable Production 이미지와 Production-ready 신호를 생성했습니다.
- GitOps Test PR #78과 Production PR #79를 병합하고 Runtime Drift Watch run `35069150294`까지 통과했습니다.
- NixOS 관리자 접근과 클러스터 DB 대사를 복구하기 전까지 Kubernetes Production reconciliation은 의도적으로 suspend 상태를 유지하며, 현재 공개 권위 런타임은 Debian systemd입니다.

## v2026.09.12.13 — 자동 Test→Production 릴리스 파이프라인

- 내부 릴리스 파이프라인 버전: `v2026.09.12.13`
- 브랜치: `ops/auto-test-prod-v2026.09.12.13`
- 정확한 SHA 기반 Test 식별, 실패 시 닫히는 Test 스모크 게이트, 자동 Production 이미지 생성, 저장소 간 Production-ready 신호를 추가했습니다.
- GitOps 자동화가 클러스터 변경의 유일한 경로로 유지됩니다. 애플리케이션 Actions에는 kubeconfig나 Production DB 자격 증명을 주지 않습니다.
- 롤백 기준은 이전에 고정된 Production 이미지 SHA입니다. 공개 정확한 SHA 확인과 백엔드/DB 스모크 검사가 통과한 뒤에만 Production 성공으로 보고합니다.

## 2026-09-03 — Moneyverse 종합 개선 및 최적화

- `main`에서 `feature/moneyverse-comprehensive-enhancement` 브랜치를 만들었습니다.
- 7개 핵심 개선을 계획/실행했습니다.
  1. Google Search Console 및 AdSense 정책 준수: GSC 확인 메타데이터, JSON-LD 구조화 데이터(Organization, WebSite, FAQPage), 소셜 메타데이터, 정책 준수 CLS-safe 광고 컨테이너
  2. 카지노(Lucky Zone) 멀티게임 확장: 투명한 PPM 확률, 예상 배당 표시, 실시간 손실 제한을 갖춘 High-Low와 Lucky Wheel 추가
  3. 프로필 사진/미디어 릴레이 감사: MIME 검사 강화, 비공개 저장 보존, 안정적인 아바타 fallback 렌더링
  4. 관리자 Master Console 감사 로그 뷰어: 불변 감사 로그 검색, 체인 무결성 검증, 전달 추적 강화
  5. 회원 잔액 조정: 10자 이상 필수 사유, 단계적 재인증, 원자적 원장 트랜잭션을 갖춘 직접 mint/recovery 조정 모달
  6. 브랜딩 정렬: Appendix A.3에 따라 WLD/덕, 덕지갑, 잡보드, 덕마켓, 마이비즈, 마스터 콘솔 공식 명칭 적용
  7. 엣지/서버 API 최적화: gzip, 장기 정적 자산 캐싱, 요청 병렬성 활성화

## 2026-09-03 — main 통합, 동의 흐름, 공지 이미지, 실시간 작업 카운트다운

- 가이드 온보딩, 언어 전환기, 관리자 콘솔 UX, 미디어 릴레이 수정을 `main`에 통합했습니다.
- 로그인은 OAuth로 회원을 먼저 식별한 뒤 보호 서비스 사용 전에 최신 약관·개인정보·연령 확인을 요구하도록 변경했습니다.
- 공지 이미지 업로드, 비공개 디스크 저장 메타데이터, 공개 상태 기반 미디어 접근, 접근 가능한 alt 텍스트, 공개 공지 렌더링을 추가했습니다.
- 일시적인 미디어 404가 웹 계층에 캐시되지 않도록 했습니다.
- 활성 작업 카드에 초 단위 카운트다운을 추가해 최소 시간이 끝나는 즉시 제출 버튼이 활성화됩니다.
- 깨끗한 PostgreSQL 17 DB에 마이그레이션 002–112를 적용하고 최소 권한 애플리케이션 역할로 공지 생성/이미지/공개/공개 읽기를 검증했습니다.
- DB 통합 포함 백엔드 1,192개, 프론트엔드 448개, 계약 23개, 마이그레이션 6개 테스트를 모두 검증했습니다.

이 파일은 동시 작업이 겹치지 않도록 프로젝트의 점진적 변경사항을 기록합니다.

## 2026-09-03 — 가이드 온보딩 개편

- `codex/guide-onboarding-20260903` 브랜치를 만들고 `main`에는 직접 변경하지 않았습니다.
- 기존 `/guide` 페이지, 가이드 데이터, 테스트, 공용 페이지 컴포넌트, 저장소 지침을 검토했습니다.
- 범위를 `frontend/src/app/guide/`, 가이드 전용 공개 이미지 자산, 이 로그로 제한했습니다.
- 퀘스트→지갑→상점→보상 경로를 보여주는 텍스트 없는 `newcomer-adventure.png`와 `first-reward-loop.png` 이미지를 추가했습니다.
- 4단계 빠른 시작, 초보자 가드레일 3개, 동의 갱신/길을 잃은 뒤 복귀 FAQ를 가이드 데이터에 추가했습니다.
- `/guide`를 시각적 온보딩 여정으로 재구축했습니다. 일러스트 히어로, 직접 시작 액션, 빠른 시작 경로, 6개 연결 체크포인트, 보상 루프 설명, 초보 팁, 첫날 체크리스트, 확장 FAQ, 최종 CTA를 포함합니다.
- 가이드 데이터의 빠른 시작 4단계와 초보 팁 3개 테스트를 추가했습니다.
- formatting, lint, workspace typecheck, 계약 23개, 마이그레이션 6개, 백엔드 696개, 프론트엔드 433개, Production 프론트 빌드, 로컬 `/guide` HTTP 200을 확인했습니다. Test DB URL이 없어 DB 기반 백엔드 테스트 299개는 건너뛰었습니다.

## 2026-09-03 — 한국어/영어 언어 경험

- `codex/i18n-language-switcher-20260903` 브랜치를 만들고 `main`에는 직접 변경하지 않았습니다.
- 한국 방문자는 한국어를 기본값으로 하고 한국 외 방문자는 영어를 선택하며 국가 정보가 없으면 브라우저 언어를 fallback으로 사용하는 감지를 추가했습니다.
- 전역 masthead에 명확한 선택 상태와 접근 가능한 터치 영역을 가진 Material 스타일 지구본 한국어/영어 전환기를 추가했습니다.
- 사용자가 명시적으로 선택한 언어는 자동 감지를 1년 동안 덮어씁니다.
- 전역 브랜드, 탐색, 세션 제어, footer, 주요 공개 홈 마케팅 콘텐츠를 현지화했습니다.
- 국가/브라우저 로케일 감지와 언어 전환기 상호작용 단위 테스트를 추가했습니다.
- Google Stitch가 요청됐지만 당시 환경에 Stitch connector/plugin이 없어 Google 국제 사이트 및 Material 상호작용 지침을 직접 따랐습니다.
- lint, workspace TypeScript, 계약 23개, 마이그레이션 6개, 백엔드 696개, 프론트엔드 438개, 정적 페이지 17개를 생성한 Production 빌드를 검증했습니다. DB URL 부재로 DB 기반 백엔드 테스트 299개는 건너뛰었습니다.
- 제어 바이트/커밋된 비밀정보 검사를 통과했습니다. Production 의존성 감사에서는 높은 심각도 0건, 중간 심각도 2건을 보고했습니다.

## 2026-09-03 — 관리자 콘솔 사용성

- `origin/main`에서 `codex/admin-console-ux-20260903` 격리 브랜치를 만들었습니다.
- 평면 회원 테이블을 검색/상태 필터 디렉터리와 요약 카드로 교체했습니다.
- 각 회원 행에서 전용 상세/활동 로그 화면으로 직접 이동할 수 있게 했습니다.
- 상태 정보, 고위험 작업, 최근 50개 회원 대상 감사 이벤트를 보여주는 회원 상세 페이지를 추가했습니다.
- 관리자 뒤로가기 컴포넌트가 문맥별 상위 목적지를 지원하도록 했습니다.
- 감사 화면에 Discord 전달 기록 전용 페이지 준비 및 요약/완료 시각/라우팅 탐색을 추가했습니다.
- 관리자 탐색을 회원 안전, 경제 운영, 기록/전달의 세 그룹으로 나누고 반응형 카드 그룹으로 재구성했습니다.
- 회원명 검색, 상태 필터, 상세 링크 상호작용 테스트를 추가했습니다.
- 제한/강제 로그아웃 후 디렉터리와 활성 상세 페이지를 모두 무효화해 오래된 화면을 수정했습니다.
- 인증 쿠키 요청도 다른 API 요청과 같이 Cloudflare의 권위 있는 클라이언트 주소 헤더를 보존하도록 했습니다.
- 최종적으로 workspace lint, 프론트엔드 테스트 435개, typecheck, 두 신규 동적 라우트를 포함한 최적화 Production 빌드를 통과했습니다.

# 2026-09-07 — 활동 신뢰성, 무제한 작업, 경제 참고자료

- 병합된 PR #75까지 GitHub 통합을 감사했습니다. `main`에 최근 AI 뉴스, 관리자 경계, 사진 moderation, 비공개 Discord 로깅 변경이 포함되어 있고 `main`에 없는 커밋을 가진 원격 기능 브랜치는 없었습니다.
- 활동 로그 관리자 guard 순서를 수정했습니다. DB에는 활동 행이 있었지만 세션 hydration 전에 엔드포인트가 403을 반환해 페이지가 빈 결과처럼 표시했습니다.
- 손실에 강한 브라우저 telemetry를 위해 client event ID, 재시도 지속성, 비성공 HTTP 응답 처리, DB 중복 제거를 추가했습니다. 정확한 원본 IP는 비공개 DB에만 남고 Discord에는 마스킹된 네트워크만 전달됩니다.
- 과제별 남아 있던 overtime 감액을 제거했습니다. 반복 작업은 일일 과제 횟수 제한 없이 전체 WLD와 EXP를 지급합니다.
- 자발적 화폐 소각처로 반복 구매 가능한 상점 상품 7개를 추가하고 시작 가이드에 신뢰성/가상경제 참고 링크를 게시했습니다.

## 2026-09-07 — 레거시 직업 과제 제한 제거 및 소각처 확장

- GitHub를 다시 fetch하고 AI 뉴스, Discord 전달, 사진 moderation, 모바일 관리자 접근, 활동 신뢰성 등 최근 원격 변경이 모두 `main`에 포함됐음을 확인했습니다.
- 직접 완료 경로는 이미 무제한이었지만 레거시 assign-submit-verify 작업 경로가 카탈로그 행의 `daily_limit`을 계속 강제하는 것을 발견했습니다.
- 마지막 배정 제한을 제거하고 호환 과제 보드 필드는 무제한 sentinel인 0을 반환하도록 했으며 회원/관리자 설명을 전체 반복 보상과 맞췄습니다.
- 350~60,000 WLD 가격대의 반복 가능한 비투자 편의 구매 8개를 추가해 신규 자발적 소각 상품을 15개로 늘렸습니다.
- 확인된 부족 사항, 우선순위, 근거, 릴리스 승인 기준을 담은 `docs/SITE_GAP_AUDIT_2026-09-07.md`를 추가했습니다.

# 2026-09-07 — 사진 공개·관리 및 단일 지갑 잔액 표시 복구

- 회원 사진 승인 후 DB는 공개 상태였지만 API가 내부 `/media/<key>` 경로를 외부 HTTPS 주소로 잘못 거부해 500을 내던 오류를 수정했습니다.
- 갤러리를 동적 조회로 전환해 승인 직후 공개 사진이 보이도록 했습니다.
- 관리자 콘텐츠 화면에서 대기·공개 사진 전체를 조회하고 공개/비공개 전환 및 영구 삭제할 수 있게 했으며, 삭제 시 내부 이미지 파일도 함께 정리합니다.
- 상점이 제거된 `cashBalance` 필드를 읽어 잔액을 0으로 표시하던 오류를 수정했습니다. 지갑과 상점 모두 동일한 `WalletOverview.balances.cash.availableAmount`를 사용합니다.
- 운영 원장 정합성 스냅샷에서 미균형 거래·누락 계좌·잔액 불일치가 모두 0임을 확인했습니다.

# 2026-09-07 — 계정 연속성, 안전한 병합, 복원력 있는 백업

- OAuth 로그인은 키와 독립적인 해시로 공급자 신원을 찾으므로 데이터 암호화 키 회전으로 빈 중복 계정이 만들어지지 않습니다.
- migrator 전용 append-only 계정 분기 병합 작업을 추가했습니다. 원장을 통해 잔액을 이동하고 선택한 이름/불변 이력을 보존하며 지원되는 사진/활동/성장/작업 상태를 병합하고 알 수 없는 소유 상태는 삭제 대신 거부합니다.
- Test/Production은 겹침 잠금, 1시간 신선도 검사, 제한된 보존, 결과 로그를 가진 10분 간격 암호화 전체 백업을 엇갈려 설치했습니다.
- 배포는 호스트 타임아웃을 줄이기 위해 하나의 SSH 제어 연결을 재사용합니다.
- 계정 병합 원장 항목에 명확한 한국어 지갑 라벨을 추가했습니다.
- 현재 프로젝트 부족 사항 감사를 `docs/findings/`에 추가했습니다.

## 2026-09-15 — v2026.09.15.113 Test 런타임 라우팅 복구

- 운영 승격 차단 원인을 확인했습니다. 공개 `test.easy-scraping.com`이 분리 Test 프론트가 아니라 Production Nginx 기본 upstream으로 들어가고 있었습니다.
- `TEST_FRONTEND_ORIGIN`이 설정된 경우에만 Test 호스트를 분리 런타임으로 전달하는 middleware 브리지를 추가했습니다. 변수가 없으면 Production 동작은 그대로입니다.
- 별도 포트 검증에서 Production 호스트는 라우터 빌드를 유지했고 Test 호스트는 정확한 main SHA `c82153917095bf380b5336ef95ad6932c9d7a295`, public-catalog 200, `noindex`를 확인했습니다.
- 잘못된 수동 BUILD_ID를 신뢰하지 않고 현재 main의 정확한 SHA로 Test 프론트/백엔드를 다시 빌드했습니다.

## 2026-09-16 — v2026.09.16.136 다중 에이전트 경제 AI 기획

- 서로 독립 버전 관리되는 전문 에이전트가 정책 적용 전 상호 반박·경쟁·감사하는 다중 에이전트 경제 구조를 추가했다.
- 결정론적 제한형 주가형성, 상점 자동 가격조절, 저위험 template 기반 SKU 자동 게시를 안전·구매력·시세조작 방지·롤백 gate와 함께 추가했다.
- 영문/한국어 컨트롤러·시뮬레이션 명세를 갱신했다. 기획 전용이며 런타임 배포는 수행하지 않았다.

## 2026-09-16 — v2026.09.16.138 적응형 직업/일일 제한 AI 기획

- 주직업 슬롯, 활성 직업 동시성, 일일 작업/정상보상 보호 제한과 무제한으로의 자동 완화를 제한형 AI 제어에 추가했다.
- 일반 일일 제한은 기본 무제한으로 유지하고 기존 주직업 선택/숙련도는 grandfathering으로 보호한다.
- 통합기획, 시나리오/QA, 롤백/감사 계약을 갱신했다. 기획 전용이며 런타임 배포는 수행하지 않았다.

## 2026-09-16 — v2026.09.16.139 전통 + AI 이중 경제 제어 조사

- OpenAlex+Crossref를 합쳐 중복 제거한 11,749건 연구 후보군과 영문/한국어 근거 검토를 추가했다.
- Economy AI를 전통/결정론 권위·fallback lane과 AI/학습 탐색 lane이 계속 병렬 실행하는 구조로 재정의했다.
- 모델 불일치 중재, 장애 fallback, 적용 후 인과보정, 주식·상점·자동 SKU·직업/제한·faucet/sink 권한경계를 추가했다.
- 이번 버전은 기획 전용이며 런타임 배포를 수행하지 않았다.

## 2026-09-16 — v2026.09.16.141 분야별 2중 경제 AI 위원회

- 6개 경제 AI 전문분야에 A/B 두 좌석, 독립/반박 검토, exact-proposal 중재, append-only 12좌석 증거를 구현했다.
- 기존 결정론 정책엔진은 fallback 권위로 유지했다.
- 개발 PostgreSQL에서 migration 200을 검증하고 두 번째 100GB 디스크에 AI 저장소를 구성했다.

## v2026.09.16.143

원격 AI 추론 비용과 지연을 줄이기 위해 동적 분야 라우팅, 조기 종료, 충돌 분야 재토론, 동시호출 제한, 동일 정책 캐시, 에이전트 telemetry/scoreboard를 추가했습니다.
