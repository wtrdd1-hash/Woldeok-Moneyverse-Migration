# Native frontend rebuild — protected administrator preview
Status: ADMIN_PREVIEW_ONLY, not independent full Test or Production frontend acceptance.

## Deployed scope
Public/member/admin documents continue to return the owner-approved emergency maintenance page. The two verified DB-free prior presentation units remain inactive/disabled. Shared API/auth/database/workers remain. No new production catalog backend or financial mutation was deployed.

A separate DB-free preview unit listens only on fixed loopback4830, not enabled at boot. One reviewed Nginx include exposes only the administrator catalog HTML and its private asset prefix behind the existing real administrator authentication subrequest. Anonymous HTML/assets401; unknown preview404; commands405. Test-host access restrictions are unchanged.

- Application source: 72714c3efdba901d07f00e0b3325bbefe43dcd6f, merged PR3349.
- Exact main CI44914069245: classify, policy, runtime-check, spring-web-check SUCCESS.
- CI artifact14710569805; archive SHA256 4588f959ec3ffd0ddcdaab470f6ff7fdab3d84ce02911e10af7e58961fc3770c.
- Immutable JAR SHA256 abeab840592abeef765ad93ab127840d098b69a5f2f19441920790cd25ff687f.
- Operational source6270f3e8b2; those operations are byte-identical to the separately reviewed source merged by PR3349. This does not relabel the application artifact as6270.
- Nginx before1e3d624f8ab3ff5f872ac90c33f38128deed413e9e06b88033c9f20671d16fd0; after7a80aba9dcd093d105529f4fed8370ff71e446e01f12a661c42b03e1a23dd9a7. Only one QA include added.
- Protected prepare/apply receipts and immutable generations remain on the working host, outside Git. The prepare tool response did not confirm success; independent protected manifest/file/JAR hash validation proved preparation complete before apply. Apply exited0.

## Actual browser observations
The existing signed-in administrator session continued to resolve current roles after deployment. No credentials were read/exported and no sessions were revoked.

Forty actual layout/locale observations: widths320/360/390/430/768/1024/1440/1920 × EN/KO/JA/ZH/VI. Each showed the current favicon image, no horizontal overflow and visible controls at least44px high. Mobile floating support was56px with exactly16px clearance over the actual67px bottom navigation. Desktop body background was rgb(12,16,32), matching the approved navy token. Primary catalog/error labels changed in all five locales. This is layout and unavailable-source acceptance only, not all-copy or all-functional acceptance.

Real interactions: mobile menu open/close; help dialog open; Escape closes it and returns focus to its launcher; catalog refresh retries. Private screenshots and the sanitized40-case matrix are retained outside Git. Desktop/mobile captures are named admin-shop-preview-desktop.png and admin-shop-preview-mobile.png.

## Findings / not passed
1. BLOCKED — retained Production catalog API still returns the old two synthetic camelCase rows. The new frontend rejects the unverified contract, disables search/category and displays an unavailable-source message. Positive catalog listing/search/filter/detail is NOT passed.
2. BLOCKED — catalog create/update/delete and high-risk security/idempotency/audit/receipt contracts remain unavailable, not successful.
3. OPEN — common administrator skip link and navigation accessibility labels retain English in non-English locales. Whole-page five-language copy acceptance is not passed.
4. OPEN — other administrator/member routes still show maintenance; this preview is one screen. Do not infer the whole website is rebuilt.
5. PR3350 canonical read backend failed its first actual PostgreSQL CI startup. A real datasource-composition regression reproduced missing jpaSharedEM_entityManagerFactory: JPA repository auto-configuration was still enabled while Hibernate was excluded. Fix/CI revalidation is in progress; no backend promotion occurred.
6. Independent full Test/data fixtures, authenticated source-positive/browser tests, normal preview-retirement inverse, remaining feature matrix and final Production cutover remain separate gates.

API anonymous baselines remained stocks200/auth401/admin401 JSON with no maintenance response; public HTML stayed503/no-store. The frontend-only preview contains no JDBC/session/job beans. Do not stop retained shared or unclassified legacy JVMs based on their names: read-only process inspection found29 application/default-mode Java services and no further explicit DB-free presentation modes. Their dependency/worker ownership is not certified by that count.


## 2026-11-22 source checkpoint / 소스 진행 상태
PR3350 merged as bca23a8607. Exact main CI44920156614 succeeded, including all18 disposable PostgreSQL cases. The JPA composition defect and expired synthetic-session fixture are corrected in source. Shared administrator first-paint locale labels are corrected in source. None of these changes is yet installed in the live application72714c3efd preview; its positive catalog test remains BLOCKED. Public publications source is separately under integration, with24 tagged SQL cases pending its own CI. This checkpoint does not supersede the deployed identity or claim full Test/Production acceptance.
