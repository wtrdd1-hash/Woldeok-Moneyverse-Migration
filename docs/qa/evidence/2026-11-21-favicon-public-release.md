# Public favicon release evidence — 2026-11-21

Scope and limitations: [release receipt](../../releases/2026-11-21-favicon-public-production.ko.md). Actual source/Test/Production evidence only; no private balances or account identifiers. The25Production checks cover layout, not all actions.

```json
{
  "applicationSource": "93a3c8dbe8c04fda28689904ffe43a86992c73c1",
  "ciRun": 44759127347,
  "allFourJobs": "SUCCESS",
  "jarSha256": "af0913b0546716871ad57e3fb49b893a4cb662b4a5078882db8707158b6b6cc0",
  "branchExactBrowserCases": 280,
  "mainExactBrowserCases": 125,
  "mainApplicationByteParityEntries": 1829,
  "productionLayoutCases": 25,
  "productionWidths": [
    320,
    359,
    360,
    390,
    1440
  ],
  "productionAuthenticatedHomeContinuity": true,
  "backendIntegerDisplayMatch": true,
  "personalValuesRecorded": false,
  "toolsAccountHeader": "OPEN_STATIC_LOGIN",
  "newFeatureRoutesEnabled": false,
  "databaseMutations": false,
  "nginxCompatibilityCases": 10,
  "testExternalBrowser": {
    "home": 403,
    "favicon": 403
  },
  "testTrustedLoopback": {
    "home": 200,
    "favicon": 200,
    "versionSource": "93a3c8dbe8c04fda28689904ffe43a86992c73c1"
  },
  "productionNginxSha256": "b5aa4016f12470bc975999b803b2462236a298e7f76119424b085165edc9fc24",
  "extraPreexistingNodeQa": {
    "pass": 13,
    "fail": 5,
    "state": "OPEN_NOT_WAIVED"
  },
  "fullApplicationAcceptance": false
}
```
