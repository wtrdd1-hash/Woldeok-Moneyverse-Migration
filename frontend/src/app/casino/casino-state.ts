import type { ActionState } from '@/lib/action-state';
import type { PlayResult } from './coin';

export interface CasinoPlayState extends ActionState {
  readonly result?: PlayResult;
  readonly netAmount?: string;
  readonly replayed?: boolean;
  readonly outcomeFace?: number;
  readonly coinOutcome?: string;
}

export const CASINO_IDLE: CasinoPlayState = { status: 'idle' };
