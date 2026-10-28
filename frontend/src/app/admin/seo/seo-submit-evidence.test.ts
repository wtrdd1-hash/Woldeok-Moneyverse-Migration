import { describe, expect, it } from 'vitest';
import { parseIndexNowSubmissionReceipt } from './seo-submit-evidence';

const valid = {
  success: true,
  submittedUrls: ['https://easy-scraping.com/stocks/CHIPS'],
  indexNowResponses: [
    { endpoint: 'https://api.indexnow.org/indexnow', status: 200, message: 'Notification received' },
    { endpoint: 'https://searchadvisor.naver.com/indexnow', status: 503, message: 'Unavailable' },
    { endpoint: 'https://www.bing.com/indexnow', status: 202, message: 'Key verification pending' },
  ],
  googlePingStatus: 410,
  timestamp: new Date().toISOString(),
};

describe('IndexNow backend receipt integrity', () => {
  it('accepts only a consistent real provider receipt', () => {
    expect(parseIndexNowSubmissionReceipt(valid)?.acceptedEndpoints).toBe(2);
    expect(parseIndexNowSubmissionReceipt(valid)?.totalEndpoints).toBe(3);
  });
  it('rejects invented success and missing provider outcomes', () => {
    expect(parseIndexNowSubmissionReceipt({ ...valid, success: true, indexNowResponses: valid.indexNowResponses.map((p) => ({ ...p, status: 503 })) })).toBeNull();
    expect(parseIndexNowSubmissionReceipt({ ...valid, indexNowResponses: [] })).toBeNull();
    expect(parseIndexNowSubmissionReceipt({ ...valid, indexNowResponses: [valid.indexNowResponses[0], valid.indexNowResponses[0], valid.indexNowResponses[2]] })).toBeNull();
    expect(parseIndexNowSubmissionReceipt({ ...valid, submittedUrls: [] })).toBeNull();
    expect(parseIndexNowSubmissionReceipt({ ...valid, submittedUrls: ['https://other.example/path'] }, 'https://easy-scraping.com')).toBeNull();
  });
  it('rejects future, stale and malformed submission evidence', () => {
    expect(parseIndexNowSubmissionReceipt({ ...valid, timestamp: 'bad' })).toBeNull();
    expect(parseIndexNowSubmissionReceipt({ ...valid, timestamp: new Date(Date.now() + 3 * 60_000).toISOString() })).toBeNull();
    expect(parseIndexNowSubmissionReceipt({ ...valid, timestamp: new Date(Date.now() - 60 * 60_000).toISOString() })).toBeNull();
    expect(parseIndexNowSubmissionReceipt({ ...valid, googlePingStatus: 200 })).toBeNull();
  });
});
