'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { SubmitButton } from '@/components/action-form';
import { reportVerifiedHelp, type HelpReportState } from './report-action';

const INITIAL: HelpReportState = { status: 'idle' };
export function HelpReportForm({ locale, slug, publishedRevisionId, idempotencyKey }: {
  readonly locale: 'ko' | 'en'; readonly slug: string; readonly publishedRevisionId: string; readonly idempotencyKey: string;
}) {
  const [state, action] = useActionState(reportVerifiedHelp, INITIAL);
  const en = locale === 'en';
  return <section className="rounded-2xl border bg-card p-4" aria-labelledby="help-report-title">
    <h2 id="help-report-title" className="font-semibold">{en ? 'Report an issue with this article' : '도움말 내용 오류 신고'}</h2>
    <p className="mt-1 text-sm text-muted-foreground">{en ? 'Signed-in members can send a private report to support. Do not include passwords or personal data.' : '로그인 회원만 관리자에게 비공개로 신고할 수 있습니다. 비밀번호나 개인정보는 입력하지 마세요.'}</p>
    <form action={action} className="mt-3 grid gap-3">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="publishedRevisionId" value={publishedRevisionId} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <label htmlFor="help-report-reason" className="text-sm font-medium">{en ? 'Reason' : '신고 사유'}</label>
      <select id="help-report-reason" name="reason" required className="min-h-11 rounded-xl border bg-background p-2">
        <option value="outdated">{en ? 'Outdated instructions' : '오래된 정보'}</option>
        <option value="incorrect">{en ? 'Incorrect information' : '잘못된 정보'}</option>
        <option value="unclear">{en ? 'Unclear instructions' : '이해하기 어려운 설명'}</option>
      </select>
      <label htmlFor="help-report-details" className="text-sm font-medium">{en ? 'What should be corrected?' : '수정이 필요한 내용을 알려주세요'}</label>
      <textarea id="help-report-details" name="details" minLength={10} maxLength={600} required className="min-h-24 rounded-xl border bg-background p-3" />
      <SubmitButton className="min-h-11">{en ? 'Send private report' : '비공개 신고 보내기'}</SubmitButton>
      {state.status !== 'idle' && <p role="status" aria-live="polite" className="text-sm">{
        state.status === 'ok' ? (en ? 'Report saved and verified.' : '신고 저장을 확인했습니다.') :
          state.status === 'invalid' ? (en ? 'Check the report fields.' : '입력값을 확인해 주세요.') :
            state.status === 'unavailable' ? (en ? 'Sign in or try later.' : '로그인 후 다시 시도해 주세요.') :
              (en ? 'Submission status is uncertain. Check your support inbox before retrying.' : '전송 여부가 불확실합니다. 다시 보내기 전에 문의함을 확인해 주세요.')
      }</p>}
      {state.status === 'ok' && state.threadId && <Link className="underline underline-offset-2" href={`/support?thread=${encodeURIComponent(state.threadId)}`}>{en ? 'View your private report' : '내 비공개 신고 확인'}</Link>}
    </form>
  </section>;
}
