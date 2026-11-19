# Admin Console + Global Floating Chat — Visuals and Interactive Preview

Version: `v2026.11.18.13` | Status: ISOLATED DEMO ONLY | User locale: Korean design review; planned app defaults: English and Korean.

The existing frontend was **not edited**. Do not deploy the preview as a production admin route. It contains **no real member data**, network API calls, credentials, persistent chat records, or working message submission.

> **Recovered implementation handoff (v2026.11.19.31):** [English](../UI_IMAGE_IMPLEMENTATION_HANDOFF_v2026.11.19.31.md) · [한국어](../UI_IMAGE_IMPLEMENTATION_HANDOFF_v2026.11.19.31.ko.md). Originally unmerged PR #3270; no Spring admin/chat integration is implied.

## Administrator reference concepts

- [Desktop administrator console and global chat concept](references/admin-console-desktop.png)

![Administrator desktop design](references/admin-console-desktop.png)

- [Mobile administrator console and global round chat launcher concept](references/admin-console-mobile.png)

![Administrator mobile design](references/admin-console-mobile.png)
- [English specification](../../planning/ADMIN_GLOBAL_CHAT_DESIGN_v2026.11.18.13.md) / [한국어 기획](../../planning/ADMIN_GLOBAL_CHAT_DESIGN_v2026.11.18.13.ko.md)

## Prototype review archive (not carried into main)

The historical animated/static preview and original editable SVG assets remain only in closed PR #3270 Git object history. They were excluded from this CI-conforming main handoff because the repository intentionally disallows executable or vector documents inside `docs/` as a release security gate. The actual PNGs in this directory are safe visual references **only**; the Spring UI, authentication, chat backend and real routes must be implemented/tested separately.

## Implementation and QA boundary

Existing deployed `FloatingSupportChatWidget` already supports ticket and DM flows but is suppressed for /admin routes. Do not simply remove that guard. The Java Spring support/chat endpoints currently accept spoofable user identity headers and some failure paths return `success:true`. Production integration is blocked pending security fixes, authenticated negative tests and explicit release review.

**Design screenshot ≠ live system state.** Test/Production frontend, database and Spring services were not changed.
