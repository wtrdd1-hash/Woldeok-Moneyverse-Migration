import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { AiNewsController } from './ai-news.controller';

function guardsOn(method: 'saveSettings' | 'autoGenerate' | 'publish' | 'generate' | 'discard'): unknown[] {
  return (Reflect.getMetadata(GUARDS_METADATA, AiNewsController.prototype[method]) as unknown[] | undefined) ?? [];
}

describe('AI news privileged mutation guards', () => {
  it.each(['saveSettings', 'autoGenerate', 'publish'] as const)(
    'requires CSRF and recent reauthentication for %s',
    (method) => {
      expect(guardsOn(method)).toEqual(expect.arrayContaining([CsrfGuard, ReauthGuard]));
    },
  );

  it.each(['generate', 'discard'] as const)(
    'keeps non-publishing workflow mutation %s behind CSRF without forcing step-up',
    (method) => {
      expect(guardsOn(method)).toContain(CsrfGuard);
      expect(guardsOn(method)).not.toContain(ReauthGuard);
    },
  );
});
