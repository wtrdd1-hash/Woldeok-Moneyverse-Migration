# Stock market read-only query validation — B v603

1. Add direct controller tests that demonstrate malformed limit/interval being accepted or reaching service before rejection; assert no service call for invalid query.
2. Add a strict canonical decimal parser in stock controller, with defaults left unchanged. Limit sparklines and prices to 1..240, candles to 1..400; only allow existing candle interval values.
3. Run focused tests, backend typecheck, full unit/build/lint, SQL/ACL read-only checks in an isolated PostgreSQL container if available. No production/dev DB writes.
4. Push a draft HOLD PR with exact SHA and complete CI/security/Test release gate evidence; do not merge without independent Test exact-SHA certification.
