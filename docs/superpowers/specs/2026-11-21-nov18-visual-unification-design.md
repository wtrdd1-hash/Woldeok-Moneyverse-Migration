# Nov18 visual unification design

The owner asks to remove the confusing mixture of visual designs first. Existing Nov18 specifications, favicon artwork, PC-first responsive requirements, real backend connections, and prior implementation/release authorization remain binding. Work on MiniPC only.

## Architecture decision

Use the existing Spring presentation process and shared Thymeleaf navigation as the visual authority. The accepted26 native pages retain their templates and clients. Legacy Spring-served HTML receives a scoped compatibility skin and shared navigation fragment, while its original main content, forms, IDs, handlers, API URLs, account controls and support widgets remain in place. This is a visual migration, not certification that captured Next content has been ported to native business views. Do not introduce an iframe, replace all pages with a dashboard, invent metrics, remove working controls, or broaden API/administrator permissions. A complete per-feature native rewrite would be a separate, larger delivery and risks regressing working forms in this design-first request.

New native components: a DB-free GET-only navigation/error presentation controller; shared member/admin sidebar fragments; a scoped legacy adapter and stylesheet. The adapter adds a sibling navigation portal after document load, never reparents/replaces business DOM. Only known legacy site navigation is visually superseded. Existing header locale/account controls remain mounted and interactive. It reads the document language to label owned navigation and never writes another language preference or reads private form values. If the fragment fails to load, the legacy view remains usable. The existing native header gets an explicit mobile favicon and every native support launcher clears its bottom navigation by at least16px.

The six palette values are #0C1020/#151D32/#9C83FF/#64B7FF/#E9F1FF/#A8BCD8. Green/red retain semantic status meaning. A neutral, type-safe card/table/input/button system skins legacy content without rewriting business text or financial values. Current favicon artwork is reused.

## Operational boundary

Apply versioned, exact-source styles/adapter only to an inventoried set of HTML page routes. API, authentication mutations, socket traffic, unknown asset versions and admin auth_request gates remain intact. Existing non-success page responses retain status and use a shared Nov18 error presentation only when the request is an HTML document; JSON/API responses never become HTML200. No database, ledger, session/key rotation, TOTP policy or financial hold change. Immutable candidates, exact-SHA CI, protected isolated Test, actual browser regression, independent source/ops review and bounded rollback precede any Production traffic update. Retained page clients/static assets are preserved until their own functionality migration is accepted.

## Acceptance

One consistent navy/violet visual family across the inventoried user/admin routes and error states, real favicon in visible desktop/mobile headers, no duplicate global navigation/support launcher, no business DOM/control loss, keyboard/focus/reduced-motion behavior, no viewport overflow at320/360/390/430/768/1024/1440/1920 and no16px spacing regression. Real source data and unavailable/error states remain truthful. Run actual search/filter/calculator/tab/menu flows and compare before/after controls/GET routes on the existing68 rendered pages; unavailable routes remain explicitly unavailable. Five-language shell labels are tested independently of pre-existing untranslated business copy. Do not report all financial/backend functions as fixed by this design work.
