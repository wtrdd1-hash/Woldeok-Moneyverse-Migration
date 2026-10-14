import { describe, it, expect } from 'vitest';
import { GET } from './route';

describe('SEO audit access', () => {
  it('does not expose audit inventory to anonymous callers', async () => {
    const response = await GET();
    expect(response.status).toBe(401);
  });
});
