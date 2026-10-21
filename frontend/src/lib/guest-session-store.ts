/**
 * Guest Session Store (Guest-to-Member Conversion)
 * Allows non-signed-in visitors to test financial calculators, view portfolio simulations,
 * and seamlessly preserve/migrate their calculation state upon registration.
 */

export interface GuestCalculationState {
  readonly calculatorType: string;
  readonly inputs: Record<string, unknown>;
  readonly result: Record<string, unknown>;
  readonly timestamp: number;
}

export interface GuestPortfolioState {
  readonly simulatedHoldings: Array<{ ticker: string; shares: number; price: number }>;
  readonly cashWld: number;
  readonly timestamp: number;
}

export interface GuestContext {
  readonly lastCalculations: GuestCalculationState[];
  readonly simulatedPortfolio?: GuestPortfolioState;
  readonly firstVisitedAt: number;
  readonly landingSource?: string;
}

const STORAGE_KEY = 'mv_guest_context';

export function getGuestContext(): GuestContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GuestContext;
  } catch {
    return null;
  }
}

export function saveGuestCalculation(calc: GuestCalculationState): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getGuestContext() ?? {
      lastCalculations: [],
      firstVisitedAt: Date.now(),
    };
    const updated: GuestContext = {
      ...current,
      lastCalculations: [calc, ...current.lastCalculations.filter((c) => c.calculatorType !== calc.calculatorType)].slice(0, 5),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Graceful swallow on storage quota or security errors
  }
}

export function clearGuestContext(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Graceful swallow
  }
}
