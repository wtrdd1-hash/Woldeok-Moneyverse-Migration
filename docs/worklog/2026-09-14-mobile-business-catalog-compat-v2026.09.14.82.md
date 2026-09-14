# Internal worklog — v2026.09.14.82

## Scope
Fix native-app business cards rendering literal `null` for purchase price and expected profit while preserving the existing web/backend contract.

## Root cause
The backend business catalog already returns canonical camelCase fields (`purchaseCost`, `dailyRevenue`, `dailyOperatingCost`). A released native client expects older semantic aliases for price/profit, so names render while numeric values resolve to null.

## Change
Compatibility aliases are added only in the public app gateway response transformation. Canonical backend DTOs and database data remain unchanged.

## Promotion order
1. Branch CI / lint / typecheck / tests / build.
2. Push test candidate.
3. Verify the exact SHA on isolated test, including backend/API response.
4. Merge to `main` only after the change is validated.
5. Allow the existing exact-SHA production gate and GitOps promotion to publish production.
