# Chrome DevTools MCP and quality-first QA — v2026.11.27.1907.1
Owner approved an additional actual-browser QA method and prioritized correctness and completeness over deadline pressure. All previous tasks, security-first order, S04-CVP, independent review and release gates remain intact. Existing Playwright remains the reproducible regression harness; DevTools MCP supplements interactive diagnosis and acceptance. No native app or live deployment change.

## Installation evidence
- Official Chrome DevTools MCP 1.14.0 pinned; npm registry integrity matched. Chrome for Testing 158.0.8127.88 installed from official release metadata; archive SHA256 59e3b43f8b3aaa292238fbdcfb36a93127debd53e212510dcdc2cc8812b4b57e; executable version and shared-library checks passed.
- Data-disk installation and supported Claude/Codex user/global stdio registrations verified. Existing MCP entries preserved. Isolated headless browser, normal sandbox, usage statistics and CrUX disabled; experimental third-party/extension tools disabled. Guard refuses startup below 2 GiB available memory, with dedicated instance lock; actual refusal test passed. Guard is not a network access-control boundary.
- Actual MCP handshake/browser smoke and running-agent availability are HOLD pending a safe resource checkpoint; current security work was not interrupted. No real account/browser profile or live production target. No extra paid usage.

## Required quality checks
- [x] Package, Chrome, registration and memory guard verified.
- [ ] Synthetic local MCP connection, navigation, click, console, network, screenshot and clean-shutdown smoke; verify actual loaded client tools.
- [ ] Security-relevant browser behavior first; authorized synthetic roles and data only, console/network and honest action results. Existing security/CVP/independent review gates unchanged.
- [ ] Remaining UI/UX, actual design reference comparisons, keyboard/accessibility, responsive 320/390/1280, all five locales and 180-route acceptance scope after security. Preserve existing Playwright, exact artifact/SHA and per-case evidence. No concurrent heavy browser jobs, no artificial deadline or fabricated completion.
- [x] Updated execution checklist and persistent handoff; latest instruction entered the normal Claude queue without interrupting current regression. Actual instruction execution and browser smoke not yet verified.

Official references: https://github.com/ChromeDevTools/chrome-devtools-mcp ; https://developer.chrome.com/docs/devtools/agents/get-started/configuration . No runtime deployment or main merge.
