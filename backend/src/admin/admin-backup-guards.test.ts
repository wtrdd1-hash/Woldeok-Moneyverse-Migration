import { GUARDS_METADATA, METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { AdminBackupController } from './admin-backup.controller';

const expectedGuards = [
  SessionGuard,
  AuthenticatedGuard,
  ConsentGuard,
  AdminGuard,
  AdminSessionGuard,
  CsrfGuard,
];

describe('AdminBackupController authorization boundary', () => {
  it('requires an elevated administrator console session for every backup endpoint', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, AdminBackupController)).toEqual(expectedGuards);
  });

  it.each([
    ['getBackupStatus', RequestMethod.GET, '/'],
    ['triggerBackup', RequestMethod.POST, 'trigger'],
  ] as const)('%s remains behind the class-level guard chain', (method, verb, path) => {
    const handler = AdminBackupController.prototype[method];
    expect(Reflect.getMetadata(METHOD_METADATA, handler)).toBe(verb);
    expect(Reflect.getMetadata(PATH_METADATA, handler)).toBe(path ?? '');
    expect(Reflect.getMetadata(GUARDS_METADATA, AdminBackupController)).toEqual(expectedGuards);
  });
});
