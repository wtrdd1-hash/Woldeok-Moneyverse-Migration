const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const INTEGER = /^-?(?:0|[1-9][0-9]*)$/;
const GAMES = new Set(['coin', 'dice_parity', 'dice_number']);
const MIN_BIGINT = -(1n << 63n);
const MAX_BIGINT = (1n << 63n) - 1n;

function isPgBigint(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 20 || !INTEGER.test(value)) return false;
  const parsed = BigInt(value);
  return parsed >= MIN_BIGINT && parsed <= MAX_BIGINT;
}

interface CasinoHistoryRecord {
  readonly play_id: string;
  readonly game: string;
  readonly choice: string;
  readonly outcome: string;
  readonly stake_amount: string;
  readonly net_amount: string;
  readonly transaction_id: string;
  readonly played_at: string;
}

function validRecord(value: unknown): value is CasinoHistoryRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.play_id === 'string' && UUID.test(row.play_id) &&
    typeof row.game === 'string' && GAMES.has(row.game) &&
    typeof row.choice === 'string' && row.choice.length <= 100 &&
    typeof row.outcome === 'string' && row.outcome.length <= 100 &&
    isPgBigint(row.stake_amount) &&
    !row.stake_amount.startsWith('-') &&
    isPgBigint(row.net_amount) &&
    typeof row.transaction_id === 'string' && UUID.test(row.transaction_id) &&
    typeof row.played_at === 'string' && row.played_at.length <= 40 && Number.isFinite(Date.parse(row.played_at))
  );
}

/** Preserve large WLD integer strings as spreadsheet text; never execute member-sourced CSV cells. */
function cell(value: string, numeric = false): string {
  const cleaned = value.replace(/[\r\n\t\u0000-\u001f\u007f]+/g, ' ');
  const safe = numeric || /^\s*[=+\-@]/.test(cleaned) ? `'${cleaned}` : cleaned;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function serializeCasinoHistory(value: unknown): string {
  if (!Array.isArray(value) || value.length > 100 || !value.every(validRecord)) {
    throw new Error('Unverified or unbounded casino history response');
  }
  const header = 'play_id,game,choice,outcome,stake_wld,net_wld,ledger_transaction_id,played_at';
  const rows = value.map((row: CasinoHistoryRecord) =>
    [
      cell(row.play_id), cell(row.game), cell(row.choice), cell(row.outcome),
      cell(row.stake_amount, true), cell(row.net_amount, true),
      cell(row.transaction_id), cell(row.played_at),
    ].join(','),
  );
  return `\uFEFF${[header, ...rows].join('\r\n')}\r\n`;
}
