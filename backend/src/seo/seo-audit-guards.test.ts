import { describe, expect, it } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { SeoController } from './seo.controller';

function guardsOn(method: keyof SeoController): unknown[] {
  const descriptor = Object.getOwnPropertyDescriptor(SeoController.prototype, method);
  return Reflect.getMetadata('__guards__', descriptor?.value) ?? [];
}

describe('SEO audit and digest administrator authority', () => {
  for (const method of ['getCrawlAudit', 'getDigestReport'] as const) {
    it(`protects ${method} reads with the administrator session chain`, () => {
      expect(guardsOn(method)).toEqual(
        expect.arrayContaining([
          SessionGuard,
          AuthenticatedGuard,
          ConsentGuard,
          AdminGuard,
          AdminSessionGuard,
        ]),
      );
    });
  }

  for (const method of ['triggerCrawlAudit', 'triggerDigestReport'] as const) {
    it(`protects ${method} mutations with administrator session and CSRF`, () => {
      expect(guardsOn(method)).toEqual(
        expect.arrayContaining([
          SessionGuard,
          AuthenticatedGuard,
          ConsentGuard,
          AdminGuard,
          AdminSessionGuard,
          CsrfGuard,
        ]),
      );
    });
  }
});
