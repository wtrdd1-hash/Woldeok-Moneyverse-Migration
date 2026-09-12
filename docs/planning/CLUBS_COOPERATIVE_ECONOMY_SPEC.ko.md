# 월덕 머니버스 — 클럽·협동 경제 시스템 명세서

> 버전: v2026.09.12.20
> 상태: 구현 지향형 Living 제품 기획서
> 기준일: 2026-09-12
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `ECONOMY_SINK_CATALOG.md`, `SEASON_SYSTEM_SPEC.md`, `PERSONAL_SPACES_CITY_PROJECTS_SPEC.md`, `PLAYER_MARKETPLACE_CRAFTING_SPEC.md`
> 영문 기준 문서: [CLUBS_COOPERATIVE_ECONOMY_SPEC.md](CLUBS_COOPERATIVE_ECONOMY_SPEC.md)

## 0. 목적

클럽은 협동, 정체성, 공동 프로젝트, 학습, 장기적인 자발적 WLD/자원 소비를 위한 지속형 소셜 조직이다. 클럽은 별도 은행·투자펀드·다단계 보상구조가 아니며, 운영진이 자유롭게 인출할 수 있는 공동 잔액을 기본으로 제공하지 않는다.

이 시스템은 다음 질문에 답해야 한다.

1. 사용자가 왜 클럽에 가입하거나 만들고 싶은가?
2. Pay-to-Win 없이 무엇을 함께 만들 수 있는가?
3. 기여가 강제 세금이 아니라 눈에 보이는 사회적 가치가 되려면 어떻게 해야 하는가?
4. 시즌이 끝나도 클럽의 영구 정체성을 보존하면서 새 협동 목표를 어떻게 제공할 것인가?
5. 임의 회원수·플레이 하드캡 없이 어떻게 확장할 것인가?

기존 `PRODUCT_DESIGN_SPEC.md`의 `5~30명`은 **소규모 클럽 UX를 위한 권장 코호트**로 재해석하며 하드캡이 아니다. 기본 회원수 설정은 `null = unlimited`로 둔다. 대규모 클럽은 페이지네이션, 큐, 모더레이션 임계치, 필요 시 UX 샤딩 등 시스템 보호 방식으로 다루고 숨은 게임플레이 상한을 두지 않는다.

## 1. 제품 원칙

### 1.1 기본 무제한

- 클럽 회원 수: 기본 `null/unlimited`.
- 일반 기여 횟수: 무제한.
- 클럽 생애 동안 완료할 프로젝트 수: 무제한.
- 클럽 기록: 제품 정책상 고정 보존 개수 제한 없음.
- 일반 장식/비희소 코스메틱 구매: 중복 의미가 있으면 무제한.
- 주간 협동 참여: 전역 하드캡 없음.

단, API 폭주 방지, 스팸 방지, 정산 잠금, 멱등성, 실제 한정 재고, 악용 검토 같은 보안·무결성 보호는 유지한다.

### 1.2 클럽 지출은 Pay-to-Win 금지

클럽 지출로 다음을 직접 올릴 수 없다.

- 작업 보상
- 가상주식 수익/체결 우위
- 대출 조건
- 사업 정산 배율
- 시즌 리그 점수
- WLD로 구매하는 랭킹 점수
- 확률형 결과의 당첨 확률

대신 정체성, 공간, 기록, 전시, 협동 콘텐츠, 소셜 도구, 학습도구, 비경제적 편의를 해금한다.

### 1.3 기여는 자발적

회비를 내지 않으면 핵심 기능을 못 쓰는 구조를 기본으로 하지 않는다. 클럽은 권장 기여 목표를 표시할 수 있지만 자동 출금은 금지한다.

## 2. 클럽 생명주기

기본 상태:

`DRAFT -> ACTIVE -> DORMANT -> ACTIVE`

관리 상태:

- `FROZEN`: 무결성/모더레이션 검토 중 보호된 변경 잠금
- `ARCHIVED`: 클럽 운영 종료 후 읽기 전용 기록 보존
- `DISSOLVED`: 명시적 해산 절차 후 종료, 필요 시 공개 아카이브 흔적 유지

모든 전환은 서버 권위이고 감사 로그를 남긴다.

### 2.1 창설

기획 시작값:

- 클럽 헌장 등록비: **10,000 WLD HARD_SINK**
- 이름, 태그, 설명, 기본 언어, 공개상태, 초기 테마 선택
- 이름 정규화/중복 검사는 서버에서 수행

원장 유형: `SINK_CLUB_CHARTER`.

P0에서 운영 안전을 위해 한 사용자가 동시에 `OWNER`인 활성 클럽을 하나로 둘 수 있으나 이는 회원가입 전체의 영구 하드캡으로 확장하지 않는다. 구현 시 이유와 범위를 다시 검토한다.

### 2.2 가입

가입 모드:

- 공개 가입
- 가입 요청
- 초대 전용
- 시즌 모집 기간

향후 다중 클럽 가입을 지원할 수 있도록 DB는 일반화하고, P0 UI가 필요하면 `primary_club_id`만 대표 클럽으로 노출한다.

## 3. 역할·권한

기본 역할:

- `OWNER`
- `STEWARD`
- `PROJECT_MANAGER`
- `MODERATOR`
- `CURATOR`
- `MEMBER`

역할명 자체를 하드코딩하기보다 capability 기반으로 검사한다.

주요 capability:

- 프로필 관리
- 가입 요청 관리
- 초대/퇴장
- 피드 모더레이션
- 프로젝트 생성/수정
- 프로젝트 단계 공개
- 클럽하우스 배치
- 클럽 프로젝트 예산으로 코스메틱 구매
- 아카이브 전시 관리
- 분석 조회
- 역할 관리
- 해산/아카이브

P0에는 `클럽 자금 자유 인출` 권한을 만들지 않는다.

## 4. 클럽 포인트와 프로젝트 자금

### 4.1 Club Points (`CP`)

CP는 WLD가 아닌 비양도 진행 지표다.

획득 예:

- 협동 목표 완료
- 클럽 프로젝트 완료
- 여러 시스템에 걸친 정상 참여
- 시즌 협동 마일스톤
- 정책상 인정되는 학습/커뮤니티 기여

게시글 수, 거래 횟수, 순환 이체만으로 CP를 파밍할 수 없게 한다.

### 4.2 프로젝트 예산

P0에는 자유 인출형 공동 WLD 잔액 대신 **프로젝트 지정형 기여**를 사용한다.

`회원 WLD -> 프로젝트 기여 -> 프로젝트 escrow/system account -> 완료 정산 -> HARD_SINK 또는 명시적 시스템 목적지`

이미 특정 프로젝트에 넣은 금액은 사전 고지된 취소/환불 규칙 없이 다른 용도로 바꿀 수 없다.

### 4.3 분류

- 건축/코스메틱 프로젝트로 최종 소멸: `HARD_SINK`
- 목표 달성 전 임시 보관: `HOLD`
- 유저간 이동: `TRANSFER`
- 재료→장식 변환: `CONVERTER`, WLD 제작비는 별도 `HARD_SINK`

## 5. 협동 프로젝트

상태머신:

`DRAFT -> PUBLISHED -> FUNDING -> FUNDED -> BUILDING -> COMPLETED -> ARCHIVED`

예외:

- `FUNDING -> CANCELLED`
- `BUILDING -> PAUSED`
- `PAUSED -> BUILDING/CANCELLED`

모든 전환은 actor/reason/timestamp/policy_version/idempotency를 기록한다.

프로젝트 유형:

1. 클럽하우스
2. 시즌·역사 아카이브
3. 기간 이벤트 무대
4. 도시 공동 후원
5. 협동 제작
6. 공동 학습/과거시장 시뮬레이션 프리셋

프로젝트 목표금액은 **완료 조건**이지 개인 기여 상한이 아니다.

고액 기여의 명예점수는 선형이 아닌 감소효용 형태를 사용한다. 예시:

`contribution_prestige = floor(100 * ln(1 + lifetime_valid_contribution / 1000))`

명예점수는 WLD나 경쟁력으로 전환하지 않는다.

## 6. 클럽하우스와 장기 소비처

| 코드 | 소비처 | 기획 가격 | 반복 | 분류 | 가치 |
|---|---|---:|---|---|---|
| CLUB-CHARTER | 클럽 헌장 | 10,000 WLD | 신규 클럽 | HARD_SINK | 조직 정체성 |
| CLUB-BANNER-BASIC | 배너 | 5,000 WLD | 여러 변형 | HARD_SINK | 외형 |
| CLUB-HALL-LOBBY | 클럽하우스 로비 | 50,000 WLD | 기본 1개 | HARD_SINK | 공동 공간 |
| CLUB-HALL-ROOM | 추가 방 | `25,000 * 1.35^n` | 기본 무제한 | HARD_SINK | 공간 확장 |
| CLUB-GALLERY-WING | 갤러리 윙 | `75,000 * 1.45^n` | 기본 무제한 | HARD_SINK | 기록/전시 |
| CLUB-TROPHY-ATR | 트로피 아트리움 | 250,000 WLD | 테마 변형 | HARD_SINK | 명예 |
| CLUB-SKYLINE-HQ | 스카이라인 본사 | 1,500,000 WLD | 확장 가능 | HARD_SINK | 고자산 명예 |
| CLUB-LEGACY-HALL | 레거시 홀 | 2,500,000 WLD | 확장 가능 | HARD_SINK | 다중시즌 기록 |
| CLUB-CITY-SPONSOR | 도시 후원 | 250,000+ WLD | 반복 | HARD_SINK | 공개 후원 기록 |
| CLUB-LANDMARK | 랜드마크 공동후원 | 5,000,000+ WLD | 반복 | HARD_SINK | 서버 명예 |

가격은 운영 config 시작값이다. 실제 콘텐츠/인프라 경계가 없다면 마지막 확장단계 하드캡을 만들지 않는다.

클럽하우스 모듈:

- 리셉션
- 멤버 월
- 시즌 아카이브
- 트로피 갤러리
- 시장 학습실
- 사업 쇼케이스
- 제작 스튜디오
- 프로젝트 컨트롤룸
- 이벤트 무대
- 도시 후원 갤러리
- 역사관
- 레거시 윙

어떤 모듈도 경제 산출량을 직접 올리지 않는다.

반복 장식 소비 예:

- 가구 제작비 1,500~10,000 WLD
- 테마 색상변경 2,500
- 배너 리디자인 5,000
- 기념 각인 3,000
- 시즌 명패 복원 7,500
- 역사 전시 설치 10,000~50,000
- 이벤트 무대 스킨 15,000~100,000
- 창립기념 조형물은 동적 명예 가격

## 7. 협동 목표

단순 반복량보다 다양한 참여를 본다.

예:

- 여러 직업에서 서로 다른 활동 완료
- 분산투자 학습 체인 공동 완료
- 사업 복기 과제 수행
- 도시 아카이브에 재료 기여
- 정책상 승인된 학습노트/시즌 복기 작성
- 여러 시스템에 걸친 시즌 스토리 완료

참여 자체는 계속 가능하지만 보상은 다음처럼 분리한다.

- 1회성 마일스톤
- 반복할수록 기여 가중치 감소
- 코스메틱/기록 인정
- 선형 무한 WLD 지급 금지

예시 가중치: `weight_n = 1 / sqrt(n)`.

## 8. 시즌 연동

영구 유지:

- 클럽 정체성
- 회원 기록
- 클럽하우스
- 구매 코스메틱
- 완료 아카이브
- 누적 기록/CP
- 도시 후원 이력

시즌 범위:

- 시즌 협동목표
- 시즌 클럽 랭킹 점수
- 시즌 기여 보드
- 시즌 전용 프로젝트/토큰

시즌 안내:

- D-14: 미완료 목표 + 다음 테마 티저
- D-7: 다음 시즌 핵심 협동 프로젝트
- D-3: 보상/클럽하우스 코스메틱 미리보기
- D-1: 종료시각/리셋표/미수령 보상
- 검증 구간: 시즌 랭킹만 잠금, 영구 클럽 공간은 유지

상위 클럽 보상은 번호 명패, 배너, 트로피, 시즌 소속 배지, 아카이브 전시 등 명예 중심으로 한다. 영구 수익 배율은 주지 않는다.

## 9. 발견·모집·피드

검색 필터:

- 언어
- 가입 방식
- 관심 분야(시장학습/수집/사업/캐주얼/제작/이벤트)
- 주 활동시간
- 시즌 참여 성향
- 초보친화 여부
- 공개 클럽하우스 여부

회원 총자산/총 WLD로 기본 정렬하지 않는다.

클럽 페이지 탭:

1. 개요
2. 회원
3. 프로젝트
4. 클럽하우스
5. 시즌
6. 아카이브
7. 피드
8. 소개/규칙

잔액, 보유주식, 부채, 개인 거래내역은 기본 비공개다.

피드는 공지, 프로젝트 업데이트, 업적 공유, 학습노트, 이벤트 글을 지원하고 신고/뮤트/차단과 서버측 스팸방지가 필요하다. 게시량 자체로 CP/WLD를 주지 않는다.

## 10. 거버넌스·안전

P0는 토큰 투표가 아니라 소유자/스튜어드 운영을 기본으로 한다. 프로젝트 선호도 투표는 가능하지만 WLD로 투표권을 구매할 수 없다.

소유권 이전은 수신자의 명시적 수락, 기존 소유자의 재인증, 감사 이벤트가 필요하다. `FROZEN` 또는 해산 진행 중에는 불가하다.

해산 화면은 활성 프로젝트, 미정산 HOLD의 환불 규칙, 클럽 귀속 장식, 영구 아카이브 영향을 모두 보여줘야 한다. 이미 완료된 hard sink는 해산만으로 자동 환불하지 않는다.

## 11. 경제 원장

권장 transaction type:

- `SINK_CLUB_CHARTER`
- `SINK_CLUB_HALL_PURCHASE`
- `SINK_CLUB_HALL_EXPANSION`
- `SINK_CLUB_DECORATION`
- `SINK_CLUB_ENGRAVING`
- `HOLD_CLUB_PROJECT_CONTRIBUTION`
- `SETTLE_CLUB_PROJECT_SINK`
- `REFUND_CLUB_PROJECT_CONTRIBUTION`
- `CONVERT_CLUB_CRAFTING_MATERIAL`
- `SINK_CLUB_CRAFTING_FEE`
- `SINK_CLUB_CITY_SPONSORSHIP`
- `SINK_CLUB_PRESTIGE`

경제 대시보드에는 총 클럽기여액과 실제 hard sink를 분리하고, 미정산 HOLD, 환불, 재료변환, 전체 sink 중 클럽 비중, 회원당 median/P90/P99 지출, 상위 1%/10% 클럽 집중도, 신규/중간/고자산 사용자 참여비율을 보여준다.

## 12. 권장 DB 구조

`clubs`: 이름/태그/언어/공개상태/상태/테마/owner/version.

`club_memberships`: `club_id`, `user_id`, `role_code`, `status`, `joined_at`, `left_at`, `is_primary`.

`club_role_capabilities`: 역할별 capability.

`club_projects`: 프로젝트 타입/코드/상태/정책버전/목표 WLD·재료/모금액/시각/version.

`club_project_contributions`: 프로젝트/사용자/WLD/재료/원장ID/멱등키/상태/시각.

`club_spaces`: 공간종류/확장인덱스/테마/레이아웃 revision.

`club_season_snapshots`: 시즌/클럽/점수구성/티어/랭크/보상정책/스냅샷버전/검증상태.

`club_audit_events`: 가입·역할·프로젝트·거버넌스 변경의 append-only 감사로그.

## 13. API

권장 경로:

- `GET/POST /api/clubs`
- `GET/PATCH /api/clubs/:clubId`
- `POST /api/clubs/:clubId/join`
- `POST /api/clubs/:clubId/leave`
- `POST /api/clubs/:clubId/invites`
- `PATCH /api/clubs/:clubId/members/:userId`
- `GET/POST /api/clubs/:clubId/projects`
- `POST /api/clubs/:clubId/projects/:projectId/contributions`
- `POST /api/clubs/:clubId/projects/:projectId/cancel`
- `POST /api/clubs/:clubId/projects/:projectId/settle`
- `GET/PATCH /api/clubs/:clubId/clubhouse`
- `GET /api/clubs/:clubId/season`
- `GET /api/clubs/:clubId/archive`
- `GET /api/clubs/:clubId/feed`

모든 변경 API는 인증·권한·서버계산 가격·검증을 적용하며 금융/정산 변경은 멱등성을 필수로 한다.

## 14. 동시성·무결성

기여 처리:

1. 프로젝트 상태/version 잠금 또는 검증
2. FUNDING 상태 확인
3. 서버 잔액·금액 검증
4. 멱등 원장 변경
5. 기여기록 생성
6. funded total 갱신
7. 목표 달성 시 `FUNDED` 전환
8. 하나의 트랜잭션 커밋
9. canonical 상태 반환

유한 목표를 초과한 금액은 P0에서 **남은 목표액만 차감하고 초과 요청분은 미차감**하는 정책을 권장한다. 고자산 유저의 무제한 소비는 반복 가능한 명예/후원 프로젝트에서 제공한다.

## 15. 악용·모더레이션

탐지 대상:

- 초대 스팸
- 가입/탈퇴 보상 파밍
- 기여→환불 순환 악용
- 가짜 희소성 공지
- 역할 상승 우회
- 중복 정산
- 다른 payload로 멱등키 재사용
- 클럽 피드 괴롭힘
- 가상주식 시세조작 공모
- 1회 보상만 노리는 sybil 클럽

무한 게시량/초대/사소한 가입으로 보상을 만들지 않는다.

## 16. 분석·KPI

이벤트:

`club_created`, `club_join_requested`, `club_joined`, `club_left`, `club_role_changed`, `club_project_published`, `club_project_contribution_completed`, `club_project_funded`, `club_project_completed`, `clubhouse_module_purchased`, `clubhouse_layout_saved`, `club_season_snapshot_created`, `club_reward_delivered`, `club_abuse_case_opened`.

주요 지표:

- WAU 중 클럽 가입 비율
- 클럽 참여 코호트별 D7 retention
- 가입 후 첫 건강한 클럽활동까지 시간
- 주간 활성 클럽 수
- 프로젝트별 기여자 폭
- 프로젝트 완료 중앙시간
- 전체 hard sink 중 클럽 비중
- 기여 집중도/Gini/top-share
- 한 명이 아닌 3명 이상이 기여한 프로젝트 비율
- 신고/차단/모더레이션 비율
- 시즌간 클럽 지속률

기여금액 하나만 최적화하지 않는다.

## 17. 관리자 콘솔

필요 기능:

- 클럽 검색/조회
- 회원/역할 감사기록
- 프로젝트·기여 대사
- 사유 포함 freeze/unfreeze
- 콘텐츠 모더레이션
- 정책/config 조회
- 시즌 스냅샷/보상 상태
- 중복정산 조사
- 클럽 sink 경제지표
- 아카이브/해산 지원

관리자도 보호 원장 기록을 직접 수정하지 않는다.

## 18. 운영 config

배포 없이 조정 가능한 항목:

- 헌장 등록비
- 클럽하우스 카탈로그/가격
- 기하 가격계수
- 프로젝트 템플릿
- CP 마일스톤
- 시즌 협동목표
- 코스메틱 보상 매핑
- 검색 카테고리
- 모더레이션 임계치
- 취소 가능기간
- 실제 유한 재고 설정

회원수 기본값은 `null`. 양의 회원수 제한을 넣는 경우 반드시 보호목적을 문서화한다.

## 19. 단계별 구현

### P0

클럽 생성/검색/가입/탈퇴, 역할/capability, 프로필·공지, 프로젝트 1종, 프로젝트 지정 WLD 기여, 기본 클럽하우스·장식, CP, 신고/모더레이션, 원장·관리자 대사.

### P1

다중 프로젝트, 클럽하우스 확장, 아카이브/트로피 갤러리, 시즌 협동목표·스냅샷, 도시 프로젝트 연동, 재료기여/협동제작, 모집조건.

### P2

다중 클럽 지원 확장, 클럽간 도시협업, 공개 클럽하우스 방문, 레거시 홀, 과거시장 공동학습, 대규모 클럽 UX 샤딩.

## 20. Definition of Done

- 영문/한국어 동작문서 일치
- 임의 회원수/기여/플레이 하드캡 없음
- 서버 권위·멱등 금융기여
- transfer/hold/hard-sink/converter 완전 대사
- 운영진 자유 인출 불가
- 서버측 capability 권한 테스트
- 프로젝트 상태 전환 트랜잭션/재시도 안전성
- 시즌 종료 후 영구 클럽 기록 유지
- 신고/차단/모더레이션 작동
- 고자산 소비가 명예/외형 중심이고 Pay-to-Win 아님
- 실제 소각량과 기여 거래량을 분석에서 분리
- forward-only migration 실제 PostgreSQL 검증
- 정확한 후보 SHA를 Test에 배포
- 동시기여/중복요청/취소·환불/권한악용/시즌정산 QA 통과
- 검증된 동일 SHA만 Production 승격

## 21. 조사 근거

- Guild Wars 2의 길드 업그레이드는 여러 회원이 자원을 모아 공동 공간·시설·정체성을 확장하는 패턴을 보여준다. Moneyverse는 협동 건설 개념만 참고하고, 기존 게임의 주간 상한이나 전투력 버프는 기본 무제한·비 Pay-to-Win 정책에 맞지 않아 채택하지 않는다.
- EVE Online의 2026 Military Campaigns는 채굴·제조·미션·전투 등 서로 다른 플레이스타일이 장기 공동 목표에 기여할 수 있게 설계되어 있다. Moneyverse도 직업·수집·제작·사업·학습 등 여러 경로가 클럽 협동에 기여하게 한다.
- EVE의 기업/프리랜스 일자리 방향은 조직이 신규 플레이어의 커뮤니티 진입다리가 될 수 있음을 보여준다. 따라서 초보 친화 모집과 작은 유효 기여를 핵심 UX로 둔다.
- TradingView의 2026 Paper Trading 대회는 동일 조건의 별도 경쟁계정을 사용한다. Moneyverse도 시즌 경쟁점수를 메인 WLD/클럽 자산과 분리해 부유한 클럽이 돈으로 순위를 사지 못하게 한다.

위 사례는 설계 참고이며 그대로 복제하지 않는다.