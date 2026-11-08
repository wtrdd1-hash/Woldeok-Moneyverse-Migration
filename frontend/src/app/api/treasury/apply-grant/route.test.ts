import { describe, expect, it, vi } from 'vitest';
import * as grantRoute from './route';

vi.mock('@/lib/mutate', () => ({
  mutate: vi.fn().mockResolvedValue({
    ok: true,
    message: '창업 지원금 신청서가 성공적으로 접수되었습니다.',
    result: { id: 'test-grant-id', status: 'PENDING' },
  }),
}));

describe('Treasury grant apply route contract', () => {
  it('exports only Next.js sanctioned route module keys', () => {
    expect(Object.keys(grantRoute).sort()).toEqual(['POST', 'dynamic']);
  });

  it('rejects incomplete application body with 400 Bad Request', async () => {
    const request = new Request('http://localhost/api/treasury/apply-grant', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ applicantName: '테스터' }),
    });
    const response = await grantRoute.POST(request);
    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    const data = await response.json();
    expect(data.ok).toBe(false);
    expect(data.message).toContain('필수 입력 항목');
  });

  it('successfully submits valid application and returns 200 OK', async () => {
    const request = new Request('http://localhost/api/treasury/apply-grant', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        applicantName: '홍길동',
        businessName: '네오스마트팜',
        businessPlan: '도시 스마트팜 인프라 및 신선 채소 유통 비즈니스 모델 구축',
        category: 'COMMERCE',
        tier: 'TIER_1_SEED',
      }),
    });
    const response = await grantRoute.POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.message).toContain('성공적으로 접수되었습니다');
  });
});

