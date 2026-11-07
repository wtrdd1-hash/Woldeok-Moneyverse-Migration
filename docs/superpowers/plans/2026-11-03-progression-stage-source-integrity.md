# Progression Stage Source Integrity — v1315
## Intent
Member growth-stage UI must never present malformed Nest/SQL responses as achieved stages, and must distinguish a verified null (not yet computed) from transport/shape failure. Keep credit, unlock, and finance contracts untouched.
## Design
Read authenticated Nest GET /api/v1/progression (SECURITY DEFINER progression_my_status). Pure parser accepts {progression:null} as verified-uncomputed, or an object with safe stage code, valid timezone-aware timestamp, nullable next-stage code and nonnegative safe integer requirement counts. Anything else is unavailable. Unknown future stage codes are preserved without inventing ladder membership. The page renders a retry link only on unavailability, retaining mobile layout and noindex metadata.
## Tasks
1. Add Vitest RED cases in frontend/src/app/progression/stage-evidence.test.ts for valid/invalid envelope, nullable state, unknown future code, timestamps and requirements.
2. Implement frontend/src/app/progression/stage-evidence.ts; verify GREEN.
3. Connect parser to frontend/src/app/progression/page.tsx; add accessible retry link and page source regression test.
4. Run exact HEAD checks, full gates, real PostgreSQL if isolated and safe, record failures, and open Draft PR only. No merge/release on any failure.
