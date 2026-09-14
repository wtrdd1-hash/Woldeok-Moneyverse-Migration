# Worklog — v2026.09.15.101 장기 미사용 보유품 재활용·큐레이션 리텐션 성장

## 목표
구현 상세를 확장하지 않고 Moneyverse 소비자 성장 기획을 갱신하고, 현재 가장 큰 리텐션 공백을 고른 뒤 기존 보안·개인정보·경제 경계를 보존한다. 최신 레퍼런스를 검토하고 작업 중 발생한 `main` 동시변경을 반영한 뒤 영문/한국어 문서만 `main`에 직접 반영한다.

## 확인한 입력
- 작업 시작·중간 `main`: `8e56f533b7f53935654a5a18f136fdbd30fd66a8`
- 반영 직전 동시변경 `main`: `76bb3339cf5bdc10ecec8964f0593c3a2e0c846c`
- `docs/planning/PROJECT_PLAN.md`
- `docs/planning/PRODUCT_GROWTH_PLAN.md`
- `IDENTITY_SAFE_MERCHANDISING_TRANSPARENT_ROTATION_GROWTH_SPEC.md`
- `COLLECTION_OWNERSHIP_TO_CURATION_RETENTION_SPEC.md`
- 최신 marketplace 작업대와 v98 cleanup commit
- v100 shop-item consolidation commit
- Production 공개 홈

## 동시변경 처리
초기 기획은 v98을 기준으로 진행했으나 반영 직전 `main`이 v100으로 이동했다. 신규 commit은 추가 shop/cosmetic sink 작업을 통합했다. stale parent에는 문서를 쓰지 않았고, v100 기준으로 성장 공백을 다시 확인한 뒤 버전을 v101로 재번호했다. 더 넓어진 catalog는 이번 공백을 약화시키지 않고 오히려 강화한다. 보유품 공급이 늘어나는 만큼 기존 아이템에 의미를 다시 부여하는 큐레이션이 더 중요해진다.

## 선택한 최대 공백
**장기 미사용 보유품을 찾는 능력이, 그 보유품을 다시 의미 있게 만드는 경험보다 먼저 커졌다.**

선택한 loop:

`오래된 보유품 발견 → 의미 이해 → keep/feature/group/later → authored 정리 결과 → 자발적 복귀 → D30 durable history → 선택적 public-safe 재해석`

현재 작업대를 투기형 live market 설계로 바꾸지 않는다.

## 주요 결정
- cleanup은 first-session activation이 아님
- old/unequipped는 discovery signal이지 `쓸모없음` 판정이 아님
- 처분·거래 압박보다 가역적 큐레이션 우선
- unlimited-by-default를 보존하고 storage scarcity를 인위적으로 만들지 않음
- player trading이 live인 것처럼 암시하지 않음
- 거래량을 retention 목표로 사용하지 않음
- raw cleanup/open/share에 meaningful WLD/WDX 보상 금지
- private holdings/history private-by-default·non-indexable 유지
- `발견 → 이해 → 큐레이션 → 보존상태 확인 → 종료`를 interruptive monetization에서 보호

## 최신 조사
직접 채택한 방향:
1. Epic Games Fortnite Archive 현행 지원문서 — 소유·역사를 삭제하지 않고 가역적으로 declutter.
2. Pinterest board personalization, 2025-10-27 — 저장 콘텐츠가 정리·취향 형성·관련 발견을 통해 반복가치를 생성.
3. Steam Trade Protected Items 현행 지원문서 — virtual-item trading은 별도의 protection/security boundary.

참고/guardrail:
4. FTC Elite Events 조치, 2026-07 — secondary-market scarcity의 fake-account/proxy/limit-circumvention 유인.
5. FTC personalized-pricing 집행정책 제안, 2026-08-19 및 9월 의견기간 연장 — 아직 제안 단계임을 명시하고 attachment/history 기반 hidden individualized pricing 방지의 보수적 근거로 사용.
6. eBay collectible coins Authenticity Guarantee 확대, 2026-08-18 — collectible market에서 provenance/authenticity 신뢰의 중요성.
7. Discord Trust & Safety phishing 안내, 2026-07-23 갱신 — 혜택·링크 메시지가 phishing vector가 될 수 있음.
8. 개인정보위 TikTok·Apple 제재, 2026-07-27 — 행태정보·개인정보 처리의 적법근거, 실질적 선택, 국외이전 투명성 중요.

## 실험 backlog
- old-item reinterpretation vs next-item recommendation
- cleanup closure summary vs endless grid
- neutral stewardship copy vs liquidation framing
- seasonal reinterpretation vs new-rotation-only promotion
- private cleanup vs opt-in public-safe transformation artifact

canonical spec에 cohort, entry point, control/treatment, primary metric, guardrail, 관찰기간, next action을 포함했다.

## 보안·악용·개인정보
- HIGH: fake cleanup/marketplace phishing·ATO
- HIGH: private inventory/serial/acquisition-history leakage
- HIGH: 미래 wash trading·collusion·multi-account farming
- HIGH: 향후 recycle/craft/destroy의 destructive-action manipulation
- HIGH: finance-like appreciation/speculation framing
- MEDIUM: inventory history 기반 behavioural profiling / hidden individualized pricing

보안 코드는 수정하지 않았다. 외부 cleanup messaging, public personalized inventory, player trading, destructive recycling/crafting, public valuation/price history, 신규 third-party tracking/pricing은 별도 development/security/privacy/fraud/legal QA가 필요하다.

## Runtime Product Reality Audit
- Production 공개 홈 접근 가능
- WLD/보상 game-only·비현금성 고지 확인
- 공개 홈의 여러 shortcut 및 sponsored placement 확인
- authenticated marketplace는 회원계정으로 독립 실행하지 않음
- 최신 저장소 구현에서 member-only/noindex 작업대, cleanup filter, 명시적 non-tradability 문구, no listing/purchase mutation 확인

Runtime verification: **부분 가능**.

## 추가 파일
- `docs/planning/DORMANT_INVENTORY_REUSE_CURATION_RETENTION_GROWTH_SPEC.md`
- `docs/planning/DORMANT_INVENTORY_REUSE_CURATION_RETENTION_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-15-dormant-inventory-reuse-curation-retention-v2026.09.15.101.md`
- `docs/changelog/2026-09-15-dormant-inventory-reuse-curation-retention-v2026.09.15.101.ko.md`
- `docs/worklog/2026-09-15-dormant-inventory-reuse-curation-retention-v2026.09.15.101.md`
- `docs/worklog/2026-09-15-dormant-inventory-reuse-curation-retention-v2026.09.15.101.ko.md`

## 변경하지 않은 범위
runtime code, DB schema/migration, API contract, auth/session/OAuth, security architecture/code, marketplace transfer/listing/escrow, crafting/recycling settlement, scheduler, infrastructure, admin API.

## Rollback
문서-only commit이므로 방향이 기각되면 해당 단일 commit을 revert하면 된다. runtime/data rollback은 필요하지 않다.
