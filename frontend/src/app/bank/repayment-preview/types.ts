export interface RepaymentPreview {
  readonly loanId: string;
  readonly requestedAmount: string;
  readonly effectiveAmount: string;
  readonly cashBalance: string;
  readonly outstandingAmount: string;
  readonly remainingCash: string | null;
  readonly remainingDebt: string | null;
  readonly canRepay: boolean;
  readonly reason: 'READY' | 'CAPPED_TO_OUTSTANDING' | 'INSUFFICIENT_CASH';
  readonly previewOnly: true;
  readonly revalidateAtExecution: true;
}
