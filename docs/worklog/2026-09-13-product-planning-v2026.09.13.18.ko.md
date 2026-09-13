# 제품 기획 작업기록 v2026.09.13.18

기준일: 2026-09-13
저장소: `wtrdd1-hash/Woldeok-Moneyverse-Migration`
변경 유형: 문서-only
브랜치: `docs/clubhouse-ux-operations-v2026.09.13.18`
테스트 배포: 문서-only 변경에는 불필요

## 시작 상태

- 작업 시작 직전 최신 `main`, Living Project Plan, Product Growth Plan, Detailed Product Design Spec, Season System Spec, Default Limit Policy, Economy Sinks Spec 및 클럽/경제/접근성/커뮤니티 관련 문서를 다시 읽었다.
- 시작 main SHA: `a785869ebeb8f9e3a9b5dc017cad3498685df59a`.
- 작성 전 열린 PR을 재확인했다. 활성 런타임 작업에는 #219 Banking Safety Overview re-home, #217 이전 banking 후보, #215 Portfolio Analysis, #195 Event Calendar, #189 Economy Scenario Lab이 있었다. 열린 문서 PR #192는 casino spec으로 이번 clubhouse UX 범위와 겹치지 않는다.
- `CLUBS_COOPERATIVE_ECONOMY_SPEC.md`에는 이미 기본 무제한 회원 수, capability 역할, 프로젝트 기여, 클럽하우스 소비처가 있고 대형 클럽 sharding이 후속작업으로 남아 있다. 화면 단위 clubhouse UX와 대규모 member directory가 실제 구현 공백이었다.

## 결정

경제 상위 명세를 다시 비대하게 만들지 않고 전용 `CLUBHOUSE_UX_OPERATIONS_SPEC`을 추가한다. 기존 클럽 명세가 ledger/accounting/project economy 권위기준을 계속 맡고, 새 명세는 IA, 반응형 상태, 대규모 목록, 온보딩, clubhouse editor revision, 권한 UX, moderation surface, QA를 맡는다.

## 완료 작업

- 영문 canonical `docs/planning/CLUBHOUSE_UX_OPERATIONS_SPEC.md` 추가.
- 한국어 대응본 동기화.
- 영문/한국어 changelog 추가.
- 영문/한국어 worklog 추가.
- 영문/한국어 문서 index 갱신.
- 기본 무제한 회원/활동 정책 유지.
- transfer/hold/hard-sink 구분과 기존 자발적 club sink 포트폴리오 유지.
- 회원 하드캡 대신 server cursor pagination/indexed search/virtualization 정의.
- draft/version/audit 기반 clubhouse 편집과 drag 대체 접근성 조작 정의.
- authoritative accepted amount와 회계의미 중심의 프로젝트 기여 확인 UX 정의.
- mobile/tablet/desktop, UI 상태, 운영자, analytics, privacy/legal, monetization, SEO 경계 추가.

## 조사 자료

### 직접 채택

1. Microsoft Learn / PlayFab `Groups, Guilds and Clans`, 2026-06-17 업데이트, 공식 개발문서. 지속 group identity, membership, role/permission, group-scoped data를 분리하는 패턴을 아키텍처 참고로 채택. 벤더 종속성은 추가하지 않음.
2. Discord Support `Community Onboarding FAQ`, 2026-06-25 업데이트, 공식 제품/도움말. 커뮤니티 첫 접점에서 과부하를 줄이고 소수의 관련/기본 목적지를 제공하며 선택을 나중에 변경할 수 있게 하는 원칙을 채택.

### 참고

3. Discord Support `Community Onboarding Examples`, 2026-05-15 업데이트. 온보딩 선택지 과다 방지 참고.
4. EVE Online `Cradle of War In Focus`, 2026-05-26. 다양한 플레이스타일이 공동 장기목표에 기여할 수 있는 라이브옵스 사례 참고. Moneyverse는 자체 경제와 비-P2W 보상원칙 유지.

## 실제 서비스 검증

`https://easy-scraping.com`은 이번 회차에 HTTP 530을 반환했다.

상태: `runtime verification unavailable`.

Production/Test 구현상태를 추정하지 않는다. 외부 접근 복구 첫 회차에는 discovery, join/onboarding, member list, clubhouse view/edit, project, season, feed, moderation, mobile, API response, error state를 `Runtime Product Reality Audit`로 비교한다.

## 법률 / 수익 / SEO

- 법률/개인정보: 공개/비공개와 민감 회원정보 경계를 명시. 미성년자 제한과 맞춤광고는 상위 safety/privacy 명세를 따름. 실결제 유저간 거래, 외부환전 가치, 유료 랜덤보상, 실제 금융상품은 `legal review required`.
- 수익: 비-P2W cosmetic/profile/club visual과 명확한 sponsorship을 지원하되 운영권한/시즌점수/금융우위 판매 금지.
- SEO: 명시적 공개 club/profile/tour/archive/community guide만 후보. member/private/editor/moderation/admin은 auth/noindex, 얇은 자동생성 클럽 페이지는 제외.

## 브랜치 / PR / 테스트 경계

- 버전: `v2026.09.13.18`
- 브랜치: `docs/clubhouse-ux-operations-v2026.09.13.18`
- PR: #221 — squash merge 완료
- 병합 커밋: `01e5d8a72f0f3b83bbd83a7fbbd9a9f09fac2b09`
- 문서-only: 예
- 이번 변경 테스트 서버: 불필요
- 실제 구현: 별도 개발 브랜치 -> 격리 Test -> backend/DB/API/authz/accessibility 검증 -> Production

## 다음 우선순위

1. 활성 런타임 PR과 최신 main/exact-SHA Test evidence 재정합.
2. 자체 인증 / Account Security Center P0.
3. 권위 club discovery/member-directory read model + capability API.
4. clubhouse draft revision model + 접근가능 편집기.
5. deterministic idempotency 기반 project/feed/moderation 런타임.
6. 외부 검증 복구 즉시 Runtime Product Reality Audit.