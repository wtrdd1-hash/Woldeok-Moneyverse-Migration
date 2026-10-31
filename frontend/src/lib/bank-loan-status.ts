export type BankLoanStatus = 'all' | 'active' | 'overdue' | 'repaid';
export type BankLoanRow = Readonly<{
  loanId: string;
  principalAmount: string;
  interestAmount: string;
  outstandingAmount: string;
  status: Exclude<BankLoanStatus, 'all'>;
  issuedAt: string;
  repaidAt: string | null;
}>;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WLD = /^(?:0|[1-9][0-9]{0,29})$/;
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
export function bankLoanStatus(value: unknown): BankLoanStatus {
  return value === 'active' || value === 'overdue' || value === 'repaid' ? value : 'all';
}
function validDate(value: unknown): value is string {
  return typeof value === 'string' && DATE.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}
export function parseBankLoans(payload: unknown, status: BankLoanStatus): BankLoanRow[] | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const loans = (payload as { loans?: unknown }).loans;
  if (!Array.isArray(loans) || loans.length > 20) return null;
  const ids = new Set<string>();
  const result: BankLoanRow[] = [];
  for (const value of loans) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const row = value as Record<string, unknown>;
    if (typeof row.loanId !== 'string' || !UUID.test(row.loanId) || ids.has(row.loanId)) return null;
    if (typeof row.principalAmount !== 'string' || !/^[1-9][0-9]{0,29}$/.test(row.principalAmount) ||
        typeof row.interestAmount !== 'string' || !WLD.test(row.interestAmount) ||
        typeof row.outstandingAmount !== 'string' || !WLD.test(row.outstandingAmount)) return null;
    if (row.status !== 'active' && row.status !== 'overdue' && row.status !== 'repaid') return null;
    if (status !== 'all' && row.status !== status) return null;
    if (!validDate(row.issuedAt) || (row.repaidAt !== null && !validDate(row.repaidAt))) return null;
    ids.add(row.loanId);
    result.push(row as BankLoanRow);
  }
  return result;
}
