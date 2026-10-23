/** Device-only reader preference. This does not alter the account or server. */
export const READING_SCALE_KEY = 'wdmv.reading-scale';
export const READING_SCALES = [100, 125, 150, 175, 200] as const;

export function normaliseReadingScale(value: string | null | undefined): number | null {
  return value !== null && value !== undefined && /^(100|125|150|175|200)$/.test(value)
    ? Number(value)
    : null;
}

/** Use an allowlist because this string is injected into the root CSS style. */
export const READING_SCALE_SCRIPT =
  `try{var v=localStorage.getItem(${JSON.stringify(READING_SCALE_KEY)});` +
  `if(/^(125|150|175|200)$/.test(v||'')){document.documentElement.style.fontSize=v+'%'}}catch(e){}`;

export function readReadingScale(): number | null {
  try {
    return normaliseReadingScale(localStorage.getItem(READING_SCALE_KEY));
  } catch {
    return null;
  }
}

/** The preference remains effective in this tab even if storage is disabled. */
export function applyReadingScale(value: number): boolean {
  if (!READING_SCALES.some((allowed) => allowed === value)) return false;
  if (value === 100) document.documentElement.style.removeProperty('font-size');
  else document.documentElement.style.fontSize = `${value}%`;
  try {
    if (value === 100) localStorage.removeItem(READING_SCALE_KEY);
    else localStorage.setItem(READING_SCALE_KEY, String(value));
  } catch {
    // Private browsing can reject storage without preventing a live preview.
  }
  return true;
}
