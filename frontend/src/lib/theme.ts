/**
 * The reader's two display choices.
 *
 * They are deliberately independent. The base — light, dark, or whatever the
 * operating system says — decides the ground and the ink. The point colour
 * decides only what draws the eye on top of it: buttons, links, the underline
 * under the current menu item, the focus ring. Nothing a reader picks here can
 * put text and its background at the same lightness, because the two knobs
 * never touch the same channel.
 *
 * The base is next-themes' job: it already ships the pre-paint script, the
 * `prefers-color-scheme` listener and the cross-tab sync, and Sonner in this
 * application already reads its context. Re-implementing that would mean two
 * sources of truth for one class name.
 *
 * The point colour is this file's job, and it is one custom property. Every
 * derived shade is computed by the stylesheet from that single value with
 * relative colour syntax, so there is no colour arithmetic here to keep in
 * step with the palette — see `[data-point]` in globals.css.
 *
 * Both live in `localStorage`, like the notice strip's dismissal: a per-browser
 * convenience with no security meaning, no cookie to send on every request,
 * and no server state for something only this browser cares about.
 */

/** next-themes owns this key; named here so the provider and Sonner agree. */
export const THEME_STORAGE_KEY = 'wdmv.theme';

export const POINT_STORAGE_KEY = 'wdmv.point';

export interface PointPreset {
  readonly id: string;
  readonly label: string;
  readonly hex: string;
}

/**
 * Six starting points, one per region of the wheel, so the swatch row is a
 * real choice rather than six versions of the same colour. The first is the
 * product's own forest: picking it is the closest a custom theme comes to
 * leaving things alone.
 */
export const POINT_PRESETS: readonly PointPreset[] = [
  { id: 'moon', label: '달빛', hex: '#f59e0b' },
  { id: 'gold', label: '황금', hex: '#eab308' },
  { id: 'amber', label: '호박', hex: '#d97706' },
  { id: 'forest', label: '숲', hex: '#214b38' },
  { id: 'sea', label: '바다', hex: '#2f5fa8' },
  { id: 'plum', label: '자두', hex: '#8e4172' },
];

const SIX = /^#[0-9a-f]{6}$/i;
const THREE = /^#[0-9a-f]{3}$/i;

/**
 * The one gate every stored or typed colour passes through.
 *
 * Returns null for anything that is not a colour, which is what makes the
 * value safe to hand to `setProperty`: a custom property is not a script
 * context, but it is interpolated into the page's styles, and the shortest
 * path to keeping that harmless is to let nothing but six hex digits through.
 */
export function normalisePoint(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  const hashed = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  // #c30 is as natural to type by hand as #cc3300.
  const expanded = THREE.test(hashed)
    ? `#${hashed
        .slice(1)
        .split('')
        .map((digit) => digit + digit)
        .join('')}`
    : hashed;
  return SIX.test(expanded) ? expanded.toLowerCase() : null;
}

/**
 * Applies the stored point colour before first paint.
 *
 * An effect would run after the page is already on screen, which would mean a
 * reader who chose a colour watches the default one flash past on every single
 * navigation — the same reason the notice strip's preference is set this way.
 *
 * It repeats the hex test rather than importing it because it runs as a string
 * in the document head, before any module has loaded.
 */
export const POINT_PREFERENCE_SCRIPT =
  `try{var d=document.documentElement,p=localStorage.getItem(${JSON.stringify(POINT_STORAGE_KEY)});` +
  `if(p&&/^#[0-9a-f]{6}$/i.test(p)){d.dataset.point='';d.style.setProperty('--point',p)}}catch(err){}`;

/** Records the choice and applies it immediately. Null restores the default. */
export function applyPoint(value: string | null): void {
  const point = normalisePoint(value);
  const root = document.documentElement;

  if (point) {
    root.dataset.point = '';
    root.style.setProperty('--point', point);
  } else {
    delete root.dataset.point;
    root.style.removeProperty('--point');
  }

  try {
    if (point) localStorage.setItem(POINT_STORAGE_KEY, point);
    else localStorage.removeItem(POINT_STORAGE_KEY);
  } catch {
    // Storage is unavailable. The choice still holds for this page view.
  }
}

/** The stored point colour, or null when the reader has not chosen one. */
export function readPoint(): string | null {
  try {
    return normalisePoint(localStorage.getItem(POINT_STORAGE_KEY));
  } catch {
    return null;
  }
}
