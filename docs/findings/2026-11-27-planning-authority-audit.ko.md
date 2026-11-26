# 전체 기획·문서 권위 재감사 — v2026.11.27.PLAN-AUDIT.1

**상태: AUTHORITY_DRIFT / 문서 검토 후보 / 운영 승격 HOLD.** [English](2026-11-27-planning-authority-audit.md)

## 점검 범위
미니PC Debian에서 2026-11-27 KST 직접 조회. 웹 main `1df1150e979106ec03d682a10f1f1348bff0a44c`, Android main `b6e9dda322ab7440567c0306295f3baf45067aeb`. 중간 fetch 동일. 양쪽 main의 모든 추적 md/mdx/txt/rst/adoc 파일 내용 기계 검색: 웹 5,634경로/고유 blob 5,544개/24,485,074바이트/273,480줄/기획 403경로; 앱 65경로·blob/647,350바이트/13,879줄. 시각 기준·게스트·main 쓰기·자동 배포·동의·시간 관련 검색 결과는 후보이며 모두 결함은 아님. 중요 지시 구간 직접 대조; 전 문장 의미/번역 검수나 모든 브랜치 전수 확인 아님. 웹 기획/운영 EN-KO 짝 후보 3개 분류 필요. 제한된 상대 .md/.json/.png 링크 검사 후보 0건은 전체 링크 정상 인증 아님(기존 API 경로 결함 유지). 인벤토리와 검색 근거는 미니PC 내부 작업 저장소에 보관.

## 충돌 및 미반영 지시
| ID | 우선 | 근거·정리 방향 |
|---|---|---|
| A01 | P0 | [문서 권위](../DOCUMENT_AUTHORITY.ko.md), [프로젝트 기획](../planning/PROJECT_PLAN.ko.md), [통합 기획](../planning/INTEGRATED_PLANNING_MASTER.ko.md), [UI 단일 참조](../UI_UX_SINGLE_REFERENCE.ko.md)는 11/23 v10. AGENTS는 G1을 현행이라 하면서 G2 링크. [디자인 정책](../design/CURRENT_UI_DESIGN.ko.md) 같은 파일에 G2/G1/v11 동시 현행 지시. G2는 기록상 사용자 승인 최신 후보이나 승인 출처·정확한 매니페스트 대조 후 단일 권위 확정. 불명확한 디자인 개편 보류. |
| A02 | P0 | [매니페스트](../design/CURRENT_UI_DESIGN_MANIFEST.json)는 G1이 아니라 v11의 180개 경로. [G2 경로별 시안](../design/game-ui-v2026.11.24.G2/routes/README.md)에는 이미 PNG 180개 존재(유형 기반 예시; 기능 검증 아님). G2 시안 부재라는 문구 정정 필요. 경로 집합/해시 검증 후 매니페스트 하나 확정, 과거 자산 이력 보존. |
| A03 | P0 | 디자인 정책의 모든 180 화면 게스트 개방과 관리자 전용 메뉴/권한 제한 충돌. 공개 안전 화면만 비로그인 탐색; 보호 HTML·데이터·액션은 서버 RBAC 및 적절한 noindex/no-store 유지. 실제 노출 확인 아님. |
| A04 | P0 | [PR3455](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3455) 전 AI 공통 Test 게이트 초안 미병합. 공통 배포 담당/잠금 강제 검증 필요. 별도 DB·비밀·정확 SHA·독립 리뷰, 운영 별도 승인·무중단·롤백 유지. 승인 없는 데이터 변환 금지. |
| A05 | P1 | [서버 시계](../planning/SERVER_GAME_CLOCK_SPEC.ko.md)는 일/주만; [PR3452](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3452) 365일 서버 연도 제안 및 PR3466 구현 후보 미병합. 기존 epoch/연속 일·주 유지, 읽기 표시 전용; 연이율·세금·지급·실시간 동의/보안 주기를 임의 변경하지 않음. |
| A06 | P1 | [PR3448](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3448) 사용자 결정: 회원별·기관별 가상 500,000 WLD 한도(실제 보험/활성화 아님), 모든 다섯 언어 페이지 /en,/ko,/ja,/zh,/vi 접두사(EN 기본; API/OAuth/socket 경로 유지). 초안 미병합; 기존 PR로 통합, 중복 기획 수정 금지. |
| A07 | P1 | Android 정책은 웹 기획 우선, 앱 PROJECT_OPERATING_INSTRUCTIONS는 기획·QA 한 문서 강제, 웹 규정은 근거 분리. 단일 결정/상태 인덱스와 불변 QA 근거 연결 권고. [PR3460](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3460) 앱 개발 보류 기록 초안; 보류 중 앱 구현 금지. 모바일 웹은 별개. |
| A08 | P1 | [PR3453](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3453) 모바일 메뉴/다국어 기획과 [PR3464](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3464) 구현 후보 미병합. 허용 메뉴 전수, 관리자 제외, 실제 5개 언어·세션·데이터, PC/모바일 스크린샷 및 E2E 필요. |
| A09 | P1 | 블로그 v1108/v1405 검증 정책과 [v1946.2](../planning/BLOG_UNVERIFIED_PUBLICATION_OWNER_ADDENDUM_v2026.11.09.1946.md) 후속 공개 예외 구분. 명시 발행된 미검증 AI 글만 별도 표시·블로그 전용 경로 허용; 가짜 검증 영수증/금융 권한 불가. 검토 지연 자동 비공개 금지, 광고 적격성 별개, 발행기·국가·주제 스케줄 검증 필요. 실제 동작/외부 광고 규정 미검증. |
| A10 | P0 | 과거 런타임 문서 및 root 메모는 현재 운영 증거 아님. 미니PC에서 Spring/Next/preview 여러 서비스 실행 관측, 실제 업스트림/산출물은 미검증. [PR3466](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3466), [PR3467](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3467) 명시 HOLD/DO NOT MERGE. |
| A11 | P1 | 기존 PR3448 미결: QA 기록 완전성과 합격 혼동, 공급량 소각/발행과 재무부 이전 혼동, 관리자/뷰포트 근거, 광고 전용 출시와 유료결제, FX 보류, 블로그 상태, API 링크 접두사, DB search_path. 기존 감사표를 재사용하며 재정 규칙 임의 확정 금지. |
| A12 | P1 | 사용자 약관/개인정보 링크, 실시간 6개월 재동의 및 정책 변경 재동의 지시. [관련 명세](../planning/REEL_27_DESIGN_RESOURCES_INTEGRATION_v2026.11.23.12.ko.md)는 승인 정책/서버 기록 확인 요구. Google/Discord/자체 로그인 동일 정책 버전·효력일·거부 처리 및 Test 필요. 서버 게임 시간으로 대체 금지. |
| A13 | P1 | [문서 권위](../DOCUMENT_AUTHORITY.ko.md)와 AGENTS의 당시 main 통합 승인 문구가 계속 현행처럼 남음. [문서 규정](../DOCUMENTATION_POLICY.ko.md)은 전용 브랜치·별도 main 승인 요구. 당시 승인 재사용 금지 명시 필요. PR3455와 겹치므로 담당자 조율. |

## 후속 작업 순서
1. PLAN-AUDIT.2: 디자인 권위/정확 매니페스트/게스트·관리자 접근 범위/과거 main 승인 정리. PR3448/3455/3452/3460과 조율. G2는 기록상 최신 후보이지 검증 완료 매니페스트 아님.
2. PLAN-AUDIT.3: 사용자 확인된 결정은 기존 PR 담당자를 통해 EN/KO 기획·통합 기획에 반영. QA 상태와 재정 분류 오류 해소, 이력 보존.
3. PLAN-AUDIT.4: 격리 Test 보안 우선 점검, 실제 백엔드/DB, 다국어·모바일·블로그·동의·180경로 UI·권한·API·롤백 검사. 보안 핫픽스와 전체 후보 구분. 앱 개발 보류 존중.
4. PLAN-AUDIT.5: 정확 불변 Test/DB/보안/권한 증거, 백업·복구 훈련, 독립 검토, 롤백 확보 후 별도 사용자 승인으로만 무중단 운영 승격.

공동 작업 중인 기존 기획 파일을 덮어쓰지 않도록 신규 감사 문서만 작성. 코드·DB·서비스·공식 Test·운영·main 변경 없음. 신규 정책 임의 확정 없음. 디자인 최종 선택과 브랜치 통합은 미결.
