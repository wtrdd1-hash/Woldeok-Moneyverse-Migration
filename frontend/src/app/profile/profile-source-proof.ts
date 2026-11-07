import {
  DISPLAY_NAME_MAX,
  IMAGE_URL_MAX,
  VISIBILITY_FIELDS,
  characters,
  isImageAddress,
  isTitleCode,
  isVisibility,
  type EarnedTitle,
  type ProfileSettings,
  type ProfileView,
} from './profile';

const unsafeText = /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/;
const validInteger = /^(0|[1-9][0-9]{0,18})$/;
const allowedFields = new Set(VISIBILITY_FIELDS.map(({ key }) => key));

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function optionalText(value: unknown, max: number): value is string | null {
  return value === null || (typeof value === 'string' && characters(value) <= max && !unsafeText.test(value));
}

function image(value: unknown): value is string | null {
  return optionalText(value, IMAGE_URL_MAX) && (value === null || isImageAddress(value));
}

function title(value: unknown): value is string | null {
  return value === null || (typeof value === 'string' && isTitleCode(value));
}

function isoInstant(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value) &&
    Number.isFinite(Date.parse(value));
}

/** The typed API client does not validate JSON; never render owner evidence before checking its shape. */
export function parseOwnProfile(payload: unknown): ProfileView | null {
  const view = record(record(payload)?.profile);
  if (!view || !optionalText(view.display_name, DISPLAY_NAME_MAX) || !image(view.image_url) ||
      !isoInstant(view.joined_at) || !isVisibility(String(view.visibility ?? '')) ||
      !optionalText(view.job_type, 64) ||
      (view.job_level !== null && (!Number.isSafeInteger(view.job_level) || (view.job_level as number) < 0)) ||
      (view.work_completions !== null && (typeof view.work_completions !== 'string' ||
        !validInteger.test(view.work_completions) || BigInt(view.work_completions) > 9223372036854775807n)) ||
      !title(view.featured_title)) return null;
  return view as unknown as ProfileView;
}

/** A missing visibility override must not become 'inherit' during a replacement save. */
export function parseOwnSettings(payload: unknown): ProfileSettings | null {
  const settings = record(record(payload)?.settings);
  if (!settings || !isVisibility(String(settings.visibility ?? '')) ||
      !optionalText(settings.display_name, DISPLAY_NAME_MAX) || !image(settings.image_url) ||
      !title(settings.featured_title)) return null;
  const fields = record(settings.field_visibility);
  if (!fields || Object.entries(fields).some(([key, value]) =>
    !allowedFields.has(key) || typeof value !== 'string' || !isVisibility(value))) return null;
  return settings as unknown as ProfileSettings;
}

/** Titles are a bounded owner grant list, not arbitrary selectable codes from an HTTP response. */
export function parseOwnTitles(payload: unknown): EarnedTitle[] | null {
  const rows = record(payload)?.titles;
  if (!Array.isArray(rows) || rows.length > 200) return null;
  const seen = new Set<string>();
  const titles: EarnedTitle[] = [];
  for (const item of rows) {
    const row = record(item);
    if (!row || typeof row.code !== 'string' || !isTitleCode(row.code) || seen.has(row.code) ||
        typeof row.name !== 'string' || row.name.length === 0 || !optionalText(row.name, 200) ||
        !isoInstant(row.awardedAt)) return null;
    seen.add(row.code);
    titles.push({ code: row.code, name: row.name, awardedAt: row.awardedAt });
  }
  return titles;
}

export function canEditOwnProfile(
  profile: ProfileView | null,
  settings: ProfileSettings | null,
  titles: readonly EarnedTitle[] | null,
): boolean {
  // Independent reads may span a concurrent settings update; fail closed rather than save stale privacy choices.
  return profile !== null && settings !== null && titles !== null && profile.visibility === settings.visibility &&
    profile.image_url === settings.image_url && profile.featured_title === settings.featured_title;
}
