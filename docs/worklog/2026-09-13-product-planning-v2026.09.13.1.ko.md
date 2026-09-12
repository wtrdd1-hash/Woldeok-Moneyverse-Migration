# 제품 기획 작업 로그 — v2026.09.13.1

기준일: 2026-09-13
범위: 통합 기획 갱신
저장소: `wtrdd1-hash/Woldeok-Moneyverse-Migration`
변경 유형: 문서-only
브랜치/PR: 없음. 현재 문서 운영 규칙에 따라 최신 `main`에 직접 반영
테스트 서버 배포: 불필요

## 확인한 입력 문서

- 작업 시작 시 최신 `main`
- `PROJECT_PLAN.md` Living Project Plan
- `PRODUCT_GROWTH_PLAN.md`
- `PRODUCT_DESIGN_SPEC.md`
- `SEASON_SYSTEM_SPEC.md`
- `DEFAULT_LIMIT_POLICY.md`
- `ECONOMY_SINKS_SPEC.md`
- `MONETIZATION_COMPLIANCE_SEO_SPEC.md`
- 문서 INDEX와 최근 기획 변경 기록

문서 작성 전 중간에 `main`을 다시 확인했고 해당 시점에는 동시 main 변경이 없었다.

## 확인 결과

- 기본 무제한 정책과 소비처 정책은 현재도 일관된다. 임의 하드캡으로 경제를 제어하지 않고, 시장·보안·시스템 보호 목적의 제한만 근거가 있을 때 허용하는 구조가 유지되고 있다.
- 기존 제품/시즌 문서에는 과거 예시 `max/cap/limit` 숫자가 남아 있지만, 최신 Default Limit Policy가 보호 근거가 없는 수치를 tuning example로 명확히 낮춰 두고 있다. 이번 회차에서는 신규 일반 플레이 하드캡을 추가하지 않았다.
- 경제 소비처 카테고리는 이미 폭넓다. 다음 경제 기획의 가장 구체적인 공백은 30/90/180일 시뮬레이션과 동적 sink tuning playbook이다.
- 수익화·규정 준수·SEO 정책은 존재하지만 검색 운영을 route/config/release gate 수준으로 내린 별도 실행 명세가 부족했다.
- 외부에서 `https://easy-scraping.com`을 확인했으나 530이 반환되어 운영 실제 상태는 확인하지 못했다.

## 최신 조사

참고일: 2026-09-13

우선 확인한 공식 자료:

- Google Search Central 사이트맵 문서(2026-07 갱신)
- Google Search Central canonical 문서(2026-07 갱신)
- Google Core Web Vitals 문서(2025-12 기준 최신)
- 네이버 서치어드바이저 사이트맵, 선호 URL/canonical, JavaScript/리소스/링크, 구조화 데이터 문서
- 네이버 2026-07 FAQ 구조화 데이터 검색 노출 종료 공지

직접 채택한 시사점:

- 사이트맵은 canonical/indexable 운영 절대 URL 중심으로 구성
- robots.txt는 canonical이나 개인정보 보호 수단이 아님
- canonical 신호는 HTML·사이트맵·내부링크에서 일관돼야 함
- EN/KO는 locale self-canonical + reciprocal hreflang 사용
- render-critical JS/CSS와 실제 href 링크는 crawler 해석에 중요
- 구조화 데이터는 설명 수단이며 특수 검색노출 보장이 아님
- FAQ rich-result 노출을 지속가능한 획득 기능으로 전제하지 않음
- Core Web Vitals과 광고 성능은 하나의 페이지 경험 예산으로 관리

## 실제 변경

신규 생성:

- `docs/planning/SEARCH_DISCOVERY_OPERATIONS_SPEC.md`
- `docs/planning/SEARCH_DISCOVERY_OPERATIONS_SPEC.ko.md`
- v2026.09.13.1 영문/한국어 changelog
- v2026.09.13.1 영문/한국어 worklog

신규 명세에는 다음을 포함했다.

- route indexability 상태
- canonical/hreflang 계약
- sitemap 분할 구조
- robots/noindex/auth 경계
- Next.js/JavaScript 렌더링 요구사항
- pagination/infinite-scroll/faceted-navigation 정책
- 구조화 데이터 제약
- 공개 콘텐츠 품질 정책
- Core Web Vitals 목표
- Google/Naver 검색 운영 지표
- 런타임 배포 게이트 및 분석 이벤트

## Runtime Product Reality Audit 상태

`runtime verification unavailable`

현재 외부 Production 확인은 530을 반환했다. Production/Test가 정상이라고 추정하지 않았으며, 서비스가 정상 접근 가능한 첫 회차에 전체 Runtime Product Reality Audit을 우선 수행해야 한다.

## 법규 / 수익 / SEO 영향

- 법규·개인정보: private/security/operator/Test 화면의 우발적 검색 색인 위험을 줄임
- 수익: 광고 가능한 공개 페이지에서 중복색인과 성능 악화를 방지
- SEO: Google/Naver + EN/KO 검색 유입을 실제 구현·운영 가능한 수준으로 구체화

## 테스트

문서 검토만 수행했다. 런타임, DB, API, 배포 테스트는 이번 변경에 필요하지 않다.

이 명세를 실제 구현할 때는 별도 런타임 브랜치 → 격리 Test → 대표 페이지 검증 → Production 순서를 유지한다.

## 다음 우선순위

1. 자체 계정/로그인 인증 구현과 보안 QA
2. 서비스 복구 시 Runtime Product Reality Audit
3. search registry/config 및 자동 SEO smoke test 구현
4. 30/90/180일 경제 시뮬레이션과 동적 sink tuning playbook
5. 임의 하드캡을 추가하지 않으면서 실제 사용자 기능 공백 지속 해소
