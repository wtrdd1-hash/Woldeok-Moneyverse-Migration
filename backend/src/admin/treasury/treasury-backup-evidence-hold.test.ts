import { describe, expect, it, vi } from 'vitest';
import { TreasuryRepository } from './treasury.repository';
import { TreasuryService } from './treasury.service';

const UNAVAILABLE = 'TREASURY_BACKUP_EVIDENCE_UNAVAILABLE';

describe('Treasury backup evidence boundary', () => {
  it('refuses a fabricated cloud snapshot before any database access', async () => {
    const query = vi.fn();
    const repository = new TreasuryRepository({ query } as never);
    await expect(repository.createImmutableBackupSnapshot('00000000-0000-0000-0000-000000000001'))
      .rejects.toThrow(UNAVAILABLE);
    expect(query).not.toHaveBeenCalled();
  });

  it('refuses hard-coded verified backup inventory without database access', async () => {
    const query = vi.fn();
    const repository = new TreasuryRepository({ query } as never);
    await expect(repository.getBackupStatus()).rejects.toThrow(UNAVAILABLE);
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects snapshot POST with HTTP 503 even if a repository returns fabricated success', async () => {
    const repository = {
      createImmutableBackupSnapshot: vi.fn().mockResolvedValue({ snapshot_id: 'FABRICATED' }),
    } as unknown as TreasuryRepository;
    const service = new TreasuryService(repository);
    await expect(service.createBackupSnapshot('00000000-0000-0000-0000-000000000001'))
      .rejects.toMatchObject({ status: 503, response: { code: UNAVAILABLE } });
    expect(repository.createImmutableBackupSnapshot).not.toHaveBeenCalled();
  });

  it('rejects backup status GET with HTTP 503 even if a repository returns fabricated verification', async () => {
    const repository = {
      getBackupStatus: vi.fn().mockResolvedValue({ stored_snapshots_count: 54 }),
    } as unknown as TreasuryRepository;
    const service = new TreasuryService(repository);
    await expect(service.getBackupStatus())
      .rejects.toMatchObject({ status: 503, response: { code: UNAVAILABLE } });
    expect(repository.getBackupStatus).not.toHaveBeenCalled();
  });
});
