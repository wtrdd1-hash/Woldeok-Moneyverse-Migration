# Product Planning Worklog — v2026.09.12.27

Date: 2026-09-12
Branch: `docs/monetization-compliance-seo-v2026.09.12.27`

## Objective

Integrate the user's accumulated requirements for profitability, advertising, Korea/US legal-risk reduction, privacy, visible UX quality and Google/search acquisition into the Moneyverse Living product specification.

## GitHub baseline reviewed before work

- latest `main` SHA: `8acaedaa6287798b97cd7d3f847a72e3d86527a8`;
- `docs/planning/PROJECT_PLAN.md`;
- `docs/planning/PRODUCT_GROWTH_PLAN.md`;
- current planning index and previously integrated v2026.09.12.26 jobs/profession work;
- existing project rule that WLD/WDX remain service-internal virtual/game systems;
- existing Living Plan ad/legal gate and SEO baseline.

## Gap found

The Living Plan already contained a conservative ad gate and basic SEO requirements, but the repository did not yet have one canonical implementation-oriented specification that connected:

- revenue model selection;
- ad placement rules;
- subscription UX;
- Korea and US compliance review gates;
- privacy data architecture;
- third-party advertising/analytics SDK governance;
- Search Console operations;
- bilingual SEO IA;
- 2026 Google Search changes;
- profitability metrics and guardrails.

## External research reviewed

Current official/reference material included:

1. Google Search Central latest documentation updates through 2026-09-08.
2. Google Search Essentials and current Core Web Vitals guidance.
3. Google's 2026 generative-AI Search guidance stressing valuable, unique/non-commodity content and conventional SEO fundamentals.
4. FTC advertising/marketing basics, endorsements/reviews guidance and native-ad transparency guidance.
5. FTC COPPA compliance guidance reflecting the April 2025 rule amendment.
6. FTC 2026 negative-option/subscription materials and recent subscription enforcement guidance.
7. California Attorney General and California Privacy Protection Agency CCPA resources, including 2026-effective regulations/risk-assessment obligations.
8. Korea PIPC behavioral-advertising materials and 2026 pseudonymized-data guidance.
9. Korea Fair Trade Commission revised recommendation/endorsement disclosure guidance.

## Decisions

- Initial advertising baseline should be contextual/non-personalized until personalized-ad privacy/legal review is complete.
- Advertising is restricted away from sensitive financial-like interaction surfaces.
- Sponsored/native content must be visibly labeled next to the content.
- Subscription design adopts clear price/renewal terms, affirmative consent and simple cancellation as a product invariant.
- WLD/WDX wording must consistently state virtual/simulated/game-only status.
- Search acquisition becomes a formal product subsystem with EN/KO IA, indexability contracts, Search Console operations and Core Web Vitals guardrails.
- No SEO strategy may depend on removed/obsolete Google features such as FAQ rich results.
- `llms.txt` is not treated as a Google ranking requirement.
- Revenue optimization must be evaluated against retention, trust, support burden and performance, not CTR alone.

## Mid-work concurrency check

`main` was re-fetched mid-work and remained at `8acaedaa6287798b97cd7d3f847a72e3d86527a8`; no concurrent main change required rebasing this documentation pass.

## Files added/updated

- `docs/planning/MONETIZATION_COMPLIANCE_SEO_SPEC.md`
- `docs/planning/MONETIZATION_COMPLIANCE_SEO_SPEC.ko.md`
- `docs/changelog/2026-09-12-monetization-compliance-seo-v2026.09.12.27.md`
- `docs/changelog/2026-09-12-monetization-compliance-seo-v2026.09.12.27.ko.md`
- this worklog and Korean counterpart
- `docs/INDEX.md`

## Runtime verification

Production and test public endpoints were not treated as verified during this planning pass; direct runtime verification was unavailable from the current web retrieval path. No claims about current production UI/runtime health are made here.

## Deployment

Documentation-only. No test-server deployment is required.

Any implementation based on this document must use a separate runtime branch and the existing staging-first release process.

## Next priorities

1. exact ad-slot wireframes and responsive layouts;
2. privacy preference center UX and consent-state machine;
3. public SEO route/template inventory against the actual current Next.js app;
4. Search Console operational runbook and automated sitemap/canonical regression checks;
5. monetization scenario model for ad-only vs ad-free subscription vs mixed model;
6. launch legal-review matrix by feature/jurisdiction;
7. once the service is reachable, run the first `Runtime Product Reality Audit` against real screens and API behavior.