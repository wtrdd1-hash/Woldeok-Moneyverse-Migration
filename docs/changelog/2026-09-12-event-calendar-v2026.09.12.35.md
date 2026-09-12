# v2026.09.12.35 — Event Calendar re-home

- Re-homed the existing authenticated Event Calendar onto current `main` without replaying stale branch history.
- Added `/calendar` as a member-only, `noindex` page using authoritative season-event, daily-event, and weekly-goal APIs.
- Added member navigation entries so the calendar is discoverable from both full and grouped navigation.
- No database migration, reward mutation, or duplicate event state is introduced.
- Base main at re-home start: `a89e97b818fe4e12060aef9855b8a6df52721756`.
- Candidate branch: `integrate/event-calendar-v2026.09.12.35`.
- Production remains blocked until CI and exact-SHA isolated Test validation succeed.