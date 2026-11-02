import { isImageAddress, isTitleCode, isVisibility, type ProfileView } from './profile';

const COUNT = /^(0|[1-9][0-9]{0,29})$/;
const JOB = /^[a-z][a-z0-9_]{0,63}$/;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/;
const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const nullableLevel = (value: unknown): value is number | null =>
  value === null || (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= 2147483647);
const nullableCount = (value: unknown): value is string | null =>
  value === null || (typeof value === 'string' && COUNT.test(value));
const nullableText = (value: unknown, limit: number): value is string | null =>
  value === null || (typeof value === 'string' && [...value].length <= limit &&
    !/[\u0000-\u001f\u007f]/.test(value));

/** Validate the exact read-only member_profile_view DTO and strip unknown fields. */
export function parseMemberProfileResponse(value: unknown): { profile: ProfileView } | null {
  if (!isObject(value) || !isObject(value.profile)) return null;
  const p = value.profile;
  if (!nullableText(p.display_name, 80) ||
      !nullableText(p.image_url, 2048) ||
      (p.image_url !== null && !isImageAddress(p.image_url)) ||
      typeof p.joined_at !== 'string' || !ISO_UTC.test(p.joined_at) ||
      !Number.isFinite(Date.parse(p.joined_at)) ||
      !nullableText(p.job_type, 64) ||
      (p.job_type !== null && !JOB.test(p.job_type)) ||
      !nullableLevel(p.job_level) ||
      !nullableCount(p.work_completions) ||
      typeof p.visibility !== 'string' || !isVisibility(p.visibility) ||
      !nullableText(p.featured_title, 64) ||
      (p.featured_title !== null && !isTitleCode(p.featured_title))) return null;

  return { profile: {
    display_name: p.display_name, image_url: p.image_url, joined_at: p.joined_at,
    job_type: p.job_type, job_level: p.job_level, work_completions: p.work_completions,
    visibility: p.visibility, featured_title: p.featured_title,
  } };
}
