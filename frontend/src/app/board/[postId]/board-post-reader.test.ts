import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api';
import { readMemberBoardPost, readPublicBoardPost } from './board-post-reader';

const id = '3e32b4a9-9c36-4d1a-8b19-516891a40f92';
const post = { postId: id, title: 'Existing discussion' };

describe('board post availability contract', () => {
  it('treats a malformed URL id as missing without requesting the backend', async () => {
    const read = vi.fn();
    await expect(readPublicBoardPost('not-a-uuid', read)).resolves.toBeNull();
    await expect(readMemberBoardPost('not-a-uuid', read)).resolves.toBeNull();
    expect(read).not.toHaveBeenCalled();
  });
  it('returns a real public post through the existing API route', async () => {
    const read = vi.fn().mockResolvedValue({ post });
    await expect(readPublicBoardPost(id, read)).resolves.toEqual(post);
    expect(read).toHaveBeenCalledWith(`/api/v1/board/public/posts/${id}`);
  });
  it('treats only an actual public 404 as absent', async () => {
    await expect(readPublicBoardPost(id, vi.fn().mockRejectedValue(new ApiError(404)))).resolves.toBeNull();
  });
  it.each([503, 502, 500, 401])('propagates public %s for retry instead of false deletion', async (status) => {
    await expect(readPublicBoardPost(id, vi.fn().mockRejectedValue(new ApiError(status)))).rejects.toMatchObject({ status });
  });
  it('propagates public transport errors instead of false deletion', async () => {
    await expect(readPublicBoardPost(id, vi.fn().mockRejectedValue(new Error('offline')))).rejects.toThrow('offline');
  });
  it.each([401, 403, 404])('falls back to public only on member %s', async (status) => {
    await expect(readMemberBoardPost(id, vi.fn().mockRejectedValue(new ApiError(status)))).resolves.toBeNull();
  });
  it('preserves member authorization when the API confirms the post', async () => {
    const read = vi.fn().mockResolvedValue({ post });
    await expect(readMemberBoardPost(id, read)).resolves.toEqual({ post });
    expect(read).toHaveBeenCalledWith(`/api/v1/board/posts/${id}`);
  });
  it.each([500, 503])('propagates member %s rather than misrepresenting the session', async (status) => {
    await expect(readMemberBoardPost(id, vi.fn().mockRejectedValue(new ApiError(status)))).rejects.toMatchObject({ status });
  });
});
