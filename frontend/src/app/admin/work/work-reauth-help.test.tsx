import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WorkAutoTuneReauthHelp } from "./work-reauth-help";

describe("work auto-tune recent-auth recovery", () => {
  it("offers the existing account security flow without asking for credentials in the admin page", () => {
    const html = renderToStaticMarkup(<WorkAutoTuneReauthHelp errorCode={undefined} />);
    expect(html).toContain("/account/security");
    expect(html).toContain("min-h-11");
    expect(html).toContain("본인 확인");
    expect(html).not.toContain("name=\"password\"");
  });
  it("announces a rejected expired proof and provides an actionable retry path", () => {
    const html = renderToStaticMarkup(<WorkAutoTuneReauthHelp errorCode="reauthentication_required" />);
    expect(html).toContain("role=\"alert\"");
    expect(html).toContain("/account/security");
    expect(html).toContain("다시");
  });
});
