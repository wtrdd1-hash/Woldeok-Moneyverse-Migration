import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, isMissingGrant, rejectionOf } from '../testing/database';
import { ProfileRepository } from './profile.repository';

/**
 * The repository's own SQL, executed.
 *
 * `member-profile.db.test.ts` at the root of src covers what migration 080
 * decides -- who may see what, and the self-exclusion -- through raw queries.
 * It runs no line of this module's SQL, and the mistakes that live in that
 * SQL are invisible to every other kind of test: a mistyped OUT parameter
 * name yields `undefined` with no type error, and a dropped `::text` yields a
 * rounded number with no error at all.
 *
 * So these go through `ProfileRepository`. The first block connects as
 * moneyverse_app, the role the API runs as, which is what makes it
 * meaningful: every refusal has to come from a function deciding, never from
 * the role having lost a grant. The second block needs members to exist and
 * so belongs to the schema owner, inside a transaction that is thrown away.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

/** A well-formed uuid that is nobody. 080 refuses it, which is the point. */
const NOBODY = '00000000-0000-4000-8000-000000000000';

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('the profile repository against a real database', () => {
  let pool: Pool;
  let profiles: ProfileRepository;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
    profiles = new ProfileRepository(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('as the role the API runs as', () => {
    /**
     * Parameter order, proved. `member_profile_view` takes the actor first
     * and the subject second, and it is the subject it checks for an active
     * account -- so a nobody asked about anybody reaches 28000 rather than
     * answering.
     */
    it('refuses a subject who is not an active member', async () => {
      const error = await rejectionOf(() => profiles.view(NOBODY, NOBODY));
      expect(code(error)).toBe('28000');
    });

    // The actor comes first for the write because it carries no idempotency
    // key, and a member who is not active cannot edit a profile at all.
    it('refuses an actor who is not an active member', async () => {
      const error = await rejectionOf(() =>
        profiles.update(NOBODY, {
          visibility: 'members',
          displayName: null,
          imageUrl: null,
          fieldVisibility: {},
          featuredTitle: null,
        }),
      );
      expect(code(error)).toBe('28000');
    });

    /**
     * Every refusal above has to be a function deciding, never the role
     * having lost a grant. Both arrive as an error and only one of them means
     * the deployment is broken -- and 080 grants execute on exactly these two
     * functions and deliberately withholds `member_field_visible`, so that
     * the application cannot answer the visibility question itself.
     */
    it('is refused by the functions themselves, never by a missing grant', async () => {
      const attempts = [
        () => profiles.view(NOBODY, NOBODY),
        () =>
          profiles.update(NOBODY, {
            visibility: 'private',
            displayName: null,
            imageUrl: null,
            fieldVisibility: {},
            featuredTitle: null,
          }),
      ];
      for (const attempt of attempts) {
        const error = await rejectionOf(attempt);
        expect(isMissingGrant(error), 'the role lost a grant').toBe(false);
      }
    });

    it('cannot reach the profile tables except through those functions', async () => {
      for (const table of ['member_profiles', 'member_titles', 'user_titles']) {
        const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${table}`));
        const message = String((error as { message?: string }).message);
        expect(message, table).toMatch(/permission denied/i);
      }
    });
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('with members to look at', () => {
    let migrator: Pool;

    beforeAll(() => {
      migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
    });

    afterAll(async () => {
      await migrator.end();
    });

    const rolledBack = async (body: (client: PoolClient) => Promise<void>): Promise<void> => {
      const client = await migrator.connect();
      try {
        await client.query('BEGIN');
        await body(client);
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    };

    const member = async (client: PoolClient): Promise<string> => {
      const id = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
      return id;
    };

    /**
     * A PoolClient satisfies Queryable structurally, which is what lets the
     * repository run inside this transaction rather than beside it. These
     * members are never committed, so the moneyverse_app pool above could not
     * see them from its own connection.
     */
    const inTransaction = (client: PoolClient): ProfileRepository => new ProfileRepository(client);

    /**
     * The column names, in the spelling 080 declares them. A rename in a later
     * migration turns every one of these into `undefined` with no type error,
     * and this is the assertion that says so out loud.
     */
    it('answers a read with exactly the columns 080 declares', async () => {
      await rolledBack(async (client) => {
        const subject = await member(client);
        const profile = await inTransaction(client).view(subject, subject);
        expect(Object.keys(profile).sort()).toEqual(
          [
            'display_name',
            'featured_title',
            'image_url',
            'job_type',
            'job_level',
            'joined_at',
            'visibility',
            'work_completions',
          ].sort(),
        );
      });
    });

    /**
     * 079 declares 'members' as the default and nothing wrote the table
     * before 080, so a member who has never opened the screen still has to be
     * readable -- on those terms rather than on none.
     */
    it('reads a member who has never opened the screen on the declared default', async () => {
      await rolledBack(async (client) => {
        const subject = await member(client);
        const viewer = await member(client);
        const profile = await inTransaction(client).view(viewer, subject);
        expect(profile.visibility).toBe('members');
      });
    });

    /**
     * A count of completed work is a bigint. Read back as a number it would
     * be rounded above 2^53, and the cast that stops that lives in the SELECT
     * rather than in TypeScript -- so its absence is only visible here.
     */
    it('reads a work count back as a string rather than a number', async () => {
      await rolledBack(async (client) => {
        const subject = await member(client);
        const profile = await inTransaction(client).view(subject, subject);
        expect(typeof profile.work_completions).toBe('string');
        expect(profile.work_completions).toBe('0');
      });
    });

    it('keeps a private profile to its owner', async () => {
      await rolledBack(async (client) => {
        const subject = await member(client);
        const viewer = await member(client);
        const repository = inTransaction(client);
        await repository.update(subject, {
          visibility: 'private',
          displayName: 'Quiet',
          imageUrl: null,
          fieldVisibility: {},
          featuredTitle: null,
        });

        // A savepoint, because a failed statement aborts the transaction and
        // everything after it would answer 25P02 instead of what it was asked.
        await client.query('SAVEPOINT before_refusal');
        const error = await rejectionOf(() => repository.view(viewer, subject));
        expect(code(error)).toBe('28000');
        await client.query('ROLLBACK TO SAVEPOINT before_refusal');

        const own = await repository.view(subject, subject);
        expect(own.display_name).toBe('Quiet');
      });
    });

    /**
     * The per-field map is the feature. A setting stored and not applied is
     * the failure 080's own comments refuse to ship: the member is told their
     * image is private while every other member keeps seeing it.
     */
    it('applies a per-field setting rather than storing it and ignoring it', async () => {
      await rolledBack(async (client) => {
        const subject = await member(client);
        const viewer = await member(client);
        const repository = inTransaction(client);
        await repository.update(subject, {
          visibility: 'public',
          displayName: 'Open',
          imageUrl: 'https://example.test/a.png',
          fieldVisibility: { imageUrl: 'private', workCompletions: 'private' },
          featuredTitle: null,
        });

        const seen = await repository.view(viewer, subject);
        expect(seen.display_name).toBe('Open');
        expect(seen.image_url, 'a withheld field is null rather than absent').toBeNull();
        expect(seen.work_completions).toBeNull();

        const own = await repository.view(subject, subject);
        expect(own.image_url).toBe('https://example.test/a.png');
        expect(own.work_completions).toBe('0');
      });
    });

    /**
     * The write echoes the stored settings, and `field_visibility` is the
     * reason it has to: no granted function reads `member_profiles` back, so
     * this response is the only place that map can be observed. jsonb arrives
     * parsed, not as text to be parsed again here.
     */
    it('gives the stored settings back, per-field map included', async () => {
      await rolledBack(async (client) => {
        const subject = await member(client);
        const settings = await inTransaction(client).update(subject, {
          visibility: 'members',
          displayName: 'Named',
          imageUrl: null,
          fieldVisibility: { jobType: 'private' },
          featuredTitle: null,
        });

        expect(Object.keys(settings).sort()).toEqual(
          ['display_name', 'featured_title', 'field_visibility', 'image_url', 'visibility'].sort(),
        );
        expect(settings.visibility).toBe('members');
        expect(settings.field_visibility).toEqual({ jobType: 'private' });
      });
    });

    /**
     * A replacement rather than a patch. This is the behaviour a caller is
     * most likely to be surprised by, so it is asserted against the real
     * function rather than assumed from reading it.
     */
    it('clears a field the second write leaves out', async () => {
      await rolledBack(async (client) => {
        const subject = await member(client);
        const repository = inTransaction(client);
        await repository.update(subject, {
          visibility: 'public',
          displayName: 'First',
          imageUrl: 'https://example.test/a.png',
          fieldVisibility: { imageUrl: 'public' },
          featuredTitle: null,
        });

        const settings = await repository.update(subject, {
          visibility: 'public',
          displayName: null,
          imageUrl: null,
          fieldVisibility: null,
          featuredTitle: null,
        });
        expect(settings.display_name).toBeNull();
        expect(settings.image_url).toBeNull();
        expect(settings.field_visibility).toEqual({});
      });
    });

    /**
     * A title the member holds is theirs to feature; one they do not hold is
     * refused by 080 rather than by anything here, because only the database
     * knows what has been awarded. No granted function lists those awards, so
     * this is also the only way a caller can discover the answer today.
     */
    it('refuses a well-formed title the member has not been awarded', async () => {
      await rolledBack(async (client) => {
        const subject = await member(client);
        const error = await rejectionOf(() =>
          inTransaction(client).update(subject, {
            visibility: 'public',
            displayName: null,
            imageUrl: null,
            fieldVisibility: {},
            featuredTitle: 'season_honour',
          }),
        );
        expect(code(error)).toBe('22023');
      });
    });

    it('features a title the member does hold', async () => {
      await rolledBack(async (client) => {
        const subject = await member(client);
        await client.query(
          `INSERT INTO public.user_titles (user_id, title_id)
           SELECT $1, title_row.id FROM public.member_titles AS title_row
           WHERE title_row.code = 'starter'`,
          [subject],
        );

        const repository = inTransaction(client);
        const settings = await repository.update(subject, {
          visibility: 'public',
          displayName: null,
          imageUrl: null,
          fieldVisibility: {},
          featuredTitle: 'starter',
        });
        expect(settings.featured_title).toBe('starter');

        const profile = await repository.view(subject, subject);
        expect(profile.featured_title).toBe('starter');
      });
    });

    /**
     * A closed account stops being on show. Knowing a member's id was
     * otherwise enough to keep reading their profile after they left.
     */
    it('stops reading a member who is no longer active', async () => {
      await rolledBack(async (client) => {
        const subject = await member(client);
        const viewer = await member(client);
        const repository = inTransaction(client);
        await repository.update(subject, {
          visibility: 'public',
          displayName: 'Gone',
          imageUrl: null,
          fieldVisibility: {},
          featuredTitle: null,
        });
        await client.query(
          `UPDATE public.users
           SET status = 'deleted'::public.user_status, deleted_at = clock_timestamp()
           WHERE id = $1`,
          [subject],
        );

        const error = await rejectionOf(() => repository.view(viewer, subject));
        expect(code(error)).toBe('28000');
      });
    });
  });
});
