import type { Provider } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { EarlyGameRepository } from './early-game.repository';

/**
 * One provider object, imported by both modules that serve part of 16.1.
 *
 * The ladder belongs on /progression, beside the growth stage and the credit
 * ladder it extends; the weekly goals and the collection books belong on
 * /engagement, beside the quests screen that renders them. Two controllers
 * therefore need the same repository, and writing the factory twice would be
 * two places for the null-when-offline rule to drift.
 *
 * A factory, not a class provider. `EarlyGameRepository`'s constructor takes
 * `Queryable`, which is an interface: TypeScript erases it to `Object` in
 * design:paramtypes, so Nest has no token to resolve and AppModule throws at
 * bootstrap -- taking the whole API down, not just these two routes.
 *
 * Null with no DATABASE_URL, because the application has to boot and answer
 * 503 on these routes rather than refuse to start.
 */
export const EARLY_GAME_REPOSITORY_PROVIDER: Provider = {
  provide: EarlyGameRepository,
  inject: [PG_POOL],
  useFactory: (pool: Queryable | null) => (pool ? new EarlyGameRepository(pool) : null),
};
