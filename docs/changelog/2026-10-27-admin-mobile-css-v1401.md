# v2026.10.27.1401 — Internal deployment and static asset integrity changelog

- **Problem:** Live SSR HTML included a removed Next.js CSS chunk after a build directory was mutated while the Next.js process remained running.
- **Evidence:** `3354/admin` referenced `07n3_vyoxfswp.css` (HTTP 500), while new candidate `3384/admin` referenced `1o54v_05nxpad.css` (HTTP 200). Candidate had 5/5 linked CSS assets available.
- **Changes:** Runtime preflight verifier for HTML-linked CSS, five no-network unit regression tests, bilingual records.
- **Controlled rollback:** Keep the previous runtime on 3354 until the new generation has passed external smoke, exact-run asset checks and session-continuity checks. Change only the Nginx frontend upstream as the last step, using a verified backup and `nginx -t` before atomic reload.
- **Release gate:** A GitHub commit alone does not certify Test or Production. See worklog for exact evidence and any unverified gates.
