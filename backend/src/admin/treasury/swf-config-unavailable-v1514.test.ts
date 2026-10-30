import { describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import type { DiscordAlertService } from '../../discord/discord-alert.service';
import { AutoSovereignWealthFundService } from './auto-swf.service';

describe('v1514 SWF unavailable evidence truth', () => {
  it('returns 503 rather than inventing an enabled policy or a last execution timestamp', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const connect = vi.fn();
    const sendDiscordEmbed = vi.fn();
    const service = new AutoSovereignWealthFundService(
      { query, connect } as unknown as Pool,
      { sendDiscordEmbed } as unknown as DiscordAlertService,
    );
    await expect(service.getConfig()).rejects.toMatchObject({
      status: 503,
      response: { code: 'SWF_CONFIG_UNAVAILABLE' },
    });
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).toContain('SELECT');
    expect(connect).not.toHaveBeenCalled();
    expect(sendDiscordEmbed).not.toHaveBeenCalled();
  });
});
