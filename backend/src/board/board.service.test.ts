import { describe, expect, it } from 'vitest';
import { BoardService } from './board.service';
import type { BoardRepository } from './board.service';

/**
 * The service is the only place a database row becomes something a member
 * sees, and it validates every field on the way through rather than trusting
 * the driver. These tests exercise that translation with a repository double,
 * so they say nothing about SQL and everything about what the application
 * does with what SQL returns.
 */

const ACTOR = '11111111-1111-4111-8111-111111111111';
const POST = '22222222-2222-4222-8222-222222222222';
const COMMENT = '33333333-3333-4333-8333-333333333333';
const KEY = '44444444-4444-4444-8444-444444444444';
const WRITTEN = new Date('2026-08-20T04:05:06.000Z');
const EDITED = new Date('2026-08-21T07:08:09.000Z');

function repository(overrides: Partial<BoardRepository> = {}): BoardRepository {
  return {
    list: async () => [],
    get: async () => null,
    create: async () => {
      throw new Error('not stubbed');
    },
    update: async () => null,
    remove: async () => false,
    listComments: async () => [],
    createComment: async () => {
      throw new Error('not stubbed');
    },
    removeComment: async () => false,
    imageVisible: async () => false,
    ...overrides,
  };
}

describe('BoardService', () => {
  it('refuses a repository that cannot answer every board operation', () => {
    const { update: _update, ...incomplete } = repository();
    expect(() => new BoardService(incomplete as BoardRepository)).toThrow(
      'board repository is required',
    );
  });

  // count() exists because node-postgres hands a bigint back as a string:
  // `commentCount` reaching a page as '3' would render, sort and compare as
  // text.
  it('reads the reply count as a number, not the string the driver returns', async () => {
    const board = new BoardService(
      repository({
        list: async () => [
          {
            post_id: POST,
            title: 'A title',
            author_name: 'A member',
            created_at: WRITTEN,
            updated_at: null,
            comment_count: '3',
            mine: true,
          },
        ],
      }),
    );

    const [post] = await board.list(ACTOR);
    expect(post?.commentCount).toBe(3);
    expect(post?.createdAt).toBe(WRITTEN.toISOString());
  });

  it('reports an unedited post as unedited rather than as an invalid time', async () => {
    const board = new BoardService(
      repository({
        get: async () => ({
          post_id: POST,
          title: 'A title',
          body: 'A body',
          author_name: 'A member',
          created_at: WRITTEN,
          updated_at: null,
          mine: false,
        }),
      }),
    );

    await expect(board.get(ACTOR, POST)).resolves.toMatchObject({ updatedAt: null });
  });

  it('reports when a post was edited', async () => {
    const board = new BoardService(
      repository({
        update: async () => ({
          post_id: POST,
          title: 'A title',
          body: 'A body',
          author_name: 'A member',
          created_at: WRITTEN,
          updated_at: EDITED,
          mine: true,
        }),
      }),
    );

    await expect(
      board.update(ACTOR, POST, { title: 'A title', body: 'A body', idempotencyKey: KEY }),
    ).resolves.toMatchObject({ updatedAt: EDITED.toISOString() });
  });

  // The function returns no row when the post is not the caller's, which is
  // the same answer it gives for a post that does not exist. Both have to
  // reach the route as null so it can answer 404 for either.
  it('returns null rather than throwing when a post is not the caller"s to edit', async () => {
    const board = new BoardService(repository());
    await expect(
      board.update(ACTOR, POST, { title: 'A title', body: 'A body', idempotencyKey: KEY }),
    ).resolves.toBeNull();
    await expect(board.get(ACTOR, POST)).resolves.toBeNull();
  });

  // The comment column rejects control characters, so a newline typed into
  // the reply box has to be folded before it reaches the database rather than
  // refused there as an unexplained bad request.
  it('folds a newline in a reply to a single space', async () => {
    const sent: string[] = [];
    const board = new BoardService(
      repository({
        createComment: async (_actor, _post, body) => {
          sent.push(body);
          return {
            comment_id: COMMENT,
            body,
            author_name: 'A member',
            created_at: WRITTEN,
            mine: true,
          };
        },
      }),
    );

    await board.createComment(ACTOR, POST, { body: 'first\nsecond', idempotencyKey: KEY });
    expect(sent).toEqual(['first second']);
  });

  it('rejects a reply longer than the column allows before sending it', async () => {
    const board = new BoardService(repository());
    await expect(
      board.createComment(ACTOR, POST, { body: 'x'.repeat(1001), idempotencyKey: KEY }),
    ).rejects.toThrow('comment is invalid');
  });

  it('rejects a row whose reply count is not a whole number', async () => {
    const board = new BoardService(
      repository({
        list: async () => [
          {
            post_id: POST,
            title: 'A title',
            author_name: 'A member',
            created_at: WRITTEN,
            updated_at: null,
            comment_count: 'many',
            mine: false,
          },
        ],
      }),
    );

    await expect(board.list(ACTOR)).rejects.toThrow('invalid comment count');
  });
});
