import { describe, expect, it } from 'vitest';
import { PublicBoardService } from './public-board.service';

const POST = '11111111-2222-4333-8444-555555555555';
const COMMENT = '22222222-3333-4444-8555-666666666666';

describe('PublicBoardService', () => {
  it('maps public posts without ever marking them as owned by the viewer', async () => {
    const pool = {
      query: async (text: string) => {
        if (text.includes('member_board_public_list')) {
          return {
            rows: [
              {
                post_id: POST,
                title: '공개 글',
                author_name: '작성자',
                created_at: new Date('2026-09-08T00:00:00Z'),
                updated_at: null,
                comment_count: '2',
                mine: false,
                image_storage_key: null,
                image_alt_text: null,
              },
            ],
          };
        }
        return { rows: [] };
      },
    };

    const service = new PublicBoardService(pool);
    await expect(service.list()).resolves.toEqual([
      expect.objectContaining({ postId: POST, title: '공개 글', commentCount: 2, mine: false }),
    ]);
  });

  it('maps a public thread and comments with public image URLs', async () => {
    const key = '33333333-4444-4555-8666-777777777777.webp';
    const pool = {
      query: async (text: string) => {
        if (text.includes('member_board_public_get')) {
          return {
            rows: [
              {
                post_id: POST,
                title: '공개 글',
                body: '본문',
                author_name: '작성자',
                created_at: new Date('2026-09-08T00:00:00Z'),
                updated_at: null,
                mine: false,
                image_storage_key: key,
                image_alt_text: '첨부 이미지',
              },
            ],
          };
        }
        if (text.includes('member_board_public_comment_list')) {
          return {
            rows: [
              {
                comment_id: COMMENT,
                body: '댓글',
                author_name: '댓글러',
                created_at: new Date('2026-09-08T00:01:00Z'),
                mine: false,
              },
            ],
          };
        }
        return { rows: [] };
      },
    };

    const service = new PublicBoardService(pool);
    await expect(service.get(POST)).resolves.toMatchObject({
      postId: POST,
      mine: false,
      imageUrl: `/media/board/${key}`,
      imageAltText: '첨부 이미지',
    });
    await expect(service.comments(POST)).resolves.toEqual([
      expect.objectContaining({ commentId: COMMENT, body: '댓글', mine: false }),
    ]);
  });
});
