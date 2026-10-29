import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { AdminTreasuryController } from './treasury.controller';
import type { Pool } from 'pg';
import type { DiscordAlertService } from '../../discord/discord-alert.service';
import { AutoSovereignWealthFundService } from './auto-swf.service';

describe('v1501 manual sovereign-fund liquidation containment', () => {
  it('requires CSRF protection on the direct backend financial mutation route', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, AdminTreasuryController.prototype.liquidateSwfToTreasury) as unknown[];
    expect(guards).toContain(CsrfGuard);
  });


  it('rejects unsafe cash normalization before opening a transaction or sending a success notification', async () => {
    const pool = { connect: vi.fn(), query: vi.fn() };
    const alerts = { sendDiscordEmbed: vi.fn(), sendAdminDirectMessage: vi.fn() };
    const service = new AutoSovereignWealthFundService(
      pool as unknown as Pool,
      alerts as unknown as DiscordAlertService,
    );

    await expect(service.liquidateToTreasuryVault('20000000')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(pool.connect).not.toHaveBeenCalled();
    expect(pool.query).not.toHaveBeenCalled();
    expect(alerts.sendDiscordEmbed).not.toHaveBeenCalled();
    expect(alerts.sendAdminDirectMessage).not.toHaveBeenCalled();
  });
});
