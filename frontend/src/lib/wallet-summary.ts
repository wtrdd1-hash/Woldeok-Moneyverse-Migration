/**
 * The landing page's one figure: a member's total balance.
 *
 * In its own module, with no `server-only`, because both halves need it —
 * the route that resolves it and the client panel that renders from it. The
 * same reason `viewer-state` is separate from `viewer`.
 */
export interface WalletSummary {
  readonly signedIn: boolean;
  readonly currency: string | null;
  /** A canonical integer string, never a number. */
  readonly totalAvailableAmount: string | null;
}

/** Also the shape returned for a signed-in member whose wallet could not be read. */
export const NO_SUMMARY: WalletSummary = {
  signedIn: false,
  currency: null,
  totalAvailableAmount: null,
};
