import { expect, it } from 'vitest';
import { PUBLIC_SEO_STATUS_FIELDS } from './seo-status-public';
it('does not expose crawler logs in public SEO status', () => {
  expect(PUBLIC_SEO_STATUS_FIELDS).not.toContain('recentLogs');
  expect(PUBLIC_SEO_STATUS_FIELDS).not.toContain('indexNowKey');
});