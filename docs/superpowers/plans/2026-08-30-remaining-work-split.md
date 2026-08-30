# 남은 작업 분담 — 2026-08-30

기획서 v2 스택 중 4개 PR이 `main`에 들어갔다. 남은 것을 **A조·B조**로 나눈다.
이 문서가 두 사람 사이의 유일한 조율 지점이다. 번호를 바꾸거나 순서를 바꾸면
**여기부터 고치고 커밋한다.**

관련 문서: [`AGENTS.md`](../../../AGENTS.md) · [기획서](../specs/2026-08-30-spec-v2.md) ·
[구현 계획](2026-08-30-spec-v2-implementation.md) · [감사 결과 164건](2026-08-30-spec-v2-audit-findings.json)

---

## 끝난 것 (main, 마이그레이션 002–061)

| 마이그레이션 | 내용 |
|---|---|
| — | `.claude` ignore · 기획서 · 구현 계획 |
| 056–059 | 2인 승인 철거 · 최고관리자 · TOTP 2단계 인증 · 기능 스위치 · 정책 버전 |
| 060 | 카지노 동전 확률 교정 · 분포 시험 · 확률 사전 공개 |
| 061 | Discord 봇 · 공유 rate limiter · outbox 워커 |
| — | 암호화 백업 · 복구 · CI 비밀값 스캔 · 의존성 감사 |

**아직 배포되지 않았다.** `ADOPT_FROM` 문제로 test 스택이 502였고, 그 수정이
이 문서와 같은 PR에 있다.

---

## 마이그레이션 번호 배정 — 겹치면 안 된다

연속성 규칙(002부터 빈틈 없이) 때문에 **번호를 미리 나눠 갖는다.**
자기 구간 밖의 번호를 쓰지 않는다. 구간이 모자라면 이 문서를 고치고 상대에게 알린다.

| 조 | 마이그레이션 구간 | 상태 |
|---|---|---|
| **A조** (저장소 소유자 측 / Claude) | 062 – 065 | `main`에 있음 |
| **B조** (Codex) | **066 – 082** | 2026-08-30 재배정 |
| **A조** 남은 것 (A3·A4·A5) | **083 이후** | |

배포·PR 병합·코드 리뷰는 A조가 맡는다. B조는 브랜치를 만들어 PR만 연다.

### 2026-08-30 재배정 — 이 문서가 틀렸다

이전 판은 A조에 **062–078을 통째로 예약**하고 "다 안 쓰면 넘긴다"고만 적었다.
넘기지 않았다. B조는 문서대로 079부터 시작했고, A조는 065에서 멈췄다.
**066–078이 비어 CI의 연속성 검사가 B조 PR 다섯 건을 전부 막았다.** 문서 잘못이다.

그래서 **미리 크게 예약하지 않는다.** 구간은 실제로 쓰는 만큼만, 쓰기 직전에 잡는다.
자기 구간을 다 못 쓸 것 같으면 **그 사실을 안 시점에** 여기를 고치고 상대에게 알린다.
연속성은 `main` 기준이므로, 아직 쓰이지 않은 예약 번호는 상대에게 벽이 된다.

### 병합 순서가 고정되어 있다

B1 → B3 → B5, 그리고 B1 → B4. 각 PR은 `main`이 아니라 **바로 앞 브랜치를 base로 연다.**
`main`을 base로 열면 각 diff가 밑에 깔린 것을 전부 다시 제안한다.

- B3의 `bank_credit_grade`는 `LANGUAGE sql`이라 CREATE 시점에 B1의 테이블을 찾는다 → 없으면 `migrate.sh`가 즉시 멈춘다.
- B4는 시그니처에 B1이 만드는 `public.work_job_type`을 쓴다 → 마찬가지로 즉시 멈춘다.
- **B5는 조용히 실패한다.** plpgsql은 CREATE 시점에 테이블 이름을 해석하지 않으므로,
  B3 없이 B5를 넣으면 마이그레이션도 배포도 성공했다고 보고한 뒤
  첫 회원 요청에서 `relation "public.user_progression" does not exist`가 난다.

---

## A조 — 원장·운영 계층

| # | 브랜치 | 마이그레이션 | 내용 |
|---|---|---|---|
| A1 | `feat/multi-origin-auth` | 없음 | ✅ **완료** (PR #9, main). 도메인 비종속 인증 — 설정 계층뿐이라 마이그레이션이 필요 없었다 |
| A2 | `feat/audit-trail` | 062–065 | ✅ **완료** (PR #10, main). 불변 해시체인 · 조회 감사 · 검색 · 무결성 검증 · 보존/파기. 후속 보강은 PR #16 |
| A3 | `feat/ledger-corrections` | 083–085 | 보정 거래 · 관리자 개시 삭제·IP 차단 · 대량 지급 · 계정 동결 |
| A4 | `feat/scheduler-and-metrics` | 086–088 | KST 스케줄러 · 대사 워커 · 안전모드 자동 전환 · 관리자 현황 |
| A5 | `feat/economy-auto-policy` | 089–092 | 자동 경제 조정 엔진 |

## B조 — 게임 콘텐츠 계층

| # | 브랜치 | 마이그레이션 | 내용 |
|---|---|---|---|
| B1 | `feat/work-jobs-xp` | 066–070 | 작업 배정·완료·보상 · 직업/경험치 · 일 400 / 주 2,200 상한 |
| B2 | `feat/shop-catalog-items` | 071–075 | 카탈로그·재고·구매·보유품·효과 · 기획서 §17 상품 전량 |
| B3 | `feat/progression-stages` | 076–078 | 성장 단계 · 해금 · 신용 등급 · 대출 만기/연체 |
| B4 | `feat/member-profile` | 079–080 | 프로필 공개 3단계 · 칭호 · 카지노 자기 한도 · 열람·정정 경로 |
| B5 | `feat/engagement-loop` | 081–082 | 퀘스트 · NPC · 도감 · 주간목표 · 시즌 수명주기 · 복귀 · 이탈감지 |

### B implementation notes

- The B stack is rebased only after A's 062–078 migrations are present on
  `main`; the migration-parity gate rejects an otherwise-valid B branch while
  that contiguous prefix is absent.
- Shop effects use a closed database vocabulary and reject fields that could
  influence casino odds, stock returns, or competitive outcomes.
- Progression measures completed work and job level separately from balances,
  so loan, administrator, and casino activity cannot satisfy stage requirements.

각 항목의 상세 요구사항은 [구현 계획](2026-08-30-spec-v2-implementation.md)의
해당 PR 절에 있다. 계획서의 번호(PR3·PR4…)와 여기 번호(A2·A3…)는 **내용이 같고
마이그레이션 번호만 다르다** — 계획서 쪽 번호는 무시하고 이 표를 따른다.

---

## A1 — 도메인 비종속 인증 (새 항목, 최우선)

지금 인증은 **단일 도메인에 묶여 있다.** `backend/src/core/config.ts:106`:

```ts
if (callbackUrl.origin !== applicationUrl.origin) return { enabled: false };
```

콜백 URI의 origin이 `APP_BASE_URL`과 정확히 같지 않으면 OAuth 제공자가
**조용히 비활성화된다.** 예외도, 로그도, 화면 경고도 없다 — 로그인 버튼만 사라진다.
`deploy/bootstrap-env.sh`가 `DISCORD_REDIRECT_URI`를 `APP_BASE_URL`에서 파생하므로
origin은 배포당 하나뿐이다.

**따라서 지금은 도메인이 바뀌거나 두 번째 DNS가 붙는 순간 인증이 죽는다.**
test는 `test.easy-scraping.com`에서만, production은 `easy-scraping.com`에서만 산다.

### 요구사항

- `OAUTH_ALLOWED_REDIRECT_URIS`를 구현한다. 기획서 §16 필수 변수 표에 이미 있고
  아직 코드에 없다. 쉼표로 구분한 **사전 등록 목록**이다.
- 콜백 origin은 요청의 Host에서 정하되 **반드시 그 목록 안에 있어야 한다.**
  목록에 없으면 거부한다. 열린 리다이렉트를 만들지 않는다 — 기획서 §17.3이
  `returnUrl`·`next`·`redirect` 류의 사용자 입력 리다이렉트를 금지한다.
- 세션 쿠키는 **host-only**를 유지한다(`Domain` 속성을 붙이지 않는다).
  기획서 §17.4: 두 도메인은 쿠키를 공유하지 않는다.
- SEO 대표 도메인은 인증과 **분리한다**. 기획서 §18.2·§18.7의
  `PUBLIC_CANONICAL_ORIGIN`이 canonical·sitemap을 정하고, 인증 허용 목록과 무관하다.
- test와 production이 서로의 origin을 허용하지 않는지 테스트로 고정한다.
- `admin.module.ts`의 TOTP `issuer`가 `baseUrl`의 host다. 도메인이 바뀌어도
  기존 등록이 깨지지 않는지 확인하고, 깨진다면 issuer를 고정값으로 옮긴다.

### 왜 A1이 먼저인가

이게 없으면 도메인이 바뀔 때마다 **인증이 조용히 죽는다.** 그리고 조용히 죽는
고장은 배포가 성공했다고 보고한 뒤에 발견된다.

---

## A2 — 감사 로그 (062–065, PR #10)

기획서 §14.9·§17.10을 구현한다. **설계 판단을 여기 남긴다** — 다음 사람이 같은 결정을
다시 내리지 않도록.

### 고친 것

007 이후로 `audit_logs`에 무결성 해시는 붙어 있었지만 **검증이 불가능했다.**

1. **해시가 재현되지 않았다.** `jsonb_build_object`에 timestamptz를 넣었고, PostgreSQL은
   그것을 세션 TimeZone으로 직렬화한다. 함수는 `search_path`만 고정했으므로 Asia/Seoul에서
   접속한 검증자는 모든 행을 위조로 판정한다. 062의 v2 해시는 타임스탬프를 UTC로 직접
   포맷한다.
2. **전순서가 없었다.** `ORDER BY created_at DESC, id DESC`인데 `id`는 랜덤 uuid다.
   062가 `sequence bigint`를 추가하고 append를 직렬화하는 그 advisory lock 안에서 채번한다.
3. **UPDATE를 막는 것이 없었다.** 018이 `economy_reconciliation_snapshots`에 쓰는 트리거를
   그대로 붙였다.

**기존 행은 재해싱하지 않는다.** `hash_version = 1`로 남고, 064의 검증자는 legacy 공식을
UTC로 고정해 재현을 시도한다. 재현되면 verified, 안 되면 `legacy` — **mismatch가 아니다.**
작성 당시 세션 TZ는 행에서 복구할 수 없으므로 불일치가 위조의 증거가 아니기 때문이다.

### 설계 판단

| 판단 | 이유 |
|---|---|
| `context` jsonb + 타입 컬럼 9개 (40컬럼 아님) | 검색 축만 컬럼으로. 나머지가 컬럼이면 매 필드가 마이그레이션이고 대부분의 행에서 NULL이다 |
| 모르는 context 키는 **거부**(22023), 무시 아님 | 호출부 오타가 조용히 기록 안 되는 필드가 되면 사고 때 발견된다 |
| 민감 키를 **키 이름**으로 재귀 차단 | 값 판별은 불가능하다. `tokenCount`도 같이 막히는데, 그 방향의 오류가 옳다 |
| 조회 감사는 **미들웨어**, 인터셉터 아님 | Nest는 guard를 인터셉터보다 먼저 돌린다 → 인터셉터는 **권한 거부된 요청을 아예 못 본다.** §17.10이 기록하라는 바로 그 사건이다 |
| `admin_record_console_access` 신설 | 거부당한 호출자는 역할이 없다. `admin_record_audit_event`의 역할 검사가 그 기록 자체를 막는다 |
| 감사 쓰기 실패가 요청을 실패시키지 않는다 | 응답을 이미 보낸 뒤에 쓴다. 로그만 남긴다 |
| 익명 요청의 거부는 기록하지 않는다 | 행위자가 없다. `/api/v1/admin` 무차별 접근은 throttler의 몫이다 |
| 보존 카테고리는 **둘뿐** | 개인정보처리방침이 "인증·권한 거부 90일, 관리자·경제 1년" 둘만 약속한다. 셋째를 만들면 공개 문서가 거짓이 된다(§18.6) |
| 파기는 `DELETE`가 아니라 기록 | §14.9 명시. 애초에 트리거가 DELETE를 막는다 |

### 방침 문서를 같이 고쳤다

IP·User-Agent 파생값·세션 해시를 새로 기록하므로 `privacy-document.tsx`의 §1 처리 항목을
실제와 맞췄다. **필드를 늘리면서 방침을 안 고치면 §18.6 위반이다.**

---

## 두 조 공통 규칙

1. **`AGENTS.md`를 먼저 읽는다.** 특히 §3(마이그레이션 스택), §4(원장 불변식),
   §9(이미 밟은 함정).
2. **브랜치를 만들어 PR만 연다. 배포하지 않는다.** `gh workflow run deploy.yml`은
   실행하지 않는다. 테스트 서버 롤은 저장소 소유자가 한다.
3. **DB 테스트는 CI에서만 돈다.** 로컬에 Postgres가 없다. "테스트 통과"라고 쓰기 전에
   CI 출력을 본다.
4. **문서를 갱신한다.** 설계 판단을 내렸으면 이 문서나 구현 계획에 적고 같은 PR에
   포함한다. 머릿속에만 있는 결정은 다음 사람에게 전달되지 않는다.
5. **커밋과 PR 본문은 영어**, `Co-Authored-By`·`Claude-Session`·"Generated with" 금지.
6. PR 본문에 **검증하지 않은 것을 명시한다.** 무엇을 실행했고 무엇을 실행하지
   않았는지 쓴다.
