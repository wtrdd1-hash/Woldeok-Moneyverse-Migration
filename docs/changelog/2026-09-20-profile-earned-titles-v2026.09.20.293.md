# v2026.09.20.293 — Profile earned-title picker

- Add least-privilege `member_earned_titles` DB read and `GET /profile/titles` API/App API coverage.
- The profile editor now offers only titles actually awarded to the signed-in member instead of every seeded title.
- Preserve a currently displayed legacy title so a replacement profile save never clears it accidentally.
- Verification: backend/frontend typecheck, backend suite, frontend suite, mobile API contract generation/check and exact-SHA CI before merge.
