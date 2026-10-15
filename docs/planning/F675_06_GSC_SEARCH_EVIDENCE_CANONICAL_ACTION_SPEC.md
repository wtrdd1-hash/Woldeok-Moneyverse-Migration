# F675-06 — Google Search Evidence, Indexing Truth & Canonical Action Center

> **v2026.10.15.688** · **PLANNING / AUTHORITY_DRIFT / Production BLOCKED** · 2026-10-15 KST
> English canonical · [한국어](F675_06_GSC_SEARCH_EVIDENCE_CANONICAL_ACTION_SPEC.ko.md) · [worklog](../worklog/2026-10-15-f67506-search-evidence-v688.md).
> Authority: [PROJECT_PLAN](PROJECT_PLAN.md) → [Integrated Planning Master](INTEGRATED_PLANNING_MASTER.md) → [v675 detailed backlog](INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.md). Reuse existing GSC admin integration and v685 partial fixes, obey v397 API contract, v530 UI release hold, v523/542/543 economy safety, v507/v527 SEO; avoid duplicated “SEO centers.” Exact start `origin/main=44d0b46583a9a2836e0f2b41655b245cf6f1c262`. No source code, live Search Console property or runtime state changed in this planning pass.

## 0. Product promise, non-goals and evidence ladder

**Administrator job-to-be-done:** “Show which search queries and pages genuinely brought impressions/clicks from which country and device, whether a URL was submitted versus observed in Google’s index, why a canonical differs, and exactly which page owner can fix it—without presenting unknowns as zero or promises of instant indexing.”

**Value:** the existing `/admin/seo` remains the ONE owner-facing UX. Extend its working GSC Search Analytics, index submission/audit and logs. Read-only diagnosis first; isolated approved actions (site map submission, safe index provider notification or queued manual Google URL Inspection) later. Never claim to force Google to crawl, index, rank or provide traffic. Never submit generic calculator, blog or virtual-stock pages to Google Indexing API—it is restricted to supported `JobPosting` / `BroadcastEvent` livestream content.

**Keep four independent evidence lanes:**
A. Site/source technical state `IN_SITEMAP / CANONICAL_DECLARED / ROBOTS_ALLOWED / NOINDEX / REDIRECT / ERROR / UNKNOWN`.
B. Submission/transport `NOT_SUBMITTED / REQUESTED / ACCEPTED / PARTIAL / REJECTED / UNKNOWN` **provider-scoped**.
C. Google indexed-version observation `INDEXED / NOT_INDEXED / GOOGLE_SELECTED_DIFFERENT_CANONICAL / INSPECTION_UNAVAILABLE / UNKNOWN` via quota-bound URL Inspection—not live URL test.
D. Actual search performance `FINAL / FRESH_INCOMPLETE / ZERO_OBSERVED / NO_ROWS / NOT_CONFIGURED / ERROR / STALE` with measured clicks, impressions, CTR, position, time window, grouping and Google property. A crawler log is not B/C/D; a successful IndexNow response is not Google indexing.

For every cell record `source, property, queryDimensions, timeRangePT, collectedAtUTC, lastSuccessfulAtUTC, isPartial, lastError, sourceSha, reportRevision`; **do not silently coerce unreported rows into Google-observed zeros**. Existing source-only observations and historical audits are not current Production tests.

## 1. Exact-source findings and v685 relationship

| ID / severity | Source on start main | Impact / next stage |
|---|---|---|
| **S688-01 P1** | `backend/src/seo/gsc-client.ts::fetchGscAnalyticsSnapshot` requests `type=web`, `dataState=all`, dates computed by server UTC day; Google Analytics API defines dates in PT. | Date attribution and preliminary latest days can drift; derive explicit PT reporting dates and mark `FRESH_INCOMPLETE` versus `FINAL`; don't compare partial periods as final. |
| **S688-02 P1** | Same source builds 30 daily rows and fills any missing Google row with `0 clicks/0 impressions/0 CTR/0 position`. | Google omits dates without rows, and delayed reporting may be unknown. Preserve `null/unreported` vs verified zero and explain collection/report coverage. |
| **S688-03 P1** | Same `GscAnalyticsSnapshot` requests only top 10 query rows and `date`; `frontend/src/app/admin/seo/gsc-analytics-card.tsx` displays queries. | No real query→page→country→device breakdown, no controlled aggregation modes; add one bounded GSC query matrix without assuming exhaustive long-tail coverage. |
| **S688-04 P1** | `backend/src/seo/seo.service.ts::getGscAnalytics` caches a connected response 1h, unconfigured 1h, error 5m, with `source=search-console/error/unconfigured`, while UI `updatedAt` refers to persisted credential update. | Operators need `lastFetchedAt`, Google reporting date and last-successful timestamp; do not treat credential-key update as fresh GSC data. |
| **S688-05 P0 truth** | `frontend/src/app/admin/seo/seo-client-view.tsx` defines `stockCoverage.indexed`, `guideCoverage.indexed`, and `formatRelativeTime(null)` = “미방문 (Unindexed)”; `/admin/seo/page.tsx` fallback marks targets `unindexed`. | Bot/HTTP visit status ≠ Google index status; rename as crawler observations; only URL Inspection can establish observed Google index state. A local `unindexed` label without inspection is forbidden. |
| **S688-06 P0 truth** | `frontend/src/app/api/admin/seo/gsc-sitemap-submit/route.ts` returns top-level `success:true` even if optional backend submission failed; uses legacy Google/Bing `/ping?sitemap` calls; tests `Promise.allSettled` fulfilled (even response null) for ping booleans. | Transport acceptance must be explicit per provider with HTTP status and response; Google Ping is not a current success or indexing guarantee. Fail closed, no fake “Google/Bing done.” |
| **S688-07 P0 truth** | `frontend/src/app/api/admin/seo/indexing-submit/route.ts` returns `success:true` and “Google Indexing API” message for general SEO/pSEO URLs but actually invokes `submitToIndexNow` plus legacy pings. | Remove unsupported Google indexing API claim, validate IndexNow actual endpoint accepted/pending and domain verified. Distinguish Bing/IndexNow provider from GSC Sitemaps. |
| **S688-08 P1** | `frontend/src/app/admin/seo/indexing-api-card.tsx` records hardcoded 564 URLs on sitemap success, 580+ “instant indexing” copy and local-only history objects. | Real response counts, persistent audited receipts, human-safe “submitted is not indexed”; no fabricated total or “priority crawl” assertion. |
| **S688-09 P0 access** | A separate Next `/api/admin/seo/gsc-sitemap-submit` route uses process-local IP limits derived from forwarded headers and direct `API_ORIGIN` fetch, unlike existing `/api/seo/gsc` BFF which routes through `api/mutate`; file itself has no session/CSRF actor assertion. | Independently verify actual middleware/access chains; use one authenticated, CSRF-checked admin BFF with role/tenant/property scope and durable budgeted throttling. **Source shows risk boundary, not proven unauthenticated exploit.** |
| **S688-10 P1** | v685 `fix(seo)` repaired SEO crawl-audit/IndexNow delivery receipts and guards; independent fallback indexing and GSC sitemap route/card still contain the above source paths. | Reuse existing implemented fixes; never downgrade/overwrite v685 nor claim that it fully resolves these remaining GSC provider/state issues. |

Other source data: GSC service-account JSON currently persisted via reviewed `seo_gsc_credential_runtime/set/delete` and used to fetch Search Console analytics; no private key was read, and **credential configured** is NOT itself proof of access to the requested site, data freshness or live indexed pages.

## 2. User roles and concrete tasks (research hypotheses, no interviews)

| Admin user and question | Expected evidence/workflow | Hazard to prevent |
|---|---|---|
| Solo site owner: “Why do I see zero visitors?” | date-finalized daily impressions/clicks; zero vs no rows vs auth error, property verification | fake 0%/100%, timezone shift and sample-based full coverage claims |
| Editor improving calculators: “Which search query leads to what tool?” | query+page+country+device filter, click/CTR/position, source/period, content owner | guess query→page solely by Korean keyword matching; wrong content rewrite |
| Korean/English translator: “Which language URL is canonical?” | requested, declared and Google-selected canonical; hreflang reciprocity and content parity | forcing one locale for all, indexing duplicate thin translations |
| On-call operator: “Did one-click submission index 580 URLs?” | request/receipt/Google later inspect separate; actual submitted URL count; token scopes | a local success toast as Google acceptance/index completion |
| Incident response: “What stopped GSC polling?” | property/scopes/auth/401/403/429/timeout/stale last good; replay after budget | retry storm, leaked service key, stale “fresh” metrics |
| SEO engineer: “Which URLs need technical fixes?” | compare sitemap, route 200/redirect, meta/X-Robots, robots, canonical and URL inspect version, exact file owner | false `unindexed` inferred from crawler visits, robots.txt used as privacy control |
| Publisher with very little traffic | empty/no rows honest explanatory zero state, beneficial next step to publish genuinely useful page | automated keyword-page spam or fabricated ranking victory |
| Security/accessibility reviewer | only admin scoped metrics, no exposed auth secrets; keyboard/320px reports | admin dashboards indexed publicly, full query logs with personal data |

Research these with consenting site owner/editor/SEO reviewer and accessibility participant. No interviews, rankings, live Google property counts, CTR improvements or growth experiments were measured in v688.

## 3. UX: extend one /admin/seo dashboard, three screens

**A. Search evidence overview (default):** a compact **property picker** restricted to verified accessible property IDs; date-range controls using Google PT reporting; segmented FINAL/FRESH_INCOMPLETE; source last fetched and last completed date; cards for actual clicks/impressions/weighted CTR/position with N/A on no rows. Query→page table with country/device/filter/toggle and downloadable **scope-labeled** non-PII summaries. Never calculate unweighted arithmetic mean of CTR/position across mixed dimensions; prefer API-provided aggregates with explicit aggregation type and avoid adding unrelated subtotals. GSC anonymizes/omits some queries; a nonempty top rows list is not all search queries.

**B. Index & canonical evidence (URL details):** property-scoped URL selector, canonical user-declared, Google-selected, last indexed-version crawl, robots/noindex status, internal sitemap membership, alternate-language/hreflang graph and own configured route owner. Display source evidence in **separate rows**, never one global green “indexed” flag. URL Inspection only reports **Google indexed version**, not the live URL; the independent live HTTP/HTML probe is a different method and cannot substitute for Index Inspection. URLs require exact hostname/property/normalization, localhost/admin/test excluded. Limited batch prioritized by search value, no blanket 580 inspections at once; inspector quota and age shown.

**C. “What can I do?” triage list:** proposed evidence-backed tasks with severity, impact estimate labelled `HEURISTIC` if not measured, affected URL set, file/module owner, repro evidence, expected SEO semantics, and safe concrete action:
1. Correct a 404/5xx, redirect loop or inconsistent canonical.
2. Fix `noindex` for approved public content; **do not remove noindex from private/admin/Test**.
3. Reconcile sitemap URLs only for genuinely canonical/indexable public content, remove duplicate/thin presets; do not pretend submission auto-indexes.
4. Review hreflang reciprocal pairs for real translated pages; **English canonical project docs ≠ search canonical all-locale page policy**.
5. Improve poor helpful content/formulas per user needs, not spammy page farms.
6. If data are stale or quota exhausted, show reason and next sensible refresh window; no secret disclosure.
Each ticket is reviewable and can be closed based on reinspection/verification; publishing changes still follow code branch/Test/release governance.

## 4. Accurate evidence model and safe API proposal

**Reuse current `/api/v1/seo/gsc/analytics`, `/api/seo/gsc` and admin SEO surfaces**, adding parameterized server-approved read projections; do not create a duplicate management platform. Candidate contracts:
- `GET /api/v1/admin/seo/search-evidence?property&from&to&dimensions&searchType&dataState&cursor` ⇒ `rows, aggregate, appliedFilters, reportingTimezone:'America/Los_Angeles', lastFinalizedDate, coverage:TOP_ROWS_ONLY|COMPLETE_FOR_REQUEST|UNKNOWN, aggregationType, fetchedAt, isPartial, nextCursor, error`. Query validation, dimensions whitelist (date/page/query/country/device; combos constrained), paging caps and bounded date range.
- `GET /api/v1/admin/seo/url-evidence?property&url` ⇒ `siteCodeEvidence, sitemapMembership, declaredCanonical, canonicalFromIndex, lastCrawlAt, indexedVersionState, sourceAges, inspectionStatus, quotaBudget, owner`; may schedule an explicit inspection job, not recursively run N URL checks.
- `POST /api/v1/admin/seo/url-inspection-jobs` ⇒ security-reviewed rate/queue, allowlisted public canonical URLs, quota reservation, dedup, durable job ID, provider errors and exact status. Admin CSRF/RBAC/owner action, not public POST.
- `GET /api/v1/admin/seo/submission-receipts` ⇒ per-provider records `SITEMAP_GSC_SUBMITTED | INDEXNOW_REQUEST_ACCEPTED | REJECTED | UNKNOWN`, timestamps/HTTP outcome, count from actually submitted payload; no "indexed" field derived from transport.
- `POST /api/v1/admin/seo/gsc/sitemap` only on verified property + explicit admin click and accepted scope; **success means accepted request**, not indexed. Prefer existing GSC submission endpoint and adapt over inventing another.

**Read model**: e.g. `SeoEvidenceRow` includes `propertyUrl, searchType, keys{page,query,country,device,date}, clicks, impressions, ctr, position, grouping, dataState, sourceAt, lastSuccessAt, requestedRangePT`; omitted query rows are not zero; a row with numeric zero is different from a missing observation. Unknown index result must stay unknown even if the site crawler saw Googlebot IP. Google query dates use Pacific Time, API `dataState=all` may include incomplete recent values. Deduplicate URL by normalized canonical **without merging different translated canonical pages**. Expose numeric/aggregated metrics only under authenticated admin with no secrets or personal search-query exports to analytics.

**Provenance vs receipt:** GSC verified property + OAuth token scope, HTTP transport, batch accepted, sitemap fetch timestamps, Google index inspection, performance impression, and eventual click are all **different authorities**. The per-URL `status` needs an explicit source. A sitemap receipt never proves processing; Search Console can choose another canonical or decline indexing.

## 5. Exact quota and operational resilience

- Google Search Analytics `rowLimit` max 25,000 (default 1,000), `startRow` offset; **GSC can cap exposure around 50k rows/day/search type and withhold anonymized queries**. Do not label top 10 query sample exhaustive. Query indexed by PT dates, bootstrap by date-only data-presence query; fetch finalized data by default and isolate "fresh" provisional values.
- URL Inspection API quota **per site 2,000 queries/day and 600/min** (per Google docs, current application limits can vary). Inspection is for indexed version, not live test and not a request indexing API. Plan far smaller internal cap (e.g. 100/day, configurable within verified project quota), backoff `429`, retries with jitter and budget-aware queue; no per-user click loop.
- Cache by property, date range, dimensions, aggregation type and state; confirmed historic final snapshots immutably, preliminary refresh after bounded TTL; show `lastSuccessfulAt` and `STALE` after outage. Shared Redis/DB-backed coordinator for budget/leases if needed; memory-only counters are not reliable cross worker process.
- OAuth/service-account authorization must respect Search Console verified property/permission; read-only `webmasters.readonly` unless explicit sitemap write action needs `webmasters`. Do not send or log the private-key JSON to browser telemetry, receipts, URLs or client JS. Assess existing DB key handling, transport `safeFetch`, SSRF allowlist, key rotation and revoke on admin access changes.
- No direct arbitrary URL HTTP fetch from admin query. For canonical/live probe: normalize URLs to allowed verified hosts, block private IP and redirects to disallowed address, enforce time/size/content-type caps, no SSRF bypass; redact forbidden pages.
- Guard POST/GET with admin session, per-action RBAC, CSRF, secure credential scopes and request body schema. Audit actor/action/property/budget without copying tokens or sensitive query data. All admin endpoints `private,no-store`, server render robots `noindex` & auth gate, not merely robots.txt disallow.
- v685 fixes IndexNow real response reporting elsewhere in current app; adopt not overwrite it. **Legacy Google/Bing ping endpoints cannot be equated with GSC sitemap submit**, and IndexNow doesn't establish Google Search index status.

## 6. User-facing statuses and bilingual microcopy

| Stage | Korean | English |
|---|---|---|
| GSC unavailable | Search Console 연결을 확인할 수 없습니다. 마지막 정상 수집 시각을 표시합니다. | Search Console is unavailable. Showing the last successful fetch time. |
| Not configured | 연결된 Search Console 속성이 없습니다. 권한을 먼저 확인하세요. | No Search Console property is connected. Check access permissions first. |
| No rows | 이 기간에 API가 제공한 행이 없습니다. 방문자 0명이라는 뜻은 아닙니다. | The API returned no rows for this period. This does not prove zero visitors. |
| Fresh data | 최근 데이터는 아직 확정되지 않았습니다. 날짜별 변동 가능성이 있습니다. | Recent data is preliminary and may change. |
| Sitemap accepted | 사이트맵 제출 요청을 수락했습니다. 크롤링·색인은 별도로 확인해야 합니다. | The sitemap submission was accepted. Crawling and indexing still need verification. |
| Ping unsupported | 일반 URL의 Google 빠른 색인 API는 지원되지 않습니다. | Google's Indexing API does not support these general URLs. |
| Indexed URL | Google 색인본에서 색인 상태를 확인했습니다. 확인 시각을 참고하세요. | Indexed status observed in Google's indexed version, as of the inspection. |
| Unknown URL | Google 색인 여부를 아직 확인하지 않았습니다. | Google index status has not yet been checked. |
| Different canonical | Google이 다른 대표 주소를 선택했습니다. 두 URL과 그 근거를 비교하세요. | Google chose a different canonical. Compare both URLs and evidence. |
| Quota exhausted | 검사 할당량이 소진됐습니다. 자동 반복 대신 다음 가능 시점에 재확인하세요. | Inspection quota is exhausted. Retry only when budget allows. |
| Crawler-only | 서버 방문 기록입니다. Google의 색인 확인 증거는 아닙니다. | This is a crawler visit record, not Google indexing evidence. |
| Submit failed | 제출 결과를 확인하지 못했습니다. 중복 재제출 전에 처리 내역을 확인하세요. | Submission outcome is unknown. Check the receipt before retrying. |

Accessible URL table has readable status text + source/time, not green/red only; keyboard filters, localized date/time labels, 320–430px and zoom 400%, column reflow/table horizontal scroll with accessible column headers. No API key in UI; property IDs only to authorized actors. Controls do not lie when loading, empty, stale or revoked.

## 7. User research hypotheses and measurement methodology

Before interviews: site owner wants meaningful query→landing actions not more vanity crawler hits; editor wants which real query led to which guide; operator wants clear difference between queued/submitted/crawled/indexed; multilingual reader expects locale canonical; tiny traffic may yield no query rows. Test on **synthetic property fixtures** with GSC disconnect, no data, Google-selected alternate canonical, 429, 401, delayed data and partial query samples. All outcomes are hypotheses: we conducted **no real Search Console credentials access, actual impressions read or editor interviews**.

Events: `seo_evidence_view{propertyAlias,dimensionSet,dateRangeBucket,state}`, `seo_url_inspection_requested{quotaClass}`, `seo_canonical_mismatch_reviewed{category}`, `seo_action_created{type,ownerRole}`, `seo_submission_transport{provider,outcome}`, `seo_api_error{statusGroup}`. Never use raw search terms, tokens, URLs with user details, service-account keys or actor email in metric labels.

Primary quality goals **not measured yet**: zero false "indexed" assertions from crawler/pings, zero private/admin/Test pages made indexable, zero secret leaks, no real consent bypass; evidence-backed ownership for 100% of created SEO action tickets. Secondary actual qualified GSC clicks, page-country query coverage with anonymized limits, declines in verified canonical mismatches, 429 budgets respected, dashboard p95 response/5xx. No predicted ranking improvements, “580 URLs indexed” or invented baseline.

## 8. D0–D7 implementation plan and release acceptance

| Stage | Separate reviewed code branch after planning | Required tests |
|---|---|---|
| **D0 source/URL authority** | enumerate GSC client, backends and both GSC/IndexNow BFFs, sitemap/robots/canonical/hreflang and exact main; map owners | no duplicate SEO admin action, v685 stays intact; URL owner/policy inventory |
| **D1 P0 truth cleanup** | fail-closed legacy `indexing-submit` and `gsc-sitemap-submit`; remove false Google API/ping/indexed words/hardcoded 564; correct crawler `Unindexed` status | Google API unavailable/legacy ping any result ⇒ no success; each provider receipt matches HTTP |
| **D2 correct GSC analytics** | PT date alignment, `dataState` final/fresh, omitted days null, filtered query/page/country/device read projection | golden API fixtures with PT midnight, partial dates, no rows, anonymized queries, aggregated CTR |
| **D3 quota-bound URL Inspection** | permissioned owner, selected canonical URL, indexed-version schema/canonical diff, small durable queue/leases | 401/403/429, no stale false-fresh, real indexed-version vs live URL labels |
| **D4 canonical action queue** | reconcile sitemap, canonical, robots/noindex, redirect, hreflang, index evidence and file owner | admin/Test/private pages never indexed; no auto-rewrite of locale policy |
| **D5 resilient auth/provenance** | fix BFF RBAC/CSRF, scope, audit, shared limits/cache, secret rotations | negative auth/cross-property, SSRF redirects/private IP, no credentials in logs |
| **D6 UX/SEO quality** | single /admin/seo evidence dashboard, localized/accessible states, meaningful operator actions | authenticated 320/390px, keyboard/screenreader and all 12 statuses, comparison periods truthful |
| **D7 release proof** | unit + contract + negative API + integration, exact-SHA isolated Test with real but nonproduction GSC property and permissioned DB, v530 full UI five passes/session/rollback | **HOLD Production** if v397 API parity, v530 UI, v523/542/543 economy/DB, external quota/security or exact-SHA Test fail; zero-downtime promotion only afterward |

Negative fixtures: new/unverified property, credential revoked, missing key, PT vs UTC date boundary, no row vs zero, top-10 vs 50k daily cap, unsupported Google Indexing API payload, simulated ping 404/null fulfilled, sitemap 200 without processing, Google canonical differs, invalid hreflang reciprocity, `robots.txt` disallowed + `noindex`, admin path accidentally in sitemap, fallback crawler observations, cross-domain inspection, 429/replay, 403/401/5xx, SSRF redirect to loopback, multiple backend replicas, stale after Google outage, 400% zoom.

## 9. Reference register — researched 2026-10-15

| ID | Official source | Adopted rule |
|---|---|---|
| R688-01 | [Google Search Analytics query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query) | dimensions, aggregation, PT dates, partial `dataState` |
| R688-02 | [Google Search Analytics data extraction](https://developers.google.com/webmaster-tools/v1/how-tos/all-your-data) | top rows, 25k page and 50k/day exposure ceilings |
| R688-03 | [Google URL Inspection API](https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect) | indexed version only, property-scoped |
| R688-04 | [Google URL Inspection result](https://developers.google.com/webmaster-tools/v1/urlInspection.index/UrlInspectionResult) | last crawl/Google canonical/declared canonical/indexing state |
| R688-05 | [Google Search Console API usage limits](https://developers.google.com/webmaster-tools/limits) | per-site inspection quota and analytics load |
| R688-06 | [Google Sitemaps list](https://developers.google.com/webmaster-tools/v1/sitemaps/list) | real submitted maps and processing timestamps |
| R688-07 | [Google Sitemaps submit](https://developers.google.com/webmaster-tools/v1/sitemaps/submit) | scope-guarded submission, not indexing |
| R688-08 | [Google sitemap guidelines](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) | submission hint, sitemap URL quality |
| R688-09 | [Google canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization) | search engine may choose different canonical |
| R688-10 | [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions) | translated reciprocal hreflang with x-default where apt |
| R688-11 | [Google noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing) | robots block prevents observing noindex; privacy needs auth |
| R688-12 | [Google Indexing API quickstart](https://developers.google.com/search/apis/indexing-api/v3/quickstart) | only JobPosting/livestream pages, not generic pSEO |
| R688-13 | [Google Search Console authorization](https://developers.google.com/webmaster-tools/v1/how-tos/authorizing) | OAuth and least scope |
| R688-14 | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | accessible status/errors and data-table UX |
| R688-15 | [Google Search crawling/indexing FAQ](https://developers.google.com/search/help/crawling-index-faq) | no index timing/placement guarantees |
| R688-16 | [Google robots.txt guidance](https://developers.google.com/search/docs/crawling-indexing/robots/intro) | robots.txt is not an access/security or noindex substitute |

**Version outcome:** v688 is a **documentation-only specification** with no actual URL Inspection API integration, new GSC data read, index requests, application code, WLD/DB mutation or production rollout. All v530, v523/542/543 and exact-SHA release blockers remain.
