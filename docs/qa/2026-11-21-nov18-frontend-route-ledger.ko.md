# 11월18일 프론트엔드 운영 경로 원장

## 현재 상태 — 13:22 KST 이후
기존8조회 경로 e2fb에 `/admin/logs/delivery` main7d58568e3041을 더해9개 관리자 조회 UI가 Nov18 공통 셸이다. 후속 Test40/운영15조합·이전8전후16배치씩과 Test 중지 독립성을 확인했다. 나머지27관리자와 전체 회원/동작/도구/정책 통일은 OPEN이다. [최신 수용](../releases/2026-11-21-nov18-admin-delivery-production.ko.md) / [추가 실제 결함](2026-11-21-nov18-unification-open-defects.ko.md). 아래12:02상태와 변경 전 표는 역사 기록이다.


## 현재 상태 — 12:02 KST 이후
관리자 조회8경로(main e2fb487a1a78)를 Nov18 공통 셸로 운영 전환했다. 실제 Test320조합/확대대응40개, 운영24배치와 실제 검색/언어/키보드/세션·Test 독립성 검증. 다른28개 관리자 경로 및 회원/정책/도구의 전체 통일은 OPEN이다. [운영 증거](../releases/2026-11-21-nov18-admin-unified-production.ko.md).

조회8경로: `/admin`, `/admin/users`, `/admin/market`, `/admin/controls`, `/admin/enterprises`, `/admin/economy`, `/admin/economy/scenario-lab`, `/admin/logs/system`. 사업장 페이지는 기존 사업장 카탈로그를 조회하며 전체 공기업 지배구조 완료가 아니다. 시나리오 페이지는 기존 정합성 조회이며 시뮬레이션 실행이 아니다.

## 변경 전 실제 운영 조사 기록

관리자 홈의 실제 링크36경로(홈1+도구35) 및 홈에서 확인한 사용자/정책13경로를 1440px에서 직접 열었다. 이는 전 기능 성공 판정이 아닌 실제 화면·디자인 분류이다. 기존 로그인 세션으로 읽기만 수행했다. UI 변경 기능/금융 동작/모든 언어·상태·동적 하위 URL은 아직 미수용이다.

| 경로 | 실제 화면 | 언어 | 본문 배경 | 현재 판정 |
|---|---|---|---|---|
| `/admin` | 대시보드 | ko | rgb(12, 16, 32) | 공통 native 셸 관찰; 전체 동작 수용 아님 |
| `/admin/market` | Stock market oversight | en | rgb(11, 18, 36) | 공통 셸 이식 진행: 기존 별도 CSS/2언어 |
| `/admin/users` | Member directory | en | rgb(11, 18, 36) | 공통 셸 이식 진행: 기존 별도 CSS/2언어 |
| `/admin/controls` | Feature governance | en | rgb(11, 18, 36) | 공통 셸 이식 진행: 기존 별도 CSS/2언어 |
| `/admin/economy` | Economy and ledger integrity | en | rgb(11, 18, 36) | 공통 셸 이식 진행: 기존 별도 CSS/2언어 |
| `/admin/support` | (H1 미관찰) | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/logs` | (H1 미관찰) | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/security` | 계정 정지 · IP 차단 | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/mint` | 한국조폐공사 (KOMSCO) | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/central-bank` | 한국은행 (BOK) 금융통화위원회 | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/treasury` | 국고 · 비축 자금 | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/enterprises` | Enterprise oversight | en | rgb(11, 18, 36) | 공통 셸 이식 진행: 기존 별도 CSS/2언어 |
| `/admin/bonds` | 기획재정국채 (KTB) 통합 관제 타워 | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/pension` | 국민연금공단(NPS) 공적 연금 총괄 관제 센터 | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/fx` | (H1 미관찰) | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/treasury/grants` | 창업·벤처 지원금 심사 관제탑 | ko | rgb(9, 13, 22) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/kdic` | (H1 미관찰) | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/catalog` | 사업 · 시즌 이벤트 | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/work` | 작업 · 직업 | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/shop` | 상점 카탈로그 및 상품 가격·재고 통제 | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/economy/scenario-lab` | Economy scenario lab | en | rgb(11, 18, 36) | 공통 셸 이식 진행: 기존 별도 CSS/2언어 |
| `/admin/market/ai-news` | AI 시장 소식 | ko | rgb(9, 13, 22) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/logs/errors` | 화면을 정상적으로 불러오지 못했습니다. | ko | rgb(9, 13, 22) | OPEN: 실제 오류 화면 |
| `/admin/logs/system` | 시스템 로그 | ko | rgb(12, 16, 32) | 공통 native 셸 관찰; 전체 동작 수용 아님 |
| `/admin/logs/integrity` | 무결성 검증 · 보존 정책 | ko | rgb(9, 13, 22) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/logs/delivery` | Discord 전달 로그 | ko | rgb(9, 13, 22) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/blog` | AI 블로그 자동발행 및 국가별 콘텐츠 관리 | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/money-flow` | 유저 자금 흐름 · 원장 관제 | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/content` | 보여 줄 소식만,차분히 꺼내 놓아요. | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/safety` | 긴급 콘텐츠 삭제 · 안전 센터 | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/api-health` | 14대 도메인 API 측정 증빙 | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/seo` | SEO 및 검색엔진 색인 관제 | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/seo-audit` | 검색엔진 수집 감사 | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/analytics` | 텔레메트리 · 그래프 분석실 | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/discord` | Discord 전달 경로 | ko | rgb(7, 11, 20) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/admin/operations/storage` | 검증된 호스트 저장공간 여유량 | ko | rgb(9, 13, 22) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/` | 홈 | ko | rgb(12, 16, 32) | 공통 native 셸 관찰; 전체 동작 수용 아님 |
| `/wallet` | 자산 지갑 | ko | rgb(12, 16, 32) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/stocks` | 주식 | ko | rgb(12, 16, 32) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/quests` | 퀘스트 | ko | rgb(12, 16, 32) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/shop` | 상점 | ko | rgb(12, 16, 32) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/board` | 커뮤니티 | ko | rgb(12, 16, 32) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/support` | 403 Forbidden | 미지정 | rgba(0, 0, 0, 0) | OPEN: 직접403 응답 |
| `/account` | 403 Forbidden | 미지정 | rgba(0, 0, 0, 0) | OPEN: 직접403 응답 |
| `/admin` | 대시보드 | ko | rgb(12, 16, 32) | 공통 native 셸 관찰; 전체 동작 수용 아님 |
| `/terms` | 이용약관 | ko | rgb(12, 16, 32) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/privacy` | 개인정보처리방침 | ko | rgb(12, 16, 32) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |
| `/chat` | 403 Forbidden | 미지정 | rgba(0, 0, 0, 0) | OPEN: 직접403 응답 |
| `/guide` | 가이드 | ko | rgb(12, 16, 32) | OPEN: 별도 화면/renderer; 전환·기능 QA 필요 |

## 재현 동작
- 홈의 첫 guest 렌더에서 로그인 링크 클릭 시 `/login`으로 이동했다. 후속 점검에서 프로필 요소가 보일 때까지 기다리자 같은 세션의 프로필/로그아웃/관리자 링크가 정상으로 바뀌었다. 지속적인 로그인 상태 연결 오류로 판정하지 않는다. 초기 guest 노출의 UX와 다른 페이지 헤더는 별도 항목이다. 프로필 링크를 실제 클릭해도 `/account`403인 것은 독립 재현했다.
- 관리자 사이드바 회원 관리 실제 클릭 후 이름 검색 입력/조회 버튼으로 불일치 검색을 제출했을 때 빈 결과가 나온다. 기존 검색은 동작하지만 한국어 공통 셸에서 영문 별도 화면으로 바뀐다.
- `/support`, `/account`, `/chat`은 해당 로그인 세션에서도 직접403. 접근 차단 원인과 인증/기능 게이트를 확인해야 하며 디자인 변경으로 우회하지 않는다.
- `/admin/logs/errors`는 실제 불러오기 실패 메시지. 색만 바꾸어 정상 완료로 판정하지 않는다.
- 관리자36경로 중 이번 기존 공통 셸은 홈/시스템 로그2개. 나머지 별도 inline/Next UI는 통일 완료가 아니다.
