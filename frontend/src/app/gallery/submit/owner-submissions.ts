/** The bounded owner-scoped SQL read from migration 098, never a public gallery list. */
export interface OwnerPhotoSubmission {
  readonly photo_id: string;
  readonly image_url: string | null;
  readonly alt_text: string;
  readonly published: boolean;
  readonly submitted_at: string;
  readonly published_at: string | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MEDIA = /^\/media\/[0-9a-f-]{36}\.(?:png|jpg|webp)$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validDate(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE.test(value) && Number.isFinite(Date.parse(value));
}

function safeImageUrl(value: unknown): value is string | null {
  if (value === null) return true;
  if (typeof value !== 'string' || value.length > 2048) return false;
  if (MEDIA.test(value)) return true;
  try {
    const url = new URL(value);
    // The existing gallery allows operator-approved HTTPS hosts; never let a
    // malformed owner response introduce active-content or protocol-relative URLs.
    return url.protocol === 'https:' && !!url.hostname && !url.username && !url.password &&
      !url.hash && value.startsWith('https://');
  } catch {
    return false;
  }
}

/** Invalid/partial upstream data is UNKNOWN, distinct from a verified empty list. */
export function parseOwnerPhotoSubmissions(payload: unknown): readonly OwnerPhotoSubmission[] | null {
  if (!record(payload) || !Array.isArray(payload.submissions) || payload.submissions.length > 30) return null;
  const ids = new Set<string>();
  const result: OwnerPhotoSubmission[] = [];
  for (const value of payload.submissions) {
    if (!record(value) || typeof value.photo_id !== 'string' || !UUID.test(value.photo_id) ||
        ids.has(value.photo_id.toLowerCase()) ||
        typeof value.alt_text !== 'string' || !value.alt_text.trim() || value.alt_text.length > 300 ||
        typeof value.published !== 'boolean' || !validDate(value.submitted_at) ||
        !safeImageUrl(value.image_url) ||
        (value.published
          ? !validDate(value.published_at) || Date.parse(value.published_at) < Date.parse(value.submitted_at)
          : value.published_at !== null)) return null;
    ids.add(value.photo_id.toLowerCase());
    result.push(value as unknown as OwnerPhotoSubmission);
  }
  return result;
}
