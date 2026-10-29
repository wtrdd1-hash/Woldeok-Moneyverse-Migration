/**
 * Dedicated single-purpose blog publisher v1419.
 *
 * This is an independent, one-shot systemd timer worker. It deliberately never
 * starts Nest's global economy scheduler, stock ticker, or another publisher.
 * It uses the same verified article author, official HTTPS source validation,
 * locale checks and idempotent SECURITY DEFINER database publication as the
 * application. No legacy JSON fallback or draft approval workflow.
 */
import 'reflect-metadata';
import { Pool } from 'pg';
import { createVerifiedBlogJob } from './blog-verified-job';
import { BlogVerifiedRepository } from './blog-verified.repository';
import { selectTwoHourBlogSlot } from './blog-two-hour-rotation';

const HOUR_MS = 60 * 60 * 1000;
const SEOUL_OFFSET_MS = 9 * HOUR_MS;
const LOCK_KEYS = ['moneyverse-blog', 'verified-2hour'] as const;

/** Catch up within the immediately preceding 2-hour Korean local window. */
export function activePublicationWindow(now: Date): Date {
  if (!Number.isFinite(now.getTime())) throw new Error('INVALID_CLOCK');
  const koreanHour = new Date(now.getTime() + SEOUL_OFFSET_MS).getUTCHours();
  return new Date(now.getTime() - (koreanHour % 2) * HOUR_MS);
}

export async function publishAutomaticBlogWindow(
  pool: Pick<Pool, 'connect'>,
  now = new Date(),
): Promise<Record<string, unknown>> {
  const slot = selectTwoHourBlogSlot(activePublicationWindow(now));
  if (!slot) throw new Error('WINDOW_SELECTION_FAILED');
  if (process.env.BLOG_TWO_HOUR_PUBLISHER_ENABLED !== 'true')
    return { skipped: true, reason: 'PUBLISHER_DISABLED', periodKey: slot.periodKey };

  // Keep a single PG session and a named session advisory lock across
  // fetch/model/write, preventing two agents generating the same period.
  const client = await pool.connect();
  let locked = false;
  try {
    const res = await client.query<{ locked: boolean }>(
      'SELECT pg_try_advisory_lock(hashtext($1),hashtext($2)) AS locked',
      [...LOCK_KEYS],
    );
    locked = res.rows[0]?.locked === true;
    if (!locked) return { skipped: true, reason: 'PUBLISHER_BUSY', periodKey: slot.periodKey };

    const repo = new BlogVerifiedRepository(client);
    const run = createVerifiedBlogJob(repo, detail => {
      console.warn('VERIFIED_BLOG_GENERATION_FAILED', detail);
    }, () => activePublicationWindow(now));
    const result = await run();
    return { ...result };
  } finally {
    if (locked) {
      try {
        await client.query('SELECT pg_advisory_unlock(hashtext($1),hashtext($2))', [...LOCK_KEYS]);
      } catch (error) {
        console.error('VERIFIED_BLOG_ADVISORY_UNLOCK_FAILED', error instanceof Error ? error.message : 'unknown');
      }
    }
    client.release();
  }
}

async function main(): Promise<void> {
  if (process.argv.length !== 2) throw new Error('NO_EXTERNAL_PERIOD_OVERRIDE');
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error('DATABASE_URL_REQUIRED');
  if (process.env.BLOG_TWO_HOUR_PUBLISHER_ENABLED !== 'true')
    throw new Error('VERIFIED_PUBLISHER_NOT_ENABLED');
  const db = new Pool({
    connectionString: url,
    max: 1,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 1000,
    application_name: 'moneyverse_verified_blog_2hour_v1419',
  });
  try {
    const result = await publishAutomaticBlogWindow(db);
    console.log(JSON.stringify({
      component: 'blog_verified_auto_publisher',
      at: new Date().toISOString(),
      ...result,
    }));
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('VERIFIED_BLOG_PUBLISH_FAILED', error instanceof Error ? error.message : 'UNKNOWN_FAILURE');
    process.exitCode = 1;
  });
}
