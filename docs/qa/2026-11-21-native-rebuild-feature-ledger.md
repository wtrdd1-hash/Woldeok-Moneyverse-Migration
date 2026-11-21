# Current native rebuild acceptance ledger

Status: IN PROGRESS. No route below has full functional acceptance. The180source routes are147static and33dynamic, including40administrator routes. This is a regenerated current-source inventory, not180successful pages.

The public frontend is under owner-approved maintenance. Only the separately protected administrator shop preview is installed at application72714c3efd. Its40layout/locale observations and menu/help/refresh checks do not certify positive catalog reads or writes. The retained API still fails the canonical catalog contract. [Actual preview receipt](../releases/2026-11-21-native-admin-rebuild-preview.md).

Source snapshot91f753bf8b; inventory SHA256 `fe1e0e2f78a560eb7d3f198ce8de62f9745bf2720b66488325ec174aa16fe154`. Existing inventory and feature-reference scripts were run on the MiniPC. [Machine-readable ledger](2026-11-21-native-rebuild-feature-ledger.json) retains exact source files, lexical API references and candidate HTML controllers per route. These require runtime/import/authority tracing before any PASS. Candidate lookup uses exact textual paths; it does not normalize Next `[id]` into MVC `{id}`. An empty candidate list is not proof that no implementation exists.

Historical v30VERIFIED_PASS/HTTP200 records and the older166-route artifact are not current release evidence. Current publication source passed659standard Spring and539Node checks;24PostgreSQL-tagged cases are excluded locally and pending exact-source CI. The earlier catalog source separately passed18real disposable PostgreSQL cases in main CI44920156614. No new source was deployed by writing this ledger.

Remaining acceptance per route: trusted role/fixture; chosen runtime+controller+canonical read/write function; all controls; real-source loading/empty/error; source numeric/string comparison; actual persisted receipt/replay/ownership negatives; five locales/eight widths/200%zoom/keyboard; exact-artifact independent Test and release inverse. A read-only screen may mark mutation not applicable only after its actions are traced.

| ID | Route | Scope | Dynamic fixture | Candidate native source | Full function acceptance |
| --- | --- | --- | --- | --- | --- |
| NATIVE-001 | `/` | Public/member untraced | None in path | NativeHomeController.java | OPEN |
| NATIVE-002 | `/[locale]/blog` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-003 | `/[locale]/blog/[slug]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-004 | `/[locale]/guide/glossary` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-005 | `/[locale]/guide/glossary/[term]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-006 | `/[locale]/tools/compound-interest-calculator` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-007 | `/[locale]/tools/compound-interest-calculator/[preset]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-008 | `/account` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-009 | `/account-deletion` | Public/member untraced | None in path | NativeAuthPageController.java | OPEN |
| NATIVE-010 | `/account/notifications` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-011 | `/account/privacy` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-012 | `/account/security` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-013 | `/admin` | Admin | None in path | AdminUiController.java, AdminDashboardPage.java | OPEN |
| NATIVE-014 | `/admin/analytics` | Admin | None in path | Not identified | OPEN |
| NATIVE-015 | `/admin/api-health` | Admin | None in path | AdminProbePageController.java | OPEN |
| NATIVE-016 | `/admin/bank` | Admin | None in path | Not identified | OPEN |
| NATIVE-017 | `/admin/blog` | Admin | None in path | Not identified | OPEN |
| NATIVE-018 | `/admin/bonds` | Admin | None in path | Not identified | OPEN |
| NATIVE-019 | `/admin/catalog` | Admin | None in path | Not identified | OPEN |
| NATIVE-020 | `/admin/central-bank` | Admin | None in path | Not identified | OPEN |
| NATIVE-021 | `/admin/content` | Admin | None in path | Not identified | OPEN |
| NATIVE-022 | `/admin/controls` | Admin | None in path | AdminReadPageController.java, LiveAdminOverviewPages.java | OPEN |
| NATIVE-023 | `/admin/discord` | Admin | None in path | Not identified | OPEN |
| NATIVE-024 | `/admin/economy` | Admin | None in path | AdminReadPageController.java, LiveAdminOverviewPages.java | OPEN |
| NATIVE-025 | `/admin/economy/scenario-lab` | Admin | None in path | AdminReadPageController.java, LiveAdminOverviewPages.java | OPEN |
| NATIVE-026 | `/admin/enterprises` | Admin | None in path | AdminReadPageController.java, LiveAdminOverviewPages.java | OPEN |
| NATIVE-027 | `/admin/fx` | Admin | None in path | Not identified | OPEN |
| NATIVE-028 | `/admin/help` | Admin | None in path | Not identified | OPEN |
| NATIVE-029 | `/admin/kdic` | Admin | None in path | Not identified | OPEN |
| NATIVE-030 | `/admin/logs` | Admin | None in path | Not identified | OPEN |
| NATIVE-031 | `/admin/logs/activity` | Admin | None in path | Not identified | OPEN |
| NATIVE-032 | `/admin/logs/delivery` | Admin | None in path | AdminDeliveryPageController.java | OPEN |
| NATIVE-033 | `/admin/logs/errors` | Admin | None in path | Not identified | OPEN |
| NATIVE-034 | `/admin/logs/integrity` | Admin | None in path | Not identified | OPEN |
| NATIVE-035 | `/admin/logs/system` | Admin | None in path | AdminUiController.java | OPEN |
| NATIVE-036 | `/admin/market` | Admin | None in path | AdminReadPageController.java, LiveAdminOverviewPages.java | OPEN |
| NATIVE-037 | `/admin/market/ai-news` | Admin | None in path | Not identified | OPEN |
| NATIVE-038 | `/admin/mint` | Admin | None in path | Not identified | OPEN |
| NATIVE-039 | `/admin/money-flow` | Admin | None in path | Not identified | OPEN |
| NATIVE-040 | `/admin/operations/storage` | Admin | None in path | Not identified | OPEN |
| NATIVE-041 | `/admin/pension` | Admin | None in path | Not identified | OPEN |
| NATIVE-042 | `/admin/safety` | Admin | None in path | Not identified | OPEN |
| NATIVE-043 | `/admin/security` | Admin | None in path | Not identified | OPEN |
| NATIVE-044 | `/admin/seo` | Admin | None in path | Not identified | OPEN |
| NATIVE-045 | `/admin/seo-audit` | Admin | None in path | Not identified | OPEN |
| NATIVE-046 | `/admin/shop` | Admin | None in path | AdminShopPageController.java | OPEN |
| NATIVE-047 | `/admin/support` | Admin | None in path | Not identified | OPEN |
| NATIVE-048 | `/admin/treasury` | Admin | None in path | Not identified | OPEN |
| NATIVE-049 | `/admin/treasury/grants` | Admin | None in path | Not identified | OPEN |
| NATIVE-050 | `/admin/users` | Admin | None in path | AdminReadPageController.java, LiveAdminUsersPage.java | OPEN |
| NATIVE-051 | `/admin/users/[id]` | Admin | Required / not bound | Not identified | OPEN |
| NATIVE-052 | `/admin/work` | Admin | None in path | Not identified | OPEN |
| NATIVE-053 | `/advisor` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-054 | `/announcements` | Public/member untraced | None in path | PublicPublicationPageController.java | OPEN |
| NATIVE-055 | `/announcements/[announcementId]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-056 | `/arcade` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-057 | `/bank` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-058 | `/bank/savings-pot` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-059 | `/blog` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-060 | `/blog/[slug]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-061 | `/board` | Public/member untraced | None in path | NativePublicFeaturePageController.java | OPEN |
| NATIVE-062 | `/board/[postId]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-063 | `/bonds` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-064 | `/businesses` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-065 | `/businesses/ventures` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-066 | `/calculators` | Public/member untraced | None in path | SpringNativeToolHubController.java | OPEN |
| NATIVE-067 | `/calendar` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-068 | `/casino` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-069 | `/central-bank` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-070 | `/chat` | Public/member untraced | None in path | NativeMessagingPageController.java, MemberPresentationPageController.java | OPEN |
| NATIVE-071 | `/clubs` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-072 | `/clubs/[clubId]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-073 | `/clubs/[clubId]/members` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-074 | `/clubs/new` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-075 | `/clubs/warfare` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-076 | `/collections` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-077 | `/dashboard` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-078 | `/data-deletion` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-079 | `/design-preview` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-080 | `/developer` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-081 | `/enterprises` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-082 | `/features` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-083 | `/forgot-password` | Public/member untraced | None in path | NativeAuthPageController.java | OPEN |
| NATIVE-084 | `/fx` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-085 | `/gallery` | Public/member untraced | None in path | PublicPublicationPageController.java | OPEN |
| NATIVE-086 | `/gallery/[photoId]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-087 | `/gallery/submit` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-088 | `/guide` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-089 | `/guide/career-mastery` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-090 | `/guide/dopamine-system` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-091 | `/guide/glossary` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-092 | `/guide/glossary/[term]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-093 | `/guide/stock-trading` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-094 | `/guide/virtual-banking` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-095 | `/help` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-096 | `/help/[slug]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-097 | `/inventory` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-098 | `/invite/[code]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-099 | `/kdic` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-100 | `/lobby` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-101 | `/login` | Public/member untraced | None in path | NativeAuthPageController.java | OPEN |
| NATIVE-102 | `/login/providers` | Public/member untraced | None in path | NativeAuthPageController.java | OPEN |
| NATIVE-103 | `/marketplace` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-104 | `/marketplace/auction` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-105 | `/mint` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-106 | `/newspaper` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-107 | `/pension` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-108 | `/prediction` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-109 | `/privacy` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-110 | `/profile` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-111 | `/profile/[userId]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-112 | `/profile/settings` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-113 | `/progression` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-114 | `/progression/prestige` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-115 | `/quests` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-116 | `/register` | Public/member untraced | None in path | NativeAuthPageController.java | OPEN |
| NATIVE-117 | `/reset-password` | Public/member untraced | None in path | NativeAuthPageController.java | OPEN |
| NATIVE-118 | `/roadmap` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-119 | `/safety` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-120 | `/safety/takedown` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-121 | `/search` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-122 | `/seasons` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-123 | `/shop` | Public/member untraced | None in path | NativePublicFeaturePageController.java | OPEN |
| NATIVE-124 | `/shop/catalog` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-125 | `/spaces` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-126 | `/spaces/real-estate` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-127 | `/status` | Public/member untraced | None in path | StatusSourceTruthController.java, StatusPresentationPageController.java | OPEN |
| NATIVE-128 | `/stocks` | Public/member untraced | None in path | PublicStocksReadOnlyPage.java, NativePublicFeaturePageController.java | OPEN |
| NATIVE-129 | `/stocks/[symbol]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-130 | `/stocks/alerts` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-131 | `/stocks/community` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-132 | `/stocks/compare` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-133 | `/stocks/derivatives` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-134 | `/stocks/history` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-135 | `/stocks/league` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-136 | `/stocks/portfolio` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-137 | `/stocks/watchlist` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-138 | `/support` | Public/member untraced | None in path | NativeMessagingPageController.java, MemberPresentationPageController.java | OPEN |
| NATIVE-139 | `/terms` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-140 | `/tools` | Public/member untraced | None in path | SpringNativeToolHubController.java | OPEN |
| NATIVE-141 | `/tools/capital-gains-tax-calculator` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-142 | `/tools/capital-gains-tax-calculator/[preset]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-143 | `/tools/compound-calculator` | Public/member untraced | None in path | SpringNativeCalculatorsController.java | OPEN |
| NATIVE-144 | `/tools/compound-calculator/[preset]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-145 | `/tools/crypto-apy-calculator` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-146 | `/tools/dividend-tax-calculator` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-147 | `/tools/dividend-tax-calculator/[ticker]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-148 | `/tools/farming-calculator` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-149 | `/tools/farming-calculator/[preset]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-150 | `/tools/fire-calculator` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-151 | `/tools/gift-tax-calculator` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-152 | `/tools/gift-tax-calculator/[preset]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-153 | `/tools/goal-wealth-calculator` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-154 | `/tools/isa-calculator` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-155 | `/tools/isa-calculator/[slug]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-156 | `/tools/kimchi-premium-calculator` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-157 | `/tools/kimchi-premium-calculator/[preset]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-158 | `/tools/loan-interest-calculator` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-159 | `/tools/loan-interest-calculator/[preset]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-160 | `/tools/pension-tax-calculator` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-161 | `/tools/pension-tax-calculator/[slug]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-162 | `/tools/quant-studio` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-163 | `/tools/real-estate-calculator` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-164 | `/tools/real-estate-calculator/[preset]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-165 | `/tools/retirement-calculator` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-166 | `/tools/retirement-calculator/[slug]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-167 | `/tools/salary-calculator` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-168 | `/tools/salary-calculator/[preset]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-169 | `/tools/stock-calculator` | Public/member untraced | None in path | SpringNativeCalculatorsController.java | OPEN |
| NATIVE-170 | `/tools/stock-calculator/[preset]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-171 | `/tools/tax-calculator` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-172 | `/tools/youth-leap-calculator` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-173 | `/tools/youth-leap-calculator/[preset]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-174 | `/treasury` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-175 | `/verify-email` | Public/member untraced | None in path | NativeAuthPageController.java | OPEN |
| NATIVE-176 | `/verify-email-change` | Public/member untraced | None in path | NativeAuthPageController.java | OPEN |
| NATIVE-177 | `/wallet` | Public/member untraced | None in path | NativeWalletController.java, MemberPresentationPageController.java | OPEN |
| NATIVE-178 | `/wallet/activity` | Public/member untraced | None in path | Not identified | OPEN |
| NATIVE-179 | `/wallet/activity/transactions/[transactionId]` | Public/member untraced | Required / not bound | Not identified | OPEN |
| NATIVE-180 | `/work` | Public/member untraced | None in path | Not identified | OPEN |


PR3351 merged as925f725d28. Exact source91f753bf8b CI44923868917 all four checks and candidate build44923833095 succeeded. The actual disposable PostgreSQL task and strict XML nonzero/minimum/failure/error/skip gates for catalog4/publication6 passed. The log directly printed messaging9/0failures/0errors/0skips; other class counts were not printed, so local tests are never relabelled as database results. New exact-main CI/artifact and real browser acceptance remain separate.
