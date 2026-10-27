import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WorkAutoTuneCard } from "./admin-work-stats";

const stats = {
  rankings: [], total_completions_24h: 0, total_paid_24h: "0", total_members_24h: 0,
  current_daily_cap: null, capped_users_count: 0, average_cap_usage_percent: 0,
  economy_health_status: "cooling" as const, recommended_daily_cap: 10000, recommended_decay_percent: 0,
  cap_buckets: [], trend_7d: [],
};

describe("work auto-tune authenticated UI", () => {
  it("withholds automatic reward policy mutation when no active policy is verified", () => {
    const html = renderToStaticMarkup(<WorkAutoTuneCard stats={stats} allowTuning={false} />);
    expect(html).toContain("자동 정책 변경을 보류합니다");
    expect(html).not.toContain('type="submit"');
  });
  it("shows an accessible verification path before the real protected policy action", () => {
    const html = renderToStaticMarkup(<WorkAutoTuneCard stats={stats} />);
    expect(html).toContain("/account/security");
    expect(html).toContain("본인 확인");
    expect(html).toContain("min-h-11");
    expect(html).toContain("규칙 기반");
    expect(html).not.toContain("AI 경제 지표 기반");
  });
});
