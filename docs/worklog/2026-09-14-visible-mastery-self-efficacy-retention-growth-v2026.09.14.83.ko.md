# 제품 기획 작업 기록 — v2026.09.14.83

## 범위
소비자 성장 기획만 수행했습니다. 런타임/코드/DB/API/인증/인프라/보안코드 변경은 없습니다.

## 검토 입력
- 작업 시작·중간 최신 `main`: `dbcdf56bf3f2d75806016d35c2bfb55d021e8600`;
- `PROJECT_PLAN.md`;
- `PRODUCT_GROWTH_PLAN.md`;
- 최근 signup, first-session, priority-home, cross-surface, long-term aspiration, monetization, progressive-complexity 성장 명세;
- 최신 모바일 business catalog compatibility 런타임 merge;
- Production 공개 홈, 시작 가이드, 운영소식;
- 최신 외부 제품/검색/개인정보 레퍼런스.

## 공백 선택
최근 기획은 acquisition context, pre-signup value, signup recovery, first-session closure, progressive first-week complexity, return ladder, social belonging, long-term aspiration, retention-safe monetization까지 이미 다룹니다.

중복이 가장 적은 남은 공백은 `보이는 competence`입니다. 사용자는 직업 작업을 끝내고 WLD/EXP를 얻을 수 있지만 자신이 무엇을 더 잘하게 되었는지는 명확히 이해하지 못할 수 있습니다. 현재 공개 가이드는 skill/learning/curation/contribution보다 자산 축적을 훨씬 선명한 progression으로 보여줍니다.

## 결정
새 구현용 progression system 대신 visible mastery/self-efficacy 소비자 계약을 추가합니다.

선호 루프:
`의미 행동 → 보이는 성장 증거 → authored mastery thread → 다음 달성 가능한 단계 → D1 recognition → D3 application → D7 before/after → D14 voluntary depth → D30 durable mastery record`.

Mastery를 WLD balance, feature breadth, time spent, trading volume, loan use, casino volume으로 환원하지 않습니다.

## 조사
직접 채택:
- Supercell 2026-05-13 progression/mastery redesign: progression은 단순·명확하고 개인 목표와 연결되어야 함.
- Supercell 2026년 6월 release/support: clearer Collection Level progress가 실제 출시되어 각 upgrade/unlock이 보이게 의미를 가짐.
- Google Search Central people-first/Discover guidance: 공개 learning/mastery 페이지는 독립적 유용성과 독창성을 가져야 하며 얇은 조합형 대량페이지를 피함.
- 개인정보보호위원회 2026-07-27 TikTok·Apple 제재: 행동 데이터 활용은 적법한 개인정보 처리 근거가 필요하며 제한 없는 광고 데이터로 취급하지 않음.

참고:
- Supercell Card Mastery support의 task-specific progress communication.
- FTC dark-pattern 선례는 직접 적용 법률 판단이 아니라 디자인 위험 참고로 사용.

## Runtime Reality Audit
공개 홈, 가이드, 운영소식 접근 가능.

확인된 불일치:
- game-only 고지는 명확함;
- 홈 quick link는 지갑/미니게임/거래소/상점/퀘스트를 전면화;
- 가이드는 profession EXP/mastery를 포함하지만 progression 서사는 WLD 구간, 저축, 주식/사업, `대표 자본가` 중심;
- 첫날 checklist는 복리예금 행동으로 종료;
- announcements는 quiet state인데 sponsored inventory는 존재.

따라서 visible mastery를 현재 이미 구현된 runtime behavior로 간주하지 않습니다.

## 보안·개인정보·악용 발견
- HIGH: fake mastery/reward/level-preservation claim을 이용한 phishing/ATO.
- HIGH: 공개 card에서 경제·부채·casino·private social·security state 노출.
- HIGH: progression event에 경제보상을 붙일 경우 bot/multi-account mastery farming.
- HIGH: finance/casino profit/recovery를 competence로 포장하여 chasing/collusion/manipulation 유발.
- MEDIUM: mastery/interest analytics가 제한 없는 광고 profile로 전환.

최소 보호조건은 canonical에 기록했습니다. external deep link, public personalized mastery, economy-linked mastery reward, finance-adjacent campaign은 별도 QA가 필요합니다.

## 실험 backlog
1. visible improvement vs reward-only result;
2. user-chosen mastery thread vs global score;
3. reflection recap vs generic weekly recap;
4. contextual public artifact vs raw achievement share;
5. mastery comprehension 이후 vs 이전 monetization.

## 예정 파일
- `docs/planning/VISIBLE_MASTERY_SELF_EFFICACY_RETENTION_GROWTH_SPEC.md`
- `docs/planning/VISIBLE_MASTERY_SELF_EFFICACY_RETENTION_GROWTH_SPEC.ko.md`
- 영문/한국어 changelog;
- 영문/한국어 worklog.

## Git 정책
커밋 직전 최신 main을 다시 확인합니다. main이 이동했으면 새 tree 위에서 다시 구성합니다. `main`은 non-force fast-forward로만 갱신하며 별도 문서 PR은 만들지 않습니다.