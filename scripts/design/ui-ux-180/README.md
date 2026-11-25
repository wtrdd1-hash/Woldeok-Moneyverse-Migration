# Offline UI/UX design tooling

These scripts generate review artifacts, not a frontend application. They use the current repository favicon and an explicit 180-route catalog. No application endpoint is contacted and no financial action can run.

The source contracts are checked with Node's built-in test runner:

    node --test scripts/design/ui-ux-180/*.test.mjs

Capture requires an already installed Playwright ESM module, a compatible Chromium executable and local Noto Sans CJK fonts. Supply absolute tool paths in the environment. This task used Node 24 and the MiniPC's existing QA tooling; it did not add product dependencies.

    export DESIGN_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs
    export DESIGN_BROWSER_EXECUTABLE=/absolute/path/to/chrome-headless-shell
    node scripts/design/ui-ux-180/capture.mjs --out /tmp/design-review/final
    node scripts/design/ui-ux-180/capture-supplement.mjs /tmp/design-review/supplement
    node scripts/design/ui-ux-180/write-gallery.mjs /tmp/design-review

The last command replaces only this proposal's named generated gallery files and flat QA report. It refuses an incomplete or failing evidence set. Output is always proposed design, never a new approved baseline.

Primary capture checks all 180 routes at 320, 390, 768, 1100 and 1440 pixels. Screenshots are saved at 390 and 1440 pixels. Checks include document overflow, touch dimensions, labels, duplicate IDs, form controls obscured by the floating help control, browser errors and external requests. Supplement checks cover representative states, partial shared-chrome locale expansion, keyboard entry and long numeric strings. These checks do not exercise real authentication, role enforcement, form submission, transaction processing or a deployed application.

Gallery sources and PNG hashes are in the generated QA report. Locale review copy is deliberately stored in docs; the renderer translates only exact shared labels. Full-copy translation and owner visual approval remain open.
