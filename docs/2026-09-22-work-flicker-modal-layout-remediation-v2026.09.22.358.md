# Career Work Elimination of 0.5s Flickering Storm & Modal Layout Overhaul (v2026.09.22.358)

- **Document Version**: `v2026.09.22.358`
- **Release Directory**: `/srv/moneyverse-data/releases/prod-11fdec7-v358`
- **Exact Git SHA**: `11fdec7fbb00ead5709b6e52069f89f1f6fb4440` (Short: `11fdec7`)
- **Target Endpoints**: `https://easy-scraping.com/work` and `https://test.easy-scraping.com/work`

---

## 1. Overview & Problem Statements

1. **0.5s High-Frequency Screen Flickering & Burst RSC Storm**:
   - Navigating to `/work` caused Chrome's tab favicon to spin endlessly, flickering the UI every 0.5s and rendering the page completely unusable.
   - Root Cause: `<LiveRefresh everyMs={10_000} />` in `frontend/src/app/work/page.tsx` fired `router.refresh()` every 10 seconds. Each background RSC re-render triggered 8 simultaneous link prefetch queries in bursts every 0.5s, saturating Chrome's rendering thread.
2. **Task Completion Modal Viewport Clipping (Screenshot 2)**:
   - Clicking "Perform career task" pushed the top 80% of the modal card outside the browser viewport into negative coordinates, exposing only the "Close" button.
   - Root Cause: Custom flexbox overlay with `justify-center` forced overflowing content into negative Y space.
3. **Task Completion Modal 30px Squished Slit & Native Scrollbars (Screenshot 3)**:
   - WLD reward and proficiency EXP boxes alongside the submit button were squished into an unusable 30px horizontal slit with Windows scroll arrows, followed by an empty void.
   - Root Cause: `max-h-[90dvh]` flex container with `flex-1 overflow-y-auto` lacking minimum height constraints collapsed the content area.
4. **Task Card Native Scrollbars (Screenshot 1)**:
   - Task cards on Windows Chrome displayed unnecessary vertical scrollbar arrows.

---

## 2. Implementation & Technical Details

### 1) `frontend/src/app/work/page.tsx`
- Completely removed `<LiveRefresh everyMs={10_000} />` and its component import.
- Extinguished continuous background RSC storm and link prefetching loops.

### 2) `frontend/src/app/work/work-forms.tsx`
- **Replaced Custom Overlay with Radix UI `Dialog`**:
  - Adopted standard `@/components/ui/dialog` primitives (`Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`).
  - Centered positioning (`fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]`) permanently eliminates clipping.
  - Specified `max-w-md w-[calc(100vw-2rem)] p-5 sm:p-6 sm:rounded-2xl max-h-[85vh] overflow-y-auto` ensuring reward cards, 48px submit button, and celebratory cards render naturally without slit collapse.
- **Removed Duplicate Refresh & Scroll Disruptions**:
  - Removed duplicate `router.refresh()` in `useEffect` on `state.status === 'ok'` (`completeTaskV2Action` already calls `revalidatePath('/work')`).
  - Removed window-level `scrollIntoView()` jumps.
- **Cycle State & Idempotency Key**:
  - Maintained unique `requestKey` and `cycle` counter per modal instance to guarantee idempotency and clean state isolation.

### 3) `frontend/src/app/work/career-tasks-board.tsx`
- Added `overflow-hidden` to task `Card` to prevent Windows Chrome native scrollbars.

### 4) `frontend/src/app/work/work-form-regression.test.ts`
- Added `// @vitest-environment node` directive ensuring native Node file system module compatibility.

---

## 3. Verification & Promotion

1. **Unit Tests**:
   - `vitest run "src/app/work/"`: 4 test suites, 41 unit tests 100% PASS.
2. **Turbopack Build**:
   - Compiled cleanly in 3.5s with 26 static/dynamic routes.
3. **Zero-Downtime Promotion (`/home/debian/stage_v358.sh`)**:
   - Runtime identity verified: `https://test.easy-scraping.com` and `https://easy-scraping.com` both matched `11fdec7...`.
   - All endpoints responded HTTP 200 OK.
   - **968 active PostgreSQL user sessions preserved with zero loss**.
