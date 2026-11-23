# 홈 대시보드 실제 데이터·디자인·파비콘 로고 지시 이행 통합 조사
버전 **v2026.11.23.9** | 일자 2026-11-23 | **P0 데이터 출처/허위 LIVE 위험 · P1 UI/로고 · OPEN** | [English](2026-11-23-dashboard-live-data-logo-ui-v2026.11.23.9.md) · [이슈 #3384](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3384)

## 1. 사용자 캡처와 조사 범위
사용자가 `https://easy-scraping.com/dashboard` 데스크톱 전체 캡처 및 W 흰 글자 사각 아이콘·`W Moneyverse` 부분 확대 캡처 2개를 제공함. 요구사항: **실제 백엔드 데이터 대신 고정 수치가 보이는지 확인**, **선택한 보라·네이비 UI 불일치 기록**, **실제 서비스 파비콘 이미지를 공통 로고로 쓰라는 기존 지시와 작업 기록의 이행 여부 조사**, 이를 한 문서로 통합. 개인정보/세션/잔액 원문 캡처는 공개 GitHub에 올리지 않았다. 운영 서버를 직접 인증 접속하지 않았으므로 실제 코드의 실행 경로와 자산 바이너리는 아직 미검증.

## 2. GitHub 실제 소스 근거 — main `9876c09888ec84034eec183cf1309c85df3d7447`
[Spring 정적 대시보드 소스](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/spring-backend/src/main/resources/static/index.html) 확인:

| 근거 | 코드 실제 내용 | 판정 |
|---|---|---|
| `index.html:943–980` | 고정 `100,000,000,000,000 WLD`, `+2.41%`, 24시간 거래량 `42.8억 WLD`, `12,840`명 및 `1,420`세션 | **파일에 직접 하드코딩된 상수 확인**. 캡처와 여러 값 일치 |
| `index.html:1025–1047` | 그래프 `<path d="M 0,90 ...">` 정적 SVG, 기준일 `2026-11-19`, 지수 `2,540.21 (+2.41%)`, 가용성 `99.99%`, `Netty 9092 LIVE` | **정적 차트·수치·LIVE 문구 확인**, 실제 실시간 API 증거 아님 |
| `index.html:897–900` | `복식부기 원장 동기화 정상` 안내 문구 직접 삽입 | 원장 실제 대사 없이 정상 상태로 단정할 위험. 사용자 화면의 복구 작업 공지와 함께 실측 확인 필요 |
| `index.html:1345–1420` | `/api/v1/auth/me` 및 필요시 `/api/v1/wallet/overview` 읽어 `balanceWld`를 첫 카드에 반영하는 JavaScript | **일부 동적 조회 코드도 실제 존재**. 전부 고정이라고 판정 금지. 로그인 사용자 `0 WLD`가 실제 잔액인지, 미조회 기본값인지 확인 필요 |
| `index.html:842–846` | 좌측 W 로고 IMG 소스 `/images/woldeok-symbol.png` | 보이는 로고 소스가 **명시적 파비콘 경로와 다름**. 실제 파일 내용이 다른지는 SHA256 확인 전 미확정 |
| `index.html:8–10` | 브라우저 탭은 `/favicon.ico`, PNG 대체 아이콘은 `/images/woldeok-symbol.png` | 별도 경로. 실제 브라우저 채택 아이콘/서비스 응답 확인 필수 |

**따라서 결론은 ‘일부 수치의 소스 하드코딩 확인 + 인증/지갑 동적 조회 코드의 혼재’이다.** 이 `index.html`이 지금 운영 `/dashboard` 요청에 실제 대응하는지의 Nginx/라우터/배포 SHA, 사용자의 잔액이 복식부기 전체 자산인지 단순 지갑 WLD인지는 추가 서버 점검 전 단정하지 않는다.

## 3. 파비콘을 실제 로고로 사용하라는 지시 및 이전 작업 전수 대조
1. [공식 아이콘/브랜드 자산 규격](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/design/OFFICIAL_ICON_AND_BRAND_ASSETS.md): 브라우저용 `/favicon.ico`, 내비게이션용 `/images/woldeok-symbol.png`, 마스터 `/images/woldeok-official-icon.png`를 기재한 과거 문서. 이 문서만으로 **후속 사용자의 실제 파비콘 재사용 지시를 덮어쓰지 않는다**.
2. [2026-11-20 파비콘/로고 작업 기록](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/worklog/2026-11-20-favicon-logo-frontend-audit.ko.md): 사용자 지시를 “실제 운영 파비콘을 로고로 사용”이라고 명시. 당시 `/favicon.ico`와 `/assets/mv39/favicon.ico`가 동일한 11,781바이트이고 SHA256 `9ce0a8f10cafff52d1d2f7aa451b3e9162944162f61258842e13aa8546f98e78`로 기록. 공통 헤더 이미지·탭 링크·모바일 표시 RED→GREEN, 일부 공개 경로 운영 승격 기록도 있음. **관리자/전체 웹 작업 완료 주장은 아님**.
3. [Superpowers 파비콘 적용 계획](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/superpowers/plans/2026-11-20-favicon-logo-frontend-audit.md): `/assets/mv39/favicon.ico`를 신규 재생성하지 않고 실제 공통 IMG로 재사용하라는 내용 명확.
4. [과거 홈 디자인 장애 보고서](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/qa/2026-11-20-member-home-visual-incident-v42.3.1.md): 과거 운영 홈에서 **허구 고정 지표** `100조 WLD`, `+2.41%`, `12,840`명, `1,420`세션이 사용됐음을 명시. **과거 문제 이력**으로, 현재 실시간 값을 측정한 보고서는 아님.
5. **책임 추적:** 지금 보이는 흰 W 아이콘과 정적 소스는 기존 ‘실제 파비콘 사용’ 지시와 충돌할 **가능성이 높아 시정 대상**이다. 하지만 실제 PNG·ICO 바이트 동일성, 최신 운영 배포 SHA, PR/커밋 담당자를 확인하기 전 **특정 작업자가 지시를 위반했다고 확정하거나 책임자 이름을 기재하지 않는다**.

## 4. 선택된 공식 디자인과 불일치
[사용자 선택 네이비·보라 전체 180화면 디자인 v2026.11.23.3](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/design/nov18-unified-all-180-20261123/docs/design/OWNER_SELECTED_UNIFIED_DESIGN_v2026.11.23.3.ko.md) 대비 실제 캡처는 단순 표준 카드/곡선 그래프 중심이고 PC 좌측 메뉴에 **직업/커리어 진입 메뉴가 보이지 않음**. 공식 선택안의 로고·내비게이션·직업 카드 등 상세 화면과 다름. 네이비 배경이나 일부 보라색 색상만 일치한다고 통일 디자인 완료로 인정 금지.

이전 3건은 별도 [불일치 통합 보고서 v2026.11.23.8](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/docs/consolidated-ui-regressions-20261123/docs/findings/2026-11-23-consolidated-ui-regression-and-qa-v2026.11.23.8.ko.md)로 유지: `/admin/users`, `/admin/logs`, `/bank`. 이번 `/dashboard`는 **네 번째 독립 화면**이다.

## 5. 시정 및 정밀 QA 수용 조건
1. **실제 서빙 파일 추적:** `/dashboard` 응답 HTML, CSS/JS, Nginx·CDN, 실제 백엔드와 설치 JAR/파일 SHA, 캐시를 대조해 이 `index.html`이 운영 화면의 원천인지 확인.
2. **모든 수치의 실데이터 증빙:** `화면 지표 → API 경로/응답시간/사용자·권한 → DB 테이블/복식부기 원장·시계열·통계 출처 → 화면 바인딩 → 실패·빈값 처리` 추적표. 검증 전 허구 수치·고정 곡선·`LIVE`·정상·가용성 99.99% 표시 제거 또는 미확인 상태로 표기.
3. **0 WLD 점검:** 실제 회원 본인 잔액과 지갑/은행/투자 자산 구분, 원장 대사, 접속 오류·503 시 `0`을 정상 잔액으로 둔갑시키지 않음. 사용자 자산 데이터/원장 수정 없이 읽기 전용 확인.
4. **로고 실사:** 운영 `/favicon.ico`, `/assets/mv39/favicon.ico`, `/images/woldeok-symbol.png`의 SHA256과 실제 메뉴 IMG를 비교. 이전 지시대로 **실제 파비콘 파일을 PC/모바일/관리자 공통 로고**로 재사용하는지 확인하고, 다르면 원인 추적 후 시정. 캐시·버전 일치 검증.
5. **UI 일관성:** 공식 네이비/보라 디자인에 맞춰 PC·모바일, 직업 진입, 5개 언어 자동/수동 선택, 전역 문의/채팅, 접근성, 320~1920px, 로딩/오류/거부 화면까지 재검증.
6. **변경 승인:** 원인 추적/실패 재현 → 별도 Spring MVC + Thymeleaf 수정 브랜치 → RED→GREEN 회귀 테스트 → 실제 권한·API·원장·브라우저 정확 SHA Test → 복구·무중단 게이트 검증 후에만 운영 반영. Gemini와 동일 파일 충돌 방지.

## 6. 최종 판정
**GitHub 소스 상수·SVG 고정값 존재는 확인됨. 현재 운영 /dashboard의 정확한 바인딩/배포판·로고 바이너리 동일성·금융 데이터 정확성·작업 담당자는 미검증.** 문서 기록만 진행했으며 프론트엔드·백엔드·DB·Test·운영 수정은 하지 않았다. 기능 합격 또는 지시 이행 완료로 표기 금지.
