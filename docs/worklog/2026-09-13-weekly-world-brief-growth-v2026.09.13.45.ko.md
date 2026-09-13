# 작업기록 — 주간 월드 브리프 성장 v2026.09.13.45

기준일: 2026-09-13
범위: 소비자 성장 기획만 수행
배포: 문서-only. Test/Production 배포 불필요
영문 기준 작업기록: `docs/worklog/2026-09-13-weekly-world-brief-growth-v2026.09.13.45.md`

## 작업 전 확인

- 이번 회차 문서 커밋 전 시작/중간 `main`: `5b6efd1f0d2f70bda4cb7385c4efd533c7453c0c`.
- `docs/planning/PROJECT_PLAN.md` Living Project Plan.
- `docs/planning/PRODUCT_GROWTH_PLAN.md`.
- `docs/planning/BRAND_CONTENT_GROWTH_ENGINE_SPEC.md`.
- `CONTENT_TO_HABIT_GROWTH_LOOP_SPEC.md` 및 최신 리텐션/정체성/공개 소비자 서사 기획.
- `RETENTION_SAFE_MONETIZATION_GROWTH_SPEC.md`와 기존 광고/개인정보 경계.
- 기존 auth/session/RBAC/ledger/admin/privacy/security 기획을 소비자 guardrail로 확인.
- 실제 공개 홈, `/announcements`, 시작 가이드.
- 2026 최신 공식 검색/discovery/social 자료.

이번 회차에서는 DB 스키마, API 계약, 인증 구현, 보안 아키텍처, migration, scheduler, backend 또는 운영자 API 상세를 확장하지 않았다.

## 선택한 가장 큰 공백

실제 공개서비스가 다시 접근 가능하지만 반복 공개 콘텐츠 면은 아직 비어 있다. 따라서 사용자가 플레이할 생각이 없는 날에도 다시 찾을 수 있는 주간 이유가 현재 가장 큰 acquisition/retention 공백이다.

선택한 좁은 루프:

`주간에 볼 가치가 있는 세계 변화 → 변화 하나 이해 → 맥락형 다음 행동 → 가입/복귀/이어하기 → 의미 행동 → D7 재방문/회고`

## Runtime Product Reality Audit

2026-09-13 확인:
- 공개 홈 접근 가능;
- game-only 고지 존재;
- 홈에 `월간 소식`과 운영 소식 진입점 존재;
- 홈과 `/announcements` 모두 검토된 공개 소식을 준비 중이라고 표시;
- `/announcements` 게시 공지는 현재 없음;
- `/guide`는 큰 기능/경제 시스템 중심이므로, 주간 브리프는 또 다른 전체 설명서가 아니라 가벼운 반복 맥락면으로 정의.

결론: runtime verification 가능. 반복 공개 콘텐츠 복귀 루프는 실제 운영에서 확인되는 공백이다.

## 작성 문서

- `docs/planning/WEEKLY_WORLD_BRIEF_GROWTH_SPEC.md`
- `docs/planning/WEEKLY_WORLD_BRIEF_GROWTH_SPEC.ko.md`
- 영/한 changelog
- 영/한 worklog

## 소비자 기획 변경

- 1~3분 Weekly World Brief 제품 계약.
- 한 문장 요약, 의미 변화 약 3개, 학습 하나, 맥락형 다음 행동 하나, 따라잡기 한 줄.
- 비회원/신규/활성/휴면/장기 사용자 경로.
- 첫 30초·3분·첫 세션과 D1/D3/D7/D14/D30 및 장기 아카이브 연결.
- 방문자 우선 SEO/공개 색인 규칙.
- 보상 우선 초대보다 의미 기반 공유.
- 유용한 가치 이후 수익화, empty content 수익화 금지.
- downstream retention/trust guardrail을 포함한 실험 5개.

## Research note

### 직접 채택

1. Spotify Newsroom — 2026-07-10 — 공식 제품 업데이트.
   - 예측 가능한 주간 discovery와 사용자 제어가 반복 목적지를 만들 수 있음.
   - 채택: 주간 anchor + 맥락 선택. Spotify 규모를 Moneyverse 예측값으로 사용하지 않음.
2. Discord — 2026-08-20 — 공식 제품/보도자료.
   - discovery/social context를 downstream play와 retention에 연결.
   - 채택: view보다 continuation/retention 평가. Discord 수치는 방향성 근거로만 사용.
3. Google Search Central — 2026-06-03, 전세계 적용 2026-08-31 표기 — 공식 Search Console 업데이트.
   - 생성형 AI 노출 전용 리포트 제공.
   - 채택: AI 검색 노출을 추가 acquisition 진단지표로 사용하되 사람에게 유용한 콘텐츠와 activation을 우선.
4. Naver Search Advisor — 2026 현재 공식 가이드.
   - 방문자 우선, 고유 제목/설명, 공개/비공개 색인 분리, 저품질 대량생성/조작 콘텐츠 금지.
   - 채택: 충분한 주간/아카이브 콘텐츠만 발행·색인하고 private surface 제외.

### 참고/정책 guardrail

5. Google Search Central Site Reputation Policy — 2026-08-28.
   - sponsor/creator 콘텐츠가 평판을 빌리는 SEO 인벤토리가 되지 않도록 참고.
6. FTC native advertising/endorsement 원칙.
   - sponsor/material connection 명확 고지 및 위장된 금융게임 추천 금지.

## Funnel/KPI 변경

핵심 퍼널:

`공개 홈/검색/공유 → Weekly Brief → engaged read → 맥락형 다음 행동 → 가입/복귀/이어하기 → 의미 행동 → D1/D7 → D30`

추가/강화 지표:
- Weekly Brief reader 및 engaged-reader rate;
- 7/30일 재방문;
- brief → 맥락형 행동;
- brief → signup/comeback → activation;
- brief-assisted D1/D7/D14/D30;
- content-assisted time-to-first-value;
- branded/direct return share;
- organic/share 유입 activation 및 D7;
- 콘텐츠 축별 D30/LTV;
- retention-adjusted contribution.

보안/신뢰 guardrail에는 fake signup, bot/engagement fraud, referral fraud, ATO signal, spam/report/takedown, privacy complaint, accidental-ad-click, duplicate reward 의심, 금융 오인 불만을 포함한다.

## 실험 backlog

1. Weekly Brief vs 공지-only/empty 복귀면.
2. 맥락형 CTA 하나 vs 일반 다중 링크 CTA.
3. 세계 변화+설명 vs raw change list.
4. public-safe 공유물 vs 일반 referral 초대.
5. 유용한 콘텐츠 뒤 수익화 vs 더 이른 수익화.

CTR/traffic만으로 성공을 판단하지 않고 downstream activation/retention과 trust를 함께 본다.

## 보안·개인정보·악용 발견

### High — 공개/비공개 경계 누출
잔액·포지션·소셜 관계·계정/보안/복구 맥락이 공개/개인화 콘텐츠를 통해 노출될 수 있음.
최소조건: public-safe field만 사용, 개인화 공개 opt-in, 숨김/가림/삭제, URL/card에 secret/session/recovery 정보 금지.
개인화 공개면 구현 전 별도 개발/보안/privacy QA 필요.

### High — 공식 소식 사칭/피싱
주간 소식·시즌·보상 브랜드를 공격자가 모방 가능.
최소조건: 공식 도메인 표시, secret-bearing link 금지, 알림에 민감 잔액/손실정보 금지, 계정 손실 공포형 긴급성 금지.
푸시/이메일/deep-link 전에 별도 개발/보안 QA 필요.

### High — finance-like claim drift
가상기업/경제 콘텐츠가 `지금 매수`, 보장수익, 손실회복 같은 표현으로 변질될 수 있음.
최소조건: 관련 내용 가까이 game-only 고지, 편집 검토, 실제 수익보장/투자권유 금지.
현금환전이나 실제 금융상품 성격으로 바뀌면 별도 legal/product review 필수.

Medium guardrail: view/share/raw signup에 의미 있는 WLD/WDX 보상 금지, opt-in moderated UGC, 제3자 analytics/ad에 private economy/security 데이터 전송 금지.

## 법규·수익·SEO 영향

- WLD/WDX는 계속 virtual/simulated/game-only.
- sponsored/native 콘텐츠는 명확한 고지 필요.
- 맞춤광고, 미성년자 타기팅, 신규 tracker, 경제적 referral, 대규모 UGC는 별도 privacy/legal/trust review.
- SEO는 충분한 실제 콘텐츠/아카이브에만 확대하고 얇은 자동생성 페이지는 만들지 않음.
- 수익은 최대 광고 inventory가 아니라 retention-adjusted contribution으로 판단.

## 중간 main 재확인 및 동시작업

첫 문서 쓰기 직전 `main`을 다시 확인했으며 `5b6efd1f0d2f70bda4cb7385c4efd533c7453c0c`로 동일했다. 그 시점에 외부 동시 변경은 확인되지 않았다.

다음 순서형 버전 `v2026.09.13.45`가 미사용임을 확인한 뒤 문서 반영을 시작했다.

## 다음 우선순위

콘텐츠 종류를 더 넓히지 않는다. 다음 성장 작업은 첫 실전 회차를 가정한 다음 루프를 더 좁히는 것이 우선이다.

`세계 변화 하나 → 설명 하나 → 의미있는 이어가기 하나 → D7 재방문`

activation, D7/D30, 신뢰, retention-adjusted contribution을 실제로 개선하는 콘텐츠 축만 이후 확대한다.