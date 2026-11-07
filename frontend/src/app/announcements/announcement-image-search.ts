export function parseAnnouncementImageQuery(
  value: string | string[] | undefined,
): { readonly query: string | null; readonly invalid: boolean } {
  if (value === undefined) return { query: null, invalid: false };
  if (typeof value !== 'string') return { query: null, invalid: true };
  const term = value.trim();
  if (
    Array.from(term).length < 2 ||
    Array.from(term).length > 80 ||
    /[<>\u0000-\u001f\u007f]/u.test(term)
  ) return { query: null, invalid: true };
  return { query: term, invalid: false };
}

interface VerifiedAnnouncementImage {
  readonly announcementId: string;
  readonly title: string;
  readonly body: string;
  readonly imageUrl: string;
  readonly imageAltText: string;
  readonly isPinned: boolean;
  readonly publishedAt: string | null;
}

export function verifiedAnnouncementImageResults(
  payload: unknown,
  query: string,
): { readonly announcements: VerifiedAnnouncementImage[] } | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const rows = (payload as { announcements?: unknown }).announcements;
  if (!Array.isArray(rows) || rows.length > 20) return null;
  const announcements: VerifiedAnnouncementImage[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
    const record = row as Record<string, unknown>;
    if (
      typeof record.announcementId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(record.announcementId) ||
      seen.has(record.announcementId) ||
      typeof record.title !== 'string' || record.title.length < 1 || record.title.length > 160 ||
      typeof record.body !== 'string' || record.body.length > 12000 ||
      typeof record.imageUrl !== 'string' || !record.imageUrl.startsWith('/media/') ||
      typeof record.imageAltText !== 'string' || record.imageAltText.length < 2 || record.imageAltText.length > 300 ||
      !record.imageAltText.toLowerCase().includes(query.toLowerCase()) ||
      typeof record.isPinned !== 'boolean' ||
      (record.publishedAt !== null && (typeof record.publishedAt !== 'string' ||
        !Number.isFinite(Date.parse(record.publishedAt))))
    ) return null;
    seen.add(record.announcementId);
    announcements.push({
      announcementId: record.announcementId,
      title: record.title,
      body: record.body,
      imageUrl: record.imageUrl,
      imageAltText: record.imageAltText,
      isPinned: record.isPinned,
      publishedAt: record.publishedAt,
    } as VerifiedAnnouncementImage);
  }
  return { announcements };
}
