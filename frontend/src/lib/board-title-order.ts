/** Verify the source applied title sorting to its bounded public-post snapshot. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function compareUtf8(left: string, right: string): number {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    if (a[i] !== b[i]) return a[i]! < b[i]! ? -1 : 1;
  }
  return Math.sign(a.length - b.length);
}

export function isVerifiedBoardTitleOrder(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const data = payload as Record<string, unknown>;
  if (data.sortApplied !== 'title' || !Array.isArray(data.posts) || data.posts.length > 50) return false;
  let previous: { title: string; postId: string } | null = null;
  const seen = new Set<string>();
  for (const item of data.posts) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    const post = item as Record<string, unknown>;
    if (typeof post.postId !== 'string' || !UUID.test(post.postId) ||
        typeof post.title !== 'string' || post.title.trim().length === 0 ||
        post.title.length > 120 || /[\u0000-\u001f\u007f]/.test(post.title)) return false;
    const id = post.postId.toLowerCase();
    if (seen.has(id)) return false;
    seen.add(id);
    if (previous) {
      const titleCompare = compareUtf8(previous.title, post.title);
      if (titleCompare > 0 || (titleCompare === 0 && previous.postId >= id)) return false;
    }
    previous = { title: post.title, postId: id };
  }
  return true;
}
