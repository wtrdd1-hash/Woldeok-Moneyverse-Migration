// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const botSource = readFileSync('../bot/index.js', 'utf8');
const routeSource = readFileSync('src/app/api/discord/broadcast/route.ts', 'utf8');
const buttonSource = readFileSync('src/app/admin/discord/admin-discord-broadcast-test-button.tsx', 'utf8');
const pageSource = readFileSync('src/app/admin/discord/page.tsx', 'utf8');

describe('Discord Realtime Governance & Financial Broadcast Engine', () => {
  it('implements HTTP webhook listener in bot/index.js with port 3099', () => {
    expect(botSource).toContain('BROADCAST_PORT');
    expect(botSource).toContain('/broadcast');
    expect(botSource).toContain('webhookServer');
  });

  it('provides /api/discord/broadcast route with graceful fallback', () => {
    expect(routeSource).toContain('BOT_BROADCAST_URL');
    expect(routeSource).toContain('AbortSignal.timeout');
    expect(routeSource).toContain('deliveredToBot');
  });

  it('renders test buttons for landmark auction, treasury proposal, and copy-trades', () => {
    expect(buttonSource).toContain('LANDMARK_AUCTION');
    expect(buttonSource).toContain('TREASURY_PROPOSAL');
    expect(buttonSource).toContain('COPY_TRADE');
    expect(buttonSource).toContain('/api/discord/broadcast');
  });

  it('mounts AdminDiscordBroadcastTestButton in admin/discord page', () => {
    expect(pageSource).toContain('AdminDiscordBroadcastTestButton');
  });
});
