export type MonetaryOrderType = 'MINT' | 'RETIRE' | 'FREEZE' | 'UNFREEZE';

export type MonetaryTargetEnvelope =
  | 'WORK_REWARD'
  | 'QUEST_REWARD'
  | 'EVENT_REWARD'
  | 'INCIDENT_COMPENSATION'
  | 'STABILIZATION_POOL'
  | 'HARD_SINK_PURGE'
  | 'GENERAL_CIRCULATION';

export type MonetaryOrderStatus = 'PROPOSED' | 'APPROVED' | 'EXECUTED' | 'CANCELLED' | 'EXPIRED';

export interface MonetaryPolicyOrder {
  id: string;
  order_type: MonetaryOrderType;
  target_envelope: MonetaryTargetEnvelope;
  max_amount_wld: string;
  executed_amount_wld: string;
  status: MonetaryOrderStatus;
  proposed_by: string | null;
  approved_by: string | null;
  reason: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface MintCertificate {
  id: string;
  policy_order_id: string;
  amount_wld: string;
  source_envelope: string;
  recipient_user_id: string | null;
  idempotency_key: string;
  actor_id: string | null;
  created_at: string;
}

export interface RetirementCertificate {
  id: string;
  policy_order_id: string | null;
  amount_wld: string;
  source_type: string;
  actor_id: string | null;
  reason: string;
  idempotency_key: string;
  created_at: string;
}

export interface MonetaryTelemetryOverview {
  m_total: string;
  m_circulating: string;
  m_treasury: string;
  m_bank_liquidity: string;
  m_locked: string;
  is_issuance_frozen: boolean;
  active_policy_orders_count: number;
  total_mint_certificates_count: number;
  total_retirement_certificates_count: number;
  verified_invariant: boolean;
  last_reconciled_at: string;
}
