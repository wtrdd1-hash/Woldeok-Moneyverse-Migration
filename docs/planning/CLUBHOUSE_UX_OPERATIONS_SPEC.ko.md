# 월덕 머니버스 — 클럽하우스 UX 및 운영 명세

> 버전: v2026.09.13.18
> 상태: 구현 지향형 Living 제품 기획서
> 기준일: 2026-09-13
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `CLUBS_COOPERATIVE_ECONOMY_SPEC.md`, `COMMUNITY_MARKET_INTEGRITY_SPEC.md`, `SEASON_SYSTEM_SPEC.md`, `ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.md`, `NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.md`
> 영문 기준 문서: [CLUBHOUSE_UX_OPERATIONS_SPEC.md](CLUBHOUSE_UX_OPERATIONS_SPEC.md)

## 0. 목적

이 문서는 기존 클럽/협동경제 모델을 화면 단위의 대형 커뮤니티 안전 제품 계약으로 구체화한다. 기존 클럽 원장, 프로젝트, 시즌, 모더레이션, 역할 capability 규칙을 대체하지 않는다. 사용자가 클럽을 발견하고, 가입 직후 무엇을 해야 하는지 이해하고, 임의 회원 수 하드캡 없이 대형 클럽을 탐색하고, 클럽하우스를 이용·편집하고, 프로젝트에 기여하고, 역할을 관리하며, 로딩/오류/권한/모더레이션 상태에서 안전하게 복구하는 방법을 정의한다.

핵심 목표:

1. 가입 후 몇 분 안에 첫 건강한 클럽 상호작용을 이해할 수 있게 한다.
2. 회원 수 기본값 `null/unlimited`를 유지하면서 대형 클럽도 사용 가능하게 한다.
3. 권한과 고위험 행동을 명확하고 서버 권위적으로 관리한다.
4. 클럽하우스 소비를 자발적·꾸미기·아카이브·사회적 가치 중심으로 유지하고 P2W를 막는다.
5. 기부액이나 게시글 수가 유일한 사회적 지위 신호가 되지 않게 한다.
6. 모든 주요 클럽 화면을 반응형·접근성·관측 가능·운영 가능 상태로 만든다.

## 1. 제품 경계

### 1.1 기본 한도 없음

다음 항목은 기본적으로 무제한이다.

- 활성 클럽 회원 수;
- 일반 회원 이력 보존;
- 클럽 생애 완료 프로젝트 수;
- 일반 프로젝트 참여 횟수;
- 콘텐츠가 반복을 지원하는 비희소 클럽하우스 확장;
- 일반 아카이브 이력;
- 클럽 콘텐츠 탐색/검색.

대규모 처리는 cursor pagination, indexed search, virtualized rendering, lazy loading, caching, background aggregation, moderation rate control, queueing, 문서화된 인프라 보호장치로 해결한다. 회원 목록 UI가 느리다는 이유만으로 회원 수 하드캡을 만들지 않는다.

### 1.2 클럽 P2W 금지

클럽하우스 구매, 프로젝트 기여, 유료 꾸미기 entitlement는 다음을 직접 개선할 수 없다.

- WLD 발행률;
- WDX 체결·수익·랭킹;
- 직업/사업 지급 배율;
- 대출 조건;
- 시즌 경쟁 점수;
- 랜덤 결과 확률;
- 모더레이션 우선순위.

### 1.3 민감정보 경계

일반 클럽 화면에는 회원 잔액, 부채, 비공개 보유자산, 결제상태, 비공개 거래내역, 연령확인 증빙, 인증상태, 민감 모더레이션 증거를 노출하지 않는다.

## 2. 정보 구조

로그인 후 주요 경로:

- `/clubs` — 클럽 탐색 및 가입 클럽;
- `/clubs/new` — 클럽 생성;
- `/clubs/:clubId` — 개요;
- `/clubs/:clubId/members` — 회원/역할;
- `/clubs/:clubId/projects` — 협동 프로젝트;
- `/clubs/:clubId/clubhouse` — 클럽하우스 보기;
- `/clubs/:clubId/clubhouse/edit` — capability 기반 편집;
- `/clubs/:clubId/season` — 시즌 목표/스냅샷;
- `/clubs/:clubId/archive` — 영구 이력/전시;
- `/clubs/:clubId/feed` — 공지/학습/프로젝트 업데이트;
- `/clubs/:clubId/settings` — 권한 기반 설정;
- `/clubs/:clubId/moderation` — 권한 기반 모더레이션 큐.

명시적으로 공개 설정된 클럽 프로필/클럽하우스 투어만 공개 URL 후보가 될 수 있다. 공개 페이지에서도 클럽 자산을 투자상품·금융상품처럼 표현하지 않는다.

## 3. 탐색 및 모집 UX

### 3.1 `/clubs`

데스크톱:

- `클럽 찾기`와 조건부 `클럽 만들기` 헤더;
- 가입 클럽 요약;
- 검색;
- 필터 rail/drawer;
- 카드 또는 조밀한 목록 보기;
- cursor/pagination;
- empty/error 상태.

모바일:

- 검색을 상단 핵심행동으로 유지;
- 필터는 bottom sheet/drawer;
- 가입 클럽을 탐색결과보다 먼저 표시;
- 1열 카드;
- 가로 테이블 의존 금지.

필터:

- 언어;
- 가입 방식;
- 관심사;
- 주 활동시간;
- 신규회원 친화;
- 시즌 참여 성향;
- 공개 클럽하우스 여부.

기본 정렬을 총 WLD나 회원 자산 기준으로 하지 않는다.

### 3.2 클럽 결과 카드

표시:

- 이름/태그;
- 짧은 설명;
- 주요 언어;
- 관심사;
- 가입 방식;
- `이번 주 활동 있음` 같은 비침해적 활동 신호;
- 신규회원 친화 배지;
- 공개 클럽하우스 여부;
- 상태에 맞는 하나의 주 CTA: `보기`, `가입`, `가입 요청`.

회원 수만으로 품질을 판단하게 만드는 과도한 대형 순위 표현은 피한다.

### 3.3 가입 온보딩

가입 직후 복잡한 대시보드에 바로 떨어뜨리지 않는다. 첫 세션 가이드는 최대 3개의 추천 행동을 보여준다.

1. 규칙/요약 읽기;
2. 관심사/알림 선호 선택;
3. 비금전 활동을 하나 수행하거나 활성 프로젝트 살펴보기.

WLD 기여는 필수 첫 행동이 아니다.

가이드는 닫았다 다시 열 수 있고 선호 질문은 나중에 수정 가능하다. 이는 2026년 Discord Community Onboarding의 최신 패턴처럼 신규 커뮤니티 사용자에게 모든 기능을 한꺼번에 노출하지 않고 관련성 높은 시작점을 제공하는 원칙을 참고한 것이다.

## 4. 클럽 개요

정보계층:

1. 클럽 정체성/헤더;
2. 중요 공지 또는 운영/모더레이션 상태;
3. `지금 할 수 있는 것` 추천행동;
4. 활성 프로젝트 요약;
5. 클럽하우스 미리보기;
6. 시즌 진행;
7. 최근 아카이브/피드;
8. 회원/커뮤니티 요약.

추천행동은 설명 가능하고 압박감이 없어야 한다. 규칙 읽기, 신규회원 환영, 비금융 선호투표, 필요한 제작재료 기여, 프로젝트 검토, 학습 목표, 아카이브 방문 등을 우선한다. `지금 기부하지 않으면 뒤처집니다` 같은 표현은 금지한다.

## 5. 회원과 대형 클럽 UX

### 5.1 회원 목록

데스크톱 열:

- 회원 식별정보;
- 역할;
- 가입일;
- 비민감 활동상태 범주;
- 정책상 허용되는 시즌/협동 배지;
- capability 기반 행동.

모바일에서는 각 행을 카드로 변환한다.

### 5.2 Pagination과 virtualization

- 대형 클럽은 서버 cursor pagination 필수;
- 페이지 크기는 성능 config이지 회원 수 한도가 아니다;
- 적절한 기준 이상 검색은 서버측 처리;
- 긴 목록 virtualization은 접근성이 유지되는 경우만 사용;
- 상세화면에서 돌아올 때 필터/위치 보존;
- 전체 회원을 브라우저에 로딩하지 않고 집계값 계산.

### 5.3 검색/정렬

정책 범위에서 정규화 display name/tag 검색. 역할, 가입일, 최근 건강한 참여 등으로 정렬 가능하다. WLD 기여액은 기본 정렬이 아니다.

### 5.4 역할 변경

역할변경 UI는 현재 역할/capability, 변경 후 capability 차이, 권한상승 확인, 고위험 소유권 이전 시 필요하면 fresh reauthentication, 감사로그를 보여준다. capability 데이터가 stale이면 fail closed 한다.

## 6. 클럽하우스 보기

클럽하우스는 공동 정체성·아카이브·사회공간이며 수동소득 건물이 아니다.

주요 모듈:

- reception;
- member wall;
- active project board;
- season archive;
- trophy/gallery;
- learning room;
- business/crafting showcase;
- city sponsorship gallery;
- legacy hall.

데스크톱은 시각적 공간 + 모듈 rail + 세부 패널, 태블릿은 접이식 rail + drawer, 모바일은 섹션 카드/단순 장면 탐색을 사용한다. 모바일 편집은 bottom sheet를 사용하고 drag-only를 금지한다.

모든 모듈은 default, prerequisite locked, purchase available, funding, building, completed, archived, permission denied, stale, loading/skeleton, empty, error, offline, maintenance 상태를 정의한다.

## 7. 클럽하우스 편집기

### 7.1 안전한 편집 모델

라이브 배치를 매 drag마다 바로 바꾸지 않는다.

`LIVE revision -> CREATE DRAFT -> EDIT -> PREVIEW -> VALIDATE -> PUBLISH -> new LIVE revision`

요구사항:

- draft 자동저장은 가능하되 자동 publish 금지;
- 새로고침으로 입력을 파괴하지 않음;
- 다른 편집자가 최신 revision을 publish했다면 conflict 표시;
- live revision으로 reset/discard 가능;
- publish는 명시 행동;
- publish는 audit event 생성.

### 7.2 접근 가능한 배치

모든 drag는 버튼/키보드 대체행동을 제공한다.

- 위/아래/좌/우 이동;
- 방/슬롯 이동;
- 지원 시 회전;
- 배치 제거;
- 복원.

작업 후 focus는 예측 가능해야 하고 상태변경은 적절한 `aria-live`로 전달한다.

### 7.3 서버 무결성

서버가 다음을 검증한다.

- 꾸미기 아이템 소유권/club binding;
- module compatibility;
- collision/slot 규칙;
- draft base revision;
- 권한;
- item lock;
- unique instance 중복배치 금지.

클라이언트 좌표는 소유권/entitlement 권위값이 아니다.

## 8. 프로젝트 및 기여 UX

프로젝트 카드에는 목적/시각적 결과, 상태, 목표와 현재치, 실제 마감시간, 환불/취소 규칙, HOLD/HARD_SINK 의미, 고래유저만 강조하지 않는 참여폭, 비금전 다음행동을 보여준다.

WLD/재료 기여 확인 전에는 권위 잔액/보유량, 요청량, 남은 필요량, 실제 수락량, sink/hold/refund 의미를 다시 보여준다. 최종 수락량과 회계 분류는 백엔드가 계산한다.

유한 건설목표를 초과하는 요청은 남은 필요량만 수락한다. 이는 프로젝트 완료 경계이지 일반 소비 한도가 아니다. 고자산 유저는 반복 가능한 명예·도시·아카이브 sink를 계속 사용할 수 있다.

## 9. 시즌 UX

클럽 시즌 화면은 현재 phase/정확한 마감시각/시간대, 플레이스타일별 목표, 클럽 진행, 개인 적격 참여이력, 꾸미기·아카이브 중심 보상, D-14/D-7/D-3/D-1 알림, 정산검증 상태, 종료 후 archive를 포함한다.

정산 lock 중에도 영구 클럽하우스와 archive는 볼 수 있고 관련 경쟁 mutation만 제한한다.

## 10. 피드·모더레이션·시장무결성

피드 유형은 공지, 프로젝트 업데이트, 이벤트, 학습노트, 아카이브/트로피 공유, 비금융 투표, 시즌 업데이트다. 게시량 자체는 CP/WLD를 만들지 않는다.

적격 콘텐츠에는 report, mute, block, copy link, 정책상 가능한 처리상태 피드백을 제공한다.

가상주식 시세조작 공모, 허위 pump, 사칭, 가짜 희소성은 `COMMUNITY_MARKET_INTEGRITY_SPEC.md`를 따른다. 클럽 피드가 특권적 매매신호 채널이 되지 않게 한다.

모더레이션 큐는 신고사유, 콘텐츠 snapshot, 필요한 최소 맥락, 조치, notes, appeal/review 상태, audit trail을 제공한다. 민감 신고증거는 필요한 capability 없는 일반 운영진에게 노출하지 않는다.

## 11. 권한 모델

UI gate는 서버가 반환한 capability에서 파생한다. 버튼 숨김은 편의일 뿐이며 백엔드 authorization은 필수다.

최소 capability:

- `club.profile.manage`
- `club.members.invite`
- `club.members.remove`
- `club.roles.manage`
- `club.projects.manage`
- `club.projects.contribute`
- `club.clubhouse.edit`
- `club.clubhouse.publish`
- `club.feed.moderate`
- `club.analytics.view`
- `club.archive.curate`
- `club.lifecycle.manage`

표시용 역할명만으로 authorization 하지 않는다.

## 12. 데이터/read model

추가 후보:

### `club_member_directory_read`
- `club_id`, `user_id`, `display_name`, `role_code`, `joined_at`, `activity_bucket`, `badges_json`, `cursor_key`

### `clubhouse_layout_revisions`
- `id`, `club_id`, `revision_number`, `state`, `base_revision_number`, `layout_json`, `created_by`, `published_by`, `created_at`, `published_at`

### `clubhouse_module_instances`
- `id`, `club_id`, `module_code`, `state`, `source_project_id`, `entitlement_or_inventory_ref`, `created_at`

### `club_onboarding_preferences`
- `club_id`, `user_id`, `interest_codes`, `notification_preferences_version`, `completed_at`

read model은 권위 membership/role/inventory/entitlement/project/audit 데이터로 재생성·reconciliation 가능해야 한다.

## 13. API 계약

후보:

- `GET /api/clubs?cursor=&query=&filters=`
- `GET /api/clubs/:clubId/overview`
- `GET /api/clubs/:clubId/members?cursor=&query=&role=`
- `GET /api/clubs/:clubId/capabilities`
- `PATCH /api/clubs/:clubId/members/:userId/role`
- `GET /api/clubs/:clubId/clubhouse`
- `POST /api/clubs/:clubId/clubhouse/drafts`
- `PATCH /api/clubs/:clubId/clubhouse/drafts/:draftId`
- `POST /api/clubs/:clubId/clubhouse/drafts/:draftId/validate`
- `POST /api/clubs/:clubId/clubhouse/drafts/:draftId/publish`
- `GET /api/clubs/:clubId/projects?cursor=&state=`
- `POST /api/clubs/:clubId/projects/:projectId/contributions`
- `GET /api/clubs/:clubId/feed?cursor=`
- `POST /api/clubs/:clubId/reports`

금융/프로젝트 mutation은 idempotency key를 사용하고 layout publish는 base revision/version 기반 optimistic concurrency를 사용한다.

## 14. 반응형/접근성 acceptance criteria

- 모든 행동 키보드 가능;
- visible focus가 가려지지 않음;
- 색상만으로 역할/프로젝트/시즌 상태 전달 금지;
- 회원 테이블의 모바일 카드 동등표현;
- drag 대체 버튼/키보드;
- dialog focus trap/restore;
- 파괴적 governance 명시확인;
- loading/error를 과도한 live-region 없이 전달;
- 200% zoom에서도 핵심행동 유지;
- 공통 touch target 기준 준수;
- 기여액/상태는 텍스트·기호와 색상을 병행.

## 15. Analytics

이벤트:
`club_discovery_viewed`, `club_discovery_filter_changed`, `club_join_started`, `club_join_completed`, `club_onboarding_completed`, `club_first_healthy_action_completed`, `club_member_search_used`, `club_role_change_completed`, `clubhouse_viewed`, `clubhouse_edit_started`, `clubhouse_draft_saved`, `clubhouse_publish_completed`, `club_project_viewed`, `club_project_contribution_completed`, `club_report_submitted`.

KPI:

- signup→첫 club view;
- join→첫 건강한 행동 시간;
- club 참여 코호트 D7/D30 retention;
- 프로젝트 참여자 폭;
- clubhouse unique viewer/editor;
- 대형 클럽 member-directory p95 latency;
- 권한오류율;
- 기여확인 이탈률;
- 신고율/모더레이션 처리시간;
- mobile vs desktop 완료율 parity;
- 접근성 결함 escape rate.

총 WLD 기여액만 최적화하지 않는다.

## 16. 경제와 소비처

새 강제세금은 추가하지 않는다. 기존 자발적 sink 포트폴리오를 따른다.

자산 코호트별 노출 후보:

- 저자산: banner variant, 소형가구, engraving;
- 중간자산: room theme, archive mount, event-stage cosmetic;
- 고자산: gallery wing, trophy atrium, city sponsorship;
- 명예자산: legacy hall, landmark co-sponsorship.

각 카탈로그는 transaction type, analytics event, config, abuse review, completion semantics를 유지한다. 유저간 이전은 `TRANSFER`, 실제 시스템 제거만 `HARD_SINK`다.

## 17. 수익화 경계

허용:

- 비-P2W 꾸미기 theme;
- 프로필/클럽 visual pack;
- 클럽 power와 무관한 광고제거 구독;
- 명확히 표시된 공개 비경쟁 커뮤니티 sponsorship.

금지:

- 운영권한 판매;
- 시즌 점수 판매;
- WDX/대출/사업 우위 판매;
- 유료 모더레이션 우선순위;
- 광고를 클럽추천처럼 위장;
- sponsor 비용으로 WDX 가격/랭킹/추천 로직 변경.

## 18. 개인정보와 법률검토

- 공개/비공개 클럽은 명확히 설정;
- 회원 프로필은 정책상 승인된 공개정보만 노출;
- 맞춤광고는 동의/연령/지역 정책 적용;
- 미성년자 제한 계정은 보수적 탐색/광고 기본값;
- 경제적 대가가 있는 추천/스폰서 클럽 콘텐츠는 이해관계 표시;
- 외부환전 가치, 유료 랜덤 클럽보상, 실결제 유저간 거래, 실제 금융상품은 `legal review required`.

## 19. SEO

색인 후보:

- 명시적 공개 클럽 프로필;
- 공개 클럽하우스 투어;
- 공개 archive exhibit;
- 공개 커뮤니티 가이드/이벤트.

인증 또는 `noindex`:

- 회원 directory;
- 가입요청/초대;
- 비공개 feed;
- 프로젝트 상세 기여내역;
- 역할/권한;
- 모더레이션 큐;
- 클럽하우스 editor/draft;
- admin/audit.

공개 EN/KO 대응 콘텐츠는 self-canonical + reciprocal hreflang. 얇은 자동생성 클럽 페이지를 SEO 물량 목적으로 색인하지 않는다.

## 20. 관리자/운영자 UX

운영도구는 read-only club overview, role/membership audit, project reconciliation, layout revision diff, moderation queue, freeze/unfreeze reason, search/pagination health, sink/contribution metric, season snapshot status를 제공한다.

운영자가 입력 중일 때 파괴적 자동새로고침을 하지 않는다. 사용자 제어형 refresh 또는 비파괴 patch를 사용한다. WLD 원장 이력 직접수정은 금지한다.

## 21. 실패/복구 상태

- membership 데이터 unavailable -> 고위험 행동 fail closed;
- capability stale -> mutation 비활성 + refresh;
- contribution timeout -> 재시도 전 idempotency 결과조회;
- layout publish conflict -> draft 보존 + diff/refresh 선택;
- project state 변경 -> confirm 전 authoritative target 재조회;
- moderation 장애 -> 안전한 범위에서 신고 draft 보존 + 제출상태 명시;
- feed 장애 -> clubhouse/projects 독립 사용;
- offline -> privacy 허용 범위 read cache만, 금융/governance write 금지.

## 22. QA 매트릭스

반드시 검증:

- 0/1/50/1,000/합성 대규모 회원 데이터;
- cursor pagination duplicate/skip 없음;
- 이름검색 정규화;
- role escalation/authorization denial;
- 동시 role edit;
- 동시 clubhouse publish;
- keyboard-only layout edit;
- mobile member/project card;
- contribution replay/idempotency;
- over-target 수락량;
- report/mute/block;
- season lock;
- permission denied/empty/loading/error/offline/maintenance;
- screen-reader label/live status;
- private route auth/noindex.

## 23. 2026-09-13 최신 레퍼런스

### 직접 채택

- Microsoft PlayFab `Groups, Guilds and Clans`, 2026-06-17 업데이트 — 지속 group identity, membership, role/permission, group-scoped data 분리 패턴을 참고하되 PlayFab 종속성은 만들지 않음.
- Discord Community Onboarding FAQ, 2026-06-25 업데이트 — 첫 접점에서 모든 기능을 보여주기보다 소수의 기본/관련 목적지를 제공하고 사용자가 관심사/역할을 나중에 수정할 수 있게 하는 원칙을 채택.

### 참고

- Discord Community Onboarding examples, 2026-05-15 업데이트 — 선택지 과다로 신규회원이 압도되지 않게 하는 참고. Discord 채널 구조를 복제하지 않음.
- EVE Online `Cradle of War In Focus`, 2026-05-26 — 다양한 플레이스타일이 장기 공동목표에 기여할 수 있는 사례를 참고. Moneyverse는 자체 경제·상태모델과 비-P2W 보상원칙을 유지.

## 24. 실제 서비스 검증

`https://easy-scraping.com`은 이번 회차에도 HTTP 530을 반환했다. 상태: `runtime verification unavailable`.

Production/Test의 실제 클럽/클럽하우스가 이 명세를 구현했다고 추정하지 않는다. 외부 접근이 복구되는 첫 회차에는 `/clubs`, 회원, 프로젝트, 클럽하우스, 피드, 모더레이션, 모바일 상태를 실제 사용자 관점에서 비교하는 `Runtime Product Reality Audit`를 갱신해야 한다.

## 25. 전달 경계

이번 변경은 문서-only이며 테스트 서버 배포가 필요하지 않다.

실제 구현은 별도 개발 브랜치 -> 격리 Test -> backend/DB/API/authorization/accessibility 검증 -> 검증된 exact SHA Production 승격 순서를 따른다.

## 26. Definition of Done

클럽하우스 런타임은 다음 전에는 완료가 아니다.

- 영문/한국어 동기화;
- 임의 회원/활동 하드캡 없음;
- 대형 회원목록 server pagination/search;
- 서버측 capability enforcement;
- 기여 회계에서 HOLD/TRANSFER/HARD_SINK 구분;
- draft/version/audit 기반 layout publish;
- drag 접근성 대체조작;
- 모바일이 desktop table에 의존하지 않음;
- private/member/admin auth + noindex;
- feed report/moderation 제공;
- raw spend/messages가 아닌 건강한 참여 analytics;
- exact candidate SHA가 격리 Test QA를 통과한 후에만 Production 반영.