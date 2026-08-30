import { describe, expect, it } from 'vitest';
import type { Queryable } from '../core/db';
import { ProfileInputError, ProfileRepository } from './profile.repository';

interface RecordedQuery {
  readonly text: string;
  readonly values: readonly unknown[] | undefined;
}

/**
 * Everything 080 stores, answered without a database. What is under test here
 * is only what this repository decides before the function is called -- the
 * function itself is exercised in `profile.repository.db.test.ts`, which CI
 * runs against a real Postgres and this machine cannot.
 */
function recordingPool(): { pool: Queryable; queries: RecordedQuery[] } {
  const queries: RecordedQuery[] = [];
  const pool: Queryable = {
    async query(text: string, values?: readonly unknown[]) {
      queries.push({ text, values });
      return {
        rows: [
          {
            visibility: 'members',
            display_name: null,
            image_url: null,
            field_visibility: {},
            featured_title: null,
          },
        ] as never[],
      };
    },
  };
  return { pool, queries };
}

const NOBODY = '00000000-0000-4000-8000-000000000000';

function update(overrides: Record<string, unknown> = {}) {
  return {
    visibility: 'members',
    displayName: null,
    imageUrl: null,
    fieldVisibility: {},
    featuredTitle: null,
    ...overrides,
  };
}

describe('ProfileRepository.update', () => {
  /**
   * The assertion this module exists to make. 080 checks the *values* of
   * field_visibility and accepts any key, so a misspelt one is stored and
   * read by nothing -- and the member is told a field is private while every
   * other member keeps seeing it.
   */
  it('refuses a field whose visibility nothing will ever read', async () => {
    const { pool, queries } = recordingPool();
    await expect(
      new ProfileRepository(pool).update(
        NOBODY,
        update({ fieldVisibility: { imageURL: 'private' } }),
      ),
    ).rejects.toBeInstanceOf(ProfileInputError);
    expect(queries, 'the statement must not be sent at all').toHaveLength(0);
  });

  it('accepts every field member_profile_view consults', async () => {
    const { pool, queries } = recordingPool();
    await new ProfileRepository(pool).update(
      NOBODY,
      update({
        fieldVisibility: {
          profile: 'members',
          imageUrl: 'private',
          jobType: 'public',
          workCompletions: 'members',
          featuredTitle: 'private',
        },
      }),
    );
    // Parsed rather than compared as text: the map goes to a jsonb parameter,
    // and the order the keys were written in is not part of what it means.
    const sent = queries[0]?.values ?? [];
    expect(JSON.parse(String(sent[4]))).toEqual({
      profile: 'members',
      imageUrl: 'private',
      jobType: 'public',
      workCompletions: 'members',
      featuredTitle: 'private',
    });
  });

  it('refuses a visibility outside the three 079 declares', async () => {
    const { pool } = recordingPool();
    const repository = new ProfileRepository(pool);
    await expect(repository.update(NOBODY, update({ visibility: 'friends' }))).rejects.toThrow(
      /public, members or private/,
    );
    await expect(
      repository.update(NOBODY, update({ fieldVisibility: { imageUrl: 'friends' } })),
    ).rejects.toThrow(/public, members or private/);
  });

  /**
   * 079 bounds the image address by length and nothing else, and the web tier
   * renders it into an `img` element.
   */
  it('refuses an image address that is not an address', async () => {
    const { pool } = recordingPool();
    const repository = new ProfileRepository(pool);
    for (const address of [
      'javascript:alert(1)',
      'data:text/html;base64,PHN2Zz4=',
      '//evil.test/a.png',
      '/\\evil.test/a.png',
      'evil.test/a.png',
    ]) {
      const rejection = await repository.update(NOBODY, update({ imageUrl: address })).then(
        () => null,
        (error: unknown) => error,
      );
      expect(rejection, address).toBeInstanceOf(ProfileInputError);
    }
  });

  it('keeps an https address and a path on this site', async () => {
    const { pool, queries } = recordingPool();
    const repository = new ProfileRepository(pool);
    await repository.update(NOBODY, update({ imageUrl: 'https://example.test/a.png' }));
    await repository.update(NOBODY, update({ imageUrl: '/media/abc123' }));
    expect(queries[0]?.values?.[3]).toBe('https://example.test/a.png');
    expect(queries[1]?.values?.[3]).toBe('/media/abc123');
  });

  /**
   * The write is a replacement, so a field the member cleared has to reach
   * the function as NULL rather than be dropped from the statement. A name of
   * three spaces would otherwise pass 079's `char_length >= 1`.
   */
  it('sends a blank field as null rather than as blank', async () => {
    const { pool, queries } = recordingPool();
    await new ProfileRepository(pool).update(
      NOBODY,
      update({ displayName: '   ', imageUrl: '', featuredTitle: undefined }),
    );
    const sent = queries[0]?.values ?? [];
    expect(sent[2]).toBeNull();
    expect(sent[3]).toBeNull();
    expect(sent[5]).toBeNull();
  });

  it('trims a display name rather than storing the spaces', async () => {
    const { pool, queries } = recordingPool();
    await new ProfileRepository(pool).update(NOBODY, update({ displayName: '  달빛  ' }));
    expect(queries[0]?.values?.[2]).toBe('달빛');
  });

  /**
   * A NUL is the sharp end: Postgres answers 22021, which `pg-error.ts` does
   * not recognise, so without this a member reaches a 500 by typing one. The
   * others are about what a name does on somebody else's screen.
   */
  it('refuses a name Postgres would not store or a screen could not render', async () => {
    const { pool, queries } = recordingPool();
    const repository = new ProfileRepository(pool);
    for (const name of ['a\u0000b', 'first\nsecond', 'admin\u202e']) {
      const rejection = await repository.update(NOBODY, update({ displayName: name })).then(
        () => null,
        (error: unknown) => error,
      );
      expect(rejection, JSON.stringify(name)).toBeInstanceOf(ProfileInputError);
    }
    expect(queries).toHaveLength(0);
  });

  /**
   * The pattern is 079's own. A code that could never match a row is the
   * member's typo and is answered here; a well-formed code they have not been
   * awarded is 080's answer to give.
   */
  it('refuses a featured title that is not a title code', async () => {
    const { pool } = recordingPool();
    await expect(
      new ProfileRepository(pool).update(NOBODY, update({ featuredTitle: 'Season Honour!' })),
    ).rejects.toBeInstanceOf(ProfileInputError);
  });

  it('passes a well-formed title code through for the database to judge', async () => {
    const { pool, queries } = recordingPool();
    await new ProfileRepository(pool).update(NOBODY, update({ featuredTitle: 'season_honour' }));
    expect(queries[0]?.values?.[5]).toBe('season_honour');
  });

  it('sends the actor first, as 080 takes it', async () => {
    const { pool, queries } = recordingPool();
    await new ProfileRepository(pool).update(NOBODY, update());
    expect(queries[0]?.values?.[0]).toBe(NOBODY);
    expect(queries[0]?.text).toContain('public.member_update_profile');
  });
});

describe('ProfileRepository.view', () => {
  it('sends the actor first and the subject second', async () => {
    const { pool, queries } = recordingPool();
    const other = '00000000-0000-4000-8000-000000000001';
    await new ProfileRepository(pool).view(NOBODY, other);
    expect(queries[0]?.values).toEqual([NOBODY, other]);
    expect(queries[0]?.text).toContain('public.member_profile_view');
  });

  /**
   * A malformed id is a sentence about the field rather than a 500 carrying a
   * message about a function, and the assertions are synchronous -- the
   * method is async so they reject the promise instead of throwing at the
   * call site, where the controller's mapping would never see them.
   */
  it('rejects a malformed member id without reaching the database', async () => {
    const { pool, queries } = recordingPool();
    await expect(new ProfileRepository(pool).view(NOBODY, 'not-a-uuid')).rejects.toThrow(
      'member id must be a UUID',
    );
    expect(queries).toHaveLength(0);
  });

  /**
   * The function refuses a subject it will not show and returns exactly one
   * row for one it will. No rows is schema drift, and reporting it as 200
   * with an empty body would leave a screen unable to tell a hidden profile
   * from a broken one.
   */
  it('fails loudly when the function returns no row', async () => {
    const pool: Queryable = {
      async query() {
        return { rows: [] as never[] };
      },
    };
    await expect(new ProfileRepository(pool).view(NOBODY, NOBODY)).rejects.toThrow(
      'member_profile_view did not return a row',
    );
  });
});
