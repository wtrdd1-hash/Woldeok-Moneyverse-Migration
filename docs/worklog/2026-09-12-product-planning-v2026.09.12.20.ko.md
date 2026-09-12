# 제품 기획 작업기록 — v2026.09.12.20

기준일: 2026-09-12
범위: 클럽·협동 경제
브랜치: `docs/clubs-cooperative-economy-v2026.09.12.20`
런타임 영향: 없음, 문서 전용

## 시작 상태 확인

작업 전 현재 기획 기준문서와 관련 구현형 명세를 확인했다.

- `PROJECT_PLAN.md`
- `PRODUCT_GROWTH_PLAN.md`
- `PRODUCT_DESIGN_SPEC.md`
- `DEFAULT_LIMIT_POLICY.md`
- `ECONOMY_SINKS_SPEC.md`
- `ECONOMY_SINK_CATALOG.md`
- `SEASON_SYSTEM_SPEC.md`
- `PERSONAL_SPACES_CITY_PROJECTS_SPEC.md`
- `PLAYER_MARKETPLACE_CRAFTING_SPEC.md`
- `docs/INDEX.md`
- 현재 열린 PR과 최근 `main` 커밋

확인 결과 클럽은 아직 5~30명, 주간 협동 목표, 클럽포인트 정도만 기획되어 있었고 경제·권한·프로젝트 정산·클럽하우스·시즌 연속성·DB/API·모더레이션 계약이 부족했다.

## 주요 결정

1. 기존 `5~30명`은 소규모 UX 권장값이며 회원수 하드캡이 아니다.
2. 회원수 기본값은 `null/unlimited`; 대규모 처리는 시스템 보호와 UX 샤딩으로 해결한다.
3. P0에서 운영진 자유인출형 공동 WLD 지갑은 도입하지 않고 프로젝트 지정형 기여를 사용한다.
4. 프로젝트 `HOLD`, 완료 `HARD_SINK`, 유저 `TRANSFER`, 재료 `CONVERTER`를 명확히 구분한다.
5. 헌장·클럽하우스 확장·갤러리·아카이브·도시후원·명예건축으로 장기 소비처를 만든다.
6. 클럽 지출은 작업보상, 주식수익/체결, 대출조건, 사업수익, 시즌랭킹에 경제 우위를 주지 않는다.
7. 정상 참여는 무제한으로 허용하되 반복활동의 한계가치를 줄이고 1회성 마일스톤으로 무한 WLD 발행을 방지한다.
8. 시즌 종료 시 클럽 정체성과 역사/공간은 유지하고 시즌 목표·점수만 초기화한다.
9. 역할명보다 capability 기반 서버 권한과 append-only 감사로그를 사용한다.
10. 프로젝트 기여/정산은 서버 권위·멱등성·트랜잭션 처리를 필수로 한다.

## 조사자료

- Guild Wars 2 길드 업그레이드: 회원이 자원을 공동 기여해 지속적인 공동공간과 조직 기능을 만드는 모델.
- EVE Online 2026 `Cradle of War`/Military Campaigns: 여러 플레이스타일이 장기 공동 목표에 기여하는 모델.
- EVE 기업/프리랜스 일자리 방향: 조직이 신규 유저의 커뮤니티 진입다리가 되는 모델.
- TradingView 2026 Paper Trading 대회: 영구자산과 분리된 동일조건 경쟁계정을 사용해 경쟁 공정성을 만드는 모델.

Moneyverse에는 외부 사례의 전투력 버프, 임의 주간 기여상한, 부유한 조직의 순위구매 요소를 채택하지 않는다.

## 추가 파일

- `docs/planning/CLUBS_COOPERATIVE_ECONOMY_SPEC.md`
- `docs/planning/CLUBS_COOPERATIVE_ECONOMY_SPEC.ko.md`
- 영문/한국어 changelog
- 영문/한국어 worklog
- `docs/INDEX.md` 갱신

## 동시변경 확인

작업 시작 전과 핵심 명세 작성 후 `main`을 다시 확인했다. `main`은 `3feb7f90b9be01b00fa98269789dd20d5fbc0959`를 유지했고 클럽/협동경제 영역의 충돌 변경은 발견되지 않았다. 열린 Banking & Financial Services 기획은 별도 범위다.

## 검증

- 영문 기준과 한국어 대응 문서의 기능 정책을 맞춰 작성했다.
- 런타임/API/DB migration은 수정하지 않았다.
- 문서 전용 변경이므로 이번 회차에는 Test 배포가 필요하지 않다.
- 향후 구현은 서버 권위 가격/정책, 멱등성, 트랜잭션 정산, 실제 PostgreSQL 검증을 명세에 요구했다.

## 다음 우선순위

1. P0 클럽 seed catalog와 실제 config payload.
2. 클럽하우스 화면별 UX, 대규모 클럽 페이지네이션/샤딩.
3. Season 1/2 협동 목표와 정확한 코스메틱/아카이브 보상표.
4. 신규/중간/고자산 코호트별 클럽 소비·기여 경제 시뮬레이션.
5. 주식 시세조작 공모를 포함한 커뮤니티 피드/모더레이션 상세 명세.
6. 구현 시점마다 상위 기획에 남아 있는 과거 hard-cap 예시 정리.