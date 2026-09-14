# v2026.09.14.83 — 보이는 숙련도·자기효능감 리텐션 성장

날짜: 2026-09-14  
변경 유형: 문서-only  
런타임/코드 변경: 없음

## 추가
- `VISIBLE_MASTERY_SELF_EFFICACY_RETENTION_GROWTH_SPEC.md`와 한국어 대응본을 추가했습니다.
- 활동을 수행하는 것과 `내가 실제로 무언가를 더 잘하게 되고 있다`고 느끼는 것 사이의 리텐션 공백을 선택했습니다.
- 선호 루프를 `의미 행동 → 보이는 성장 증거 → 사용자 선택 mastery thread → 다음 달성 가능한 단계 → D1 → D3 적용 → D7 before/after → D14 자발적 심화 → D30 durable mastery record`로 정의했습니다.
- mastery를 raw WLD wealth, 체류시간, 기능 수, 거래횟수, 대출, 카지노 이용량과 분리했습니다.
- completion, understanding, consistency, curation, contribution, reflection의 mastery evidence 범주를 정의했습니다.
- 1~3분, 5~15분, 30분+ 세션이 mastery continuity에서 맡는 역할을 정의했습니다.
- 교육적·맥락형 mastery artifact의 acquisition/share/SEO 원칙을 추가하고 개인 진행·경제·보안 상태는 검색대상에서 제외했습니다.
- `행동 → 결과 → 무엇이 좋아졌는지 이해 → 다음 선택` 구간을 interruptive monetization으로부터 보호했습니다.
- visible improvement vs reward-only, authored mastery vs global score, reflection recap, contextual share artifact, monetization timing 실험을 추가했습니다.
- 피싱/ATO, 민감상태 노출, mastery farming, finance/casino manipulation, analytics 과수집 guardrail을 추가했습니다.

## 검토 자료
직접 채택:
- Supercell 2026-05-13 `New Collection Levels & Mastery Changes` — 명확한 progression, 개인 목표 정렬, 다음 목표까지 거리.
- Supercell 2026년 6월 progression update/support — clearer Collection Level progression 실제 출시 교차검증.
- Google Search Central 현행 people-first 및 2026 Discover guidance — 독창적·유용하고 대량 얇은 페이지가 아닌 공개 mastery/학습 콘텐츠.
- 개인정보보호위원회 2026-07-27 TikTok·Apple 제재 — 행동 데이터는 제한 없는 광고 부산물이 아님.

참고:
- Supercell 현행 Card Mastery support — task-specific progress/badge 설명 패턴.
- FTC dark-pattern 선례 — misleading progression certainty와 purchase pressure 경계 참고.

## Runtime 현실
- 공개 홈, 가이드, 운영소식에 접근 가능했습니다.
- 홈은 WLD/보상을 game-only 가상 데이터라고 명확히 고지하지만 quick link는 지갑/미니게임/거래소/상점/퀘스트를 강하게 노출하고 sponsored placement도 존재합니다.
- 가이드는 profession EXP/mastery를 언급하지만 dominant roadmap은 `seed WLD → 저축 → 주식/사업 → 대표 자본가`의 자산구간 중심입니다.
- 첫날 checklist는 여전히 남은 WLD를 복리예금에 넣는 것으로 끝납니다.
- 공개 운영소식은 quiet state이지만 sponsored inventory가 존재합니다.
- visible mastery/self-efficacy는 아직 미검증 성장 가설로 기록합니다.

## 보안·법적 메모
- 보안코드·아키텍처 변경 없음.
- 기존 OAuth/session/RBAC/admin/ledger/market-integrity/probability/privacy 경계가 우선합니다.
- external mastery deep link, personalized public mastery, economy-linked mastery reward, finance-adjacent mastery campaign은 별도 security/privacy/fraud/legal QA가 필요합니다.

## Git/반영 메모
- 작업 시작·중간 동기화 기준 `main`은 `dbcdf56bf3f2d75806016d35c2bfb55d021e8600`였습니다.
- 최종 최신 main 재확인 뒤 non-force fast-forward로만 직접 반영합니다.