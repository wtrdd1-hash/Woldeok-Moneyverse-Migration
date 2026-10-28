/** Validate security-sensitive mutation outcomes at runtime; generic API types do not validate JSON. */
export function isVerifiedCredentialReceipt(
  value: unknown,
  operation: 'reauthentication' | 'password-change' | 'email-change',
): boolean {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const receipt = value as Record<string, unknown>;
  switch (operation) {
    case 'reauthentication':
      return receipt.outcome === 'reauthenticated';
    case 'password-change':
      return receipt.outcome === 'password-changed';
    case 'email-change':
      return receipt.accepted === true && receipt.verificationRequired === true;
  }
}
