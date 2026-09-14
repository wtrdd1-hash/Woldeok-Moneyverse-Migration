# Changelog — App API Runtime v2026.09.14.2

- Restores production-compatible verification mail through a loopback-only SMTP relay contract; unauthenticated remote SMTP remains forbidden.
- Locks the native OAuth `mobile_client` challenge flag with regression coverage after the v2026.09.14.1 browser handoff fix.
- Promotes Google Play account/data deletion pages as first-class public sitemap routes and regression-checks both URLs.
- Expands the canonical mobile API specification with crash-free client handling, signup SMTP failure semantics, OAuth completion, re-consent, deletion APIs, retention windows, and release QA.
- Carries forward v56 read-budget and v57 signup-wallet contract fixes for Production promotion.
