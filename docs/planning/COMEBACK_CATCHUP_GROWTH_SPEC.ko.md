# Woldeok Moneyverse — 복귀 캐치업 성장 명세

> 버전: v2026.09.13.53
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-13
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `RETENTION_RETURN_LADDER_GROWTH_SPEC.md`, `D7_CONTINUITY_CONTRACT_GROWTH_SPEC.md`, `WEEKLY_WORLD_BRIEF_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_GROWTH_SPEC.md`
> 영문 기준본: [COMEBACK_CATCHUP_GROWTH_SPEC.md](COMEBACK_CATCHUP_GROWTH_SPEC.md)

## 1. 이번에 선택한 공백

가장 큰 잔존 리텐션 공백은 **부재 후 이해 부채(comprehension debt)**다.

Moneyverse에는 D1→D7 연속성과 주간 콘텐츠 기획이 있지만, 한두 회를 놓친 사용자가 공지·시장·직업·시즌·커뮤니티 변경을 전부 따라잡아야 한다면 그 연속성이 오히려 복귀 장벽이 된다.

2026-09-13 공개 서비스 확인 결과:
- 홈은 정상 접근되고 WLD가 게임 전용 가상 데이터임을 명시한다.
- 홈에는 이미 여러 스폰서 광고 영역이 있다.
- 월간 소식은 아직 공개 운영 소식을 준비 중이라고 표시된다.
- `/announcements`는 접근 가능하지만 실제 공지가 없고 광고 영역은 존재한다.
- `/guide`는 예금·국채·대출·주식·사업 배당·카지노까지 넓은 경제 체계를 먼저 설명한다.

따라서 다음 우선순위는 콘텐츠 추가가 아니라 **부재 기간을 현재 상태 하나와 다음 행동 하나로 압축하는 캐치업 경험**이다.

핵심 루프:

`부재 → 압박 없는 복귀 → 바뀐 것/그대로인 것 이해 → 관련 캐치업 하나 선택 → 의미 행동 하나 → 연속성 복원 → 다음 복귀 이유`

## 2. 복귀 약속

**“전부 따라잡을 필요는 없습니다. 당신의 기록은 남아 있고, 지금 중요한 것만 몇 분 안에 이해할 수 있습니다.”**

복귀 화면은 다음 순서로 답한다.
1. 무엇이 그대로 남아 있는가.
2. 무엇이 실질적으로 바뀌었는가.
3. 무엇은 무시해도 되는가.
4. 지금 1~5분 안에 할 수 있는 유용한 행동은 무엇인가.

놓친 보상, 끊긴 streak, 순위 하락, 만료 상품, 죄책감 문구를 먼저 보여주지 않는다.

## 3. 부재 기간별 캐치업

### 3~6일
마지막 의미 스레드, 변화 하나, 3분 이내 이어하기 하나만 보여준다. 큰 경제 보상은 주지 않는다.

### 7~13일
놓친 D7 회복 구간이다. 이전 open question이 있었다면 2~3문장으로 답을 요약하고, 상세보기는 선택사항으로 둔다. Weekly Brief 전체를 읽어야 정상 기능을 쓸 수 있게 만들지 않는다.

### 14~29일
`내 진행은 그대로 → 지금 중요한 변화 3개 이하 → 예전에 관심 있던 것과 연결된 변화 하나 → 5분 이내 행동 하나` 순서로 압축한다. 모든 공지를 시간순으로 나열하지 않는다.

### 30일 이상
과거 기록은 존중하되 낡은 체크리스트를 강제하지 않는다. `기존 스레드 이어가기`와 `새로 시작하기`를 둘 다 허용한다. 장기 부재 때문에 정상 참여 능력이 영구적으로 낮아져서는 안 된다.

## 4. 첫 복귀 세션

첫 30초에는 중요한 것이 몰수되지 않았고, 무엇이 바뀌었으며, 다음 행동이 무엇인지 보여준다. 첫 3분에는 짧은 브리핑을 읽고 이전 관심사를 이어가거나 새 관심사를 고른 뒤 행동 하나를 시작/완료할 수 있어야 한다. 5~15분 심화는 그 이후에 제공한다.

## 5. 캐치업은 경제 보상이 아니라 이해 보조

우선 제공할 것은 요약, 다음 행동, 늦은 시즌 진입경로, 컬렉션/직업 맥락 복구, 리플레이/설명 콘텐츠다.

피할 것:
- 부재만으로 큰 WLD 지급;
- 복귀자에게 유리한 주식·대출·카지노 조건;
- 의도적 휴면이 최적 전략이 되는 보상;
- 다계정 comeback farming이 쉬운 구조.

실제 경제 보상은 별도 fraud/economy 검토가 필요하다.

## 6. 복귀 홈 우선순위

1. 죄책감 없는 환영
2. `그대로 남아 있는 것` 하나
3. 중요한 변화 최대 3개
4. `지금 이어하기` 주 CTA 하나
5. 선택적 탐색

기능 그리드, 자산 순위, 만료 보상 목록, 카지노 홍보, 대출 권유, 광고 과밀 화면으로 시작하지 않는다.

## 7. 알림/복귀 메시지

권장: `팔로우한 주제에 짧은 업데이트가 있어요`, `없는 동안 바뀐 것만 정리했어요`, `컬렉션/진행은 그대로 남아 있어요`.

금지: 잔액 위험, 지금 안 받으면 손실, 계정 보안 위기처럼 보이는 마케팅, 잔액·보유·부채·대출·비공개 관계의 알림 노출.

이메일·푸시·외부 deep link는 phishing/ATO·privacy·notification QA가 별도로 필요하다.

## 8. SEO/공개 콘텐츠

색인 후보는 독립적으로 유용한 시즌/세계 캐치업 가이드, 가상기업 역사, 실질적인 what-changed 설명, public-safe 이벤트 아카이브다.

개인화 복귀 브리핑, 사용자 진행, 자산·대출·카지노 기록, 보안/복구 상태, referral/reward claim, 얇은 개인별/날짜별 캐치업 페이지는 색인하지 않는다.

퍼널은 `검색/공유 → 현재상태 이해 → 맥락형 가입/복귀 → 의미 행동 → D7/D30 → retention-adjusted contribution`이다.

## 9. 소셜/바이럴

공유 가능한 것은 `이번 달 바뀐 것`, 시즌 캐치업, 공개 가상기업/세계 타임라인, 컬렉션/lore 정리다. 사용자의 부재 일수, 잔액/부채, 개인 comeback reward URL, 비공개 소셜 활동은 공유하지 않는다.

## 10. 수익화

복귀는 신뢰가 약한 순간이다. `무엇이 바뀌었는지`와 주 행동을 먼저 보여준 뒤 수익화를 배치한다. 기본 복귀 CTA로 대출·주식성과·카지노를 밀지 않는다. 광고제거 구독은 반복가치가 다시 형성된 뒤 제안한다.

## 11. KPI

퍼널: `휴면 → 복귀 방문 → 브리핑 이해 → 관련 행동 하나 → 의미 행동 → 복귀 후 D1 → D7 → D30 재리텐션`.

핵심 지표: briefing completion, time-to-reorientation, comeback→meaningful action, 1~5분 catch-up completion, resumed-thread/fresh-thread rate, 복귀 후 D1/D3/D7/D14/D30, sessions/user, meaningful actions/session, reactivated LTV, retention-adjusted contribution.

가드레일: comeback bonus abuse, multi-account/fake-return signal, reward duplication, phishing/ATO report, notification opt-out, privacy complaint, finance-like claim complaint, accidental ad click, guilt/FOMO/pressure feedback.

## 12. 실험 backlog

A. 시간순 전체 목록 vs `지금 중요한 것 3개 + 행동 하나` — 14~29일 휴면, primary는 meaningful action/time-to-reorientation, D7 성숙까지 관찰.

B. `진행은 그대로` reassurance-first vs 놓친 보상 강조 — 7일 이상 휴면, primary는 meaningful action/D7-after-return, pressure/opt-out 가드레일.

C. 30일+ 사용자에게 `이어하기 또는 새로 시작` vs 기존 체크리스트 강제 — first-session completion/D7 비교.

D. contextual catch-up vs 큰 WLD comeback reward — D7/D30 재리텐션을 보되 reward abuse/multi-account/economy inflation을 가드레일로 둔다.

E. 답/행동 이후 광고 vs 조기 광고 — retention-adjusted contribution을 primary로 둔다.

## 13. 보안·악용·개인정보

### High — comeback phishing/ATO
사칭 welcome-back·보상만료·계정변경 메시지로 credential 탈취 가능. 공식 도메인 신호, 잔액손실 긴급성 금지, URL에 secret/session/recovery 정보 금지. 이메일·푸시·개인화 외부링크 전 별도 QA 필요.

### High — 개인화 복귀 브리핑 유출
보유·부채·관계·활동·보안상태 노출 가능. 기본 비공개, public-safe allowlist, 민감값 URL/analytics 금지. 공개/공유 개인화면 전 별도 QA 필요.

### High — comeback reward farming
휴면 반복·다계정으로 보상을 채굴할 수 있음. 부재 자체에 의미 있는 보상 금지, bounded eligibility, retention 기준, duplicate/replay 방어가 최소조건.

### High — finance-like reactivation targeting
대출, safe yield, 손실복구, 보장 passive income, 카지노 승리를 복귀 메시지로 밀지 않는다. game-only 맥락과 중립 설명을 유지한다.

### Medium — 미성년자/행동 타기팅 과도화
휴면 패턴으로 민감특성을 추론하지 않는다. 맞춤광고·연령기반 복귀전략은 별도 privacy/legal review 대상으로 둔다.

## 14. 최신 외부 근거

직접 채택:
- Supercell Clash Royale Welcome Back Log-in Calendar: 30일+ 복귀자 대상 7개 보상을 연속 로그인 없이, 보상 수의 2배 기간 안에 받을 수 있게 한다. Moneyverse는 `연속 출석 강제 없는 grace/recovery`만 참고하고 보상 중심 구조는 그대로 채택하지 않는다.
- Google Search Central 2026-02-05 Discover core update: clickbait/선정성을 줄이고 깊이·독창성·시의성 있는 콘텐츠를 강화한다. 공개 캐치업의 편집 원칙으로 채택.
- Discord phishing guidance 2026-07-23 업데이트: 제안/링크 클릭을 유도하는 사칭 메시지가 대표적인 피싱 패턴임을 재확인. 복귀 메시지의 공식 도메인·비긴급성 원칙에 반영.

참고:
- EA NHL 27 Loyalty Rewards 2026-08-11: 과거 참여를 복귀 시 인정하는 사례. Moneyverse는 연속성 인정만 참고하고 참여량 비례 경제보상은 악용/P2W 위험 때문에 채택하지 않는다.
- Discord 2026 teen-by-default/age assurance: 연령 민감 개인화에서 불필요한 신원수집을 줄이고 보수적 기본 보호를 유지하는 방향을 참고한다.

## 15. Runtime verification

2026-09-13 공개 서비스 비파괴 확인 가능. 홈 정상, game-only 고지와 여러 광고 확인, 월간 소식 비어 있음, `/announcements` 비어 있으면서 광고 존재, `/guide`는 광범위한 금융/자산 성장 서사를 우선한다. 인증·가치변경·관리자·카지노 정산·파괴적 행동은 수행하지 않았다.

## 16. 다음 우선순위

`7~29일 부재 → 30~90초 캐치업 → 의미 행동 하나 → 복귀 후 D1 → D7`을 실제 핵심 루프로 검증한다. 이 루프가 fraud/privacy/finance-like pressure 없이 재리텐션을 개선하기 전에는 comeback bonus, 알림량, 광고 인벤토리, 개인화 타기팅을 확대하지 않는다.