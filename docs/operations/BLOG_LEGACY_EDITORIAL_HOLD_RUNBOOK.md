# Legacy AI blog store — editorial hold and emergency write containment

**English canonical | [한국어](BLOG_LEGACY_EDITORIAL_HOLD_RUNBOOK.ko.md)**

## Current authority and protection (2026-10-16)
- Production v717 and Test v721 correctly reject unaudited AI `POST /api/blog/generate`, but rollback-era v600/v635/v697/v712 standalone frontend processes still have old writer routes on non-public loopback ports. Nginx only proxies public Production to v717 :3234. Do not assert which legacy caller created the 16:16:41 article without a per-request receipt.
- Shared content store `/srv/moneyverse-data/shared/blog-posts.json` is `debian:debian` with `0444` mode, backed up at `/srv/moneyverse-tasks/ai-blog-v721/blog-posts.before-readonly.json` (restricted). Verified SHA256 `f146cd031e63054f72dc3289f6b7d270fcff29f81e2a20d4260e471d8b8dddd3`, preserved on permission change. Direct JSON file writing is blocked for ordinary runtime user; reads are healthy. This is file-level containment, not a mandatory-access or directory rename safeguard against privileged/root writers.
- Legacy generated posts stay archived and readable by direct URL in v721 Test, with `noindex,follow`; they are excluded from discovery APIs and sitemaps. GSC deindex cannot be presumed until crawler/index evidence appears.

## Evidence and alert checks (read-only)
1. `stat -c '%a %U %G %s %y' /srv/moneyverse-data/shared/blog-posts.json` and `sha256sum` before/after any action. Record count and latest `publishedAt` using GET `/api/blog` on Production only while v717 is still live; after v721 deploy that API hides legacy posts and cannot be used as raw-store count.
2. `systemctl list-units '*moneyverse*' --all` to inventory live old process versions, and `nginx -T` **with redaction** to verify the active proxy port. Never call old `/api/blog/generate` just to check it: old versions may actually publish.
3. Alert if file mode returns to writable or checksum/mtime changes unexpectedly. Journal searches must target specific service units and redact headers/tokens, not dump unfiltered gateway logs.
4. Runtime health smoke: Production `/blog`, Test `/blog`, read-only country pages and `/sitemap-blog.xml`. Never equate HTTP 200 with indexing.

## Conditions to restore publishing
- Stop/retire or strictly isolate all old generator-capable runtime services **with ownership/concurrency review**, while keeping immutable binaries and tested rollback path. No second active scheduler should target a writer.
- Add an immutable approval receipt per article (source URLs, retrieved/as-of date, jurisdiction/editor approval, content hash/semantic similarity, quality and licensed image review). Use an idempotent publication job with durable locking and verified persistence; no hardcoded token fallback. The route must fail closed when a write fails, rather than returning false success.
- Promote that implementation through separate PR, full CI, exact-source Test and session/DB checks. Only after approved release and backup validation may an operator, in a controlled change window, restore write permission if this file remains the approved store. Record actor, expected writer, checksum, diff and rollback receipt. **Do not simply run `chmod 644` while old servers exist.**
- Production financial/authorization/166-page UI gates are independent and never waived by this limited blog protection.
