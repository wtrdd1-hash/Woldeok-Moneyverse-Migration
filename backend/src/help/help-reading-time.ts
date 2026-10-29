/** A display-only estimate from the already approved article body, never a comprehension claim. */
export function estimateHelpReadingMinutes(body: string, locale: string): number {
  const content = body.trim();
  const units = locale === 'en'
    ? (content.match(/\S+/gu)?.length ?? 0)
    : Array.from(content.replace(/\s/gu, '')).length;
  const perMinute = locale === 'en' ? 200 : 500;
  return Math.max(1, Math.min(60, Math.ceil(units / perMinute)));
}
