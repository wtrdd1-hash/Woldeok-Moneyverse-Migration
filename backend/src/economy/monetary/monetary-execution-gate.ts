import { ServiceUnavailableException } from '@nestjs/common';

/**
 * P0 containment (v721): certificate/order mutations use direct application-role
 * DML and cannot be considered canonical, ledger-conserving settlement.
 *
 * Both flags default to off. The corresponding forward DB grant revocation
 * keeps this boundary fail-closed even if flags are mistakenly enabled;
 * audited SECURITY DEFINER commands are required before activation.
 */
export function requireLedgerCertifiedMintExecution(): void {
  if (
    process.env.MONEYVERSE_MINT_EXECUTION_ENABLED !== 'true' ||
    process.env.MONEYVERSE_MINT_LEDGER_CERTIFIED !== 'true'
  ) {
    throw new ServiceUnavailableException(
      'Monetary execution is held until audited ledger settlement is certified',
    );
  }
}
