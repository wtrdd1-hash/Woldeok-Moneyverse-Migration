export type BackupVerificationStatus = 'VERIFIED' | 'PENDING';

/** A legacy filename/stat is never evidence of encryption or a successful restore. */
export function backupStatusLabel(status: BackupVerificationStatus, isEnglish: boolean): string {
  if (status === 'VERIFIED') return isEnglish ? 'Verified' : '검증됨';
  return isEnglish ? 'Unverified' : '검증되지 않음';
}

/** Zero means no verified retention policy for the legacy dump inventory. */
export function backupRetentionLabel(days: number, isEnglish: boolean): string {
  if (!Number.isInteger(days) || days <= 0) return isEnglish ? 'Unverified' : '검증되지 않음';
  return isEnglish ? `${days} days` : `${days}일`;
}
