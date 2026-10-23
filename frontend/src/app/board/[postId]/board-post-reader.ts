import { ApiError } from '@/lib/api';

const UUID_PATH = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Preserve the API's real 404/503 distinction for public SEO and retry UI. */
export async function readPublicBoardPost<T>(
  postId: string,
  read: (path: string) => Promise<{ post: T }>,
): Promise<T | null> {
  if (!UUID_PATH.test(postId)) return null;
  try {
    const response = await read(`/api/v1/board/public/posts/${encodeURIComponent(postId)}`);
    return response.post;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** A missing member session may fall back to public; a failed service may not. */
export async function readMemberBoardPost<T>(
  postId: string,
  read: (path: string) => Promise<{ post: T }>,
): Promise<{ post: T } | null> {
  if (!UUID_PATH.test(postId)) return null;
  try {
    return await read(`/api/v1/board/posts/${encodeURIComponent(postId)}`);
  } catch (error) {
    if (error instanceof ApiError && [401, 403, 404].includes(error.status)) return null;
    throw error;
  }
}
