import 'reflect-metadata';
import { ServiceUnavailableException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { Queryable } from '../core/db';
import { WorkController } from './work.controller';
import { WorkRepository } from './work.repository';

const ACTOR = '00000000-0000-4000-8000-000000000001';
const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;
const certification = { jobType: 'developer', qualificationCode: 'UNIFORM_STYLING' };
const CODE = 'WORK_QUALIFICATION_LEDGER_UNAVAILABLE';

async function expectLedgerHold(action: () => Promise<unknown>): Promise<void> {
  try {
    await action();
    throw new Error('Unsafe qualification certification was accepted');
  } catch (error) {
    expect(error).toBeInstanceOf(ServiceUnavailableException);
    const exception = error as ServiceUnavailableException;
    expect(exception.getStatus()).toBe(503);
    expect(exception.getResponse()).toMatchObject({ code: CODE });
  }
}

describe('P0 job qualification fee ledger containment', () => {
  it('rejects certification at the controller before any repository method executes', async () => {
    const certifyQualification = vi.fn().mockResolvedValue({ id: 'unsafe-success' });
    const controller = new WorkController({ certifyQualification } as unknown as WorkRepository);
    await expectLedgerHold(() => controller.certify(request, certification));
    expect(certifyQualification).not.toHaveBeenCalled();
  });

  it('rejects even when the controller has no repository', async () => {
    await expectLedgerHold(() => new WorkController(null).certify(request, certification));
  });

  it('rejects direct repository calls before feature checks or fee SQL', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ result: { id: 'unsafe-success' } }] });
    const repository = new WorkRepository({ query } as unknown as Queryable);
    await expectLedgerHold(() => repository.certifyQualification(ACTOR, 'developer', 'UNIFORM_STYLING'));
    expect(query).not.toHaveBeenCalled();
  });

  it('preserves the authentication, consent and CSRF guard stack for the write route', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, WorkController)).toEqual([
      SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard,
    ]);
  });
});
