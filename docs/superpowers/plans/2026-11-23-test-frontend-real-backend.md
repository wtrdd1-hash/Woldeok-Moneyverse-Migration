# Test-only execution addendum
Owner scope: independent Test frontend connected to a real backend; no Production promotion. This narrows the already approved native frontend rebuild plan.
1. Baseline: serial Gradle tests, identify exclusions separately.
2. TDD: real Thymeleaf render covers shared game stylesheet digest, unchanged favicon, five locales, no synthetic active telemetry; fix only demonstrated regressions.
3. Runtime: package exact committed source; candidate CI must pass applicable jobs. Use database-free frontend-presentation mode and explicitly configure BOTH source clients to existing real Test API55438. Never default to4550.
4. Test ingress: copy original site config root-private; transform ONLY test.easy-scraping.com block, fixed native page/assets/read API allowlist. Reject source drift. Validate nginx syntax, then reload. Production block stays byte-identical. Unknown pages/unsupported writes stay closed rather than proxy to Production.
5. QA: actual Test origin, fresh Chromium contexts, source identity, backend API shapes, PC/mobile/five locales, icon bytes, overflow/errors, safe calculator interactions. No credential or financial mutation from a production member.
6. Document actual scope, test results, unsupported routes and deployment state. Finish with a fresh review and required fixes.
