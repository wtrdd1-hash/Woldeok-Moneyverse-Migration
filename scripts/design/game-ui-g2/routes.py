#!/usr/bin/env python3
"""G2 per-route previews for every manifest route (owner-approved G2, 2026-11-24).

Each route takes its title from the G1 route vocabulary and its body from the
G2 reference layout for its archetype, so every page shows the same shell,
ledger strip, panels and type. Figures are illustrative and stamped.
"""
from __future__ import annotations

import importlib.util
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[2]


def load(name: str, path: pathlib.Path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    sys.argv = sys.argv[:1]  # the generators read argv[1] as their output dir
    spec.loader.exec_module(mod)
    return mod


OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "out-routes"
g1 = load("g1gen", ROOT / "scripts/design/game-ui-g1/generate.py")
g2 = load("g2gen", HERE / "generate.py")

LAYOUT = {"home": "home-member", "wallet": "wallet", "bank": "bank", "market": "stocks", "quest": "quests", "shop": "shop",
          "community": "board", "article": "article", "support": "support", "account": "account", "admin": "admin",
          "tool": "calculator", "status": "status", "doc": "doc", "auth": "login"}
LEAD = {"home": "오늘의 월덕 시장과 길드 소식입니다.", "wallet": "원장에 기록된 잔액과 거래입니다.", "bank": "예금 계약과 대출을 관리합니다.",
        "market": "가상 기업 종목의 시세와 체결입니다.", "quest": "받을 수 있는 퀘스트와 보상입니다.", "shop": "WLD로 꾸미기 아이템을 구매합니다.",
        "community": "길드원 공략과 소식입니다.", "article": "본문과 작성 정보, 댓글입니다.", "support": "운영진과 1:1로 대화합니다.",
        "account": "프로필, 보안, 알림을 관리합니다.", "admin": "운영자 전용 관제 화면입니다. 모든 조치는 감사 로그에 남습니다.",
        "tool": "값을 넣으면 결과를 바로 계산합니다. 결과는 교육용입니다.", "status": "구성 요소별 상태입니다.",
        "doc": "필요한 내용을 짧게 정리했습니다.", "auth": "디스코드, 구글 또는 자체 계정으로 들어옵니다."}


def layout_for(route: str, kind: str) -> str:
    if route == "/":
        return "home-guest"
    if kind == "market" and "[" in route:
        return "stock-detail"
    return LAYOUT[kind]


def main() -> None:
    manifest = json.loads((ROOT / "docs/design/CURRENT_UI_DESIGN_MANIFEST.json").read_text())
    (OUT / "pages").mkdir(parents=True, exist_ok=True)
    index = []
    for entry in manifest["routes"]:
        route = entry["route"]
        kind = g1.archetype(route)
        key = layout_for(route, kind)
        active, _title, _lead, actions, desk, mob, signed = g2.screen(key)
        title = g1.title_for(route)
        if key == "stock-detail":
            title = "종목 상세"
        mob = mob.replace(f"<h1>{_title}</h1>", f"<h1>{g2.E(title)}</h1>", 1)
        lead = _lead if key in ("home-guest", "stock-detail") else LEAD[kind]
        name = pathlib.Path(entry["file"]).stem
        html = g2.frame(f"{route} ({kind})", active, title, lead, actions, desk, mob, signed)
        (OUT / "pages" / f"{name}.html").write_text(html, encoding="utf8")
        index.append({"route": route, "name": name, "archetype": kind, "layout": key, "title": title})
    (OUT / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding="utf8")
    print(len(index), "pages")


if __name__ == "__main__":
    main()
