import { describe, expect, it } from "vitest";
import { parseAdminWorkStatsResponse } from "./work-stats-evidence";

const evidence = {
  rankings: [{ job_type: "farmer", rank: 1, completions_24h: 2, members_24h: 1,
    total_paid_24h: "9007199254740993", total_exp_24h: "12", share_percentage: 100 }],
  total_completions_24h: 2,
  total_paid_24h: "9007199254740993",
  total_members_24h: 1,
  current_daily_cap: "5000",
  capped_users_count: 0,
  average_cap_usage_percent: 20,
  economy_health_status: "active",
  recommended_daily_cap: 5000,
  recommended_decay_percent: 5,
  cap_buckets: [{ bucket: "0-25", label: "0 ~ 25%", user_count: 1, percentage: 100 }],
  trend_7d: [{ date: "2026-10-27", count: 2, total_paid: "9007199254740993" }],
};

describe("admin work statistics evidence contract", () => {
  it("accepts the existing nested NestJS response and preserves large integer strings", () => {
    expect(parseAdminWorkStatsResponse({ ...evidence, stats: evidence })?.total_paid_24h)
      .toBe("9007199254740993");
  });
  it("accepts the legacy flat response without inventing zero statistics", () => {
    expect(parseAdminWorkStatsResponse(evidence)).toEqual(evidence);
  });
  it.each([null, undefined, {}, { stats: null }, { ...evidence, rankings: null },
    { ...evidence, trend_7d: undefined }, { ...evidence, cap_buckets: "none" }])(
    "rejects absent or structurally invalid evidence %#", (value) => {
      expect(parseAdminWorkStatsResponse(value)).toBeNull();
    },
  );
  it.each([
    { total_completions_24h: Number.MAX_SAFE_INTEGER + 1 },
    { total_members_24h: -1 },
    { average_cap_usage_percent: Number.NaN },
    { economy_health_status: "unknown" },
    { recommended_daily_cap: -500 },
    { recommended_decay_percent: 101 },
    { total_paid_24h: "9007199254740993.5" },
    { total_paid_24h: Number.MAX_SAFE_INTEGER + 2 },
    { current_daily_cap: "-1" },
    { capped_users_count: 2 },
  ])("rejects unsafe or inconsistent policy evidence %#", (change) => {
    expect(parseAdminWorkStatsResponse({ ...evidence, ...change })).toBeNull();
  });
  it("rejects invalid ranking and cap bucket totals instead of rendering invented charts", () => {
    expect(parseAdminWorkStatsResponse({ ...evidence, rankings: [evidence.rankings[0], evidence.rankings[0]] })).toBeNull();
    expect(parseAdminWorkStatsResponse({ ...evidence, cap_buckets: [{ ...evidence.cap_buckets[0], user_count: 2 }] })).toBeNull();
    expect(parseAdminWorkStatsResponse({ ...evidence, rankings: [{ ...evidence.rankings[0], share_percentage: 101 }] })).toBeNull();
  });
  it("rejects invalid trend dates and monetary strings", () => {
    expect(parseAdminWorkStatsResponse({ ...evidence, trend_7d: [{ date: "not-a-date", count: 2, total_paid: "1" }] })).toBeNull();
    expect(parseAdminWorkStatsResponse({ ...evidence, rankings: [{ ...evidence.rankings[0], total_exp_24h: "1e5" }] })).toBeNull();
  });
});
