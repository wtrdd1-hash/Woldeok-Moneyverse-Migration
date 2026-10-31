import { describe, expect, it } from 'vitest';
import { alertStatus, alertStatusUrl } from './alert-status';

describe('stock alert condition status selection', () => {
  it('accepts only canonical status and rejects repeated or malformed values', () => {
    expect(alertStatus(undefined)).toBe('all');
    expect(alertStatus('met')).toBe('met');
    expect(alertStatus('watching')).toBe('watching');
    expect(alertStatus('all')).toBe('all');
    expect(alertStatus(['met', 'watching'])).toBeNull();
    expect(alertStatus('MET')).toBeNull();
    expect(alertStatus('')).toBeNull();
  });
  it('preserves stock deep link and sends only a canonical filter to Nest', () => {
    expect(alertStatusUrl('met')).toBe('/api/v1/stocks/alerts?status=met');
    expect(alertStatusUrl('all')).toBe('/api/v1/stocks/alerts');
  });
});
