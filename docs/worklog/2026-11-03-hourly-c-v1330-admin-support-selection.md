# Development C v1330 — Admin support selected-thread boundary

- Start: origin/main e325d3ef827441f807734178cfcd8fe72d7061be; miniPC Debian 13.6 healthy; existing dirty root worktree untouched.
- Mid: P1 issue: untrusted `?thread=` triggered private messages read even if thread absent from authorized list. Member support already restricts selected ID; admin support did not.
- Change: select only an ID present in the returned authorized thread list, otherwise fall back to first authorized thread. Preserve existing admin guard and API contract; no DB changes.
- Release: HOLD pending exact-SHA full CI, isolated Test, E2E and GitOps gates. No production deployment.
