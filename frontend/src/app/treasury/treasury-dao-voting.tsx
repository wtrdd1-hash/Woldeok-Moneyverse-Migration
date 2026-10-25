'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Vote } from 'lucide-react';

interface TreasuryDaoVotingProps {
  readonly isLoggedIn: boolean;
  readonly isEn?: boolean | undefined;
}

/** A proposal cannot be represented as real without a durable, audited vote receipt. */
export function TreasuryDaoVoting({ isEn = false }: TreasuryDaoVotingProps) {
  const [status, setStatus] = useState<'loading' | 'unverified'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/treasury/proposals', { cache: 'no-store', signal: controller.signal })
      .then(() => { if (!controller.signal.aborted) setStatus('unverified'); })
      .catch(() => { if (!controller.signal.aborted) setStatus('unverified'); });
    return () => controller.abort();
  }, []);

  return (
    <section className="space-y-4" aria-labelledby="treasury-proposals-heading">
      <h2 id="treasury-proposals-heading" className="flex items-center gap-2 text-xl font-bold text-foreground">
        <Vote className="size-5 text-indigo-400" aria-hidden="true" />
        {isEn ? 'Citizen Budget Proposals' : '시민 주민참여예산 제안'}
      </h2>
      <div role="status" aria-live="polite" className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" aria-hidden="true" />
        <p>{status === 'loading'
          ? (isEn ? 'Checking verified proposal records…' : '공공사업 제안·투표 기록 검증 중…')
          : (isEn
            ? 'Proposal and vote records cannot be verified against the treasury ledger. Submission and voting are unavailable; no budget execution is implied.'
            : '공공사업 제안·투표 기록을 국고 원장과 검증할 수 없습니다. 발의와 투표는 중단되었으며 예산 집행을 의미하지 않습니다.')}
        </p>
      </div>
    </section>
  );
}
