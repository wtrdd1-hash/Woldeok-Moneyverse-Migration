# 길드 홈 QA 반영 기록 — v2026.11.24.1646.2 ~ .1646.4

원본 QA: `docs/qa/2026-11-24-guild-home-visual-review-v2026.11.24.1646.ko.md` (브랜치 `docs/guild-home-qa-20261124-1646`, 커밋 0d6bdc94e2).
작업자: Claude Code (Claude Opus 5.5) · 브랜치 `fe/next-spring-test-connect-20261124` · 상태: Test 반영 / 운영 HOLD.

## .1646.2 원인 조사
- 디자인 기준: 소유자 승인 G1(`docs/design/game-ui-v2026.11.24.G1`). QA 가 인용한 11/18 시안은 보관본이므로 G1 을 기준으로 하되 QA 지적을 우선 반영.
- GH-04 잔액: `/api/wallet/summary`(Next) → Spring `/api/v1/wallet/summary`. 비로그인은 `signedIn:false`, 로그인 실패/읽기 불가는 별도 상태(WalletGlance). 송금 버튼은 이전 구현에서 비회원에게도 노출됐음.
- GH-08 서버 시간: `/app-api/v1/game-clock`(Spring `game-clock`, `realSecondsPerDay=600`) 실값. 의미 설명이 화면에 없었음.
- GH-07: 실시간 시세는 `/api/v1/stocks` 실데이터. "최근 활동" 공개 API 는 확인되지 않아 만들지 않음(가짜 피드 금지).

## .1646.3 구현 (격리 브랜치)
| ID | 반영 |
| --- | --- |
| GH-01 | 큰 장식 배너 → 압축 상태 띠(제목·서버 시간·오늘 상승/하락 종목 수) |
| GH-02 | 금색은 핵심 수치(잔액)만, 주 버튼·링크는 바이올렛, 절단 모서리 12→8px, 공통 Button 기본도 바이올렛 |
| GH-03 | 가입 없이 시작은 비회원에게만(로그인 회원 미노출), 링크 3개 유지 |
| GH-04 | 금색 원 장식 제거, 잔액 상태 구분 유지, 지갑·송금은 회원만, 비회원은 "로그인하고 지갑 보기" |
| GH-05 | 공지 날짜 표시(Asia/Seoul 고정), 카드 높이 내용에 맞춤(그리드 items-start), 전체 보기 링크 |
| GH-06 | 굵은 디스플레이 서체는 페이지 제목만, 섹션 제목은 본문 서체 700, 수치 tabular-nums |
| GH-07 | 시세 표를 넓은 칸에 배치(벤토 2열), 실데이터만 |
| GH-08 | "서버 시간 (현실 10분 = 서버 하루)" 라벨과 서버 시계 |
| 추가 | 광고 표시가 한국어 홈에서 영어로 나오던 문제(기본 언어 처리), 온보딩 칩이 공지 제목을 가리던 문제(사이드바 하단 이동), 머리글 링크 44px |

## .1646.4 Test 검증
- 해상도 1736/1440/1280/1024/768/430/390/320: 가로 넘침 0, h1 1개, JS 오류 0(Playwright Chromium, 비로그인).
- 전체 프론트 테스트 통과(tsc 통과). 홈 관련 테스트(게스트 진입, SEO, 링크, 대비) 통과.
- **미검증(수용 기준 미충족 → 운영 HOLD 유지):** 회원/관리자 로그인 상태 화면, 세션 만료·401/403/5xx 브라우저 시나리오, 송금 E2E(격리 합성 계정 필요 — 자체 가입이 백엔드에서 닫혀 있어 계정 생성 불가), 키보드·대비 자동 측정 리포트.

## PR #3438 (`docs/guild-home-remedy-v2026.11.24.1650`) 대조 검토
같은 QA(GH-01~08)를 근거로 한 별도 구현. 기준 브랜치는 v10 개편 스택(bc0ad80785)이며 이 브랜치와 `frontend/src/app/page.tsx` 가 충돌한다. Test Spring(55438) 실계약과 대조한 결과:

| 항목 | PR #3438 | 실제 / 규칙 |
| --- | --- | --- |
| 시장 지표 | `/api/v1/stocks/market-summary` 호출, 실패 시 `1254.8`, `+1.42%` 고정값 표시 | 해당 API 404 → 항상 고정 시세 노출. QA §4 "고정 시세 금지" 위반 |
| 잔액 | `cashBalance`/`depositBalance`/`netWorth` 를 `Number()` 로 표시, 없으면 0 | 실제 응답은 `totalAvailableAmount`(문자열) → 로그인 회원도 항상 0. QA "가짜 0 금지", AGENTS "잔액 Number() 금지" 위반 |
| 서버 시간 안내 | "서버 10분 = 현실 1일" | 실제는 현실 10분(600초) = 서버 하루(`realSecondsPerDay=600`) — 반대로 표기 |
| SEO/게스트 | 로케일 h1·메타데이터, 비회원 빠른 시작, WalletGlance, P2P 송금, 시세 실패 문구 제거 | 기존 테스트(guest-first-home, seo-sitemap-integrity, e2e-click) 계약 위반 |
| 디자인 | 대문자 eyebrow, 그라디언트, hex 직접 지정 | QA GH-02 "승인 토큰·컴포넌트 재사용" 및 G1 규칙 위반 |

권고: PR #3438 의 `page.tsx` 는 병합하지 않는다. 이 브랜치의 구현(.1646.3)이 같은 QA 를 실데이터·기존 계약 안에서 반영한다. PR 의 Spring Thymeleaf `home.html`/`home.css` 는 전환기 프레젠테이션이므로 별도 판단.
