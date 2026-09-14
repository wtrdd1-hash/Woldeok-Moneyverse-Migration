# v2026.09.14.87 — Shop deadlines in Event Calendar

- Added server-authoritative shop sale-ending deadlines to `/calendar`.
- Deadlines come from the existing authenticated shop catalog; no guessed dates or new economy state are introduced.
- Sale-ending items are sorted by their authoritative `sale_ends_at` timestamp and capped to a concise upcoming list.
- Added focused tests for deadline filtering, ordering, limiting, and source-array immutability.
- Updated the Living Project Plan and Korean parity to reflect the implemented calendar slice.
