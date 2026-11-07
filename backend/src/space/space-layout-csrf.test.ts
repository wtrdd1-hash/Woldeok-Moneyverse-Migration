import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SpaceController } from './space.controller';

describe('owner space layout CSRF boundary', () => {
  it('requires session-bound CSRF on the persisted PUT layout mutation', () => {
    const guards = (Reflect.getMetadata(GUARDS_METADATA, SpaceController.prototype.updateLayout) as unknown[]) ?? [];
    expect(guards).toContain(CsrfGuard);
  });
});
