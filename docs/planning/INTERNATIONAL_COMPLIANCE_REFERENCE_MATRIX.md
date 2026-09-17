# Woldeok Moneyverse — International Compliance Reference Matrix

> Version: v2026.09.17.177
> Date: 2026-09-17
> Purpose: authority-first research index for product planning; not legal advice
> Korean counterpart: [INTERNATIONAL_COMPLIANCE_REFERENCE_MATRIX.ko.md](INTERNATIONAL_COMPLIANCE_REFERENCE_MATRIX.ko.md)

## Research rule

The discovery sweep is intentionally broad, but a large raw result count is not evidence quality. Duplicates, SEO summaries, stale commentary and unsourced forum material do not become release gates. Product decisions prefer current statutes/regulators/store rules, then courts, then public-health/peer-reviewed material.

## Search / localization authorities

| Authority | Source | Product conclusion |
| --- | --- | --- |
| Google Search Central | https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites | Separate URLs per language; avoid forced language redirects; let users switch; use hreflang. |
| Google Search Central | https://developers.google.com/search/docs/specialty/international/localized-versions | Reciprocal hreflang, ISO language/optional region codes, x-default support. |
| Google Search Central | https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages | Locale-adaptive/IP/Accept-Language content may not be fully crawled; prefer separate URLs. |
| Google Search Central | https://developers.google.com/search/docs/crawling-indexing/canonicalization | Same-language regional duplicates need coherent canonical + hreflang. |
| Google Search Central | https://developers.google.com/search/docs/essentials/spam-policies | Do not create scaled low-value content primarily to manipulate rankings. |

## Korea

| Authority | Source | Product conclusion |
| --- | --- | --- |
| National Law Information Center — Game Industry Promotion Act | https://www.law.go.kr/ | Rating/distribution and exchange of game results/game money are regulated; casino architecture cannot rely on terms-only no-cash wording. |
| National Law Information Center — Article 32 | https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1032690633 | Business exchange/brokering/repurchase of game results/game money is prohibited. |
| Google Play — Korea distribution | https://support.google.com/googleplay/android-developer/answer/6223646 | Simulated gambling is treated as unsuitable under 19; casino-style games need GRAC rating certificate for Korea distribution. |
| Apple — Korea age ratings | https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions | Frequent/intense simulated gambling is a high-age content descriptor; Korea may require GRAC RCN. |
| Apple — Korea rating update (2026-08-12) | https://developer.apple.com/news/?id=oj3r9pvw | Korea-specific GRAC rating override flow is current store-release evidence. |
| Korea FTC — dark patterns / recurring payments | https://www.ftc.go.kr/ | E-commerce dark-pattern rules and recurring price/free-to-paid consent requirements must be built into checkout/subscription. |
| National Law Information Center — E-commerce Act Art. 13(6) | https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1027063817 | Recurring price increases/free-to-paid conversion require consent and cancellation information. |
| E-commerce Enforcement Decree Art. 20-2 | https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lspttninfSeq=193909 | Current advance period is 30 days. |
| Korea PIPC — behavioral advertising | https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=9888 | Personalized advertising requires explicit data-purpose/provider review; contextual is safer launch default. |
| Google Play — South Korea alternative billing | https://support.google.com/googleplay/android-developer/answer/11222040 | Alternative billing is possible only under program/API/reporting requirements; not a generic bypass. |

## United States

| Authority | Source | Product conclusion |
| --- | --- | --- |
| FTC COPPA | https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa | General-audience service must address known-under-13 users; no child-directed expansion without dedicated compliance. |
| Washington RCW 9.46.0285 | https://app.leg.wa.gov/rcw/default.aspx?cite=9.46.0285 | “Thing of value” includes credit/service/entertainment/privilege of playing without charge. |
| Ninth Circuit — Kater v. Churchill Downs | https://cdn.ca9.uscourts.gov/datastore/opinions/2018/03/28/16-35010.pdf | Virtual chips extending continued play were treated as thing of value under Washington law; no-cash-out is not globally sufficient. |
| Google Play Payments | https://support.google.com/googleplay/android-developer/answer/9858738 | Digital goods/subscriptions normally use Play Billing unless a current eligible regional program applies. |
| Apple App Review Guidelines | https://developer.apple.com/app-store/review/guidelines/ | Digital in-app unlocks default to IAP; gambling is heavily regulated and market-specific. |

## EU / EEA

| Authority | Source | Product conclusion |
| --- | --- | --- |
| European Commission — DSA Q&A | https://digital-strategy.ec.europa.eu/en/faqs/digital-services-act-questions-and-answers | Dark patterns restricted; targeted ads based on minors' data/sensitive data prohibited on online platforms. |
| European Commission — DSA | https://digital-strategy.ec.europa.eu/en/policies/digital-services-act | Ad transparency, user control and minor protections are product requirements. |
| European Commission — Consumer Rights Directive | https://commission.europa.eu/law/law-topic/consumer-protection-law/consumer-contract-law/consumer-rights-directive_en | Pre-contract information and withdrawal rules cover distance/digital-content contracts. |
| European Commission — child data | https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en | Where consent is the basis, parental-consent threshold varies by Member State from 13 to 16. |

## Germany / France / Spain overlays

| Authority | Source | Product conclusion |
| --- | --- | --- |
| Germany — Youth Protection Act (JuSchG) §10b | https://www.gesetze-im-internet.de/juschg/__10b.html | Age-rating assessment can consider gambling-like mechanisms, in-game purchase pressure, excessive-use mechanisms and other usage risks; Germany needs a youth/rating overlay even for non-cash simulated play. |
| Germany — JuSchG §14a | https://www.gesetze-im-internet.de/juschg/__14a.html | Game platforms can have age-label obligations, including providers outside Germany in scope; channel/scale applicability requires local review. |
| France — Autorité nationale des jeux (ANJ) | https://www.anj.fr/joueurs/offre-illegale | Real-money online casino sites are illegal in France outside the legally authorized offer; Moneyverse simulated/no-cash play must stay clearly outside any real-money/referral loop and remains locally review-gated. |
| Spain — DGOJ loot-box consultation | https://www.ordenacionjuego.es/novedades/proceso-participativo-sobre-mecanismos-aleatorios-recompensa-cajas-botin | The regulator explicitly identifies convergence/confusion between random-reward videogame mechanisms and gambling; paid random items remain blocked and casino is locally review-gated. |
| Spain — DGOJ Juego Seguro 2026–2030 | https://www.ordenacionjuego.es/sites/default/files/files/news/Programa_JuegoSeguro_DGOJ_2026_2030_0.pdf | Current safe-gambling programme continues videogame/loot-box monitoring and vulnerable-consumer protection; treat Spanish launch as an active-policy environment. |

## United Kingdom

| Authority | Source | Product conclusion |
| --- | --- | --- |
| UK Gambling Commission — virtual currencies | https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/page/digital-and-virtual-currencies | Convertibility/trading for value can make in-game items money or money's worth. |
| UK Gambling Commission — social gaming discussion | https://www.gamblingcommission.gov.uk/about-us/page/virtual-currencies-esports-and-social-gaming-discussion-paper | Social gaming/virtual currencies need boundary review; tradeable credits/tokens increase regulatory concern. |
| UK Gambling Commission — Remote Technical Standards | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards | Use strict safety patterns as product guardrails: one deliberate action per cycle, transaction clarity, limits/reality checks. |

## Australia

| Authority | Source | Product conclusion |
| --- | --- | --- |
| Australian Classification | https://www.classification.gov.au/classification-ratings/new-classifications-for-gambling-content-video-games | Since 22 Sep 2024 simulated gambling in computer games has minimum R18+; paid chance items minimum M. |
| Australian Classification — ratings | https://www.classification.gov.au/classification-ratings/what-are-ratings | R18+ is legally restricted to adults; simulated gambling has minimum R18+. |

## Japan

| Authority | Source | Product conclusion |
| --- | --- | --- |
| Japan FSA — prepaid payment instruments | https://www.fsa.go.jp/en/news/2018/20180717.html | Cash-purchased e-money/e-points may be regulated prepaid payment instruments; paid game currency creates additional obligations. |
| Japan PPC — APPI Q&A | https://www.ppc.go.jp/personalinfo/faq/APPI_QA/ | Child consent/representative-consent capability depends on age/data/service context; youth handling needs local review. |

## Brazil / future markets

| Authority | Source | Product conclusion |
| --- | --- | --- |
| Brazil federal decree 12,880/2026 | https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/decreto/d12880.htm | Child/adolescent digital classification and safety now explicitly consider loot boxes/problematic engagement; Brazil rollout needs current local review. |
| China mainland / Canada / Singapore / Taiwan | country-specific review not yet launch-grade in this cycle | Default REVIEW_REQUIRED/BLOCK for regulated monetization/casino until current primary-source review and counsel evidence are attached. |

## Store/payment authority

| Authority | Source | Product conclusion |
| --- | --- | --- |
| Google Play Payments | https://support.google.com/googleplay/android-developer/answer/9858738 | Digital goods/services billing route is governed by Play policy and regional programs. |
| Google Play user-choice/choice billing | https://support.google.com/googleplay/android-developer/answer/13821247 | Regional alternative billing is program-specific and evolves; store policy must be release evidence. |
| Apple IAP | https://developer.apple.com/app-store/review/guidelines/ | In-app digital unlocks normally use IAP; regional exceptions must not be assumed globally. |

## Release evidence rule

For every `ALLOW` high-risk policy, store: source URL/version/date checked, reviewer/owner, jurisdiction/channel, product architecture reviewed, expiry/recheck date, rating/certificate where applicable, and exact policy version. A link existing in this matrix is not itself an approval.
