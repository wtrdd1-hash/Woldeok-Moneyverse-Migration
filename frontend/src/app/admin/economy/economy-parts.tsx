import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatMoment } from '@/lib/money';
import {
  adjustmentDirection,
  alertKindLabel,
  blockedLabel,
  knobRangeLabel,
  knobValueLabel,
  memberCount,
  numericText,
  outcomeLabel,
  payoutDetailLabel,
  percentFromRatio,
  plainCount,
  proposalState,
  reconciliationState,
  ruleLabel,
  severityLabel,
  unpayableCount,
} from './economy';
import type {
  AutoPolicyProposal,
  BulkPayoutItem,
  BulkPayoutPreview,
  EconomyAlert,
  EconomyDashboard,
  PolicyAdjustment,
  PolicyKnob,
} from './economy';

/**
 * The pieces of the economy console worth rendering on their own.
 *
 * None of them is a client component: they hold no state and take no event,
 * so they render on the server with the page -- and the two the payout
 * console needs are still plain functions, which is what lets a `'use client'`
 * file import them without either half changing shape.
 *
 * They live here rather than inside `page.tsx` because a page cannot be
 * rendered in a test -- that needs a live API and a database -- while these
 * can, and what this console is most likely to get wrong is exactly what a
 * test can hold: an unreadable figure, a refusal rendered as an emptiness,
 * and a count of members nobody can pay going unsaid.
 *
 * Each takes the control that acts on it as `children`, so the server half
 * and the client half meet in the page rather than here.
 */

/**
 * One term and its figure.
 *
 * `plain` is the difference between money and a count of things. Both are
 * grouped and both are tabular; only money carries the WLD mark, because a
 * count of open alerts with a currency after it is a different claim.
 */
export function Figure({
  term,
  value,
  plain = false,
  hint,
}: {
  readonly term: string;
  readonly value: string;
  readonly plain?: boolean;
  readonly hint?: string;
}) {
  return (
    <div className="grid gap-0.5 border-b pb-2 last:border-b-0">
      <div className="flex items-baseline justify-between gap-3">
        <dt className="text-sm text-muted-foreground">{term}</dt>
        <dd className="text-sm">
          {plain ? <span className="tabular">{value}</span> : <Amount value={value} currency />}
        </dd>
      </div>
      {hint && <p className="text-xs text-muted-foreground [word-break:keep-all]">{hint}</p>}
    </div>
  );
}

/** What the money supply is made of right now. */
export function SupplyFigures({ dashboard }: { readonly dashboard: EconomyDashboard }) {
  return (
    <dl className="grid gap-2 sm:grid-cols-2">
      <Figure term="통화량 (M2)" value={dashboard.m2_amount} />
      <Figure term="회원 현금" value={dashboard.member_cash_amount} />
      <Figure term="회원 예금" value={dashboard.member_bank_amount} />
      <Figure term="에스크로" value={dashboard.escrow_amount} />
      <Figure term="누적 순발행" value={dashboard.net_mint_issuance_amount} />
      <Figure term="누적 소각 흡수" value={dashboard.sink_absorbed_amount} />
    </dl>
  );
}

/** What has been issued and burned lately, over three windows. */
export function IssuanceFigures({ dashboard }: { readonly dashboard: EconomyDashboard }) {
  return (
    <dl className="grid gap-2 sm:grid-cols-2">
      <Figure term="1시간 발행" value={dashboard.issued_1h} />
      <Figure term="24시간 발행" value={dashboard.issued_24h} />
      <Figure term="7일 발행" value={dashboard.issued_7d} />
      <Figure term="24시간 소각" value={dashboard.burned_24h} />
      <Figure
        term="24시간 순발행"
        value={dashboard.net_issued_24h}
        hint="발행에서 소각을 뺀 값입니다. 계속 양수라면 통화량이 늘고 있습니다."
      />
    </dl>
  );
}

/**
 * The state of the ledger check, in three answers rather than two.
 *
 * `reconciliation_ok` is null until a snapshot has ever been taken, and a red
 * badge on a check that has never run would send an operator looking for a
 * break that nothing has claimed exists.
 */
export function ReconciliationBadge({
  ok,
  at,
}: {
  readonly ok: boolean | null;
  readonly at: string | null;
}) {
  const state = reconciliationState(ok, at);
  if (state === 'never') {
    return (
      <div className="grid gap-1">
        <Badge variant="outline" className="w-fit">
          대사 기록 없음
        </Badge>
        <p className="text-xs text-muted-foreground">
          아직 한 번도 대사가 실행되지 않았어요. 정합성이 깨졌다는 뜻은 아닙니다.
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-1">
      <Badge variant={state === 'passed' ? 'secondary' : 'destructive'} className="w-fit">
        {state === 'passed' ? '정합성 정상' : '정합성 불일치'}
      </Badge>
      <p className="text-xs text-muted-foreground">{formatMoment(at)} 기준</p>
    </div>
  );
}

/** How the economy is holding up, and what is waiting for somebody. */
export function HealthFigures({ dashboard }: { readonly dashboard: EconomyDashboard }) {
  const share = percentFromRatio(dashboard.top_holder_share);
  return (
    <dl className="grid gap-2 sm:grid-cols-2">
      <Figure term="회원 수" value={memberCount(dashboard.member_count)} plain />
      <Figure
        term="최대 보유자 비중"
        value={share ?? '—'}
        plain
        hint="한 지갑이 회원 전체 보유액에서 차지하는 비율입니다."
      />
      <Figure term="열린 알림" value={plainCount(dashboard.open_alert_count, '건')} plain />
      <Figure
        term="전달 실패 이벤트"
        value={plainCount(dashboard.failed_outbox_count, '건')}
        plain
      />
      <Figure term="실행 중인 작업" value={plainCount(dashboard.running_job_count, '개')} plain />
    </dl>
  );
}

/**
 * One alert: what it is, how loud it is, when it was raised, and whether
 * anybody has said they have seen it.
 *
 * `summary` is written by the function that raised the alert and is English.
 * It stays as it is rather than being flattened into a Korean category,
 * because it carries the figure that made somebody care -- the kind above it
 * is what is translated.
 */
export function AlertItem({
  alert,
  children,
}: {
  readonly alert: EconomyAlert;
  readonly children?: React.ReactNode;
}) {
  const acknowledged = alert.acknowledged_at !== null;
  return (
    <div className="grid gap-2 border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={
            alert.severity === 'critical'
              ? 'destructive'
              : alert.severity === 'warning'
                ? 'outline'
                : 'secondary'
          }
        >
          {severityLabel(alert.severity)}
        </Badge>
        <b>{alertKindLabel(alert.kind)}</b>
        <code className="font-mono text-[0.7rem] text-muted-foreground">{alert.kind}</code>
        <span className="text-xs text-muted-foreground">{formatMoment(alert.raised_at)}</span>
        {acknowledged && <Badge variant="outline">확인함</Badge>}
      </div>
      <p className="text-sm [word-break:keep-all]">{alert.summary}</p>
      {acknowledged ? (
        <p className="text-xs text-muted-foreground">
          {formatMoment(alert.acknowledged_at)}에 확인 처리됐어요.
        </p>
      ) : (
        children
      )}
    </div>
  );
}

/**
 * One knob: what it is worth now, the range §15.4 allows it, and whether the
 * engine may move it at all.
 *
 * When the engine would move it this week, the proposed value sits beside the
 * current one with the rules that asked for it. A knob moving five percent
 * with no reason next to it is the thing an operator cannot sign off on.
 */
export function KnobItem({
  knob,
  adjustment,
  children,
}: {
  readonly knob: PolicyKnob;
  readonly adjustment?: PolicyAdjustment | undefined;
  readonly children?: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-2">
        <b>{knob.title}</b>
        <code className="font-mono text-[0.7rem] text-muted-foreground">{knob.knob_key}</code>
        <Badge variant={knob.auto_adjustable ? 'secondary' : 'outline'}>
          {knob.auto_adjustable ? '자동 조정' : '자동 조정 해제'}
        </Badge>
      </div>
      <dl className="grid gap-1 text-sm sm:grid-cols-3">
        <div className="flex items-baseline justify-between gap-3 sm:block">
          <dt className="text-xs text-muted-foreground">현재 값</dt>
          <dd className="tabular">{knobValueLabel(knob.current_value, knob.unit)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 sm:block">
          <dt className="text-xs text-muted-foreground">기준 값</dt>
          <dd className="tabular">{knobValueLabel(knob.baseline_value, knob.unit)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 sm:block">
          <dt className="text-xs text-muted-foreground">허용 범위</dt>
          <dd className="tabular">{knobRangeLabel(knob)}</dd>
        </div>
      </dl>
      {!knob.auto_adjustable && knob.paused_reason !== '' && (
        <p className="text-xs text-muted-foreground [word-break:keep-all]">
          해제 사유: {knob.paused_reason}
        </p>
      )}
      {adjustment && <AdjustmentLine adjustment={adjustment} />}
      {children}
    </div>
  );
}

/** What the engine would do to one knob, and which rules asked for it. */
export function AdjustmentLine({ adjustment }: { readonly adjustment: PolicyAdjustment }) {
  const direction = adjustmentDirection(adjustment);
  return (
    <div className="grid gap-1 rounded-md bg-muted px-3 py-2">
      <div className="flex flex-wrap items-baseline gap-2 text-sm">
        <span className="text-xs text-muted-foreground">이번 제안</span>
        <span className="tabular">
          {knobValueLabel(numericText(adjustment.from), adjustment.unit)} →{' '}
          {knobValueLabel(numericText(adjustment.to), adjustment.unit)}
        </span>
        {direction && (
          <Badge variant="outline">{direction === 'up' ? '상향' : '하향'}</Badge>
        )}
      </div>
      <ul className="grid gap-0.5 text-xs text-muted-foreground">
        {adjustment.rules.map((rule) => (
          <li key={rule} className="[word-break:keep-all]">
            · {ruleLabel(rule)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * What the engine would do today, and when it would not, why not.
 *
 * Four answers, never three: the proposal could not be read at all, something
 * blocked the run, nothing blocked it and no knob moves, or a version is
 * ready to be written. Folding the middle two together is how an operator
 * spends an afternoon looking for a switch that was never off.
 */
export function ProposalPanel({ proposal }: { readonly proposal: AutoPolicyProposal }) {
  const state = proposalState(proposal);
  const blockers = proposal.blockedBy ?? [];
  const observations = proposal.observations ?? [];

  return (
    <div className="grid gap-4">
      {state === 'unreadable' && (
        <EmptyState
          title="엔진 제안을 읽지 못했어요."
          description="지표 창을 계산하지 못했습니다. 잠시 후 다시 확인해 주세요."
        />
      )}

      {state === 'blocked' && (
        <div className="grid gap-2">
          <Badge variant="outline" className="w-fit">
            지금은 실행되지 않아요
          </Badge>
          <ul className="grid gap-1 text-sm text-muted-foreground">
            {blockers.map((reason) => (
              <li key={reason} className="[word-break:keep-all]">
                · {blockedLabel(reason)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {state === 'nothing_to_do' && (
        <EmptyState
          title="이번 주 지표로는 바꿀 값이 없어요."
          description="막힌 조건은 없고, 규칙에 걸리는 지표도 없습니다."
        />
      )}

      {state === 'ready' && (
        <div className="grid gap-3">
          <Badge variant="secondary" className="w-fit">
            {(proposal.adjustments ?? []).length}개 값을 바꿀 준비가 됐어요
          </Badge>
          <div className="grid gap-2">
            {(proposal.adjustments ?? []).map((adjustment) => (
              <div key={adjustment.knob} className="grid gap-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <b className="text-sm">{adjustment.title}</b>
                  <code className="font-mono text-[0.7rem] text-muted-foreground">
                    {adjustment.knob}
                  </code>
                </div>
                <AdjustmentLine adjustment={adjustment} />
              </div>
            ))}
          </div>
        </div>
      )}

      {observations.length > 0 && (
        <div className="grid gap-1">
          <p className="section-label">지켜보는 지표</p>
          <ul className="grid gap-1 text-xs text-muted-foreground">
            {observations.map((observation) => (
              <li key={observation} className="[word-break:keep-all]">
                · {observation}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground [word-break:keep-all]">
            이 항목들은 자동으로 조정하지 않습니다. 사람이 판단할 몫으로 남겨 둔 지표입니다.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * What a batch would cost and how many members it would miss, before anybody
 * confirms it.
 *
 * The gap between the target count and the payable count is the reason this
 * panel exists, so it is stated as its own figure rather than left for the
 * reader to subtract. Who those members are is not knowable here:
 * `admin_preview_bulk_payout` returns counts and no identities, and the
 * per-member report only exists once a batch has run. Saying so is better
 * than a list this screen would have to invent.
 */
export function PreviewPanel({ preview }: { readonly preview: BulkPayoutPreview }) {
  const unpayable = unpayableCount(preview);
  const blocked = unpayable !== null && unpayable !== '0';

  return (
    <div className="grid gap-3">
      <dl className="grid gap-2 sm:grid-cols-2">
        <Figure term="조건에 맞는 회원" value={memberCount(preview.target_count)} plain />
        <Figure term="지급 가능한 회원" value={memberCount(preview.payable_count)} plain />
        <Figure
          term="지급할 수 없는 회원"
          value={unpayable === null ? '—' : memberCount(unpayable)}
          plain
        />
        <Figure term="지급 총액" value={preview.total_amount} />
      </dl>
      <p className="text-xs text-muted-foreground">
        적용될 정책 버전: <span className="tabular">{preview.policy_version ?? '없음'}</span>
      </p>
      {blocked && (
        <p className="text-sm text-clay-ink [word-break:keep-all]">
          사용 중인 현금 계좌가 없는 회원은 지급 대상에서 빠집니다. 누구인지는 실행 뒤 보고서에서만
          확인할 수 있어요.
        </p>
      )}
      {preview.payable_count === '0' && (
        <p className="text-sm text-destructive [word-break:keep-all]">
          지금 조건으로는 아무에게도 지급되지 않아요. 조건을 바꿔 다시 확인해 주세요.
        </p>
      )}
    </div>
  );
}

/** Who was paid, who was skipped and who failed, one row each. */
export function PayoutReportTable({ items }: { readonly items: readonly BulkPayoutItem[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>회원</TableHead>
            <TableHead>결과</TableHead>
            <TableHead>사유 · 거래</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.user_id}>
              <TableCell>
                <code className="font-mono text-[0.7rem]">{item.user_id}</code>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    item.outcome === 'paid'
                      ? 'secondary'
                      : item.outcome === 'failed'
                        ? 'destructive'
                        : 'outline'
                  }
                >
                  {outcomeLabel(item.outcome)}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground [word-break:keep-all]">
                {item.transaction_id === null ? (
                  payoutDetailLabel(item)
                ) : (
                  <code className="font-mono text-[0.7rem]">{item.transaction_id}</code>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
