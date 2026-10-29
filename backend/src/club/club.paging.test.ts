import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import type { Queryable } from '../core/db';
import { ClubController } from './club.controller';
import { ClubInputError, PostgresClubRepository } from './club.repository';
import type { ClubService } from './club.service';

const actor = '11111111-2222-4333-8444-555555555555';
const clubId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;
const invalid: unknown[] = ['', '2junk', '1e2', '2.5', '-1', '+2', ' 2', '02', '9999999999999999999999', 'Infinity', ['1', '2'], { limit: '2' }];

describe('ClubController roster and feed paging', () => {
  const service = { listClubs: vi.fn().mockResolvedValue([]), listClubMembers: vi.fn().mockResolvedValue([]), listClubFeed: vi.fn().mockResolvedValue([]) };
  const controller = new ClubController(service as unknown as ClubService);

  for (const value of [...invalid, '0', '101', '10001']) {
    it('rejects invalid club directory limit before service access: ' + JSON.stringify(value), async () => {
      service.listClubs.mockClear();
      await expect(controller.listClubs(request, undefined, value as string, undefined)).rejects.toThrow(BadRequestException);
      expect(service.listClubs).not.toHaveBeenCalled();
    });
  }

  for (const value of [...invalid.filter((v) => v !== '0'), '-1', '10001']) {
    it('rejects invalid club directory offset before service access: ' + JSON.stringify(value), async () => {
      service.listClubs.mockClear();
      await expect(controller.listClubs(request, undefined, undefined, value as string)).rejects.toThrow(BadRequestException);
      expect(service.listClubs).not.toHaveBeenCalled();
    });
  }

  it('preserves club directory defaults and upper bounds', async () => {
    await controller.listClubs(request);
    expect(service.listClubs).toHaveBeenLastCalledWith(actor, undefined, 50, 0);
    await controller.listClubs(request, 'ALPHA', '100', '10000');
    expect(service.listClubs).toHaveBeenLastCalledWith(actor, 'ALPHA', 100, 10000);
  });

  for (const value of invalid) {
    it(`rejects invalid roster limit ${JSON.stringify(value)} before SQL`, async () => {
      service.listClubMembers.mockClear();
      await expect(controller.listClubMembers(request, clubId, value as string, undefined)).rejects.toThrow(BadRequestException);
      expect(service.listClubMembers).not.toHaveBeenCalled();
    });
    it(`rejects invalid roster offset ${JSON.stringify(value)} before SQL`, async () => {
      service.listClubMembers.mockClear();
      await expect(controller.listClubMembers(request, clubId, undefined, value as string)).rejects.toThrow(BadRequestException);
      expect(service.listClubMembers).not.toHaveBeenCalled();
    });
    it(`rejects invalid feed limit ${JSON.stringify(value)} before SQL`, async () => {
      service.listClubFeed.mockClear();
      await expect(controller.listClubFeed(clubId, value as string)).rejects.toThrow(BadRequestException);
      expect(service.listClubFeed).not.toHaveBeenCalled();
    });
  }

  it('rejects out-of-range limits and offsets', async () => {
    await expect(controller.listClubMembers(request, clubId, '101', '0')).rejects.toThrow(BadRequestException);
    await expect(controller.listClubMembers(request, clubId, '50', '10001')).rejects.toThrow(BadRequestException);
    await expect(controller.listClubFeed(clubId, '101')).rejects.toThrow(BadRequestException);
  });

  it('preserves omitted defaults and valid boundaries', async () => {
    await controller.listClubMembers(request, clubId);
    expect(service.listClubMembers).toHaveBeenLastCalledWith(clubId, actor, 50, 0);
    await controller.listClubMembers(request, clubId, '100', '10000');
    expect(service.listClubMembers).toHaveBeenLastCalledWith(clubId, actor, 100, 10000);
    await controller.listClubFeed(clubId);
    expect(service.listClubFeed).toHaveBeenLastCalledWith(clubId, 50);
    await controller.listClubFeed(clubId, '100');
    expect(service.listClubFeed).toHaveBeenLastCalledWith(clubId, 100);
  });
});

describe('PostgresClubRepository direct-call paging', () => {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const repo = new PostgresClubRepository({ query } as unknown as Queryable);
  for (const value of [NaN, Infinity, -Infinity, 0, -1, 1.5, 101, 1e20]) {
    it('rejects invalid club directory limit before SQL: ' + String(value), async () => {
      query.mockClear();
      await expect(repo.listClubs(actor, undefined, value, 0)).rejects.toThrow(ClubInputError);
      expect(query).not.toHaveBeenCalled();
    });
  }
  for (const value of [NaN, Infinity, -Infinity, -1, 1.5, 10001, 1e20]) {
    it('rejects invalid club directory offset before SQL: ' + String(value), async () => {
      query.mockClear();
      await expect(repo.listClubs(actor, undefined, 50, value)).rejects.toThrow(ClubInputError);
      expect(query).not.toHaveBeenCalled();
    });
  }
  it('binds valid club directory paging values', async () => {
    query.mockClear();
    await repo.listClubs(actor, 'ALPHA', 100, 10000);
    expect(query).toHaveBeenLastCalledWith(expect.any(String), [actor, 'ALPHA', 100, 10000]);
  });

  for (const value of [NaN, Infinity, -Infinity, 0, -1, 1.5, 101, 1e20]) {
    it(`rejects invalid roster limit ${String(value)}`, async () => {
      query.mockClear();
      await expect(repo.listClubMembers(clubId, actor, value, 0)).rejects.toThrow(ClubInputError);
      expect(query).not.toHaveBeenCalled();
    });
    it(`rejects invalid feed limit ${String(value)}`, async () => {
      query.mockClear();
      await expect(repo.listClubFeed(clubId, value)).rejects.toThrow(ClubInputError);
      expect(query).not.toHaveBeenCalled();
    });
  }
  for (const value of [NaN, Infinity, -Infinity, -1, 1.5, 10001, 1e20]) {
    it(`rejects invalid roster offset ${String(value)}`, async () => {
      query.mockClear();
      await expect(repo.listClubMembers(clubId, actor, 50, value)).rejects.toThrow(ClubInputError);
      expect(query).not.toHaveBeenCalled();
    });
  }
  it('binds valid upper bounds without coercion', async () => {
    query.mockClear();
    await repo.listClubMembers(clubId, actor, 100, 10000);
    expect(query).toHaveBeenCalledWith(expect.any(String), [clubId, actor, 100, 10000]);
    await repo.listClubFeed(clubId, 100);
    expect(query).toHaveBeenLastCalledWith(expect.any(String), [clubId, 100]);
  });
});
