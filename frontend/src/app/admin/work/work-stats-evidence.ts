import type { AdminWorkRealtimeStats } from "../types";

type ObjectValue = Record<string, unknown>;

function object(value: unknown): value is ObjectValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function count(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function percent(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

function money(value: unknown): value is string {
  return typeof value === "string" && /^(0|[1-9][0-9]*)$/.test(value) && value.length <= 40;
}

function label(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 128;
}

function date(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

/** Never promote an unchecked backend payload to verified administrator evidence. */
export function parseAdminWorkStatsResponse(value: unknown): AdminWorkRealtimeStats | null {
  if (!object(value)) return null;
  const raw = "stats" in value ? value.stats : value;
  if (!object(raw)) return null;
  if (!Array.isArray(raw.rankings) || raw.rankings.length > 50 ||
      !Array.isArray(raw.cap_buckets) || raw.cap_buckets.length > 10 ||
      !Array.isArray(raw.trend_7d) || raw.trend_7d.length > 14) return null;
  if (!count(raw.total_completions_24h) || !money(raw.total_paid_24h) ||
      !count(raw.total_members_24h) || !count(raw.capped_users_count) ||
      raw.capped_users_count > raw.total_members_24h ||
      !percent(raw.average_cap_usage_percent) ||
      !["stable", "active", "overheated", "cooling"].includes(String(raw.economy_health_status)) ||
      !count(raw.recommended_daily_cap) || raw.recommended_daily_cap === 0 ||
      !count(raw.recommended_decay_percent) || raw.recommended_decay_percent > 100 ||
      !(raw.current_daily_cap === null || money(raw.current_daily_cap))) return null;

  const jobs = new Set<string>();
  let completed = 0;
  for (const entry of raw.rankings) {
    if (!object(entry) || !label(entry.job_type) || jobs.has(entry.job_type) ||
        !count(entry.rank) || entry.rank === 0 || !count(entry.completions_24h) ||
        !count(entry.members_24h) || !money(entry.total_paid_24h) ||
        !money(entry.total_exp_24h) || !percent(entry.share_percentage)) return null;
    jobs.add(entry.job_type);
    completed += entry.completions_24h;
    if (!Number.isSafeInteger(completed)) return null;
  }
  if (completed > raw.total_completions_24h) return null;

  const buckets = new Set<string>();
  let bucketMembers = 0;
  for (const entry of raw.cap_buckets) {
    if (!object(entry) || !label(entry.bucket) || buckets.has(entry.bucket) ||
        !label(entry.label) || !count(entry.user_count) || !percent(entry.percentage)) return null;
    buckets.add(entry.bucket);
    bucketMembers += entry.user_count;
    if (!Number.isSafeInteger(bucketMembers)) return null;
  }
  if (bucketMembers !== raw.total_members_24h) return null;

  const days = new Set<string>();
  for (const entry of raw.trend_7d) {
    if (!object(entry) || !date(entry.date) || days.has(entry.date) ||
        !count(entry.count) || !money(entry.total_paid)) return null;
    days.add(entry.date);
  }
  return raw as unknown as AdminWorkRealtimeStats;
}
