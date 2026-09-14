# 변경 기록 — 신뢰 증거·신뢰도 전환 성장 v2026.09.14.88

## 추가
- `docs/planning/TRUST_PROOF_CREDIBILITY_CONVERSION_GROWTH_SPEC.md`.
- 한국어 대응본.

## 소비자 기획
- 최신 브랜드 약속 뒤에 공개 신뢰 증거가 충분히 연결되지 않은 점을 현재 가장 큰 공백으로 정의했다.
- `적합한 발견 → 명확한 약속 → 신뢰 가능한 증거 스택 → public-safe 샘플 → authored interest → contextual signup → 의미 행동 → D1 일관성 → D7 획득된 신뢰 → D30 지속 관계` 루프를 추가했다.
- 카테고리 명확성, 운영 연속성, 개인정보/안전 명확성, 콘텐츠 provenance, 진짜 social proof로 구성된 공개 신뢰 증거 스택을 추가했다.
- 첫 30초 `약속 + 믿을 이유 하나`, 첫 3분 proof-before-credential 원칙을 추가했다.
- 가짜 긴급성·가짜 활동·금융안전처럼 들리는 신뢰표현 없이 D1/D3/D7/D14/D30 신뢰 기준을 추가했다.
- SEO·creator·viral·monetization의 신뢰 규칙을 추가했다.

## KPI 변경
- game-only 이해, scam/실제금융 오인, 개인정보 경계 이해, public-proof interaction, proof→interest/signup/activation, time-to-first-trusted-value, D1 일관성, proof 노출별 D7, D30 지속 관계 지표를 추가했다.
- fake/incentivized review incident와 `진짜 서비스인가/사기인가` 유형 support 혼동을 guardrail로 추가했다.

## 실험 backlog
- promise only vs promise + 검증 가능한 proof.
- 일반 가이드 vs provenance-aware 금융유사 가이드.
- 정직한 quiet state vs 실제 검증 가능한 social proof; fake proof는 실험군이 아니라 금지.
- 짧은 privacy/safety proof vs policy link only.
- 제품/신뢰 이해 전 sponsor prominence vs 이해 후 sponsor.

## 신뢰·안전·개인정보
- HIGH: 가짜 trust/security 알림을 이용한 phishing·ATO.
- HIGH: 조작된 review/social proof/creator credibility.
- HIGH: 과도한 transparency로 인한 민감 운영·보안정보 노출.
- HIGH: `safe`, `verified`, `audited`, `stable`, `guaranteed`를 금융안전처럼 오인시키는 표현.
- MEDIUM: trust analytics 과수집.
- 기존 OAuth/session/RBAC/admin/ledger/privacy/market-integrity/community 경계는 유지하며 보안 코드는 수정하지 않았다.

## 조사
- Google Search Central people-first guidance: E-E-A-T에서 trust를 가장 중요하게 보고 필요한 경우 Who/How/Why를 명확히 함.
- Discord Transparency Hub와 2026 Teen Default Experience의 transparency 변경.
- Roblox 2026-01-07 age-check 커뮤니케이션: safety benefit 설명과 layered protection.
- FTC 2025-12 Consumer Review Rule 경고: fake/incentivized/undisclosed review 및 influence indicator가 현재도 집행관심.
- Naver Search Advisor 2026 현재 공신력/유용한 정보 및 anti-spam 지침.
- FTC 2026 subscription enforcement와 개인정보보호위원회 2026-07-22 youth privacy 논의를 guardrail로 유지.

## Runtime
- 공개 웹 검증 가능.
- 강점: 반복되는 game-only 고지, 구체적인 개인정보처리방침, 미검증 상태를 정직하게 표시하는 status 문구.
- 공백: status에 확인된 기록이 없고, 운영소식은 비어 있지만 광고가 보이며, 시작가이드는 복리·배당·시세차익·패시브소득·자본가 progression을 강하게 전면화한다.
- finance-like 공개 교육/제품 콘텐츠의 일관된 provenance pattern은 아직 미검증이다.

## 범위
문서 전용. 런타임·DB·API·인증·migration·scheduler·인프라·보안 코드 변경 없음.
