import 'reflect-metadata';
import { GUARDS_METADATA, HEADERS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { DeokiAdvisorController } from './deoki-advisor.controller';

const ACTOR = '11111111-1111-4111-8111-111111111111';

function headersFor(name: 'getDiagnosis' | 'askDeoki'): Record<string, string> {
  const headers = Reflect.getMetadata(HEADERS_METADATA, DeokiAdvisorController.prototype[name]) as Array<{ name: string; value: string }> | undefined;
  return Object.fromEntries((headers ?? []).map(({ name, value }) => [name.toLowerCase(), value]));
}

describe('Deoki advisor actor and privacy boundary', () => {
  it('requires session, authentication and current consent on both advisor routes', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, DeokiAdvisorController) as unknown[] | undefined;
    expect(guards).toEqual([SessionGuard, AuthenticatedGuard, ConsentGuard]);
  });

  it('requires CSRF on POST ask and private no-store/noindex on both routes', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, DeokiAdvisorController.prototype.askDeoki)).toEqual([CsrfGuard]);
    for (const name of ['getDiagnosis', 'askDeoki'] as const) {
      expect(headersFor(name)).toMatchObject({ 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' });
    }
  });

  it('rejects missing session rather than passing a synthetic guest actor to SQL', async () => {
    const diagnoseUserPortfolio = vi.fn();
    const askDeoki = vi.fn();
    const controller = new DeokiAdvisorController({ diagnoseUserPortfolio, askDeoki } as never);
    await expect(controller.getDiagnosis({} as never)).rejects.toMatchObject({ status: 401 });
    await expect(controller.askDeoki({} as never, { question: 'risk' })).rejects.toMatchObject({ status: 401 });
    expect(diagnoseUserPortfolio).not.toHaveBeenCalled();
    expect(askDeoki).not.toHaveBeenCalled();
  });

  it('uses the verified session actor and never exposes SQL errors to the client', async () => {
    const diagnoseUserPortfolio = vi.fn().mockRejectedValue(new Error('permission denied for virtual_stock_positions'));
    const askDeoki = vi.fn().mockRejectedValue(new Error('SQL 42501 private details'));
    const controller = new DeokiAdvisorController({ diagnoseUserPortfolio, askDeoki } as never);
    const request = { session: { user_id: ACTOR } } as never;
    await expect(controller.getDiagnosis(request)).rejects.toMatchObject({ status: 503, message: 'advisor source unavailable' });
    await expect(controller.askDeoki(request, { question: 'risk' })).rejects.toMatchObject({ status: 503, message: 'advisor source unavailable' });
    expect(diagnoseUserPortfolio).toHaveBeenCalledWith(ACTOR);
    expect(askDeoki).toHaveBeenCalledWith(ACTOR, 'risk');
  });

  it('reports unavailable service as 503, not a client-side 400', async () => {
    const controller = new DeokiAdvisorController(null);
    await expect(controller.getDiagnosis({ session: { user_id: ACTOR } } as never)).rejects.toMatchObject({ status: 503 });
  });
});
