import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
const source = (path: string) => readFileSync(join(process.cwd(), 'src', path), 'utf8');
describe('accessible reading preference entrypoints', () => {
  it('makes the guest page noindex and local-only without a server session', () => {
    const page = source('app/accessibility/page.tsx');
    expect(page).toContain("robots: { index: false, follow: false }");
    expect(page).toContain('<ReadingScaleControls />');
    expect(page).not.toContain('requireMember');
    expect(source('components/site-footer.tsx')).toContain('href="/accessibility"');
  });
  it('makes the member page private and links it from account navigation', () => {
    expect(source('app/account/accessibility/page.tsx')).toContain('await requireMember()');
    expect(source('app/account/accessibility/page.tsx')).toContain('noindex');
    expect(source('app/account/page.tsx')).toContain('href="/account/accessibility"');
  });
  it('applies the validated preference before the first paint', () => {
    expect(source('app/layout.tsx')).toContain('READING_SCALE_SCRIPT');
  });
  it('offers native keyboard-accessible radio inputs and truthful device-only status', () => {
    const component = source('components/reading-scale-controls.tsx');
    expect(component).toContain('type="radio"');
    expect(component).toContain('type="button"');
    expect(component).toContain('aria-live="polite"');
    expect(component).toContain('이 브라우저');
  });
});
