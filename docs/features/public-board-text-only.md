# Public board — text-only discovery (A 2026-11-02 18:25)

**English canonical** | [한국어](public-board-text-only.ko.md)

The public `/board` search offers **All posts** and **Posts without photos**. The optional `media=text` query may be combined with existing `q` (literal title query) and `stock` (stock symbol). It only filters the **50 most recent public posts** returned by `public.member_board_public_list_with_stock(50)`, not the full archive. It is not a full-text or archive search.

Nest GET `/api/v1/board/public/stock-posts?media=text` validates exact `media=text`, rejects unknown/duplicate parameters, and returns `{posts,filterApplied:'text'}` even when verified empty. SQL filters `image_storage_key IS NULL` **after** the existing public SECURITY DEFINER function; no direct table grants, migration, money writes or identity exposure are added. The service refuses to attest rows with images. The web distinguishes verified empty from unavailable/malformed upstream evidence, and does not index filtered results.

Android GET `/app-api/v1/board/public/stock-posts?media=text` validates the marker, bounded rows, UUID uniqueness and no-image proof before accepting a success. Unverified success returns 503. Filtered HEAD returns 405 rather than pretending bodyless source proof. Filtered success/error responses are no-store/noindex/no-referrer. Rollback: omit `media` and use existing All posts; no schema or data rollback is required.

**Release HOLD:** all required exact-SHA gates, real DB/ACL, isolated Test authenticated flow, independent restore, Production provenance and GitOps authorization must pass before merge/promotion. This document is not deployment approval.
