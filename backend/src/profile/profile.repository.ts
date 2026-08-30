import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * The three values public.profile_visibility allows (079) and the vocabulary
 * member_update_profile checks its own argument against (080).
 */
export const PROFILE_VISIBILITIES = ['public', 'members', 'private'] as const;
export type ProfileVisibility = (typeof PROFILE_VISIBILITIES)[number];

/**
 * The field keys member_profile_view actually consults, spelled as it spells
 * them. 'profile' gates the whole read; the other four gate one column each.
 *
 * Checked here because the database cannot. 080 validates the *values* of
 * field_visibility and accepts any key, so 'imageURL' or 'image_url' is
 * stored happily and read by nothing: the member would be told their image is
 * private while every other member kept seeing it. That is the failure the
 * same migration's own comments refuse to ship for a self-exclusion -- a
 * control the member believes is holding -- and a key is the one part of this
 * request the function has no opinion about.
 */
const VISIBILITY_FIELDS: readonly string[] = [
  'profile',
  'imageUrl',
  'jobType',
  'workCompletions',
  'featuredTitle',
];

/** 079's CHECK bounds, mirrored so a violation is a sentence about the field. */
const DISPLAY_NAME_MAX = 80;
const FEATURED_TITLE_MAX = 80;
const IMAGE_URL_MAX = 2048;
/** 079: member_titles.code CHECK (code ~ '^[a-z0-9_]{3,64}$'). */
const TITLE_CODE = /^[a-z0-9_]{3,64}$/;

/**
 * Control characters and the bidirectional overrides, neither of which any
 * name needs.
 *
 * A NUL is the sharp end: Postgres will not store one in a text column and
 * answers 22021, which is not a code `pg-error.ts` recognises, so a member
 * could reach a 500 by typing one. The rest are about what a name does on
 * somebody else's screen -- a newline breaks the row it is rendered in, and
 * an override reverses the characters after it, which is how one member's
 * name is made to read as another's.
 */
const UNSAFE_TEXT = /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/;

export class ProfileInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileInputError';
  }
}

/**
 * Validated here as well as in the database function. The double gate is
 * deliberate and documented across this codebase: the function is the
 * authority, and this turns a malformed argument into a 400 with a sentence
 * about the field rather than a 500 carrying a message about a function.
 */
function assertUuid(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw new ProfileInputError(`${field} must be a UUID`);
  }
}

/** Code points, which is what Postgres `char_length` counts in 079's CHECKs. */
function characters(text: string): number {
  return [...text].length;
}

function requireVisibility(value: unknown, field: string): ProfileVisibility {
  if (typeof value !== 'string' || !(PROFILE_VISIBILITIES as readonly string[]).includes(value)) {
    throw new ProfileInputError(`${field} must be public, members or private`);
  }
  return value as ProfileVisibility;
}

/**
 * Absent, null and blank all mean the same thing here, and they mean it
 * because the write is a replacement: 080 upserts every column from its
 * arguments, so a field the member cleared has to reach the function as NULL
 * rather than be dropped from the statement. Trimming first stops a name of
 * three spaces from passing 079's `char_length >= 1`.
 */
function optionalText(value: unknown, field: string, max: number): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') throw new ProfileInputError(`${field} must be text`);
  const text = value.trim();
  if (text === '') return null;
  if (UNSAFE_TEXT.test(text)) {
    throw new ProfileInputError(`${field} may not contain control characters`);
  }
  if (characters(text) > max) {
    throw new ProfileInputError(`${field} must be ${max} characters or fewer`);
  }
  return text;
}

/**
 * 079 bounds the image address by length and nothing else, and the web tier
 * renders it into an `img` element. A `javascript:` or `data:` value would be
 * a payload the database is perfectly happy to keep, so the shape is decided
 * here.
 *
 * A root-relative path stays allowed because that is how every gallery image
 * already addresses itself ('/media/<key>', served by MediaController) -- but
 * only with a single leading separator: '//host/path' and '/\host/path' read
 * as paths and load from somebody else's origin.
 */
function optionalImageUrl(value: unknown): string | null {
  const text = optionalText(value, 'the image address', IMAGE_URL_MAX);
  if (text === null) return null;

  const rejected = new ProfileInputError(
    'the image address must be an http or https address, or a path on this site',
  );
  if (text.startsWith('/')) {
    if (/^\/[/\\]/.test(text)) throw rejected;
    return text;
  }

  let parsed: URL;
  try {
    parsed = new URL(text);
  } catch {
    throw rejected;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw rejected;
  return text;
}

/**
 * The pattern is 079's, not a guess at what titles exist. A code that cannot
 * match any row is the member's typo and becomes a 400 about the field; a
 * well-formed code they have not been awarded is 080's answer to give, and it
 * arrives as 22023.
 */
function optionalTitleCode(value: unknown): string | null {
  const text = optionalText(value, 'the featured title', FEATURED_TITLE_MAX);
  if (text === null) return null;
  if (!TITLE_CODE.test(text)) throw new ProfileInputError('the featured title is not a title code');
  return text;
}

function requireFieldVisibility(value: unknown): Record<string, ProfileVisibility> {
  if (value === undefined || value === null) return {};
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new ProfileInputError('the per-field visibility must be an object');
  }

  const fields: Record<string, ProfileVisibility> = {};
  for (const [field, setting] of Object.entries(value)) {
    if (!VISIBILITY_FIELDS.includes(field)) {
      throw new ProfileInputError(`${field} is not a field whose visibility can be set`);
    }
    fields[field] = requireVisibility(setting, `the visibility of ${field}`);
  }
  return fields;
}

/**
 * public.member_profile_view RETURNS TABLE:
 * packages/database/migrations/080-member-profile-functions.sql
 *
 * Every column but `joined_at` and `visibility` is nullable, and null here is
 * the answer rather than missing data: it is what the function returns for a
 * field this caller may not see. `work_completions` is a bigint and stays a
 * string; `job_level` is an integer and stays a number.
 */
export interface ProfileViewRow {
  readonly display_name: string | null;
  readonly image_url: string | null;
  readonly joined_at: Date;
  readonly job_type: string | null;
  readonly job_level: number | null;
  readonly work_completions: string | null;
  readonly visibility: ProfileVisibility;
  readonly featured_title: string | null;
}

/**
 * public.member_update_profile RETURNS TABLE: the same migration.
 *
 * The stored settings rather than the rendered profile -- notably
 * `field_visibility`, which no read function in the schema returns.
 */
export interface ProfileSettingsRow {
  readonly visibility: ProfileVisibility;
  readonly display_name: string | null;
  readonly image_url: string | null;
  readonly field_visibility: Readonly<Record<string, string>>;
  readonly featured_title: string | null;
}

/** A replacement, not a patch: see `update`. */
export interface ProfileUpdate {
  readonly visibility: unknown;
  readonly displayName: unknown;
  readonly imageUrl: unknown;
  readonly fieldVisibility: unknown;
  readonly featuredTitle: unknown;
}

/**
 * Database gateway for member profiles.
 *
 * Both statements target a SECURITY DEFINER function 080 granted to
 * moneyverse_app. The four tables 079 creates -- member_profiles,
 * member_titles, user_titles and casino_self_limits -- are revoked from that
 * role, so there is no SQL path here that reads or writes one directly, and
 * there must never be.
 *
 * In particular nothing in this file decides who may see what. The actor is
 * handed to the function and `member_field_visible` answers, which is why
 * that function is not granted to moneyverse_app: the application is not
 * meant to be able to ask the question on its own.
 */
export class ProfileRepository {
  constructor(private readonly pool: Queryable) {}

  /**
   * A profile as this caller is allowed to see it. `actor` and `subject` may
   * be the same member, and 080 answers with every field when they are.
   *
   * Async so the assertions above reject the promise rather than throw at the
   * call site, where the controller's mapping would never see them.
   */
  async view(actor: unknown, subject: unknown): Promise<ProfileViewRow> {
    assertUuid(actor, 'actor');
    assertUuid(subject, 'member id');
    const row = await queryOne<ProfileViewRow>(
      this.pool,
      `SELECT profile.display_name,
              profile.image_url,
              profile.joined_at,
              profile.job_type::text AS job_type,
              profile.job_level,
              profile.work_completions::text AS work_completions,
              profile.visibility::text AS visibility,
              profile.featured_title
       FROM public.member_profile_view($1::uuid, $2::uuid) AS profile`,
      [actor, subject],
    );
    // The function refuses a subject it will not show and returns exactly one
    // row for one it will, so no rows is schema drift rather than an answer.
    // Reporting it as 200 with an empty body would leave a screen unable to
    // tell a hidden profile from a broken one.
    if (!row) throw new Error('member_profile_view did not return a row');
    return row;
  }

  /**
   * The caller's own profile, replaced.
   *
   * 080 upserts every column from its arguments, so this is PUT semantics and
   * not PATCH: a field the caller omits is cleared, not kept. Merging the
   * omitted fields with the stored ones is not available to do here -- no
   * granted function reads `member_profiles` back -- and inventing a merge
   * from the last response would let two tabs overwrite each other silently.
   *
   * The actor comes first and there is no idempotency key, because this is an
   * upsert of one row keyed by the member rather than an event: sending it
   * twice stores the same settings twice, which is the same settings.
   */
  async update(actor: unknown, input: ProfileUpdate): Promise<ProfileSettingsRow> {
    assertUuid(actor, 'actor');
    const visibility = requireVisibility(input.visibility, 'the profile visibility');
    const displayName = optionalText(input.displayName, 'the display name', DISPLAY_NAME_MAX);
    const imageUrl = optionalImageUrl(input.imageUrl);
    const fieldVisibility = requireFieldVisibility(input.fieldVisibility);
    const featuredTitle = optionalTitleCode(input.featuredTitle);

    const row = await queryOne<ProfileSettingsRow>(
      this.pool,
      `SELECT settings.visibility::text AS visibility,
              settings.display_name,
              settings.image_url,
              settings.field_visibility,
              settings.featured_title
       FROM public.member_update_profile(
              $1::uuid, $2::text, $3::text, $4::text, $5::jsonb, $6::text) AS settings`,
      [actor, visibility, displayName, imageUrl, JSON.stringify(fieldVisibility), featuredTitle],
    );
    if (!row) throw new Error('member_update_profile did not return a row');
    return row;
  }
}
