# 클럽하우스 UX 및 운영 v2026.09.13.18

## 변경 이유

기존 `Clubs & Cooperative Economy` 명세에는 클럽 정체성, 기본 무제한 회원 수, capability 기반 역할, 프로젝트 기여, 클럽하우스 소비처, 시즌, 회계가 이미 정의되어 있다. 그러나 후속작업으로 클럽하우스 화면 단위 UX와 대형 클럽 pagination/sharding이 남아 있었다.

이번 회차는 기존 경제정책을 바꾸지 않고 이 구현 공백을 닫는다.

## 변경사항

- 영문 canonical `CLUBHOUSE_UX_OPERATIONS_SPEC.md`와 한국어 대응본 추가.
- 탐색, 개요, 회원, 프로젝트, 클럽하우스, 편집기, 시즌, 아카이브, 피드, 설정, 모더레이션 IA 정의.
- 데스크톱/태블릿/모바일과 default/loading/empty/error/offline/maintenance/permission/stale 상태 정의.
- 가입 직후 소수의 건강한 첫 행동을 제시하는 온보딩 정의. WLD 기여는 필수 첫 행동이 아님.
- 회원 수 하드캡 없이 server cursor pagination, indexed search, aggregate read model, 접근 가능한 virtualization 정의.
- capability 기반 역할관리와 고위험 행동 fail-closed 처리.
- clubhouse draft -> preview -> validate -> publish revision, optimistic concurrency, audit 정의.
- drag의 키보드/버튼 대체조작 필수화.
- 프로젝트 HOLD/HARD_SINK 의미, 권위 수락량, 유한 목표 overfund 보호 확인 UX 정의.
- 시즌, 피드, 신고/모더레이션, 운영자, analytics, privacy/legal, monetization, SEO 계약 추가.
- 0/1/50/1,000/합성 대규모 회원, cursor 무결성, 동시 publish/role edit, 접근성 QA 추가.

## 기본 한도 정책 영향

임의 회원 수, 기여 횟수, 프로젝트 수, 아카이브 수, 탐색 횟수 하드캡을 추가하지 않았다. UI 규모는 pagination, index, virtualization, cache, 인프라 보호장치로 처리한다. 양의 capacity는 보안, 무결성, 인프라, 진짜 희소성, 실제 법적 목적이 있을 때만 허용한다.

## 경제 영향

새 강제세금은 없다. 기존 자발적 클럽하우스/아카이브/도시 명예 소비처를 유지한다. 유저간 이동은 `TRANSFER`, 실제 시스템 제거만 `HARD_SINK`다. 유한 프로젝트 초과수락 방지는 완료경계 규칙이지 일반 소비 한도가 아니다.

## 2026-09-13 최신 레퍼런스

### 직접 채택

- Microsoft Learn / PlayFab `Groups, Guilds and Clans`, 2026-06-17 업데이트, 공식 개발문서 — 지속 group identity, membership, role/permission, group-scoped data 분리 패턴 참고. PlayFab 종속성은 없음. https://learn.microsoft.com/en-us/gaming/playfab/community/associations/groups/
- Discord Support `Community Onboarding FAQ`, 2026-06-25 업데이트, 공식 제품/도움말 — 신규회원에게 소수의 관련/기본 목적지를 제공하고 온보딩 선택을 나중에 수정 가능하게 하는 원칙을 직접 채택. https://support.discord.com/hc/ko/articles/11074987197975

### 참고

- Discord Support `Community Onboarding Examples`, 2026-05-15 업데이트 — 선택지 과다 방지 참고. Discord 채널구조를 복제하지 않음. https://support.discord.com/hc/de/articles/10394859532823
- EVE Online `Cradle of War In Focus`, 2026-05-26 — 다양한 플레이스타일이 장기 공동목표에 기여하는 운영사례 참고. Moneyverse는 자체 비-P2W 경제/상태모델 유지. https://www.eveonline.com/news/view/cradle-of-war-in-focus

## 실제 서비스 검증

`https://easy-scraping.com`은 HTTP 530을 반환했다. 상태: `runtime verification unavailable`.

현재 Production/Test 클럽·클럽하우스가 이 명세를 구현했다고 추정하지 않는다.

## 법률 / 수익 / SEO 영향

- 법률/개인정보: 위험 감소. 공개/비공개, 미성년자 제한 기본값, 스폰서 표시, 민감정보 경계를 명확히 했다. 실결제 유저간 거래, 외부환전 가치, 유료 랜덤 클럽보상, 실제 금융상품은 `legal review required`.
- 수익: 비-P2W 꾸미기/프로필/클럽 visual 및 명확히 표시된 sponsorship은 허용하되 운영권한, 시즌점수, 금융우위, 모더레이션 우선순위 판매 금지.
- SEO: 명시적 공개 club profile/tour/archive/community guide만 색인 후보. member directory, private feed, contribution detail, role, moderation, editor/draft, admin/audit는 인증/noindex. 얇은 자동생성 클럽 페이지는 SEO 물량 목적으로 색인하지 않음.

## 전달 상태

- 버전: `v2026.09.13.18`
- 브랜치: `docs/clubhouse-ux-operations-v2026.09.13.18`
- PR: #221 — squash merge 완료
- 병합 커밋: `01e5d8a72f0f3b83bbd83a7fbbd9a9f09fac2b09`
- 변경 유형: 문서-only
- 테스트 서버: 이번 문서 변경에는 배포 불필요
- 실제 구현: 별도 개발 브랜치 -> 격리 Test -> backend/DB/API/authorization/accessibility 검증 -> Production

## 다음 우선순위

1. 활성 런타임 PR을 최신 main 및 격리 Test gate와 재대조.
2. 자체 인증 / Account Security Center P0.
3. 권위 club discovery/member-directory read model + capability API.
4. clubhouse draft revision model + 접근가능 편집기.
5. deterministic financial idempotency 기반 project/feed/moderation 구현.
6. 외부 런타임 접근 즉시 Runtime Product Reality Audit.