# v2026.09.20.298 — Account route rebuild

- Rebuilds `/account` around identity/access tasks instead of a uniform card feed.
- Keeps identity, re-authentication and deletion authority unchanged while surfacing security, notifications and privacy as a dedicated account-tools rail.
- Adds regression coverage for semantic navigation, touch targets and destructive-flow continuity.
- Production remains blocked until the complete frontend rebuild passes its release gate.
