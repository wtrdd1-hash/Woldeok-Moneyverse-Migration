import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ProblemFilter } from '../core/problem.filter';
import { CraftingController } from './crafting.controller';
import { CraftingService } from './crafting.service';

describe('P0 crafting source/ledger containment at the real Nest HTTP boundary', () => {
  let app: INestApplication;
  const listRecipes = vi.fn(() => [{ id: 'recipe_moonlight_tint', feeWld: 150 }]);
  const executeCrafting = vi.fn(async () => ({ success: true, fee_wld: 150, item_code: 'frame_moonlight_emerald' }));

  beforeAll(async () => {
    const builder = Test.createTestingModule({
      controllers: [CraftingController],
      providers: [{ provide: CraftingService, useValue: { listRecipes, executeCrafting } }],
    });
    for (const guard of [SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard]) {
      builder.overrideGuard(guard).useValue({ canActivate: () => true });
    }
    const moduleRef = await builder.compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new ProblemFilter(true));
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { user_id: '11111111-1111-4111-8111-111111111111' };
      next();
    });
    await app.init();
  });
  afterAll(async () => app?.close());

  it('refuses unverified official recipe availability rather than returning static inventory promises', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/crafting/recipes').expect(503);
    expect(response.body.code).toBe('CRAFTING_SOURCE_UNVERIFIED');
    expect(response.body).not.toHaveProperty('recipes');
    expect(listRecipes).not.toHaveBeenCalled();
  });

  it('refuses a valid crafting request without invoking any unledgered DB function or claiming item delivery', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/crafting/execute').send({
      recipeId: 'recipe_moonlight_tint', idempotencyKey: '22222222-2222-4222-8222-222222222222',
    }).expect(503);
    expect(response.body.code).toBe('CRAFTING_LEDGER_UNAVAILABLE');
    expect(response.body).not.toHaveProperty('success', true);
    expect(response.body).not.toHaveProperty('item_code');
    expect(executeCrafting).not.toHaveBeenCalled();
  });

  it('retains session, identity, consent and mutation CSRF guards', () => {
    const classGuards = Reflect.getMetadata(GUARDS_METADATA, CraftingController) ?? [];
    expect(classGuards).toEqual(expect.arrayContaining([SessionGuard, AuthenticatedGuard, ConsentGuard]));
    const writeGuards = Reflect.getMetadata(GUARDS_METADATA, CraftingController.prototype.executeCrafting) ?? [];
    expect(writeGuards).toContain(CsrfGuard);
  });
});
