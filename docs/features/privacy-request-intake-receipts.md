# Private privacy-request intake receipt CSV

Authenticated members can download **up to 30 recent intake receipts** from the Privacy Center. The source is `privacy_list_my_requests(actor, 30)` through the existing session-bound NestJS service; the browser never supplies the account ID. Each receipt contains request ID, type, status (`received`), submission time and the member's own submitted detail. The download is **not** a copy of personal data, an exhaustive history, proof of legal processing, or evidence that a deletion or access request has been fulfilled.

`GET /api/v1/privacy/requests/snapshot` returns `{scope: 'recent_intake_receipts', limit: 30, requests}`; the web `GET /account/privacy/requests.csv` validates the complete shape and sanitizes spreadsheet formulas. Android `GET /app-api/v1/privacy/requests/snapshot` uses the authenticated cookie jar and receives private `no-store`, `noindex` and `nosniff` responses. The endpoint is read-only, adds no migration and writes no ledger data.

**Release hold:** Production and Test promotion require exact SHA full CI, isolated PostgreSQL ACL and real user-flow verification, security/a11y/SEO, and authorized GitOps release gates. Rollback before merge is simply retaining the Draft PR; after any authorized deployment, revert the isolated read-only endpoint and UI through a reviewed rollback PR.
