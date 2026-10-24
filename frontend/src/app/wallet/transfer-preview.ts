export interface TransferPreview {
  readonly recipientUserId: string;
  readonly amount: string;
  readonly cashAvailable: string;
  readonly canSend: boolean;
  readonly shortfall: string;
  readonly checkedAt: string;
  readonly readOnly: true;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function transferAmountInput(value: string): string | null {
  return /^[1-9][0-9]{0,37}$/.test(value) ? value : null;
}

export function isPreviewCurrent(
  preview: Pick<TransferPreview, 'recipientUserId' | 'amount' | 'canSend' | 'readOnly'> | null,
  recipientUserId: string,
  amount: string,
): boolean {
  return !!preview && preview.readOnly === true && preview.canSend === true &&
    UUID.test(recipientUserId) && preview.recipientUserId === recipientUserId.toLowerCase() &&
    preview.amount === transferAmountInput(amount);
}
