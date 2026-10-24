import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_API_CONTRACT_VERSION, appGatewayPath } from './app-gateway';

interface Endpoint {
  readonly method: string;
  readonly path: string;
  readonly operationId: string;
  readonly authorization: string;
  readonly parameters: readonly { name: string; required: boolean }[];
  readonly responseSchema: { properties: Record<string, { type: string }> };
}

describe('native wallet pocket history contract', () => {
  it('publishes an owner-only, bounded, discoverable Android GET endpoint', () => {
    const document = JSON.parse(readFileSync(resolve(process.cwd(), '../docs/mobile-api-contract.json'), 'utf8')) as {
      contractVersion: string;
      endpoints: Endpoint[];
    };
    expect(document.contractVersion).toBe(APP_API_CONTRACT_VERSION);
    const matches = document.endpoints.filter((entry) => entry.path === '/app-api/v1/wallet/transactions');
    expect(matches).toHaveLength(1);
    const endpoint = matches[0]!;
    expect(endpoint.method).toBe('GET');
    expect(endpoint.operationId).toBe('WalletController_pocketTransactions');
    expect(endpoint.authorization).toMatch(/로그인/);
    expect(endpoint.parameters.find((item) => item.name === 'pocket')?.required).toBe(true);
    expect(endpoint.responseSchema.properties.transactions?.type).toBe('array');
    expect(appGatewayPath(['wallet', 'transactions'])).toBe('/api/v1/wallet/transactions');
  });
});
