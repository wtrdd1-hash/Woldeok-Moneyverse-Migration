# Implementation plan — P0 bank pocket customization fee contract

1. RED: assert repository never calls fee-bearing SQL without an authoritative quote; assert controller returns HTTP 503 and no repository write.
2. GREEN: dedicated BankFeeContractUnavailableError; repository throws before DB query; controller maps it to ServiceUnavailableException without exposing SQL.
3. Preserve unrelated bank operations; replace legacy overload test with containment assertion.
4. Verify exact SHA, record failures, Draft/HOLD PR stacked on #2069, coordinate #2070 and Frontend C. Never claim fee mismatch resolved.
