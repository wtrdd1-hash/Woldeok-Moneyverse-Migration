# 월덕 머니버스 운영 서비스·UI·검색 유입 정합성 감사 — v2026.10.14.624

**[영어 정본](MONEYVERSE_SERVICE_UI_AUDIT_v2026.10.14.624.md)** | **상태:** 결함·후속 검증 필요 / Test·운영 수용 아님
**기준:** 2026-10-14 KST, `origin/main=77e27063059555c97249a63bcd58a3451671150d` 및 미니PC 운영 경로 `prod-v600`.
**권위 문서:** `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, v530 긴급 UI 게이트. 이번 감사가 통합기획 권위를 변경하거나 배포를 승인하지 않는다.

## 1. 실제 확인 범위와 한계

- 미니PC `$pc`의 프론트엔드·백엔드·Nginx·Discord 봇·MCP 프로세스가 active, **개발 DB** 연결이 connected였다. 개별 기능 합격 증거는 아니다.
- `/srv/moneyverse`와 `production-current`는 모두 `prod-v600`; `test-current`는 `test-v618-7fa3f245bbc3`. systemd 실행 기준 경로는 `production-current`였다.
- 최신 `origin/main`의 Next `page.tsx` 템플릿 **164개, 관리자 34개**; 배포판은 **163개, 관리자 34개**. 템플릿 수가 정상 검증된 URL 수를 뜻하지 않는다.
- 읽기 전용 공개 URL 조사에서 홈, 도구 허브, 복리/연봉 계산기, 주식, 국고, 블로그, 가이드, 로드맵, 로그인/가입, 마켓, robots, sitemap, 영/일/중 홈 및 일부 번역 계산기 모두 HTTP 200. `/news`는 404였으나 사용자가 실제 누르는 링크인지 확인되지 않았다. `/api/health` 200. 비로그인 `/admin/seo` 응답이 HTTP 200인 사실만으로 관리자 권한 우회를 의미하지 않는다.
- 홈 SSR HTML의 `<h1>` 수는 **0**. 표본의 도구·주식·블로그·가이드·계산기들은 H1이 있었다. 홈 응답 하나가 약 6.42초, 다른 표본은 약 1초 수준으로 단발 표본이므로 CWV/지속 장애 근거는 아니다.
- 인증 계정/운영 거래/쓰기 API/관리자 기능 변경/DB 수정은 수행하지 않았다. 화면을 실제 렌더링하는 그래픽 브라우저를 사용할 수 없어 **픽셀 단위 모바일 겹침을 이번에 재현했다고 주장하지 않는다.**

## 2. 우선순위별 발견사항

| ID | 등급 | 코드·운영 증거 및 위험 | 해결·검수 조건 |
| --- | --- | --- | --- |
| UI624-01 | P1, 실측 잘림 시 P0 | 운영 `frontend/src/app/admin/seo/page.tsx:110-128`의 한국어가 긴 SEO 탭 2개가 줄바꿈 없는 `flex`. v530 때 문제가 된 별도 액션 그룹은 `seo-client-view.tsx:294`의 모바일 grid로 일부 개선됐으나 화면 전체 합격은 아님. | 320/360/375/390/430px, 가로모드·200% 확대, 포커스/키보드에서 실제 잘림 없음; 관리자 34개 템플릿 인증 E2E. |
| UI624-02 | P1 | `frontend/src/app/mobile-responsive-regression.test.ts:9-65`는 주로 CSS 문자열 포함 여부 테스트. 실제 DOM overflow, 클릭 위치, 모달 겹침, 가상 키보드 가림 검증과 다름. | 최신 정확한 SHA의 Playwright 렌더링/접근성/화면 캡처 전체 라우트·상태 테스트. |
| UI624-03 | P1 | `mobile-bottom-nav.tsx:71` 한 요소에 `min-w-[44px]`와 `min-w-0` 공존. 실제 클릭 영역이 줄어들 위험이 있으나 현재 크기 위반을 계측하진 않았다. | 충돌 클래스 정리, 계산된 클릭 영역 44×44px 이상, 5개 탭 320px 확인. |
| SEO624-01 | P1 | 운영 홈페이지 서버 반환 HTML에 H1이 없음. `frontend/src/app/page.tsx`는 H2/H3 중심. | 언어별 의미 있는 서버 렌더링 H1 한 개와 헤딩 계층 검증. |
| SEO624-02 | P1 | `frontend/src/lib/json-ld.ts:46-49`, `lib/seo.ts:88-90,135-137` 및 여러 금융 계산기에서 별점 4.9 등과 리뷰 수를 고정 입력. 실제 평점 데이터 출처는 입증되지 않음. | 검증되지 않은 별점 제거 또는 실제 검증 가능한 사용자 리뷰와 일치하도록 연결, Google 리치 결과 검사. |
| SEO624-03 | P1 | v603에서 `api/admin/seo-audit/route.ts:8-53`의 크롤링·색인 성과 고정값 확인. 실제 GSC/Naver 실측이라고 볼 수 없음. | MOCK 표시 또는 권위 API·집계시각·오류상태·속성 연동, 제출과 실제 색인 분리. |
| SEO624-04 | P2 | `FAQPage`로 검색 결과 아코디언 확보를 홍보하는 코드/문서가 남음. Google은 2026년 5월 FAQ 리치 결과를 종료했다고 명시. | 잘못된 기대효과/성과지표 정정; FAQ 텍스트 자체의 유용성은 유지. |
| ECON624-01 | P1 | 이전 v603 감사는 `api/treasury/claim/route.ts:7-58`이 원장 영수증 없이 지급 성공 응답할 가능성을 코드로 확인. 실제 지급이나 악용은 이번에 시험하지 않음. | 지급 실패 시 성공 반환 금지, 모의 기능과 실제 지급 분리, 멱등 원장 정산/영수증·동시성 검증. |
| TRUST624-01 | P1 | 운영 홈페이지 메타 문구에 즉시 1만 WLD 및 1천만 WLD 잭팟 복권 약속. 현재 통합기획 v523/v542는 WLD 복권·발행·자금 보전 관련 제한이 있어 실제 지급·자격 증빙 없이 확정 광고하면 오인 위험. | 승인·실가동 보상만 홍보, 연령/지역·지급조건·영수증 일치, 확정적 보장 표현 정리. |
| SEC624-01 | 조건부 P0/P1 | v603 감사지에 공통 기본 인증키 위험, 관리자 백업 권한 검사, 중복 DAO 투표, 파일 저장 원자성, 미인증 IndexNow, 지원자 식별 오류가 기록됨. 실운영 악용 여부 미확인. | 인증키 fail-closed, 역할/행위 음성검사, 데이터/원장 정합성 검수, 독립 Test 검증. |
| OPS624-01 | P1 | 공식 v530 전체 UI 상태는 여전히 BLOCKED. 운영 prod-v600과 Test v618 후보는 명칭이 다르고 배포 디렉터리 루트의 `.moneyverse-release.json` 파일은 확인되지 않음. 정확한 커밋/CI/수용 기록 없이는 승격 수용 불가. | GitHub CI → 동일 SHA 격리 Test(백엔드/DB/인증 포함) → 전체 관리자 UI → 무중단 운영 증빙. |
| NAV624-01 | P2·미분류 | `/news`가 404. 유효 메뉴 링크임을 확인하지 못해 실제 깨진 메뉴라고 확정하지 않음. | 링크 그래프 조사 후 필요하면 목적지 수정. |
| PERF624-01 | P2·표본 부족 | 홈 1회 요청 약 6.42초. p95·p99 및 LCP/INP/CLS 측정 없이는 일반적 지연이라고 확정 못함. | 로그인 여부·지역·캐시별 RUM 및 부하 없는 반복 측정. |

## 3. 실행 우선순위

1. **원장·권한·신뢰성:** 실제 지급 없이 성공, 조건부 고정 인증키, 중복 투표 등 이용자 피해 가능 경로를 먼저 안전화한다. 운영 데이터는 진단 중 변경하지 않는다.
2. **UI 검증과 실제 개선:** 관리자 SEO 탭, 모바일 하단 메뉴와 고정 레이어, 스크롤, 접근성, 모달·키보드, 확대와 언어별 레이아웃을 화면 실측으로 고친다. 관리자 화면 34개 포함 전체 상태 검사한다.
3. **사용자에게 보이는 수치의 진실성:** 보상/복권 광고 문구, 관리자 색인률/검색 수치, 원장 영수증을 실제 근거와 연결한다.
4. **검색 유입:** 홈 H1, 증빙 없는 별점, 2026년 종료된 FAQ 스니펫 기대효과, 국가/언어별 canonical/hreflang·원천 데이터·내부 링크 및 검색 유입 후 행동/회원전환을 검증한다. 가치 없는 대량 URL 증설은 보류한다.
5. **배포품질:** 정확한 Git SHA, CI, 격리 Test 백엔드/DB/세션, 모바일·전체 관리자 E2E 증거를 갖춘 뒤 공식 무중단 운영 절차에 따른다. 이번 분석이 완료·승격을 뜻하지 않는다.

## 4. 근거·검증 상태

- 기준 문서: `docs/planning/PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md`, `EMERGENCY_FULL_UI_REAUDIT_SPEC.md`.
- 선행 코드 감사: `docs/findings/MONEYVERSE_FULL_CODE_SECURITY_AUDIT_v2026.10.14.603.ko.md`.
- Google 구조화 데이터 품질: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google Search 업데이트(FAQ 종료): https://developers.google.com/search/updates
- Google 대량 저가치 콘텐츠 정책: https://developers.google.com/search/docs/essentials/spam-policies
- **미실행:** 브라우저 스크린샷 및 전체 라우트 5패스, 34개 관리자 인증 E2E, 운영 DB/경제 음성검증, 정확한 SHA Test 승격, 운영 배포. **이번 작업은 읽기 중심 진단과 문서만 생성한다.**
