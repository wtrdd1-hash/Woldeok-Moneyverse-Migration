# Production Home UI vs Approved Design — Worklog v2026.11.19.32.1

Date: 2026-11-19 KST
Status: STARTED — independent evidence-only documentation; no frontend/runtime operations.
Owner: ChatGPT
Branch: `docs/home-ui-actual-v20261119-32`
GitHub main at start: `78a3ff446fae1ee4754da6edd14b7fc3409f43a2`
Concurrent image owner: `docs/restore-ui-image-assets-v20261119-31` (v31 already merged to main). Do not modify their assets.

## START — before edits
Owner supplied a 783x1536 mobile screenshot of easy-scraping.com showing a design-gallery homepage headed '신규 사용자 유입을 위한 홈 화면 3안', green visual style, a quest card, bottom navigation and floating controls, and reported that the approved new frontend design is not properly applied. Requested detailed durable documentation of images and limits, not another unverified completion claim.
- Inspected GitHub main and local mini-PC main separately: remote main v31 image-restoration commit 78a3ff4; local main fa36b7b has more Spring work not yet equivalent to GitHub main. Only remote main is branch base. Master/planning/docs authority and v31 handoff reviewed.
- Independently requested public `https://easy-scraping.com/` on 2026-11-19 11:11 KST: HTTP 200, 113884-byte response, exact design-gallery H1, '실시간 라이브 연동' and 'Chrome Modern Web 1.0' present in HTML.
- Read-only mini-PC snapshot `/srv/moneyverse-data/frontend-static/index.html` at 2026-11-19 11:07 KST contains the same heading/labels. New UI design PNGs exist in remote main as `docs/design/.../previews/home.png`, `docs/images/showcase/home-mobile.png`/desktop, `docs/design/.../references/admin-console-*.png`.
- User screenshot SHA256: `306fa75c03997e91c94da4697219b3a3637608bc0931029567ea815879a6cfeb`. Attachment bytes exist in the user conversation sandbox, not mounted on the mini-PC; do not invent a GitHub image path for the attachment.
- Prior UI design PRs #3268/#3270 closed unmerged; v31 restored 180 route-concept PNGs and 2 admin refs to main, but design assets remain planning-only. Frontend source `frontend/src/app/page.tsx` is not the same as the currently served design-gallery HTML.
- Owner directive from newer mini-PC integrated docs: **all web frontend and APIs ultimately Spring Boot MVC/Thymeleaf**, EN first / KO second; preserve existing features, no Node/Next runtime fallback, G0–G6. Document conflict between this local/latest directive and older published remote-master sections without silently suppressing either.
- QA caution: local v30 JSON board reports '180 verified' but local v30 master says only 5 native Production routes; JSON is not versioned on remote main. Treat unverified tally as conflicting and request route-by-route external proof, not a completed migration.

## MID — documentation and verification
- Reconfirmed public HTML and the mini-PC static file contain the three-design-gallery H1; author/deployer attribution remains unproven.
- Rechecked latest public main 78a3ff4 versus newer local main fa36b7b; avoided image asset conflicts with v31 owner.
- Completed bilingual detailed 14-item P0/P1 limitations and 10 implementation gates; embedded home/mobile/desktop and admin reference images with stable relative links.
- Verified 35 local documentation links (including 16 image references across four principal docs), zero missing targets.
- The user JPEG is a current conversation attachment, not a mounted GitHub file; no fictitious image URL committed.
- Site HTTP verification is read-only; authenticated/browser/finance feature QA and Spring deployment were not performed.


## END — evidence-only handoff
- Local image/document references validated; git diff --check pass; no production frontend/Spring/Nginx/DB/ops changes.
- Deliver via isolated documentation PR on published GitHub main, preserving Gemini image branch and historical records.
- Homepage content mismatch CONFIRMED/UNFIXED; mobile green placeholder root cause and exact occlusion require browser measurement.
- Requires separate Spring frontend implementation, exact-SHA Test, authenticated/ledger browser QA and independent rollback before release.
- Internal updates remain ignored locally and are not force-added.
