/**
 * The row shapes the admin API returns.
 *
 * snake_case because that is what the read models hand back — these are
 * database rows travelling through a route, not domain objects, and renaming
 * them here would only hide where they came from.
 *
 * Shared by the console's area pages. They were interfaces inside the single
 * page that used to render every panel at once; splitting that page gave them
 * six consumers and no home.
 */

export interface AdminUser {
  readonly user_id: string;
  readonly status: string;
  readonly display_name: string;
  readonly created_at: string;
  readonly restricted_at: string | null;
  readonly restriction_reason: string | null;
}

/** packages/database/migrations/059-feature-switches-and-economy-policies.sql */
export interface FeatureSwitch {
  readonly feature_key: string;
  readonly state: 'enabled' | 'paused' | 'safe_mode' | 'disabled';
  readonly title: string;
  readonly activation_preconditions: readonly string[];
  readonly reason: string;
  readonly updated_by: string | null;
  readonly updated_at: string;
}

/** packages/database/migrations/059-feature-switches-and-economy-policies.sql */
export interface EconomyPolicyVersion {
  readonly policy_id: string;
  readonly version: string;
  readonly status: 'draft' | 'approved' | 'active' | 'superseded' | 'rolled_back';
  readonly effective_at: string;
  readonly activated_at: string | null;
  readonly superseded_at: string | null;
  readonly superseded_by: string | null;
  readonly reason: string;
  readonly created_by: string | null;
  readonly created_at: string;
  readonly payload: unknown;
}

/** packages/database/migrations/057-superadmin-authority-and-admin-sessions.sql */
export interface AdminRoleAssignment {
  readonly user_id: string;
  readonly display_name: string;
  readonly role: string;
  readonly granted_at: string;
}

/**
 * camelCase, unlike its neighbours: these are shaped by the API rather than
 * handed back by a read model, so they are domain objects travelling through
 * a route rather than database rows.
 */
export interface AdminConsole {
  readonly available: boolean;
  readonly roles: readonly string[];
  readonly secondFactor: {
    readonly enrolled: boolean;
    readonly confirmed: boolean;
    readonly lockedUntil: string | null;
  };
  readonly consoleSession: {
    readonly state: 'open' | 'idle_locked' | 'expired' | 'closed' | 'none';
    readonly expiresAt: string | null;
    readonly idleExpiresAt: string | null;
  };
  readonly loginPolicy: readonly {
    readonly kind: string;
    readonly value: string;
    readonly label: string;
    readonly recorded_at: string;
  }[];
}

export interface AuditEvent {
  readonly audit_id: string;
  readonly actor_user_id: string | null;
  readonly action: string;
  readonly target_id: string | null;
  readonly created_at: string;
  readonly integrity_hash: string;
}

export interface OutboxEvent {
  readonly event_id: string;
  readonly event_type: string;
  readonly created_at: string;
  readonly delivered_at: string | null;
  readonly delivery_attempts: number;
  readonly delivery_status: string;
}

export interface AdminStock {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  /** The size of the company, and what nobody is holding of it (053). */
  readonly shares_outstanding: string;
  readonly shares_available: string;
  /** What decides whether the stock can be deleted, shown next to the button. */
  readonly holders: number;
  readonly trades: number;
  readonly active: boolean;
}

export interface AdminBusiness {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly purchase_cost: string;
  readonly daily_revenue: string;
  readonly daily_operating_cost: string;
  readonly active: boolean;
}

export interface AdminSeasonEvent {
  readonly id: string;
  readonly season_name: string;
  readonly title: string;
  readonly cost_wld: string;
  readonly points_per_entry: number;
  readonly active: boolean;
}

export interface ReconciliationHealth {
  readonly available: boolean;
  readonly calculatedAt?: string;
  readonly integrity?: {
    readonly ok: boolean;
    readonly ledgerTransactionCount: string;
    readonly unbalancedTransactionCount: string;
    readonly balanceMismatchAccountCount: string;
    readonly balanceTotalDeltaAmount: string;
  };
  readonly supply?: {
    readonly m2Amount: string;
    readonly netMintIssuanceAmount: string;
    readonly sinkAbsorbedAmount: string;
    readonly treasuryBalanceAmount: string;
  };
  readonly treasury24h?: {
    readonly inflowAmount: string;
    readonly outflowAmount: string;
    readonly netFlowAmount: string;
  };
}
