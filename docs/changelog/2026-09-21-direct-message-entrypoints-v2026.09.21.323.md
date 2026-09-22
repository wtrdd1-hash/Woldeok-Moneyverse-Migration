# v2026.09.21.323 — Cross-surface Direct-Message Entry Points

Date: 2026-09-21
Type: Planning / documentation only

Expanded the existing urgent 1:1 private-chat plan to cover message initiation from board post/comment authors, profiles, member ID/username/nickname search and eligible member-list surfaces.

Key decisions: canonical server-side member ID is the only target identity authority; existing DM eligibility remains the single authorization policy; board/profile/search/list share one frontend member-action primitive; repeated initiation opens one canonical pair conversation; sensitive peer state is not disclosed; search and stale-identity behavior must resist enumeration and misrouting; mobile navigation returns to the originating context.

No runtime, DB, API deployment, realtime infrastructure or Production change was performed in this cycle.
