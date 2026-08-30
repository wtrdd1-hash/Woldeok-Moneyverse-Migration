import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SecondFactorRepository } from '../auth/second-factor.repository';
import { SessionRepository } from '../auth/session.repository';
import { sealingKeyFrom } from '../auth/totp';
import type { AppConfig } from '../core/config';
import { CONFIG } from '../core/config';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { StockModule } from '../stock/stock.module';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { AdminSecurityController } from './admin-security.controller';
import { AdminSecurityService } from './admin-security.service';
import { AdminService } from './admin.service';
import { AdminControlsController } from './controls.controller';
import { ControlsRepository } from './controls.repository';
import { GameCatalogController } from './game-catalog.controller';
import { PostgresGameCatalogRepository } from './game-catalog.repository';

/**
 * The device pepper.
 *
 * A trusted device is remembered by a hash of the browser's own headers, and
 * without a pepper that hash is a lookup away from being reversed by trying
 * the few hundred common User-Agent strings. It falls back to the internal
 * API token because that is a secret every deployment already has, and a
 * missing pepper must not silently degrade to none.
 */
function devicePepper(config: AppConfig): string {
  // `||`, not `??`: compose writes `${ADMIN_DEVICE_HASH_PEPPER:-}` when the
  // variable is unset, so the value arrives as an empty string rather than
  // absent, and an empty pepper is no pepper.
  return process.env.ADMIN_DEVICE_HASH_PEPPER || config.internalToken;
}

@Module({
  imports: [AuthModule, StockModule],
  controllers: [
    AdminController,
    AdminControlsController,
    AdminSecurityController,
    GameCatalogController,
  ],
  providers: [
    {
      provide: AdminService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new AdminService({ repository: new AdminRepository(pool) }) : null,
    },
    {
      provide: ControlsRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new ControlsRepository(pool) : null),
    },
    {
      provide: AdminSecurityService,
      inject: [CONFIG, SecondFactorRepository, SessionRepository],
      useFactory: (
        config: AppConfig,
        factors: SecondFactorRepository | null,
        sessions: SessionRepository | null,
      ) =>
        factors && sessions
          ? new AdminSecurityService({
              factors,
              sessions,
              // Read here rather than from AppConfig: the module factories in
              // this codebase already own their optional environment (photo
              // storage, market ticker, status collector), and a deployment
              // without the key has to boot and answer "unavailable" on these
              // routes rather than refuse to start.
              sealing: sealingKeyFrom(process.env),
              issuer: new URL(config.baseUrl).host,
            })
          : null,
    },
    {
      provide: 'ADMIN_DEVICE_PEPPER',
      inject: [CONFIG],
      useFactory: devicePepper,
    },
    {
      provide: PostgresGameCatalogRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new PostgresGameCatalogRepository(pool) : null,
    },
  ],
  exports: [AdminService],
})
export class AdminModule {}
