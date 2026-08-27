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
 */
export const poolProvider: Provider = {
  provide: PG_POOL,
  inject: [CONFIG],
  useFactory: (config: AppConfig): Pool | null =>
    config.databaseUrl ? new Pool({ connectionString: config.databaseUrl }) : null,
};
