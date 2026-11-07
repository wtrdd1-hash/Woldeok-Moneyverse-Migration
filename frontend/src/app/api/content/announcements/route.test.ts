import { beforeEach, describe, expect, it, vi } from 'vitest';
const { apiMock } = vi.hoisted(() => ({apiMock:vi.fn()}));
vi.mock('@/lib/api', () => ({apiOrNull:apiMock}));
import { GET } from './route';

beforeEach(()=>vi.resetAllMocks());

describe('public announcement availability BFF',()=>{
  it('returns 503 rather than a cached false-empty result when DB is offline',async()=>{
    apiMock.mockResolvedValue(null);
    const response=await GET();
    expect(response.status).toBe(503);
    expect((await response.json()).announcements).toBeUndefined();
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it('rejects legacy success-shaped unverified empty payload',async()=>{
    apiMock.mockResolvedValue({announcements:[]});
    expect((await GET()).status).toBe(503);
  });
  it('returns verified empty with count=0 only after DB proof',async()=>{
    apiMock.mockResolvedValue({sourceStatus:'VERIFIED',count:0,announcements:[]});
    const response=await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({sourceStatus:'VERIFIED',count:0,announcements:[]});
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
});
