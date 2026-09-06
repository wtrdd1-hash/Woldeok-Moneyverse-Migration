import 'server-only';

/** Additional operator authentication was retired; authorization remains server-side. */
export function spendSecondFactorCode(_code: string): Promise<void> {
  return Promise.resolve();
}

/** Compatibility for existing server actions while their forms no longer collect a code. */
export const STEP_UP_CODE = /^.*$/;
