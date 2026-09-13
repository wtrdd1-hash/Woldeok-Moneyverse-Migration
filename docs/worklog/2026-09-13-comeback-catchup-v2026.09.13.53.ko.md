# 작업기록 — 복귀 캐치업 성장 v2026.09.13.53

기준일: 2026-09-13
범위: 소비자 성장 기획 전용
배포: 문서-only, Test/Production 배포 불필요
영문 대응본: `docs/worklog/2026-09-13-comeback-catchup-v2026.09.13.53.md`

## 검토 입력
- 작업 시작 최신 `main`: `27b9a9ab02fcdee3abee24527d3dc18e3a482ddc` (v2026.09.13.52 Google Play 삭제/API 문서 작업 포함);
- `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`;
- `RETENTION_RETURN_LADDER_GROWTH_SPEC.md`;
- `D7_CONTINUITY_CONTRACT_GROWTH_SPEC.md`;
- 실제 공개 홈, `/announcements`, `/guide`;
- Supercell, Google Search Central, Discord, EA 최신 공식자료.

## 중간 동기화
문서 쓰기 직전 `main`을 다시 확인했으며 head는 `27b9a9ab02fcdee3abee24527d3dc18e3a482ddc`로 동일했다. 당시 추가 동시변경은 없었다.

## 선택한 공백
부재 뒤 이해 부채를 가장 큰 잔존 리텐션 공백으로 선정했다. 기존 D7 연속성은 활성 사용자에게 유용하지만 1주 이상 놓친 사용자에게는 따라잡기 숙제가 될 수 있다.

## 제품 결정
`COMEBACK_CATCHUP_GROWTH_SPEC` v2026.09.13.53 생성:
- 3~6, 7~13, 14~29, 30일+ 휴면 코호트;
- reassurance/current-state/one-action 복귀 구조;
- 첫 30초/3분/5~15분 복귀 경험;
- 경제 faucet이 아닌 이해 보조 중심 catch-up;
- 홈, 알림, SEO, 공유, 수익화 원칙;
- reactivation KPI 및 실험 backlog;
- abuse/privacy/security/legal guardrail.

## 외부 근거
직접 채택:
- Supercell Clash Royale Welcome Back Log-in Calendar: 장기 부재자에게 연속 로그인 강제 없는 grace/recovery.
- Google Search Central 2026년 2월 Discover core update: clickbait 감소, 독창적·시의성·깊이 있는 콘텐츠 강화.
- Discord 2026년 7월 업데이트 phishing 안내: unsolicited offer/click request가 대표적 사칭 위험.

참고:
- EA NHL 27 Loyalty Rewards 2026년 8월: 복귀 시 과거 참여와 연속성 인정. 경제 보상 구조는 복제하지 않음.
- Discord 2026 teen/age-assurance 업데이트: 연령 민감 개인화에 보수적 privacy default 참고.

## Runtime Reality Audit
비파괴 확인:
- 홈 정상 및 game-only 고지;
- 스폰서 광고 이미 존재;
- 월간 소식 비어 있음;
- `/announcements` 비어 있으면서 광고 존재;
- `/guide`는 여전히 넓고 자산/금융 성장 중심.

로그인, 가치변경, 관리자, 카지노 정산, 파괴적 요청은 수행하지 않았다.

## 추가 문서
- `docs/planning/COMEBACK_CATCHUP_GROWTH_SPEC.md`
- `docs/planning/COMEBACK_CATCHUP_GROWTH_SPEC.ko.md`
- 영/한 changelog
- 영/한 worklog

## 테스트/배포
문서-only. 런타임/API/DB/인프라 수정 없음. 이번 변경 자체에는 Test/Production 배포가 필요하지 않다.

## 잔여 위험/다음 우선순위
`7~29일 부재 → 30~90초 캐치업 → 의미 행동 하나 → 복귀 후 D1 → D7` 루프를 먼저 검증한다. 검증 전에는 comeback bonus, 알림량, 광고 인벤토리, 개인화 타기팅을 확대하지 않는다.