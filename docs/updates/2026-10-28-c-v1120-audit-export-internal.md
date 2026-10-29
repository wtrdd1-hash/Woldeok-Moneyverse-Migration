# C v1120 internal update (English canonical)
- Audit export P1: spreadsheet formula injection in CSV; paginated export scope was not explicit.
- Implemented pure CSV serializer and current-page CSV/JSON scope/accessible labels; existing authenticated NestJS/PostgreSQL audit query contract unchanged.
- TDD RED -> 11 GREEN, existing page 6 GREEN; final exact-SHA release gates to be recorded in PR. No Test/Production/DB mutation.
