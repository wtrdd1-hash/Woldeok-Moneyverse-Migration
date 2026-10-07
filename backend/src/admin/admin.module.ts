import { AdminShopController } from './admin-shop.controller';
import { AiNewsController } from './ai-news.controller';
import { AiNewsRepository } from './ai-news.repository';
import { AiNewsService } from './ai-news.service';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SessionRepository } from '../auth/session.repository';
import { sealingKeyFrom } from '../auth/totp';
import { AdminLoginPolicyRepository } from './admin-login-policy.repository';
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

import { AdminTreasuryController } from './treasury/treasury.controller';
import { TreasuryRepository } from './treasury/treasury.repository';
import { TreasuryService } from './treasury/treasury.service';
import { AutoSovereignWealthFundService } from './treasury/auto-swf.service';
import { ApiHealthController } from './api-health.controller';
import { AdminEnterpriseController, PublicEnterpriseController } from './enterprises/enterprise.controller';
import { EnterpriseRepository } from './enterprises/enterprise.repository';
import { EnterpriseService } from './enterprises/enterprise.service';
import { AdminTreasuryBondController, PublicTreasuryBondController } from './bonds/treasury-bond.controller';
import { TreasuryBondRepository } from './bonds/treasury-bond.repository';
import { TreasuryBondService } from './bonds/treasury-bond.service';
import { AdminNationalPensionController, PublicNationalPensionController } from './pension/national-pension.controller';
import { NationalPensionRepository } from './pension/national-pension.repository';
import { NationalPensionService } from './pension/national-pension.service';
import { AdminFxController, PublicFxController } from './fx/fx.controller';
import { FxRepository } from './fx/fx.repository';
import { FxService } from './fx/fx.service';
import { DiscordAlertService } from '../discord/discord-alert.service';

@Module({
  imports: [AuthModule, StockModule],
  controllers: [
    ApiHealthController,
    AdminTreasuryController,
    AdminEnterpriseController,
    PublicEnterpriseController,
    AdminTreasuryBondController,
    PublicTreasuryBondController,
    AdminNationalPensionController,
    PublicNationalPensionController,
    AdminFxController,
    PublicFxController,
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
      provide: AdminLoginPolicyRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => pool ? new AdminLoginPolicyRepository(pool) : null,
    },
    {
      provide: AdminSecurityService,
      inject: [AdminLoginPolicyRepository, SessionRepository],
      useFactory: (policy: AdminLoginPolicyRepository | null, sessions: SessionRepository | null) =>
        policy && sessions ? new AdminSecurityService({ policy, sessions }) : null,
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
    {
      provide: TreasuryRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new TreasuryRepository(pool) : null),
    },
    {
      provide: TreasuryService,
      inject: [TreasuryRepository],
      useFactory: (repo: TreasuryRepository | null) => (repo ? new TreasuryService(repo) : null),
    },
    AutoSovereignWealthFundService,
    {
      provide: EnterpriseRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new EnterpriseRepository(pool) : null),
    },
    {
      provide: EnterpriseService,
      inject: [EnterpriseRepository],
      useFactory: (repo: EnterpriseRepository | null) => (repo ? new EnterpriseService(repo) : null),
    },
    {
      provide: TreasuryBondRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new TreasuryBondRepository(pool as any) : null),
    },
    {
      provide: TreasuryBondService,
      inject: [TreasuryBondRepository, DiscordAlertService],
      useFactory: (repo: TreasuryBondRepository | null, discord: DiscordAlertService | null) =>
        repo ? new TreasuryBondService(repo, discord ?? undefined) : null,
    },
    {
      provide: NationalPensionRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new NationalPensionRepository(pool as any) : null),
    },
    {
      provide: NationalPensionService,
      inject: [NationalPensionRepository, DiscordAlertService],
      useFactory: (repo: NationalPensionRepository | null, discord: DiscordAlertService | null) =>
        repo ? new NationalPensionService(repo, discord ?? undefined) : null,
    },
    {
      provide: FxRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new FxRepository(pool as any) : null),
    },
    {
      provide: FxService,
      inject: [FxRepository, DiscordAlertService],
      useFactory: (repo: FxRepository | null, discord: DiscordAlertService | null) =>
        repo ? new FxService(repo, discord ?? undefined) : null,
    },
  ],
  exports: [
    AdminService,
    AuditRepository,
    AutoSovereignWealthFundService,
    EnterpriseService,
    TreasuryBondService,
    NationalPensionService,
    FxService,
  ],
})
export class AdminModule {}
