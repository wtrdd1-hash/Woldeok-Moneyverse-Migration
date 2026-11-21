# 2026-11-20-native-presentation-production-receipt

Observed final public presentation source42422aab0d3bed3399a27819c6eb774cfd1a933a. This record does not certify member/admin/financial operations.

These are human-readable QA records, not application configuration.

```json
{
  "deployment": {
    "status": "PUBLIC_PRESENTATION_PROMOTED",
    "scope": "home-tool-hubs-two-calculators-only",
    "sourceSha": "42422aab0d3bed3399a27819c6eb774cfd1a933a",
    "workflowRun": 44736479741,
    "jarSha256": "e3d01bef2605147cfabae4ff4f45d33489c05550bb6f593cfc4f8f3315ee23b6",
    "siteBeforeSha256": "32ae88abce5534de8873ae8731e34c4eb8c596e0667913f4fa2954f19934de35",
    "siteAfterSha256": "66cbd107a4af20848aaf9573b37c5ceb7a9521e8d8525a1fbf7a475efa0a1276",
    "pages": [
      {
        "path": "/",
        "status": 200,
        "bodyMatchesMainArtifactOrigin": true
      },
      {
        "path": "/tools",
        "status": 200,
        "bodyMatchesMainArtifactOrigin": true
      },
      {
        "path": "/calculators",
        "status": 200,
        "bodyMatchesMainArtifactOrigin": true
      },
      {
        "path": "/tools/compound-calculator",
        "status": 200,
        "bodyMatchesMainArtifactOrigin": true
      },
      {
        "path": "/tools/stock-calculator",
        "status": 200,
        "bodyMatchesMainArtifactOrigin": true
      }
    ],
    "legacyVersionPolicyPreserved": true,
    "legacyBackendPidUnchanged": true,
    "existingApiStocks": 10,
    "existingApiPosts": 2,
    "anonymousSessionPrivacyPassed": true,
    "signupHoldsPreserved": true,
    "productionDatabaseModified": false,
    "rollbackAvailable": true,
    "promotedAtUtc": "2026-11-20T12:53:58.696420+00:00"
  },
  "controlPlaneObservation": {
    "cutoverSiteSha256": "66cbd107a4af20848aaf9573b37c5ceb7a9521e8d8525a1fbf7a475efa0a1276",
    "observedCurrentSiteSha256": "1881ba134b9c278c097af84c21b555bd592a78cbf086d781cf8f0bbe23ad6157",
    "concurrentChange": "separate operator actuator access hardening; not authored by this presentation task",
    "presentationConfigOtherwiseIdentical": true,
    "rollbackPreservesConcurrentActuatorHardening": true,
    "registrationHoldsPreserved": true,
    "rollbackCandidateSha256": "de6993283b324863a742358d9c74d3d007291101b1337a187e5bc6a238261d65",
    "rollbackDrySyntaxExit": 0,
    "rollbackApplied": false
  },
  "browserEvidence": {
    "preReleaseSourceSha": "44da60339c6c0d17d12d2cb49ec3dc003327b437",
    "preReleaseCases": 50,
    "productionSourceSha": "42422aab0d3bed3399a27819c6eb774cfd1a933a",
    "productionCases": 10,
    "failedCases": 0,
    "preReleaseToCiIdenticalTemplatesAssetsLocaleEntries": 45,
    "authenticatedBrowserObserved": false,
    "wholeSiteCertified": false
  }
}
```
