# Woldeok Moneyverse — Advertising-Only Revenue Specification

> Version: v2026.10.02.507
> Status: PLANNING / cash monetization authority
> Date: 2026-10-02
> Korean counterpart: [AD_ONLY_ADVERTISING_REVENUE_SPEC.ko.md](AD_ONLY_ADVERTISING_REVENUE_SPEC.ko.md)

## 1. Authority and business constraint

Until the registered business scope is explicitly expanded and reviewed, **cash revenue is advertising-only**.

Active cash channels:
- Google AdSense / Google publisher advertising on eligible public content;
- AdSense Auto Ads or other Google ad formats only under measured experiments and route exclusions;
- another ad-management network only after its eligibility, contract, privacy and traffic-quality gates pass.

BLOCKED cash channels:
- paid subscriptions / ad-removal subscriptions;
- paid digital goods, cosmetics, themes, profiles or entitlements;
- paid WLD/WDX or any paid game/economy value;
- paid random items, paid casino entry/value/stake;
- marketplace commissions charged to users;
- donations, memberships, paid API/B2B access, affiliate commission or direct product sales unless a later business/tax/legal review explicitly authorizes the specific channel.

A later authority change must name the permitted business activity and update this spec, PROJECT_PLAN, the KR compliance audit and operational billing controls before implementation.

## 2. KRW 1,000,000/month advertising target model

Google defines Page RPM as estimated earnings divided by pageviews, multiplied by 1,000. Therefore:

`monthly ad revenue = monthly pageviews / 1,000 × observed Page RPM`

The following are **scenario inputs, not forecasts or guarantees**:

| Observed Page RPM | Pageviews for KRW 1,000,000/month |
|---:|---:|
| KRW 2,000 | 500,000 |
| KRW 3,000 | 333,334 |
| KRW 5,000 | 200,000 |
| KRW 7,500 | 133,334 |
| KRW 10,000 | 100,000 |
| KRW 15,000 | 66,667 |
| KRW 20,000 | 50,000 |

The operating target is never “raise clicks.” It is: grow qualified human pageviews, improve viewability/format mix safely, and measure realized Page RPM.

## 3. Revenue ladder

### Phase A — AdSense baseline
- Keep current approved publisher/ads.txt setup.
- Measure 30-day Page RPM, ad RPM, impressions, ad requests, coverage, viewability, revenue/pageview, route, locale, device and traffic source.
- Separate eligible public-content traffic from login, economy-action, account, admin and other blocked surfaces.
- Use realized data as the baseline; do not backfill missing RPM with industry averages.

### Phase B — AdSense optimization
- Use Google Auto Ads/Experiments to A/B test ad load and formats.
- Require retention/task-completion/Core Web Vitals/accidental-click guardrails.
- Prefer content-complete in-page placements; reserve layout space to protect CLS.
- Keep route exclusions fail-closed.

### Phase C — premium ad-management eligibility
- Re-evaluate third-party ad-management networks only after traffic quality and eligibility are met.
- Example research checkpoint: Journey by Mediavine currently states a minimum of 1,000 Tier-1-country sessions in 30 days plus original audience-first content and clean traffic.
- This is an optional advertising channel, not permission for paid products or subscriptions.

## 4. Advertising route contract

Ads may appear only on reviewed public content where ads do not interfere with a financial/game decision or critical task.

Keep blocked:
- wallet, transfer, lending/loan;
- WDX decision/order and other transaction surfaces;
- casino/chance surfaces;
- account/security/payment failure;
- admin/action consoles;
- private chat/private user data;
- legal/privacy/consent flows where ad proximity would confuse the purpose.

The existing explicit allowlist/blocklist remains authoritative unless a reviewed route-level change supersedes it.

## 5. Traffic growth for ad revenue

Priority order:
1. Search Console crawl/index/canonical truth;
2. original high-intent calculators and guides that fully satisfy the query;
3. internal linking from high-traffic tools to genuinely related guides;
4. EN/KO locale correctness before scaling additional locale URLs;
5. durable community/guide pages with publication and moderation quality gates;
6. only then expand programmatic templates with unique user value.

Do not generate thin pages merely to create ad inventory. Do not buy low-quality traffic, use traffic exchanges, incentivize ad views/clicks, ask users to support the service by interacting with ads, or run automation that creates impressions.

## 6. Experiment guardrails

Every ad experiment records:
- experiment ID and exact date range;
- original and variation settings;
- eligible traffic share;
- Page RPM and total revenue;
- viewability/coverage where available;
- LCP/INP/CLS;
- bounce/engagement/task completion;
- accidental-click/user complaint signals;
- invalid-traffic/policy warnings;
- rollback decision.

Revenue lift alone cannot win if invalid-traffic risk, policy risk, user trust or critical UX materially degrades.

## 7. Monthly operating dashboard

Required:
- finalized and estimated ad revenue kept separate;
- Page RPM and ad RPM;
- pageviews and ad impressions;
- top revenue routes;
- revenue by locale/device/source;
- traffic-source concentration;
- organic search impressions/clicks and indexed-page trends;
- invalid-traffic adjustment/warning state;
- Core Web Vitals by monetized template;
- ad-serving policy status.

The KRW 1,000,000 target is evaluated from finalized/realized data. Tax liabilities, infrastructure and other operating costs are tracked separately; gross ad revenue is not “profit.”

## 7.1 International advertising economics — v507

International growth is evaluated by country + locale + landing family + device + source + consent state.

| Gross monthly target | RPM KRW 5,000 | RPM KRW 10,000 | RPM KRW 20,000 |
|---:|---:|---:|---:|
| KRW 1M | 200k PV | 100k PV | 50k PV |
| KRW 5M | 1.0M PV | 500k PV | 250k PV |
| KRW 10M | 2.0M PV | 1.0M PV | 500k PV |

This is scenario arithmetic, not a forecast. Use observed Page RPM and revenue per 1,000 qualified organic sessions. Market investment requires incremental ad revenue to exceed localization, content, moderation, infrastructure, privacy/compliance and support cost while retention, CWV, task completion and invalid-traffic/policy guardrails remain healthy.

Large US, Japanese and European digital-ad markets are macro context only; they do not imply a Moneyverse publisher RPM.

## 8. Tax/business evidence gate

National Tax Service guidance recognizes platform-distributed advertising income as business income in its one-person-media guidance and discusses foreign-platform consideration and VAT treatment under stated conditions. That guidance does **not** automatically classify this website.

Before expanding ad providers or direct advertising contracts, retain evidence of:
- current registered business activities;
- actual business commencement date;
- tax/VAT treatment confirmed for this business;
- foreign-platform payment records;
- privacy/overseas-transfer/vendor records;
- invoices/receipts/accounting evidence as applicable.

## 9. Prohibited traffic and ad behavior

Hard BLOCK:
- publisher/self clicks on live ads;
- asking friends/users to click or refresh ads;
- paid-to-click, paid-to-surf, auto-surf or click-exchange traffic;
- bots or automation that generate ad impressions;
- deceptive placement that resembles navigation/download/game controls;
- more advertising/promotional material than publisher content;
- keyword/content manipulation only to obtain higher-value ads.

## 10. Evidence sources

Primary sources checked 2026-09-30:
- Google AdSense Page RPM: https://support.google.com/adsense/answer/112030
- Google Auto Ads: https://support.google.com/adsense/answer/9261805
- Google Auto Ads experiments: https://support.google.com/adsense/answer/9726342
- Google invalid traffic: https://support.google.com/adsense/answer/16737
- Google Publisher Policies/Restrictions: https://support.google.com/adsense/answer/10008391
- National Tax Service one-person-media tax guidance: https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7802&mi=2480
- Mediavine requirements: https://www.mediavine.com/mediavine-requirements/

## 11. Release status

This version changes planning/docs only. It does not claim a new AdSense setting, ad experiment, Test deployment, Production deployment, tax classification, or KRW 1,000,000/month revenue result.
