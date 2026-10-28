/**
 * The existing SQL function only records a moderation decision and audit row.
 * Never equate that receipt with an enforced account restriction or a delivered warning.
 */
export function verifyChatModerationReceipt(
  value: unknown,
  reportId: string,
  action: string,
): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const receipt = value as Record<string, unknown>;
  return receipt.success === true &&
    receipt.reportId === reportId &&
    receipt.newStatus === action &&
    receipt.effect === 'report_status_only' &&
    receipt.enforcementApplied === false &&
    receipt.notificationSent === false;
}
