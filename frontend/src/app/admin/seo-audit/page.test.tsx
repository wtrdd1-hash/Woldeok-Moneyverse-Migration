import { describe, it, expect } from 'vitest';
import Page from './page';
describe('SEO audit page', () => { it('is async', () => { expect(Page.constructor.name).toBe('AsyncFunction'); }); });
