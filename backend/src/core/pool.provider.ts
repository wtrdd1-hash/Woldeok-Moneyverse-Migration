import type { Provider } from '@nestjs/common';
import { Pool } from 'pg';
import type { AppConfig } from './config';
import { CONFIG } from './config';

export const PG_POOL = Symbol('PG_POOL');

/**
 * Null when no DATABASE_URL is configured. Every service that depends on the
 * database checks for null and reports itself unavailable rather than
 * inventing data: the original application's public pages stay readable with
 * the store offline, and its APIs answer 503.
 *
 * The pool is bounded on purpose -- see `DatabasePoolConfig`. Until now it was
 * constructed from the connection string alone, which meant `pg`'s defaults:
 * ten connections, and an unbounded wait for the eleventh. The count was
 * survivable; the wait was not, because a saturated pool answered nothing
 * instead of answering 503, and the caller could not tell the two apart.
 */
export const poolProvider: Provider = {
  provide: PG_POOL,
  inject: [CONFIG],
  useFactory: (config: AppConfig): Pool | null =>
    config.databaseUrl
      ? new Pool({ connectionString: config.databaseUrl, ...config.databasePool })
      : null,
};
