/** A successful transport response is not evidence that the credential was changed. */
export function isPasswordResetReceipt(value: unknown): value is { outcome: 'password-reset' } {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === 1
    && 'outcome' in value && value.outcome === 'password-reset';
}
