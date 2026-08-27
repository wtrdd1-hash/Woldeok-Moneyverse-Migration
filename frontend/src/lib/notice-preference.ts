/**
 * Whether the reader has dismissed the strip above the masthead.
 *
 * One mechanism, used twice: a `data-notice` attribute on the document
 * element, which a stylesheet rule turns into `display: none`. The script
 * below sets it before first paint on a page load, and the strip's own close
 * button sets it on a click. Nothing else reads the preference.
 *
 * It has to run before paint, because the alternative — hiding the strip in
 * an effect after hydration — would flash a dark bar onto the screen and take
 * it away again on every single page load, for exactly the people who asked
 * for it to be gone.
 *
 * The preference is a per-browser convenience with no security meaning, so
 * `localStorage` is the right home for it: no cookie to send on every
 * request, and no server state for something only this browser cares about.
 * Private windows and blocked site storage throw on access, so both the read
 * and the write are guarded — a reader who cannot store it simply keeps
 * seeing the strip.
 */
export const NOTICE_STORAGE_KEY = 'wdmv.notice-bar';

export const NOTICE_DISMISSED = 'dismissed';

export const NOTICE_PREFERENCE_SCRIPT =
  `try{if(localStorage.getItem(${JSON.stringify(NOTICE_STORAGE_KEY)})===` +
  `${JSON.stringify(NOTICE_DISMISSED)}){document.documentElement.dataset.notice=` +
  `${JSON.stringify(NOTICE_DISMISSED)}}}catch(e){}`;

/** Records the dismissal and applies it immediately. */
export function dismissNotice(): void {
  try {
    localStorage.setItem(NOTICE_STORAGE_KEY, NOTICE_DISMISSED);
  } catch {
    // Storage is unavailable. The strip still closes for this page view.
  }
  document.documentElement.dataset.notice = NOTICE_DISMISSED;
}
