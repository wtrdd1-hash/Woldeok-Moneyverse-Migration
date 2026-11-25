# Instagram reference: 100 UI names for AI-assisted UI specification

> **Version:** v2026.11.22.2041.1
> **Status:** PLANNING / VERIFIED SOURCE REFERENCE, NOT AN APPROVED REDESIGN
> **Canonical language:** English · [한국어](2026-11-22-instagram-uxwoodytips-ui-100-v2041.ko.md)
> **Project:** Woldeok Moneyverse — November 18 owner-approved Spring MVC + Thymeleaf PC/mobile website
> **Source:** [Original Instagram reel](https://www.instagram.com/reel/DgB83_Fh4NP/) · [Creator profile](https://www.instagram.com/uxwoodytips/)

## 1. Provenance and limits

- **Publisher:** Instagram `@uxwoodytips` (profile display name "우디 | 디자이너 취업, 포폴 코칭").
- **Published:** November 21, 2026 (as stated in publicly accessible Instagram metadata).
- **Reel title:** `UI 이름 100개, 몇 개나 알고 계세요?` ("How many of these 100 UI names do you know?").
- **Main message:** When asking an AI to create an interface, specify precise UI pattern and component names rather than saying only "make it beautiful." The creator says the complete UI dictionary is linked in their Instagram profile.
- **Verification:** Official page metadata and Instagram oEmbed inspected on the mini-PC on November 22; the publicly accessible **22-second reel video** was separately retrieved transiently and multiple frames manually reviewed. This document reflects only text clearly visible in those frames and a short paraphrase of the caption. The profile-linked complete glossary/document was **not** retrieved, and **the full set of 100 names is NOT verified**.
- **Archiving policy:** Preserve the original URL, publication metadata, inspected concept inventory and project interpretation. Do **not** commit the creator's video, screenshots, CDN signed links or third-party dictionary to the project. External links can change or expire; the reference is not code or production truth.

## 2. Terminology visibly confirmed in the video

These labels were read directly from sampled video frames (around seconds 4, 7, 10, 13 and 16). Some are deliberate **comparisons**, not interchangeable synonyms.

| Category | Visible names (Korean / English) | Interpretation for specification |
| --- | --- | --- |
| Choice controls | 토글 vs 체크박스 / Toggle vs Checkbox; 라디오 vs 체크박스 / Radio vs Checkbox; 빠른 선택 칩 / Quick chips | Immediate setting versus selected state; exclusive versus multiple selection; compact suggested choices |
| Layout and navigation | 히어로 / Hero section; 벤토 그리드 / Bento grid; 카드 그리드 / Card grid; 스플릿 / Split screen; 페이지네이션 / Pagination | Section hierarchy, dashboard clusters, responsive cards, side-by-side panes and paginated result sets |
| Time/selection | 캘린더 / Calendar; 기간 선택 / Date range; 휠 피커 / Wheel picker | Calendar input, bounded period query, touch-friendly rotating selector |
| Feedback and overlays | 토스트 vs 스낵바 / Toast vs Snackbar; 모달 등장 / Modal present; 모달 vs 바텀시트 / Modal vs Bottom sheet; 바텀시트 vs 드로어 / Bottom sheet vs Drawer; 푸시 / Push | Different notification persistence/actions, modal layout and mobile contextual surface placement |
| Positioning and controls | 플로팅 vs 하단 고정 / Floating vs Sticky; 액션 버튼 / Action button; 베지 버거 / Veggie burger | Floating overlay versus fixed bottom action; explicit primary CTA; menu icon variant as labeled by creator |
| Motion and transitions | 페이드 업 / Fade up; 이즈 인 / Ease-in; 스프링 / Spring; 공유 요소 / Shared element; 확대 전환 / Zoom transition | Animation primitives: controlled timing, transitions and continuity; honor reduced-motion preference |
| Cognitive/UX concepts | 앵커링 / Anchoring; 기본값 효과 / Default effect; 피크엔드 법칙 / Peak-end rule | User perception principles, **not** reusable code component names |
| Content/access | 약관 동의 / Terms agreement; 플레이스홀더 / Placeholder | Separate consent capture and incomplete/empty input affordances |

Also visible in smaller or partially cropped cards, but **not counted as independently fully verified vocabulary**: top tabs, splash screen, mask reveal, hamburger, knob, loss aversion, stairs. Do not silently expand this into a fabricated list of 100.

## 3. Moneyverse implementation interpretation — proposal, not adoption

| Existing owner-approved area | Precise UI design instruction to use in a future task | Required product/security condition |
| --- | --- | --- |
| Member homepage and market dashboards | 240px desktop sidebar, five-item mobile dock, responsive **Bento grid/Card grid** as appropriate; reserve **Hero section** only for a genuine priority | Preserve November 18 navy/violet visual authority, existing route/action hierarchy and source-backed financial figures |
| Bank, cards, deposits, money transfer | **Radio** for one account/card choice, **Checkbox** for separately selectable options, **Toggle** only for immediate Boolean settings, **Date range** for transaction filters | Real Spring API and source-of-truth monetary receipts; no fictitious transfer/issuance success or balances |
| Admin lists, support and member history | **Pagination**, clear **Tabs**, **Toast/Snackbar** for truthful feedback, contextual **Modal/Bottom sheet** for tasks with correct focus behavior | Actual authenticated/authorized data, server-side permission checks, error states, and documented audit scope |
| Global member chat and admin support | One accessible **Floating action button**, mobile safe-area clearance; don't duplicate an existing sticky CTA | Existing globally available contact/chat owner instruction; strict user/admin role isolation; no fake send-success |
| Social authentication | Use accurately labeled Google and Discord login actions as required by the existing approved authentication contract | **Do not remove, invent or change providers** based on this design reference; require actual end-to-end login QA |
| All browser pages | Prefer semantic HTML forms and consistent responsive components; use **Fade up / Spring / Shared element** only where motion improves comprehension | Keyboard/focus/ARIA, WCAG 2.2 AA, reduced motion, EN default with KO/JA/ZH/VI auto-detection and manual override |

Sample request format for AI-assisted coding: "For the bank transaction-history page, implement a responsive Card grid with a Date range filter, server-backed Pagination and an accessible Toast/Snackbar error state, matching the owner-approved November 18 styles. Use real authenticated Spring data; verify 320/390/768/1440 px and all supported locales. Do not change OAuth providers or infer transaction success."

## 4. Verification gates before any code or release

1. Match each proposed pattern against the **current** approved `PROJECT_PLAN.md`, integrated master and November 18 design authority. The reel is a learning resource, not approval for an unrequested redesign.
2. Confirm exact existing Spring routes, JSON contracts, authenticated source data and server-side permissions. No fake figures, user identity, financial transactions or notification delivery.
3. Create an isolated feature branch/worktree for implementation, with task start/mid/finish records and collision checks against Gemini/other agents.
4. Validate desktop/mobile layout, accessibility, keyboard-only interaction, error/loading/empty states, EN/KO/JA/ZH/VI language parity and no duplicated support launcher.
5. Require real end-to-end Test evidence (including Google/Discord auth and positive/negative API data paths), security and rollback gates before any zero-downtime Production promotion.
6. If the creator's complete dictionary becomes independently accessible, verify its license, enumerate the actual 100 entries against the source and revise this research note as a **new version**. Do not claim completion now.

## 5. Change and handoff

This entry is **documentation and source analysis only**. It does not create or replace website UI, alter Google/Discord login, install external services, modify databases, deploy Test/Production or authorize copying copyrighted design assets. See the [EN worklog](../worklog/2026-11-22-instagram-ui-glossary-v2041.md) / [KO](../worklog/2026-11-22-instagram-ui-glossary-v2041.ko.md) for start, midpoint and outcome evidence.
