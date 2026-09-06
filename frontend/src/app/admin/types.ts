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
  readonly cash_balance?: number;
  readonly bank_balance?: number;
  readonly bond_balance?: number;
  readonly stock_eval?: number;
  readonly total_net_worth?: number;
  readonly wealth_rank?: number;
  readonly last_login_at?: string | null;
  readonly last_seen_at?: string | null;
  readonly last_admin_at?: string | null;
}

export interface UserStockPosition {
  readonly stockId: string;
  readonly symbol: string;
  readonly name: string;
  readonly quantity: number;
  readonly averageCost: number;
  readonly currentPrice: number;
  readonly evalAmount: number;
  readonly profitLoss: number;
}

export interface UserBondHolding {
  readonly id: string;
  readonly bondCode: string;
  readonly bondName: string;
  readonly principalAmount: number;
  readonly yieldBps: number;
  readonly maturityAmount: number;
  readonly purchasedAt: string;
  readonly maturityAt: string;
  readonly status: string;
}

export interface UserPortfolio {
  readonly userId: string;
  readonly displayName: string;
  readonly status: string;
  readonly createdAt: string;
  readonly restrictedAt: string | null;
  readonly restrictionReason: string | null;
  readonly cashBalance: number;
  readonly bankBalance: number;
  readonly bondBalance: number;
  readonly stockEval: number;
  readonly stocks: readonly UserStockPosition[];
  readonly bonds: readonly UserBondHolding[];
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
  /**
   * When this session last proved who it belongs to, and until when that
   * counts. Five minutes, which is what the three console SQL functions
   * enforce -- not the fifteen `ReauthGuard` allows.
   */
  readonly reauthentication: {
    readonly at: string | null;
    readonly freshUntil: string | null;
    readonly fresh: boolean;
  };
  readonly loginPolicy: readonly {
    readonly kind: string;
    readonly value: string;
    readonly label: string;
    readonly recorded_at: string;
  }[];
}

/**
 * One entry of the audit trail, as the console searches it.
 *
 * Every bigint here is a decimal string and stays one. `sequence` is a chain
 * position, and `Number()` on it would round past 2^53 into a row that does
 * not exist -- the same reason amounts are strings.
 *
 * `session_hash` and `client_ip` arrive already masked: twelve characters of
 * the hash, and the address cut back to its /24 or /48 network. Reading the
 * originals is a separate, recorded request.
 *
 * packages/database/migrations/063-audit-event-context.sql defines the
 * columns and the context envelope; 064-audit-search-and-verification.sql
 * defines this projection.
 */
export interface AuditSearchRow {
  readonly sequence: string;
  readonly audit_id: string;
  readonly created_at: string;
  /** 1 for rows written before 062, which the verifier reproduces differently. */
  readonly hash_version: number;
  readonly actor_user_id: string | null;
  readonly action: string;
  readonly feature: string | null;
  readonly target_kind: string | null;
  readonly target_id: string | null;
  readonly subject_user_id: string | null;
  readonly transaction_id: string | null;
  readonly request_id: string | null;
  readonly trace_id: string | null;
  readonly session_hash: string | null;
  readonly client_ip: string | null;
  readonly outcome: string | null;
  readonly response_status: number | null;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly context: Readonly<Record<string, unknown>>;
  readonly previous_integrity_hash: string | null;
  readonly integrity_hash: string;
}

/**
 * packages/database/migrations/064-audit-search-and-verification.sql -- the
 * same entry unmasked, which the database only returns after recording who
 * asked and why.
 */
export interface AuditRevealedEvent {
  readonly sequence: string;
  readonly audit_id: string;
  readonly created_at: string;
  readonly actor_user_id: string | null;
  readonly action: string;
  readonly session_hash: string | null;
  readonly client_ip: string | null;
  readonly context: Readonly<Record<string, unknown>>;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * packages/database/migrations/064-audit-search-and-verification.sql.
 *
 * The three failure counts are kept apart because they mean different
 * things: a broken link says a row was removed or inserted, a mismatch that
 * a row's body was edited, a drift that a column was edited around the
 * envelope that was signed. `legacy_count` is none of those.
 */
export interface ChainVerification {
  readonly verification_id: string;
  readonly from_sequence: string;
  readonly to_sequence: string;
  readonly checked_count: string;
  readonly verified_count: string;
  readonly legacy_count: string;
  readonly mismatch_count: string;
  readonly link_break_count: string;
  readonly column_drift_count: string;
  readonly first_bad_sequence: string | null;
  readonly status: 'passed' | 'failed' | 'empty';
}

/** packages/database/migrations/064-audit-search-and-verification.sql */
export interface ChainVerificationHistory extends ChainVerification {
  readonly requested_by: string | null;
  readonly started_at: string;
  readonly completed_at: string;
}

/** packages/database/migrations/065-audit-retention-and-destruction.sql */
export interface AuditRetentionCategory {
  readonly category: string;
  readonly retention_days: number;
  readonly cutoff_at: string;
  readonly total_rows: string;
  readonly expired_rows: string;
  readonly oldest_expired_sequence: string | null;
  readonly newest_expired_sequence: string | null;
  readonly last_disposition: string | null;
  readonly last_disposition_at: string | null;
}

/** packages/database/migrations/065-audit-retention-and-destruction.sql */
export interface AuditDisposition {
  readonly record_id: string;
  readonly category: string;
  readonly from_sequence: string;
  readonly to_sequence: string;
  readonly row_count: string;
  readonly method: string;
  readonly note: string;
  readonly evidence_hash: string | null;
  readonly performed_by: string;
  readonly performed_at: string;
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

/** One stock's mood beside its price: `stock_market_dynamics_admin` (124). */
export interface AdminStockDynamics {
  readonly stock_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  readonly fair_value: string;
  /** Basis points a day, as numerics cross the wire: strings, read and never summed. */
  readonly trend_bps: string;
  readonly vol_bps: string;
  readonly market_trend_bps: string;
  readonly live_events: number;
}

/** A market event, as the console lists them (124): running, ended and cancelled alike. */
export interface AdminMarketEvent {
  readonly id: string;
  readonly stock_id: string | null;
  readonly symbol: string | null;
  readonly name: string | null;
  readonly direction: 'up' | 'down';
  readonly strength: number;
  readonly headline: string;
  readonly body: string;
  readonly source: string;
  readonly starts_at: string;
  readonly ends_at: string;
  readonly cancelled_at: string | null;
  readonly live: boolean;
}

/** `ai_news_settings_get` (127). The key itself never crosses; only its last four characters. */
export interface AiNewsSettings {
  readonly api_base_url: string;
  readonly model: string;
  readonly has_key: boolean;
  readonly api_key_hint: string;
  readonly updated_at: string;
}

/** One proposed scenario, as `ai_news_batch_latest` lists them. */
export interface AiNewsScenario {
  readonly id: string;
  readonly ordinal: number;
  readonly stock_id: string | null;
  readonly symbol: string | null;
  readonly name: string | null;
  readonly direction: 'up' | 'down';
  readonly strength: number;
  readonly hours: number;
  readonly headline: string;
  readonly body: string;
  readonly rationale: string;
  readonly status: 'proposed' | 'published' | 'discarded' | 'superseded';
  readonly published_event_id: string | null;
  readonly decided_at: string | null;
}

export interface AiNewsBatch {
  readonly batch_id: string;
  readonly created_at: string;
  readonly operator_prompt: string;
  readonly model: string;
  readonly scenarios: readonly AiNewsScenario[];
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

/**
 * packages/database/migrations/106-admin-operations-read-models.sql.
 *
 * `base_reward` is the catalogue price; `paid_24h` is what the caps and the
 * repeat decay actually let through (068). They are supposed to differ.
 */
export interface AdminWorkTask {
  readonly task_id: string;
  readonly code: string;
  readonly name: string;
  readonly job_type: string;
  readonly difficulty: number;
  readonly base_reward: string;
  readonly base_experience: string;
  readonly minimum_duration_seconds: number;
  readonly daily_limit: number;
  readonly active: boolean;
  readonly open_assignment_count: string;
  readonly awaiting_verification_count: string;
  readonly approved_24h: string;
  readonly rejected_24h: string;
  readonly paid_24h: string;
  readonly last_assigned_at: string | null;
}

/** packages/database/migrations/106-admin-operations-read-models.sql */
export interface AdminJobLevel {
  readonly job_type: string;
  readonly member_count: string;
  readonly average_level: string;
  readonly top_level: number;
  readonly total_experience: string;
  readonly active_7d_count: string;
}

/**
 * packages/database/migrations/106-admin-operations-read-models.sql.
 *
 * The seven policy fields are null together when no version is in force. That
 * is a state an operator has to be able to read, not an error -- the counts
 * beside them are still real.
 */
export interface AdminWorkPolicy {
  readonly policy_id: number | null;
  readonly effective_at: string | null;
  readonly daily_cap: string | null;
  readonly weekly_cap: string | null;
  readonly repeat_decay_percent: number | null;
  readonly enabled: boolean | null;
  readonly reason: string | null;
  readonly active_task_count: string;
  readonly open_assignment_count: string;
  readonly awaiting_verification_count: string;
  readonly paid_24h: string;
  readonly members_paid_24h: string;
  readonly experience_24h: string;
}

/** packages/database/migrations/106-admin-operations-read-models.sql */
export interface AdminBankOverview {
  readonly deposit_amount: string;
  readonly depositor_count: string;
  readonly open_loan_count: string;
  readonly outstanding_amount: string;
  readonly overdue_loan_count: string;
  readonly overdue_amount: string;
  readonly maturing_7d_count: string;
  readonly issued_24h_count: string;
  readonly issued_24h_amount: string;
  readonly repaid_24h_amount: string;
  readonly borrower_count: string;
}

/** packages/database/migrations/106-admin-operations-read-models.sql */
export interface AdminCreditGrade {
  readonly grade: string;
  readonly minimum_account_days: number;
  readonly minimum_work_completions: number;
  readonly credit_limit: string;
  readonly interest_bps: number;
  readonly term_days: number;
  readonly minimum_repayment: string;
  readonly active: boolean;
  readonly open_loan_count: string;
  readonly outstanding_amount: string;
  readonly overdue_loan_count: string;
  readonly issued_loan_count: string;
  readonly issued_principal: string;
}

/**
 * packages/database/migrations/106-admin-operations-read-models.sql.
 *
 * `display_name` is the OAuth name, not the one the member chose: 097 keeps
 * the console on the account behind the alias.
 */
export interface AdminLoan {
  readonly loan_id: string;
  readonly user_id: string;
  readonly display_name: string;
  readonly credit_grade: string;
  readonly status: string;
  readonly principal_amount: string;
  readonly interest_amount: string;
  readonly outstanding_amount: string;
  readonly repaid_amount: string;
  readonly minimum_repayment: string;
  readonly issued_at: string;
  readonly maturity_at: string | null;
  readonly overdue_at: string | null;
  readonly status_reason: string | null;
}

/** packages/database/migrations/106-admin-operations-read-models.sql */
export interface AdminOutboxHealth {
  readonly pending_count: string;
  readonly retry_pending_count: string;
  readonly delivering_count: string;
  readonly delivered_count: string;
  readonly dead_letter_count: string;
  readonly suppressed_count: string;
  readonly delivered_24h_count: string;
  /** 087's predicate exactly, so the overview and this screen cannot disagree. */
  readonly stuck_count: string;
  readonly oldest_undelivered_at: string | null;
  readonly last_delivered_at: string | null;
  readonly last_failure_at: string | null;
  readonly unrouted_type_count: string;
}

/**
 * packages/database/migrations/106-admin-operations-read-models.sql.
 *
 * `routed` false means no row in `discord_outbox_routes`, so
 * `outbox_claim_pending` (061) will never claim this type and its events
 * accumulate silently. The four route fields are null there because there is
 * no route to describe.
 */
export interface AdminDiscordRoute {
  readonly event_type: string;
  readonly channel_key: string | null;
  readonly enabled: boolean | null;
  readonly note: string | null;
  readonly routed: boolean;
  readonly total_count: string;
  readonly pending_count: string;
  readonly dead_letter_count: string;
  readonly suppressed_count: string;
  readonly delivered_24h_count: string;
  readonly last_delivered_at: string | null;
}
