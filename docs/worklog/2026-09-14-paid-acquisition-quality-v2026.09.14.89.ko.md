# 작업 기록 — 유료 획득 품질·리텐션 경제성 성장 v2026.09.14.89

기준일: 2026-09-14
변경 유형: 문서-only 소비자 성장 기획

## 검토 입력
- 작업 시작 `main`: `aea77def54ac4b839bb0299781253e9824ac8982`.
- 조사 중간 및 write 직전 `main`: 동일한 `aea77def54ac4b839bb0299781253e9824ac8982`.
- `docs/planning/PROJECT_PLAN.md` Living Project Plan.
- `docs/planning/PRODUCT_GROWTH_PLAN.md`.
- recurring content acquisition과 중복을 피하기 위해 `BRAND_CONTENT_GROWTH_ENGINE_SPEC.md` 검토.
- value-before-monetization gate 보존을 위해 `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md` 검토.
- v87 브랜드 positioning, v88 trust-proof 최신 기획 검토.
- creator/community acquisition, retention-to-viral, artifact-recipient, season/archive, monetization 관련 저장소 검색.
- 현재 공개 Production 홈페이지 `https://easy-scraping.com/` 검증.

## 공백 선택 근거
저장소에는 이미 다음의 전용 소비자 명세가 있다.
- recurring public content 및 SEO;
- creator/community qualified acquisition;
- artifact-to-recipient viral flow;
- first-session/first-week activation;
- D1~D30 return/comeback;
- social bond/belonging;
- monetization eligibility;
- brand promise와 credibility proof.

상대적으로 덜 구체화된 것은 paid-media 품질과 경제성이었다. 기존 문서에는 CAC를 activation/D7/D30/LTV에 연결해야 한다는 원칙은 있지만, paid creative→landing→activation 전용 계약, retained-CAC scale gate, incrementality model, 민감정보 광고 경계, paid cohort 실험 세트가 하나의 canonical로 정리돼 있지 않았다.

## Runtime 확인
공개 홈페이지 검증 가능.

확인사항:
- WLD/보상은 game-only virtual data라고 반복 고지함.
- 첫 viewport에 지갑과 미니게임이 먼저 보임.
- broad quick-link grid가 지갑, 게임, 거래소, 상점, 퀘스트, 로비를 동시에 노출함.
- deeper product explanation 전/중간에 sponsored placement가 있음.
- 핵심 brand statement와 `활동은 기록으로 남음` 메시지는 초기 utility/shortcut 영역 아래에 있음.
- 가입 전 guide/shop/news/community context가 존재함.
- 운영소식은 현재 quiet state.

기획 시사점: 한 가지 좁은 가치를 약속한 cold paid creative를 generic homepage에 자동으로 보내지 않는다. Media spend 확대 전에 message/intent continuity를 첫 실험으로 둔다.

## 외부 조사
조사일: 2026-09-14.

직접 채택:
1. Google Ads AI Max / DSA migration (2026-04-15, 2026-06-11 업데이트): matching/text/final URL 자동화 확대 → Moneyverse campaign control 및 downstream quality gate 강화.
2. Google AI Max steering features (2026-04-30): explicit brand/messaging steering과 reviewed claim family 필요성.
3. TikTok Attribution Portfolio (2026-05-13): multi-touch measurement, last-click 단독 판단 금지.
4. Meta 2026 AI performance update: incrementality-aware measurement와 automated creative/ranking 주의. Meta 내부 lift는 Moneyverse 예상치로 사용하지 않음.
5. Google Ad Traffic Quality invalid-activity guidance: raw click이 아니라 fraud-adjusted acquisition metric 사용.

Guardrail/reference:
6. Meta scam advertiser 법적 조치 (2026-02-26): celeb-bait, cloaking, impersonation, subscription fraud 위험.
7. Meta anti-scam/advertiser verification 확대 (2026-03): advertiser identity를 trust boundary로 봄.
8. 개인정보보호위원회 TikTok·Apple 제재 (2026-07-27): proper legal basis 없는 타사 행태정보 이용은 현재 privacy 집행 관심사항.
9. KISA 불법스팸 안내서 제7차 개정 (2026-03-04): marketing consent 명확성, push-ad 거부 friction 제한을 retargeting/comeback guardrail로 유지.

## 기획 결정
- v2026.09.14.89 `Paid Acquisition Quality & Retained-Economics Growth` 선택.
- fraud-adjusted D30 retained user와 contribution margin을 paid acquisition scale 기준으로 정의.
- 4개 safe creative promise family 추가, finance/profit/casino형 cold acquisition claim 제외.
- signup pressure 전에 source-matched landing continuity 정의.
- paid cohort D1/D3/D7/D14/D30 기준 추가.
- CAC_activation, CAC_D7, CAC_D30, retained contribution, payback gate 추가.
- platform attribution + first-party cohort + incrementality 측정 layer 추가.
- 별도 review 없이는 WLD/WDX/debt/casino/portfolio/social/security private state를 광고 optimization payload로 사용하지 않도록 명시.
- paid retargeting, SEO, referral, monetization interaction 규칙 추가.

## 추가 실험 backlog
1. Source-matched landing vs generic homepage.
2. Signup optimization vs meaningful-activation optimization.
3. Broad discovery vs qualified intent controls.
4. Platform attribution only vs incrementality-informed budget review.
5. Immediate retargeting vs value-triggered retargeting.

각 실험의 target cohort, primary metric, guardrail, 관찰기간, 성공/실패 후 행동은 canonical에 기록했다. Serious quality read는 최소 D7 mature cohort, permanent scale 결정은 D30을 우선한다.

## 보안·개인정보·악용 검토
기록:
- HIGH paid-ad impersonation/phishing/ATO;
- HIGH automated creative의 real-finance/gambling claim drift;
- HIGH invalid traffic/bot/fake-signup/referral arbitrage;
- HIGH private economy/social/security data의 ad/analytics vendor 유출;
- MEDIUM landing mismatch/cloaking/affiliate deception.

보안 구현은 수정하지 않았다. 기존 OAuth/session/RBAC/admin/ledger/market-integrity/privacy/community 경계는 그대로 유지한다.

## 추가 파일
- `docs/planning/PAID_ACQUISITION_QUALITY_RETAINED_ECONOMICS_GROWTH_SPEC.md`
- `docs/planning/PAID_ACQUISITION_QUALITY_RETAINED_ECONOMICS_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-14-paid-acquisition-quality-v2026.09.14.89.md`
- `docs/changelog/2026-09-14-paid-acquisition-quality-v2026.09.14.89.ko.md`
- `docs/worklog/2026-09-14-paid-acquisition-quality-v2026.09.14.89.md`
- `docs/worklog/2026-09-14-paid-acquisition-quality-v2026.09.14.89.ko.md`

## 검증 / 반영 정책
- 문서-only라 이번 commit에 Test/Production 배포는 필요 없음.
- 영문 canonical과 한국어 대응본을 같은 commit에 반영.
- 영/한 changelog와 worklog를 같은 commit에 반영.
- 현재 사용자 지시에 따라 latest checked `main`을 parent로 직접 반영하고 별도 문서 PR을 만들지 않음.
- `main` 갱신은 force 없이 fast-forward만 허용.

## 다음 성장 질문
다음 우선순위는 한 가지 paid promise family를 `creative → source-matched public value → authored interest → meaningful activation → D1 → D7 → D30`까지 실제 cohort로 검증하는 것이다. Broad media scale이나 richer ad-platform tracking은 그 이후에 판단한다.