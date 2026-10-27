import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { read, gate } = vi.hoisted(() => ({ read: vi.fn(), gate: vi.fn() }));
vi.mock("@/lib/api", () => ({ apiOrNull: read }));
vi.mock("@/lib/session", () => ({ requireAdminConsole: gate }));
vi.mock("./admin-work-forms", () => ({ WorkPolicyTuningCard: () => null, WorkTaskTuningTable: () => null }));
vi.mock("./admin-work-stats", () => ({ WorkStatsDashboard: () => <div data-testid="verified-work-stats">Verified stats</div> }));
vi.mock("../economy/economy-parts", () => ({ Figure: () => null }));

import Page from "./page";

const overview = {
  catalogue: [], jobLevels: [],
  policy: { policy_id: null, daily_cap: null, repeat_decay_percent: 0, paid_24h: "0",
    members_paid_24h: "0", open_assignment_count: "0", awaiting_verification_count: "0" },
};
const stats = {
  rankings: [], total_completions_24h: 0, total_paid_24h: "0", total_members_24h: 0,
  current_daily_cap: null, capped_users_count: 0, average_cap_usage_percent: 0,
  economy_health_status: "cooling", recommended_daily_cap: 10000, recommended_decay_percent: 0,
  cap_buckets: [], trend_7d: [],
};

beforeEach(() => { vi.clearAllMocks(); });

describe("admin work page evidence integration", () => {
  it("requires admin authentication and refuses to show invented stats on a failed read", async () => {
    read.mockResolvedValueOnce(overview).mockResolvedValueOnce(null);
    const html = renderToStaticMarkup(await Page());
    expect(gate).toHaveBeenCalledWith("/admin/work");
    expect(html).toContain("role=\"alert\"");
    expect(html).toContain("통계를 검증하지 못했습니다");
    expect(html).not.toContain("verified-work-stats");
  });
  it("refuses a malformed stats payload even when the API returned 200", async () => {
    read.mockResolvedValueOnce(overview).mockResolvedValueOnce({ stats: { total_paid_24h: "0" } });
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain("통계를 검증하지 못했습니다");
    expect(html).not.toContain("verified-work-stats");
  });
  it("renders verified real API stats when the contract is complete", async () => {
    read.mockResolvedValueOnce(overview).mockResolvedValueOnce({ stats });
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain("verified-work-stats");
    expect(html).not.toContain("통계를 검증하지 못했습니다");
  });
});
