import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BankPrivacyNotice } from './bank-privacy-notice';

describe('private virtual banking evidence', () => {
  it('explains that loan and credit evidence are member-only in Korean', () => {
    expect(renderToStaticMarkup(<BankPrivacyNotice locale='ko' />)).toContain('대출과 신용정보는 로그인한 본인만 조회');
  });
  it('explains the same boundary in English', () => {
    expect(renderToStaticMarkup(<BankPrivacyNotice locale='en' />)).toContain('Only you can view your loan and credit information');
  });
});
