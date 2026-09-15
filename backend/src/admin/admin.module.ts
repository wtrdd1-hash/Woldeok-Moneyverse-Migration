import { AdminShopController } from './admin-shop.controller';
import { AiNewsController } from './ai-news.controller';
import { AiNewsRepository } from './ai-news.repository';
import { AiNewsService } from './ai-news.service';
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
import { EncryptionService } from '../security/encryption.service';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { AdminAuditController } from './audit.controller';
import { AdminSecurityController } from './admin-security.controller';
import { AdminSecurityService } from './admin-security.service';
import { AbuseSecurityController } from './abuse-security.controller';
import { AbuseSecurityRepository } from './abuse-security.repository';
import { AdminService } from './admin.service';
import { AuditRepository } from './audit.repository';
import { AdminControlsController } from './controls.controller';
import { ControlsRepository } from './controls.repository';
import { GameCatalogController } from './game-catalog.controller';
import { PostgresGameCatalogRepository } from './game-catalog.repository';
import {
  AdminBankOperationsController,
  AdminDiscordOperationsController,
  AdminWorkOperationsController,
} from './operations.controller';
import { OperationsRepository } from './operations.repository';

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
  return process.env.ADMIN_DEVICE_HASH_PEPPER || config.internalToken;
}

@Module({
  imports: [AuthModule, StockModule],
  controllers: [
    AdminShopController,
    AdminController,
    AdminAuditController,
    AdminControlsController,
    AdminSecurityController,
    AbuseSecurityController,
    GameCatalogController,
    AiNewsController,
    AdminWorkOperationsController,
    AdminBankOperationsController,
    AdminDiscordOperationsController,
  ],
  providers: [
    {
      provide: AdminService,
      inject: [PG_POOL, EncryptionService],
      useFactory: (pool: Queryable | null, encryption: EncryptionService) =>
        pool ? new AdminService({ repository: new AdminRepository(pool, encryption) }) : null,
    },
    {
      provide: AuditRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new AuditRepository(pool) : null),
    },
    {
      provide: ControlsRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new ControlsRepository(pool) : null),
    },
    {
      provide: AbuseSecurityRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new AbuseSecurityRepository(pool) : null),
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
              sealing: sealingKeyFrom(process.env),
              issuer: new URL(config.baseUrl).host,
            })
          : null,
    },
    {
      provide: AiNewsService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new AiNewsService(new AiNewsRepository(pool), sealingKeyFrom(process.env)) : null,
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
    {
      provide: OperationsRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new OperationsRepository(pool) : null),
    },
  ],
  exports: [AdminService, AuditRepository],
})
export class AdminModule {}
