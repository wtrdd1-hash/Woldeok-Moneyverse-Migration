import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./actions', () => ({ createSupportThread: vi.fn(), replySupportThread: vi.fn() }));

import { NewSupportThreadForm, SupportReplyForm } from './support-compose-forms';

const KEY = 'd92451e0-334e-4dcb-887e-7b6f9327eac9';
const THREAD = 'df02b115-9a0e-4f93-a8f2-4dc8130d7d9a';

describe('support retry form drafts', () => {
  it('retains the draft and same idempotency key when the form is reset after an action', () => {
    const { container } = render(<NewSupportThreadForm idempotencyKey={KEY} />);
    const subject = screen.getByLabelText('문의 제목') as HTMLInputElement;
    const body = screen.getByLabelText('문의 내용') as HTMLTextAreaElement;
    fireEvent.change(subject, { target: { value: '내 문의' } });
    fireEvent.change(body, { target: { value: '확인해 주세요' } });
    fireEvent.reset(container.querySelector('form')!);
    expect(subject.value).toBe('내 문의');
    expect(body.value).toBe('확인해 주세요');
    expect((container.querySelector('input[name="idempotencyKey"]') as HTMLInputElement).value).toBe(KEY);
  });

  it('retains the reply draft and owner thread reference after a form reset', () => {
    const { container } = render(<SupportReplyForm threadId={THREAD} idempotencyKey={KEY} />);
    const body = screen.getByLabelText('답장 내용') as HTMLTextAreaElement;
    fireEvent.change(body, { target: { value: '다시 보내기' } });
    fireEvent.reset(container.querySelector('form')!);
    expect(body.value).toBe('다시 보내기');
    expect((container.querySelector('input[name="threadId"]') as HTMLInputElement).value).toBe(THREAD);
    expect((container.querySelector('input[name="idempotencyKey"]') as HTMLInputElement).value).toBe(KEY);
  });
});
