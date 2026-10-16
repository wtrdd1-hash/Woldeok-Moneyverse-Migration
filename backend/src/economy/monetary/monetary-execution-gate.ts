import { ServiceUnavailableException } from '@nestjs/common';

/**
 * v738 fail-closed P0 containment: no policy orders, mint/retirement certificates,
 * or currency issuance may proceed via direct application-role SQL. Existing
 * MONEYVERSE_MINT_* environment flags are intentionally NOT an unlock path;
 * a future audited ledger-first implementation requires a reviewed code change
 * with authoritative database acceptance, and cannot be enabled by config alone.
 */
export function requireLedgerCertifiedMintExecution(): void {
  throw new ServiceUnavailableException(
    'Monetary issuance and retirement are held until canonical ledger settlement is verified',
  );
}
