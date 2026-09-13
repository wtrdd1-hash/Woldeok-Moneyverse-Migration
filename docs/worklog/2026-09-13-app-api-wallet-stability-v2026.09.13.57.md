# v2026.09.13.57 — App API registration/wallet stability

- Adds a real-DB regression assertion that local registration provisions a readable USER_CASH/USER_BANK wallet.
- Documents wallet WLD fields as decimal strings, never JSON numbers.
- Defines empty recentTransactions as valid for new accounts.
- Requires native clients to isolate API failures instead of terminating the process.
- Continues P1 app-API stabilization on top of the v56 startup read-budget fix.
