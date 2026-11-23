# 사용자 지시 통합 문제점·UI·실데이터·로고·약관 재동의 마스터 보고서
버전: **v2026.11.23.10** | 날짜: 2026-11-23 | 상태: **PLANNING / P0 시정 필요 / 실제 적용 전**
영문 정본: [English](2026-11-23-all-issues-ui-data-logo-policy-consent-master-v2026.11.23.10.md)

## 1. 통합 범위와 공식 기준
이번 문서는 사용자가 보내주신 **4개 화면**과 **새로운 이용약관·개인정보처리방침·6개월 재동의 및 변경시 즉시 공지/재동의** 요구사항을 한 곳에 묶은 **최신 통합 보고서**다. 이전 [3개 화면 통합 v8](2026-11-23-consolidated-ui-regression-and-qa-v2026.11.23.8.ko.md), [대시보드 별도 조사 v9](2026-11-23-dashboard-live-data-logo-ui-v2026.11.23.9.ko.md)은 증거 기록으로 보존한다. 본 문서는 실시간 운영 검증 또는 배포 영수증이 아니다.

공식 선택 UI: [네이비·보라색 전체 180페이지 v2026.11.23.3](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/design/nov18-unified-all-180-20261123/docs/design/OWNER_SELECTED_UNIFIED_DESIGN_v2026.11.23.3.ko.md) (Draft PR #3376, main 미병합). 문서 권위는 `PROJECT_PLAN` → `INTEGRATED_PLANNING_MASTER` → 명시 채택된 상세 규격을 따른다. GitHub main 시작·중간 `9876c09888ec84034eec183cf1309c85df3d7447`. 미니PC 접근 오프라인. 원본 회원 스크린샷·회원 이름/UUID 및 개인 데이터를 공개 저장소에 넣지 않는다.

## 2. 기존 문제 4개 화면 + 로고 통합 원장
| ID | 실제 사용자 캡처 경로 | 확인된 문제·한계 | 우선순위 / 기존 이슈 |
|---|---|---|---|
| UI-01 | `/admin/users` | 공식 W 브랜드 관리자 공통 헤더/사이드바 대신 `WOLDEOK / ADMIN` 텍스트 상단·일반 회원 표. 가입일 원본 ISO, 첫 제한 수 데이터만 검색한다는 안내 | P0 UI / P1 검색·권한·반응형 [#3378](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3378) |
| UI-02 | `/admin/logs` | 화면 대부분을 초대형 보라색 그래픽이 차지하고 로그 목록·필터가 해당 캡처에 보이지 않음. **백엔드 로그 부재 증거는 아님** | P0 레이아웃·CSS·로그 권한 [#3382](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3382) |
| UI-03 | `/bank` | 사이드바/탭에 `Translation unavailable`, 입출금 입력란·금액 버튼·여백 불규칙, 통일 메뉴/직업 경로 미표현 | P0 다국어 / P1 금융 UX·원장 [#3380](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3380) |
| DATA-04 | `/dashboard` | 캡처의 `+2.41%`, 회원·세션 수 등이 [Spring 정적 HTML](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/spring-backend/src/main/resources/static/index.html)에 고정 상수로 존재. 차트 SVG·기준일·가용성 99.99%·LIVE·원장 정상 문구도 정적으로 정의됨. **다만 인증·지갑 API를 통한 일부 잔액 갱신 코드도 존재** | P0 실데이터 출처/허위 LIVE 판정 필요 [#3384](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3384) |
| BRAND-05 | `/dashboard` 확대 캡처 | 사용자 지시: **사이트 실제 파비콘을 화면 로고로 재사용**. 이전 [11/20 작업 기록](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/worklog/2026-11-20-favicon-logo-frontend-audit.ko.md) 존재. 코드상 사이드바 PNG `/images/woldeok-symbol.png`, 탭 ICO `/favicon.ico`로 경로가 다름. **동일 이미지 바이트인지와 운영 배포 SHA는 미확인** | P1 로고/지시 이행 검증 [#3384](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3384) |
| DESIGN-06 | 위 4화면 전체 | 공식 통일 UI와 화면별 셸·버튼·메뉴가 다르고 보이는 PC 메뉴에 직업 진입이 없음. 색상 일부 일치로 합격 처리 금지 | P0 전체 네이비·보라 통일 및 상세 UI [#3374](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3374) |

**판정 경계:** 정적 소스에 수치가 있는 사실은 확인했지만 지금 운영 `/dashboard`를 실제 어떤 HTML·캐시·JAR가 서비스하는지, `0 WLD`가 실제 회원 원장 값인지까지는 인증된 서버 검사 전 확정 금지. 원장 DB를 직접 변경해서 문제를 숨기지 않는다.

## 3. 이용약관·개인정보처리방침 공식 접근 링크
GitHub에 실제 **페이지 경로 소스**가 존재한다. 다만 외부 HTTP로 두 페이지가 현재 정상 열리는지는 이번 조사에서 검증하지 못했다.

- **이용약관:** [https://easy-scraping.com/terms](https://easy-scraping.com/terms) — `frontend/src/app/terms/page.tsx` 확인.
- **개인정보처리방침:** [https://easy-scraping.com/privacy](https://easy-scraping.com/privacy) — `frontend/src/app/privacy/page.tsx` 확인.

PC·모바일의 **모든 공개/회원/관리자 페이지 하단 푸터**, 로그인/회원가입, 구글·디스코드 OAuth 시작·복귀 흐름, 자체 이메일 로그인, 계정/보안 설정, 최초 동의/재동의 팝업에 **두 문서 링크를 명확히 표시**할 것. 비로그인·미동의 상태에서도 전문 열람 가능해야 하며 원문에는 제목·문서 버전·게시일·시행일·개정 이력·언어 선택을 제공한다. 영어 기본, 한국어 두 번째, 일본어/중국어 간체/베트남어 지원. 실제 발행 본문/링크 404 및 관리자 페이지 링크 누락을 QA한다.

## 4. 구글·디스코드·자체 로그인 모두 적용할 동의 정책
**사용자 신규 명시 요구: 최초 동의 + 6개월마다 재동의 + 약관 내용 변경 시 공지 및 재동의**. 이는 사용자가 지정한 **서비스 운영 정책**이며, 한국 법에서 모든 상황에 6개월 주기를 일률적으로 강제한다는 의미로 기록하지 않는다. 법적 고지·동의의 범위, 특히 선택/필수 개인정보 처리 구분은 별도 법률 검토한다.

1. **로그인 방식 통일:** Google OAuth, Discord OAuth, 자체 이메일/비밀번호의 **가입·첫 로그인·기존 로그인·세션 복귀** 모두 같은 서버 정본 `이용약관 버전 + 개인정보처리방침 버전 + 최종 동의 시각`으로 판정. SNS 제공자 이용약관 동의를 머니버스 동의로 간주하지 않는다.
2. **명시적 개별 체크:** 이용약관 확인·개인정보 처리에 대한 필요한 항목(법적 근거별 구분) 및 기존의 연령 확인 항목을 각각 제공; 미리 체크 금지, 원문 링크·문서 버전 표시. **선택 마케팅/광고 동의를 필수 동의로 합치지 않음**.
3. **정확히 6개월마다:** 회원이 마지막 필수 동의를 **성공적으로 서버에 기록한 시점부터 6개월(달력상 6개월, 단순 180일 아님)**이 지나면 최신 두 문서를 표시하고 재동의 요청. 로그인 시·세션 재개 시·보호되는 기능의 API 실행 전 서버에서 판정. 서버 UTC 타임스탬프+달력 월 계산, 날짜 경계/윤년/말일 정책을 테스트하고 정본 DB 증거를 보존. **기존 구현에 6개월 자동 만료가 있다는 증거는 아직 찾지 못함** → 신규 요구/미구현 검증 필수.
4. **약관·방침 변경 시 즉시:** 6개월이 지나지 않았어도 **중요 변경·동의 범위 변경·새 게시 버전** 발생 시 시행일/변경 전후 버전/변경 요약·차이·전문 링크를 **공지하고 해당 보호 기능 사용 전에 새 버전으로 재동의**받는다. 경미한 편집 변경은 법률/정책 검토 후 별도 고지만 할 수 있어 개정=항상 법적 재동의 의무라고 단정하지 않는다. 사용자 요청에 따라 서비스 정책상 필수 대상 변경은 즉시 재동의한다.
5. **거부·중단 처리:** 동의하지 않으면 동의를 필요로 하는 보호 기능 차단, 약관 원문·개인정보 관련 문의·로그아웃·계정 삭제 요청은 접근 유지. 재동의 거부를 몰래 승인하거나 자동 체크하지 않음. 이미 로그인한 사용자를 약관 버전 변경만으로 무조건 로그아웃/OAuth 재인증시키지 않되, 인증 자체가 만료된 경우는 별도 처리한다.
6. **감사·보안:** 서버는 사용자·세션·문서별 승인 버전·시각·표시 언어·공지 시각·요약 식별자 등을 **개인정보 보호된 서버 저장소**에 기록, 구버전 수락 기록은 보존한다. 동의 API는 CSRF, 소유권, 멱등성, 동시 장치·재전송·시간 조작·실패 기본 차단을 검증한다. GitHub에 회원 동의 기록·토큰·개인정보 원문 게시 금지.

### 현재 코드에서 확인한 부분과 미검증 부분
- 기존 `frontend/src/app/login/consent-form.tsx`의 [가입/동의 UI](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/frontend/src/app/login/consent-form.tsx)에 `/terms`, `/privacy` 링크와 버전별 필수 동의가 존재함.
- `frontend/src/components/consent-guard.tsx`는 `consentCurrent`가 거짓일 때 최신 정책 재동의 팝업 표시.
- `backend/src/auth/bootstrap.controller.ts`는 `GET /auth/policy`의 두 정책 버전 및 `GET /auth/viewer`의 최신 동의 상태를 제공.
- `backend/src/auth/auth.controller.ts`의 `PUT /auth/consent` 및 `backend/src/auth/guards/consent.guard.ts`는 서버 세션/CSRF/동의 검사(미동의 시 428)를 일부 갖춤.
- **그러나 위 기존 Next/Nest 소스만으로 현재 Spring 운영에서 구글·디스코드·자체 로그인과 6개월 주기/버전 변경 통지가 모두 동작한다고 판단할 수 없다.** 6개월 만료일 데이터와 Spring 코드·테스트의 실제 적용 경로를 점검해야 한다.

## 5. 정밀 QA 및 수정 승인 기준
- 세 로그인 방식 × 신규 가입/동의/거부/재동의/세션 유지/비정상 종료/이중 제출/다중 기기 × **6개월 경계 직전·당일·경과** × 이용약관만 변경/방침만 변경/동시 변경/공지·시행일·서버 장애 시나리오.
- PC/모바일 320/360/390/430/768/1024/1440/1920px 및 200% 확대, EN/KO/JA/ZH/VI, 링크 정상 열림, 키보드·스크린리더·대화상자 포커스, 403/428/503/로딩/실패 메시지 검사.
- 회원 본인 정본 동의 상태 및 서버 감사 영수증, OAuth 콜백 우회·로그인 경로 차별·API 직접 호출 우회 금지. 법적/비즈니스 검토를 통해 개인정보 처리 목적별 필요한 동의와 고지를 구분한다.
- 기존 4개 화면의 UI·API·실데이터/로고/금융 정밀 QA도 **모두 OPEN**. Gemini 충돌을 막는 별도 브랜치, Spring MVC + Thymeleaf Test 환경에서 정확 SHA 및 실제 DB의 읽기 전용 비교·권한/보안/회귀 검사를 완료한 뒤에만 무중단 운영 승격.

## 6. 관련 문서·이슈·상태
이전 [3화면 통합 보고서](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/docs/consolidated-ui-regressions-20261123/docs/findings/2026-11-23-consolidated-ui-regression-and-qa-v2026.11.23.8.ko.md) · [대시보드 소스·로고 조사](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/docs/dashboard-source-logo-ui-audit-20261123/docs/findings/2026-11-23-dashboard-live-data-logo-ui-v2026.11.23.9.ko.md) · 문제 추적 [#3378](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3378), [#3382](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3382), [#3380](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3380), [#3384](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3384).

**결론: 통합 문서화 및 새로운 운영 정책 채택 요청 기록만 완료.** 실제 사이트 개인정보처리방침/이용약관 HTTP 200, 6개월 동의 자동화, 구글·디스코드·자체 로그인 실제 QA, 데이터/로고/UI 수정 및 Test·운영 반영은 **완료 확인되지 않음**. 기존 사용자 동의나 서버 DB를 변경하지 않았다.
