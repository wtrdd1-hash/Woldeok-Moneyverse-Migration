/**
 * The vocabulary of a member profile, and the small decisions the profile
 * screens share.
 *
 * Everything here is pure, and it lives outside `page.tsx` for the reason
 * `stages.ts` does: a page cannot be rendered in a test -- that needs a live
 * API and a database -- while the words a member reads and the rules about
 * which of them to show can be, and they are the parts most likely to be got
 * wrong.
 */

/**
 * `public.profile_visibility` (079), which is also the vocabulary
 * `member_update_profile` checks its argument against (080).
 */
export const VISIBILITIES = ['public', 'members', 'private'] as const;
export type ProfileVisibility = (typeof VISIBILITIES)[number];

export function isVisibility(value: string): value is ProfileVisibility {
  return (VISIBILITIES as readonly string[]).includes(value);
}

/**
 * `public.member_profile_view` RETURNS TABLE, as
 * `backend/src/profile/profile.repository.ts` returns it over the wire:
 * packages/database/migrations/080-member-profile-functions.sql.
 *
 * Every column but `joined_at` and `visibility` is nullable, and a null is an
 * answer rather than missing data -- it is what the function returns for a
 * field this reader may not see. `work_completions` is a bigint and stays a
 * string all the way to the DOM; `job_level` is an int4 and stays a number.
 * `joined_at` is a timestamptz and reaches the browser as an ISO string.
 */
export interface ProfileView {
  readonly display_name: string | null;
  readonly image_url: string | null;
  readonly joined_at: string;
  readonly job_type: string | null;
  readonly job_level: number | null;
  readonly work_completions: string | null;
  readonly visibility: ProfileVisibility;
  readonly featured_title: string | null;
}

/**
 * `public.member_update_profile` and `public.member_profile_settings` RETURNS
 * TABLE, under `settings` rather than `profile` because it is a different
 * shape: what the member stored, not what a reader is shown. It is the only
 * place `field_visibility` can be observed -- `member_profile_view` answers
 * what a reader may see and cannot tell "hidden" from "never set".
 */
export interface ProfileSettings {
  readonly visibility: ProfileVisibility;
  readonly display_name: string | null;
  readonly image_url: string | null;
  readonly field_visibility: Readonly<Record<string, string>>;
  readonly featured_title: string | null;
}

export interface VisibilityChoice {
  readonly value: ProfileVisibility;
  readonly label: string;
  readonly description: string;
}

/**
 * The whole-profile setting, and what each option honestly buys today.
 *
 * 전체 공개 is described as an intention rather than as an outcome on
 * purpose. `member_profile_view` accepts a null actor and would answer a
 * public profile for a signed-out visitor, but every route on
 * `/api/v1/profile` carries `SessionGuard`, so 'public' and 'members'
 * currently reach the same readers. Describing 'public' as "anyone, even
 * signed out" would be a sentence this build cannot keep.
 */
export const VISIBILITY_CHOICES: readonly VisibilityChoice[] = [
  {
    value: 'public',
    label: '전체 공개',
    description: '누구에게나 공개한다는 표시예요. 지금은 프로필을 회원만 열 수 있어서 회원 공개와 같은 범위로 보여요.',
  },
  { value: 'members', label: '회원 공개', description: '로그인한 회원에게 보여요.' },
  { value: 'private', label: '비공개', description: '나만 볼 수 있어요.' },
];

/** The Korean for a visibility, or the value itself for one this build has not been taught. */
export function visibilityLabel(value: string): string {
  return VISIBILITY_CHOICES.find((choice) => choice.value === value)?.label ?? value;
}

/** A field left out of the map is shown on the profile's own setting. */
export const INHERIT = 'inherit';
export type FieldSetting = typeof INHERIT | ProfileVisibility;

export const FIELD_CHOICES: readonly { readonly value: FieldSetting; readonly label: string }[] = [
  { value: INHERIT, label: '프로필 설정 따름' },
  { value: 'public', label: '전체 공개' },
  { value: 'members', label: '회원 공개' },
  { value: 'private', label: '비공개' },
];

export interface VisibilityField {
  readonly key: string;
  readonly label: string;
  readonly description: string;
}

/**
 * The five keys `member_profile_view` consults, spelled exactly as it spells
 * them, and mirrored by `VISIBILITY_FIELDS` in
 * `backend/src/profile/profile.repository.ts` -- which rejects any other key
 * with a 400 rather than store a setting nothing will ever read.
 *
 * 'profile' gates the whole read and the other four gate one column each, so
 * it is listed first and its consequence is spelled out: setting it to
 * 비공개 does not hide a field, it closes the profile.
 */
export const VISIBILITY_FIELDS: readonly VisibilityField[] = [
  {
    key: 'profile',
    label: '프로필 전체',
    description: '비공개로 두면 항목이 아니라 프로필 자체가 열리지 않아요.',
  },
  { key: 'imageUrl', label: '프로필 이미지', description: '프로필에 보이는 이미지예요.' },
  { key: 'jobType', label: '직업과 레벨', description: '작업 화면에서 쌓인 직업 기록이에요.' },
  {
    key: 'workCompletions',
    label: '완료한 작업 수',
    description: '지금까지 보상을 받은 작업의 횟수예요.',
  },
  { key: 'featuredTitle', label: '대표 칭호', description: '프로필 이름 옆에 붙는 칭호예요.' },
];

/**
 * The form field name carrying one key's setting.
 *
 * Prefixed so that a field key can never collide with `visibility`, which is
 * the whole-profile setting and a different thing from `field.profile`.
 */
export function fieldInputName(key: string): string {
  return `field.${key}`;
}

/**
 * The per-field map, as `member_update_profile` wants it.
 *
 * 'inherit' is not a value the database accepts -- it is the *absence* of a
 * key, which is what 080 falls back on. So an inherited field is dropped
 * rather than sent, and an empty map is the schema's own default.
 *
 * Returns null for a value that is neither, so the action can name the
 * problem instead of quietly storing four of the five settings.
 */
export function fieldVisibilityFrom(
  chosen: Readonly<Record<string, string>>,
): Record<string, ProfileVisibility> | null {
  const fields: Record<string, ProfileVisibility> = {};
  for (const field of VISIBILITY_FIELDS) {
    const setting = chosen[field.key] ?? INHERIT;
    if (setting === INHERIT) continue;
    if (!isVisibility(setting)) return null;
    fields[field.key] = setting;
  }
  return fields;
}

/**
 * `public.work_job_type` (066), in the Korean a member reads it in.
 *
 * The enum's labels are English and no granted function exposes them, so the
 * words live here -- the same arrangement, and for the same reason, as the
 * growth stages in `app/progression/stages.ts`. A job this build has not been
 * taught is rendered as itself, which is worse than a name and better than a
 * blank where a member's job should be.
 */
const JOB_LABELS: Readonly<Record<string, string>> = {
  farmer: '농부',
  miner: '광부',
  carrier: '운반원',
  technician: '기술자',
  merchant: '상인',
};

export function jobLabel(code: string): string {
  return JOB_LABELS[code] ?? code;
}

/**
 * The titles 079 seeds, in Korean.
 *
 * `member_titles` holds English names ('Starter', 'Helper', 'Season honour')
 * and nothing reads that table back, so this list is written rather than
 * fetched -- and it is a list of codes this build knows, never a claim about
 * which of them the member holds. 080 refuses a title that was never awarded
 * with 22023, which the API answers as a 409.
 */
const TITLE_LABELS: Readonly<Record<string, string>> = {
  starter: '첫걸음',
  helper: '조력자',
  season_honour: '시즌 명예',
};

export function titleLabel(code: string): string {
  return TITLE_LABELS[code] ?? code;
}

/** The value the title control carries when the member displays no title. */
export const NO_TITLE = 'none';

/**
 * The options the title control offers.
 *
 * The seeded codes, plus whichever title the member is already displaying if
 * this build has not heard of it. Without that last part a title awarded by a
 * later migration would disappear from the control the moment its owner
 * opened the screen, and saving would take it off their profile -- the write
 * is a replacement, so an option that is not on the list is an option that
 * gets cleared.
 */
export function titleChoices(
  current: string | null,
): readonly { readonly value: string; readonly label: string }[] {
  const known = Object.keys(TITLE_LABELS).map((code) => ({ value: code, label: titleLabel(code) }));
  const extra =
    current !== null && !(current in TITLE_LABELS)
      ? [{ value: current, label: current }]
      : [];
  return [{ value: NO_TITLE, label: '칭호 없음' }, ...known, ...extra];
}

/** 079: member_titles.code CHECK (code ~ '^[a-z0-9_]{3,64}$'). */
const TITLE_CODE = /^[a-z0-9_]{3,64}$/;

export function isTitleCode(value: string): boolean {
  return TITLE_CODE.test(value);
}

/** Strict RFC UUID, the shape `ParseUUIDPipe` accepts on `/api/v1/profile/:userId`. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID.test(value);
}

/** 079's CHECK bounds, so a member is told which field is too long. */
export const DISPLAY_NAME_MAX = 80;
export const IMAGE_URL_MAX = 2048;

/** Code points, which is what Postgres `char_length` counts. */
export function characters(text: string): number {
  return [...text].length;
}

/**
 * The shape of an image address this product will render.
 *
 * The API decides it for real -- `optionalImageUrl` in
 * `backend/src/profile/profile.repository.ts` -- and this repeats the rule so
 * that a mistyped address is a sentence about the address rather than the
 * generic "입력한 내용을 다시 확인해 주세요" a 400 turns into. A path is
 * allowed with one leading separator only: '//host/path' and '/\host/path'
 * read as paths and load from somebody else's origin.
 */
export function isImageAddress(value: string): boolean {
  if (value.startsWith('/')) return !/^\/[/\\]/.test(value);
  try {
    const parsed = new URL(value);
    // https only, mirroring the API. The site's CSP refuses an http image,
    // so accepting one here would let a member save a picture the browser
    // will never render.
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * What was stored, reported from the row the database returned rather than
 * from the form that was sent -- the same rule every receipt on this site
 * follows, and it matters here because the write is a replacement and the
 * member's best question afterwards is "what does my profile say now".
 */
export function savedSentence(settings: ProfileSettings): string {
  const chosen = Object.keys(settings.field_visibility ?? {}).length;
  const opening = `프로필을 ${visibilityLabel(settings.visibility)}로 저장했어요.`;
  return chosen === 0
    ? `${opening} 항목별 공개 범위는 모두 프로필 설정을 따라요.`
    : `${opening} 항목별로 따로 정한 것은 ${chosen}개예요.`;
}

/**
 * True when a reader was shown nothing but the join date.
 *
 * A profile whose every optional field came back null is a card with a name
 * and a date on it, which reads as a broken page rather than as a member who
 * keeps to themselves. The screen says so in a sentence instead.
 */
export function nothingShown(profile: ProfileView): boolean {
  return (
    profile.image_url === null &&
    profile.job_type === null &&
    profile.work_completions === null &&
    profile.featured_title === null
  );
}
