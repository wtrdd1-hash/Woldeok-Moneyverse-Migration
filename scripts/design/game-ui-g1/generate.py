#!/usr/bin/env python3
"""Generate the "Guild Ledger" game-feel candidate mockups (G1) for all 180 routes.

Each route in docs/design/CURRENT_UI_DESIGN_MANIFEST.json gets one HTML page
holding a desktop frame and a phone frame side by side; render.mjs screenshots
them to PNG. Thirteen archetypes carry the layout; every route supplies its own
title, scene and section copy, so pages differ by purpose rather than by label.

Figures drawn in the mockups are illustrative and are stamped as such on every
image: the repository forbids presenting invented balances as real data.
"""
from __future__ import annotations

import html
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
MANIFEST = ROOT / "docs/design/CURRENT_UI_DESIGN_MANIFEST.json"
OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "scripts/design/game-ui-g1/out"
FAVICON = (ROOT / "frontend/public/favicon.ico").as_uri()

E = html.escape

# --------------------------------------------------------------------------- copy

SEG = {
    "admin": "GM 콘솔", "analytics": "분석", "api-health": "API 상태", "bank": "은행", "blog": "블로그",
    "bonds": "국채", "catalog": "카탈로그", "central-bank": "중앙은행", "content": "콘텐츠", "controls": "기능 스위치",
    "discord": "디스코드", "economy": "경제", "scenario-lab": "시나리오 실험실", "enterprises": "공기업", "fx": "외환시장",
    "help": "도움말", "kdic": "예금보험", "logs": "로그", "activity": "활동", "delivery": "전송", "errors": "오류",
    "integrity": "무결성", "system": "시스템", "market": "시장", "ai-news": "AI 뉴스", "mint": "조폐국",
    "money-flow": "자금 흐름", "operations": "운영", "storage": "저장소", "pension": "국민연금", "safety": "안전",
    "security": "보안", "seo": "검색 노출", "seo-audit": "검색 감사", "shop": "상점", "support": "문의",
    "treasury": "국고", "users": "회원", "work": "직업", "stocks": "거래소", "account": "내 계정",
    "notifications": "알림", "privacy": "개인정보", "wallet": "지갑", "tools": "계산기", "guide": "가이드",
    "glossary": "용어 사전", "clubs": "클럽", "gallery": "갤러리", "profile": "프로필", "announcements": "공지",
    "board": "광장", "businesses": "사업", "marketplace": "장터", "progression": "성장", "spaces": "공간",
    "login": "로그인", "quests": "퀘스트", "seasons": "시즌", "arcade": "아케이드", "casino": "카지노",
    "lobby": "로비", "calendar": "달력", "inventory": "인벤토리", "collections": "도감", "advisor": "덕이 상담소",
    "chat": "채팅", "invite": "초대", "register": "모험가 등록", "forgot-password": "비밀번호 찾기",
    "reset-password": "비밀번호 재설정", "terms": "이용약관", "status": "서버 상태", "roadmap": "로드맵",
    "features": "기능 안내", "developer": "개발자", "search": "검색", "design-preview": "디자인 미리보기",
    "newspaper": "월덕 신문", "prediction": "예측 시장", "dashboard": "대시보드", "calculators": "계산기 모음",
    "account-deletion": "계정 삭제", "data-deletion": "데이터 삭제", "portfolio": "포트폴리오", "history": "거래 내역",
    "watchlist": "관심 종목", "compare": "종목 비교", "alerts": "조건부 알림", "lounge": "주주 라운지",
    "orders": "주문", "transactions": "거래 기록", "settings": "설정", "edit": "편집", "new": "새로 만들기",
    "providers": "로그인 방법", "loans": "대출", "deposits": "예금", "compound-interest-calculator": "복리 계산기",
    "loan-calculator": "대출 이자 계산기", "providers.html": "로그인 방법",
}

TOOL_NAMES = {
    "compound": "복리", "interest": "이자", "loan": "대출", "mortgage": "주택담보대출", "savings": "적금",
    "deposit": "예금", "dividend": "배당", "tax": "세금", "salary": "연봉 실수령", "inflation": "물가",
    "retirement": "노후 자금", "fx": "환율", "currency": "환전", "stock": "주식 수익률", "roi": "투자 수익률",
    "pension": "연금", "rent": "전월세", "budget": "가계부", "percentage": "퍼센트", "vat": "부가세",
    "income": "소득세", "capital": "양도세", "gains": "차익", "dca": "적립식 투자", "rule": "72의 법칙",
    "break": "손익분기", "even": "", "credit": "신용", "card": "카드", "isa": "ISA", "irp": "IRP",
    "severance": "퇴직금", "insurance": "보험료", "calculator": "", "preset": "프리셋",
}


def seg_name(seg: str) -> str:
    if seg.startswith("[") and seg.endswith("]"):
        inner = seg[1:-1]
        return {"slug": "글 상세", "term": "용어 상세", "preset": "프리셋", "locale": "", "id": "상세",
                "symbol": "종목 상세", "key": "상세", "handle": "프로필 상세"}.get(inner, "상세")
    if seg in SEG:
        return SEG[seg]
    parts = [TOOL_NAMES.get(p, p) for p in seg.split("-")]
    words = " ".join(p for p in parts if p)
    return (words + " 계산기") if seg.endswith("calculator") else words


def title_for(route: str) -> str:
    if route == "/":
        return "길드 홀"
    segs = [s for s in route.split("/") if s and s != "[locale]"]
    names = [seg_name(s) for s in segs]
    names = [n for n in names if n]
    if not names:
        return "길드 홀"
    if len(names) >= 2 and names[-1] in ("글 상세", "상세", "용어 상세", "프리셋", "종목 상세", "프로필 상세"):
        return f"{names[-2]} {names[-1]}"
    return names[-1]


def archetype(route: str) -> str:
    r = route.replace("/[locale]", "")
    first = r.split("/")[1] if r != "/" else ""
    if first == "":
        return "home"
    if first == "admin":
        return "admin"
    if first in ("login", "register", "forgot-password", "reset-password", "invite"):
        return "auth"
    if first in ("wallet", "inventory", "mint", "collections", "dashboard"):
        return "wallet"
    if first in ("bank", "central-bank", "bonds", "pension", "kdic", "treasury", "fx"):
        return "bank"
    if first in ("stocks", "businesses", "enterprises", "prediction"):
        return "market"
    if first in ("quests", "progression", "seasons", "arcade", "casino", "lobby", "calendar"):
        return "quest"
    if first in ("shop", "marketplace"):
        return "shop"
    if first in ("blog", "board", "announcements", "gallery", "clubs", "newspaper", "spaces"):
        return "article" if r.count("/") >= 2 and "[" in r else "community"
    if first in ("support", "chat", "help", "advisor"):
        return "support"
    if first in ("account", "profile", "account-deletion", "data-deletion"):
        return "account"
    if first in ("tools", "calculators", "guide"):
        return "tool"
    if first == "status":
        return "status"
    return "doc"


SCENE = {
    "home": "skyline", "wallet": "vault", "bank": "vault", "market": "chart", "quest": "board",
    "shop": "stall", "community": "board", "article": "board", "support": "tavern", "account": "gate",
    "admin": "citadel", "tool": "lab", "status": "citadel", "doc": "gate", "auth": "gate",
}

LEAD = {
    "home": "오늘의 월덕 시장과 내 길드 진행 상황을 한 화면에서 확인합니다.",
    "wallet": "보유 WLD와 아이템, 최근 거래를 원장 기준으로 보여 줍니다.",
    "bank": "예금 계약과 대출, 기준금리를 금고 창구처럼 정리했습니다.",
    "market": "가상 기업 종목의 호가와 체결을 실시간으로 따라갑니다.",
    "quest": "오늘 받을 수 있는 퀘스트와 시즌 보상을 확인하세요.",
    "shop": "WLD로 꾸미기 아이템과 프레임을 구매합니다.",
    "community": "길드원 소식과 공략, 공지를 모아 봅니다.",
    "article": "본문과 작성 정보, 댓글을 함께 읽습니다.",
    "support": "운영진에게 문의하고 답변을 실시간으로 받습니다.",
    "account": "내 캐릭터 정보와 보안, 알림을 관리합니다.",
    "admin": "운영자 권한으로만 열리는 관제 화면입니다. 모든 조치는 감사 로그에 남습니다.",
    "tool": "값을 넣으면 결과와 추이를 바로 계산합니다.",
    "status": "서비스 구성 요소별 상태를 실시간으로 보여 줍니다.",
    "doc": "필요한 내용을 읽기 쉬운 길이로 정리했습니다.",
    "auth": "길드 문을 열고 모험을 이어가세요.",
}


# Every colour reaches the page through a token (style.css :root). Scenes are
# written with readable hex for authoring, then rewritten here so no literal
# colour survives into the HTML.
ART_TOKENS = {
    "#F7E7C2": "--paper-light", "#E9D3A2": "--paper", "#FFE9B0": "--moon-core", "#F2B84B": "--gold",
    "#3A2C78": "--tower-top", "#1C1638": "--plum", "#8B6CFF": "--violet", "#251C4A": "--plum-2",
    "#8A5A12": "--gold-deep", "#4BE3A4": "--mint", "#FF5D73": "--ember", "#3A2716": "--wood",
    "#6C4FE0": "--violet-deep", "#9CA3AF": "--rare-common", "#4BA3FF": "--rare-rare", "#B67CFF": "--rare-epic",
    "#120E26": "--night", "#3a2f6b": "--line", "#7d72a6": "--faint",
}
_ATTR = re.compile(r'\s(fill|stroke|stop-color)="(#[0-9A-Fa-f]{6})"')


def tokenize(svg: str) -> str:
    def fix_tag(m: "re.Match[str]") -> str:
        tag = m.group(0)
        styles = []
        for prop, hexv in _ATTR.findall(tag):
            token = ART_TOKENS.get(hexv) or ART_TOKENS.get(hexv.upper()) or ART_TOKENS.get(hexv.lower())
            if token is None:
                raise KeyError(f"untokenised colour {hexv}")
            styles.append(f"{prop}:var({token})")
        if not styles:
            return tag
        tag = _ATTR.sub("", tag)
        close = "/>" if tag.endswith("/>") else ">"
        return tag[: -len(close)] + f' style="{";".join(styles)}"' + close
    return re.sub(r"<[a-zA-Z][^<>]*>", fix_tag, svg)

# --------------------------------------------------------------------------- svg scenes


def scene_svg(kind: str, w: int = 520, h: int = 200) -> str:
    stars = "".join(
        f'<circle cx="{(i * 97) % w}" cy="{(i * 53) % (h // 2)}" r="{1 + (i % 3) * 0.5}" fill="#F7E7C2" opacity="{0.25 + (i % 4) * 0.15}"/>'
        for i in range(22)
    )
    moon = f'<circle cx="{w - 90}" cy="58" r="38" fill="url(#moon)"/><circle cx="{w - 90}" cy="58" r="52" fill="none" stroke="#F2B84B" stroke-opacity=".25"/>'
    defs = (
        '<defs><radialGradient id="moon"><stop offset="0" stop-color="#FFE9B0"/><stop offset="1" stop-color="#F2B84B" stop-opacity=".2"/></radialGradient>'
        '<linearGradient id="bld" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2C78"/><stop offset="1" stop-color="#1C1638"/></linearGradient></defs>'
    )
    body = ""
    if kind == "skyline":
        xs = [(10, 70, 90), (90, 110, 60), (160, 50, 130), (220, 90, 80), (320, 60, 120), (390, 80, 70)]
        for x, bw, bh in xs:
            body += f'<rect x="{x}" y="{h - bh}" width="{bw * .7:.0f}" height="{bh}" fill="url(#bld)" stroke="#8B6CFF" stroke-opacity=".35"/>'
            for k in range(3):
                body += f'<rect x="{x + 8 + k * 14}" y="{h - bh + 14}" width="6" height="9" fill="#F2B84B" opacity=".75"/>'
    elif kind == "vault":
        body = (f'<circle cx="150" cy="{h - 70}" r="62" fill="#251C4A" stroke="#F2B84B" stroke-width="4"/>'
                f'<circle cx="150" cy="{h - 70}" r="40" fill="none" stroke="#F2B84B" stroke-dasharray="6 6"/>'
                f'<rect x="146" y="{h - 110}" width="8" height="80" fill="#F2B84B" transform="rotate(35 150 {h - 70})"/>'
                + "".join(f'<ellipse cx="{270 + i * 34}" cy="{h - 22 - (i % 3) * 10}" rx="16" ry="6" fill="#F2B84B" stroke="#8A5A12"/>' for i in range(6)))
    elif kind == "chart":
        pts, y = [], h - 60
        for i in range(14):
            o = y
            y = max(30, min(h - 20, y + (-18 if i % 3 else 22) + (i % 5) * 3))
            color = "#4BE3A4" if y < o else "#FF5D73"
            body += f'<rect x="{20 + i * 26}" y="{min(o, y)}" width="12" height="{abs(o - y) + 4}" fill="{color}"/>'
            pts.append(f"{26 + i * 26},{y}")
        body += f'<polyline points="{" ".join(pts)}" fill="none" stroke="#F2B84B" stroke-width="2"/>'
    elif kind == "board":
        body = f'<rect x="40" y="40" width="300" height="{h - 50}" rx="6" fill="#3A2716" stroke="#8A5A12" stroke-width="4"/>'
        for i, (x, y, c) in enumerate([(60, 60, "#F7E7C2"), (150, 70, "#E9D3A2"), (240, 58, "#F7E7C2"), (90, 120, "#E9D3A2"), (200, 125, "#F7E7C2")]):
            body += f'<rect x="{x}" y="{y}" width="72" height="50" fill="{c}" transform="rotate({(i % 3 - 1) * 4} {x + 36} {y + 25})"/><circle cx="{x + 36}" cy="{y + 4}" r="4" fill="#FF5D73"/>'
    elif kind == "stall":
        body = (f'<path d="M40 70 L360 70 L340 40 L60 40 Z" fill="#8B6CFF"/>'
                + "".join(f'<path d="M{60 + i * 40} 70 q20 24 40 0" fill="{"#F2B84B" if i % 2 else "#6C4FE0"}"/>' for i in range(8))
                + f'<rect x="60" y="94" width="280" height="{h - 100}" fill="#251C4A" stroke="#F2B84B" stroke-opacity=".5"/>'
                + "".join(f'<rect x="{80 + i * 64}" y="{h - 70}" width="44" height="44" rx="6" fill="#1C1638" stroke="{["#9CA3AF", "#4BA3FF", "#B67CFF", "#F2B84B"][i]}" stroke-width="3"/>' for i in range(4)))
    elif kind == "tavern":
        body = (f'<rect x="40" y="{h - 90}" width="320" height="16" fill="#8A5A12"/>'
                + "".join(f'<rect x="{70 + i * 70}" y="{h - 130}" width="28" height="40" rx="4" fill="#F2B84B" opacity=".85"/><rect x="{98 + i * 70}" y="{h - 120}" width="8" height="18" rx="3" fill="none" stroke="#F2B84B" stroke-width="3"/>' for i in range(4))
                + '<path d="M60 60 h120 a14 14 0 0 1 14 14 v30 a14 14 0 0 1 -14 14 h-80 l-20 18 v-18 h-20 a14 14 0 0 1 -14 -14 v-30 a14 14 0 0 1 14 -14z" fill="#8B6CFF" opacity=".8"/>')
    elif kind == "citadel":
        body = (f'<path d="M80 {h} V90 l30 -30 l30 30 V{h}z M200 {h} V60 l40 -40 l40 40 V{h}z" fill="url(#bld)" stroke="#FF5D73" stroke-opacity=".5"/>'
                + "".join(f'<circle cx="{240}" cy="{80 + i * 28}" r="5" fill="{["#4BE3A4", "#F2B84B", "#4BE3A4", "#FF5D73"][i]}"/>' for i in range(4)))
    elif kind == "lab":
        body = (f'<path d="M120 50 h40 v40 l40 70 a14 14 0 0 1 -12 20 h-96 a14 14 0 0 1 -12 -20 l40 -70z" fill="#251C4A" stroke="#4BE3A4" stroke-width="3"/>'
                f'<path d="M96 150 h128 l-10 22 h-108z" fill="#4BE3A4" opacity=".6"/>'
                + "".join(f'<text x="{250 + (i % 3) * 40}" y="{70 + (i // 3) * 40}" font-family="Orbitron" font-size="22" fill="#F2B84B" opacity=".7">{s}</text>' for i, s in enumerate("%+=×÷∑")))
    elif kind == "gate":
        body = (f'<path d="M120 {h} V90 a80 80 0 0 1 160 0 V{h}z" fill="#251C4A" stroke="#F2B84B" stroke-width="4"/>'
                f'<path d="M150 {h} V100 a50 50 0 0 1 100 0 V{h}z" fill="#120E26"/><circle cx="235" cy="{h - 50}" r="5" fill="#F2B84B"/>')
    return tokenize(f'<svg viewBox="0 0 {w} {h}" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">{defs}{stars}{moon}{body}</svg>')


# --------------------------------------------------------------------------- blocks

RARITY = [("일반", "var(--rare-common)"), ("희귀", "var(--rare-rare)"), ("영웅", "var(--rare-epic)"), ("전설", "var(--gold)")]


def panel(title: str, body: str, cls: str = "", tag: str = "") -> str:
    t = f'<span class="tag">{E(tag)}</span>' if tag else ""
    return f'<section class="panel {cls}"><header><h2>{E(title)}</h2>{t}</header>{body}</section>'


def rows(items, num=True) -> str:
    out = ""
    for i, it in enumerate(items):
        label, value, tone = (it + ("",))[:3] if isinstance(it, tuple) else (it, "", "")
        out += f'<li><span>{E(label)}</span><b class="n {tone}">{E(value)}</b></li>'
    return f'<ul class="rows">{out}</ul>'


def bars(items) -> str:
    return '<div class="bars">' + "".join(
        f'<div class="bar"><span>{E(l)}</span><i style="--w:{w}%;--c:{c}"></i><b class="n">{w}%</b></div>' for l, w, c in items
    ) + "</div>"


def quest_list(items) -> str:
    return '<ul class="quests">' + "".join(
        f'<li><i class="seal" style="--c:{RARITY[r][1]}"></i><div><b>{E(t)}</b><small>{E(d)}</small><span class="prog"><i style="--w:{p}%"></i></span></div><em class="n">+{rw} WLD</em></li>'
        for t, d, p, rw, r in items
    ) + "</ul>"


def items_grid(names, n=8) -> str:
    out = ""
    for i in range(n):
        rn, rc = RARITY[i % 4]
        name = names[i % len(names)]
        out += f'<div class="item" style="--c:{rc}"><div class="gem"></div><b>{E(name)}</b><small>{rn}</small><em class="n">{(i + 2) * 350:,} WLD</em></div>'
    return f'<div class="items">{out}</div>'


def ticker_table(n=6) -> str:
    names = [("CHIMU", "치무전자"), ("WDBK", "월덕은행"), ("MOON", "달빛게임즈"), ("LANT", "등불식품"), ("GUILD", "길드건설"), ("STAR", "별빛바이오"), ("NOVA", "노바에너지")]
    out = ""
    for i in range(n):
        s, k = names[i % len(names)]
        up = i % 3 != 1
        out += f'<tr><td><b>{s}</b><small>{k}</small></td><td class="n">{(5023 - i * 611):,}</td><td class="n {"up" if up else "down"}">{"+" if up else "−"}{(i * 0.8 + 0.6):.2f}%</td><td><span class="spark {"up" if up else "down"}"></span></td></tr>'
    return f'<table class="tbl"><thead><tr><th>종목</th><th>현재가</th><th>등락</th><th>추이</th></tr></thead><tbody>{out}</tbody></table>'


def orderbook() -> str:
    asks = "".join(f'<li class="ask"><b class="n">{5100 - i * 20:,}</b><i style="--w:{30 + i * 12}%"></i><span class="n">{120 + i * 37}</span></li>' for i in range(4))
    bids = "".join(f'<li class="bid"><b class="n">{5020 - i * 20:,}</b><i style="--w:{70 - i * 12}%"></i><span class="n">{310 - i * 41}</span></li>' for i in range(4))
    return f'<ul class="book">{asks}<li class="mid n">5,040 체결</li>{bids}</ul>'


def chart_svg(h=150, w=560) -> str:
    """Candles with grid, price axis and volume, so a market panel reads as a chart, not scenery."""
    grid = "".join(f'<line x1="0" x2="{w - 46}" y1="{y}" y2="{y}" stroke="#3a2f6b" stroke-dasharray="3 5"/>' for y in range(12, h - 30, max(18, (h - 40) // 4)))
    axis = "".join(f'<text x="{w - 40}" y="{y + 4}" font-family="Orbitron" font-size="10" fill="#7d72a6">{5200 - i * 60:,}</text>' for i, y in enumerate(range(12, h - 30, max(18, (h - 40) // 4))))
    body, y, ma = "", h * 0.55, []
    n = 22
    step = (w - 60) / n
    for i in range(n):
        o = y
        y = max(14, min(h - 40, y + ((i * 37) % 23 - 11) * 1.4))
        up = y < o
        c = "#4BE3A4" if up else "#FF5D73"
        x = 6 + i * step
        body += f'<line x1="{x + step * .3:.1f}" x2="{x + step * .3:.1f}" y1="{min(o, y) - 6:.1f}" y2="{max(o, y) + 6:.1f}" stroke="{c}"/>'
        body += f'<rect x="{x:.1f}" y="{min(o, y):.1f}" width="{step * .6:.1f}" height="{abs(o - y) + 2:.1f}" fill="{c}"/>'
        vh = 6 + (i * 13) % 18
        body += f'<rect x="{x:.1f}" y="{h - vh}" width="{step * .6:.1f}" height="{vh}" fill="{c}" opacity=".35"/>'
        ma.append(f"{x + step * .3:.1f},{(o + y) / 2:.1f}")
    body += f'<polyline points="{" ".join(ma)}" fill="none" stroke="#F2B84B" stroke-width="1.6"/>'
    return tokenize(f'<svg class="chart" viewBox="0 0 {w} {h}" aria-hidden="true">{grid}{axis}{body}</svg>')


def growth_svg(h=150, w=560) -> str:
    """Compound growth: principal band plus the interest area above it, by year."""
    pts, top = [], []
    for i in range(11):
        x = 10 + i * (w - 60) / 10
        y = h - 20 - (h - 50) * ((1.044 ** i - 1) / (1.044 ** 10 - 1)) * 0.9 - 30
        pts.append(f"{x:.1f},{y:.1f}")
        top.append((x, y))
    area = f'M10,{h - 20} L' + " L".join(pts) + f' L{top[-1][0]:.1f},{h - 20} Z'
    base = f'<rect x="10" y="{h - 50}" width="{w - 60}" height="30" fill="#8B6CFF" opacity=".35"/>'
    labels = "".join(f'<text x="{top[i][0] - 6:.1f}" y="{h - 4}" font-family="Orbitron" font-size="10" fill="#7d72a6">{i}y</text>' for i in (0, 5, 10))
    return tokenize(f'<svg class="chart" viewBox="0 0 {w} {h}" aria-hidden="true">{base}<path d="{area}" fill="#4BE3A4" opacity=".25"/>'
            f'<polyline points="{" ".join(pts)}" fill="none" stroke="#F2B84B" stroke-width="2.4"/>{labels}</svg>')


def rate_svg(h=140, w=560) -> str:
    """Policy rate as a step line: rates change at meetings, they do not wander like prices."""
    steps = [3.0, 3.0, 3.25, 3.25, 3.5, 3.5, 3.5, 3.25, 3.25, 3.25]
    lo, hi = 2.75, 3.75
    y = lambda r: h - 24 - (r - lo) / (hi - lo) * (h - 40)
    seg = (w - 60) / len(steps)
    d = f"M10,{y(steps[0]):.1f}"
    for i, r in enumerate(steps):
        d += f" H{10 + i * seg:.1f} V{y(r):.1f}"
    d += f" H{10 + len(steps) * seg:.1f}"
    marks = "".join(f'<text x="{w - 44}" y="{y(r) + 4:.1f}" font-family="Orbitron" font-size="10" fill="#7d72a6">{r:.2f}%</text>' for r in (3.0, 3.25, 3.5))
    meets = "".join(f'<circle cx="{10 + i * seg:.1f}" cy="{y(r):.1f}" r="4" fill="#F2B84B"/>' for i, r in enumerate(steps) if i and steps[i - 1] != r)
    return tokenize(f'<svg class="chart" viewBox="0 0 {w} {h}" aria-hidden="true"><path d="{d}" fill="none" stroke="#8B6CFF" stroke-width="2.4"/>{meets}{marks}</svg>')


def table(headers, data) -> str:
    th = "".join(f"<th>{E(x)}</th>" for x in headers)
    tr = "".join("<tr>" + "".join(f'<td class="{"n" if re.fullmatch(r"[-+−0-9,.:% ]+.*", str(c)) else ""}">{E(str(c))}</td>' for c in r) + "</tr>" for r in data)
    return f'<table class="tbl"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table>'


def chat() -> str:
    msgs = [("me", "어제 상점에서 산 프레임이 프로필에 안 보여요."), ("gm", "확인했어요. 적용 버튼을 한 번 더 눌러 주시면 바로 반영됩니다."), ("me", "됐어요! 감사합니다."), ("gm", "좋은 모험 되세요. 문의는 처리 완료로 바꿀게요.")]
    return '<div class="chat">' + "".join(f'<p class="{w}">{E(t)}</p>' for w, t in msgs) + '<div class="composer"><span>메시지 입력</span><b>보내기</b></div></div>'


def form(fields, cta) -> str:
    f = "".join(f'<label><span>{E(a)}</span><div class="input">{E(b)}</div></label>' for a, b in fields)
    return f'<div class="form">{f}<div class="cta">{E(cta)}</div></div>'


def toggles(items) -> str:
    return '<ul class="toggles">' + "".join(f'<li><span>{E(t)}</span><i class="sw {"on" if on else ""}"></i></li>' for t, on in items) + "</ul>"


def stat_tiles(items) -> str:
    return '<div class="tiles">' + "".join(f'<div class="tile"><small>{E(l)}</small><b class="n {t}">{E(v)}</b></div>' for l, v, t in items) + "</div>"


def doc_body(title) -> str:
    sections = ["제1조 목적", "제2조 용어의 정의", "제3조 가상 재화 WLD", "제4조 회원의 의무", "제5조 운영 정책"] if "약관" in title or "개인정보" in title or "삭제" in title else ["개요", "시작하기", "자주 묻는 질문", "변경 이력"]
    toc = "".join(f"<li>{E(s)}</li>" for s in sections)
    para = "<p>월덕 머니버스의 WLD는 커뮤니티 안에서만 쓰이는 게임 재화이며 실제 화폐나 투자 상품이 아닙니다. 모든 거래는 복식부기 원장에 기록되고, 잘못된 거래는 삭제가 아니라 보정 거래로 바로잡습니다.</p>"
    return f'<div class="doc"><ol class="toc">{toc}</ol><article><h3>{E(sections[0])}</h3>{para}<h3>{E(sections[1])}</h3>{para}</article></div>'


# --------------------------------------------------------------------------- archetype content


def content(kind: str, route: str, title: str):
    """Return (desktop_main_html, mobile_main_html)."""
    last = route.rstrip("/").split("/")[-1]
    if kind == "home":
        d = (
            '<div class="grid g3">'
            + panel("오늘의 퀘스트", quest_list([("시장 개장 출석", "매일 첫 접속", 100, 50, 0), ("주식 1회 체결", "아무 종목이나", 40, 120, 1), ("길드 광장에 글 쓰기", "공략 또는 후기", 0, 80, 2)]), "span2")
            + panel("서버 시계", '<div class="clock"><b class="n">D+128</b><span>현실 10분 = 서버 1일</span><span>서버 7일 = 서버 1주</span></div>')
            + panel("내 자산", stat_tiles([("WLD 잔액", "128,400", "gold"), ("주식 평가", "52,100", ""), ("오늘 손익", "+3.2%", "up")]))
            + panel("시장 시세", ticker_table(4), "span2")
            + "</div>"
        )
        m = panel("오늘의 퀘스트", quest_list([("시장 개장 출석", "매일 첫 접속", 100, 50, 0), ("주식 1회 체결", "아무 종목이나", 40, 120, 1)])) + panel("내 자산", stat_tiles([("WLD", "128,400", "gold"), ("손익", "+3.2%", "up")]))
    elif kind == "wallet":
        inv = "inventory" in route or "collections" in route
        d = '<div class="grid g3">' + panel("보유 WLD", '<div class="coin"><i></i><b class="n gold">128,400</b><small>원장 기준 WLD</small></div>' + bars([("현금성", 58, "var(--gold)"), ("주식", 27, "var(--violet)"), ("예금", 15, "var(--mint)")]))
        if inv:
            d += panel("인벤토리" if "inventory" in route else "도감", items_grid(["달빛 프레임", "등불 배지", "용의 비늘", "길드 깃발", "황금 열쇠", "별의 조각"], 8), "span2")
        else:
            d += panel("최근 거래", table(["시각", "내용", "금액"], [("21:04", "퀘스트 보상", "+120"), ("20:41", "치무전자 매수", "−5,023"), ("19:12", "상점, 달빛 프레임", "−1,200"), ("18:30", "출석 보상", "+50")]), "span2")
        d += panel("조폐와 소각 현황" if "mint" in route else "자산 분포", bars([("이번 주 발행", 64, "var(--gold)"), ("이번 주 소각", 41, "var(--ember)"), ("순 유통", 72, "var(--violet)")]), "span3") + "</div>"
        m = panel("보유 WLD", '<div class="coin"><i></i><b class="n gold">128,400</b><small>WLD</small></div>') + panel("최근 거래", rows([("퀘스트 보상", "+120", "up"), ("치무전자 매수", "−5,023", "down"), ("상점 구매", "−1,200", "down")]))
    elif kind == "bank":
        prod = {"bonds": "국채 발행 목록", "pension": "내 연금 계좌", "kdic": "예금보험 한도", "treasury": "국고 비축", "fx": "환율 보드", "central-bank": "기준금리 결정"}.get(route.split("/")[1], "예금 상품")
        d = ('<div class="grid g3">' + panel("기준금리", '<div class="gauge"><b class="n gold">3.25%</b><span>다음 회의 서버 D+135</span></div>')
             + panel(prod, '<div class="contracts">' + "".join(f'<div class="contract"><b>{n}</b><span class="n">{r}</span><small>{t}</small></div>' for n, r, t in [("자유 예금", "연 2.1%", "언제든 인출"), ("길드 정기예금", "연 3.8%", "서버 4주 만기"), ("모험가 적금", "연 4.4%", "매일 자동 납입")]) + "</div>", "span2")
             + panel("대출과 상환", rows([("이용 중 대출", "20,000 WLD"), ("이번 주 이자", "84 WLD"), ("상환 예정일", "서버 D+131")]))
             + panel("기준금리 결정 이력", rate_svg(), "span2") + "</div>")
        m = panel("기준금리", '<div class="gauge"><b class="n gold">3.25%</b></div>') + panel(prod, rows([("자유 예금", "연 2.1%"), ("정기예금", "연 3.8%"), ("적금", "연 4.4%")]))
    elif kind == "market":
        sub = {"portfolio": "내 포트폴리오", "history": "거래 내역", "watchlist": "관심 종목", "compare": "종목 비교", "alerts": "조건부 알림", "lounge": "주주 라운지"}.get(last, "")
        d = ('<div class="grid g3">' + panel("치무전자 CHIMU", chart_svg(170), "span2", "영웅 위험도") + panel("호가창", orderbook())
             + panel(sub or "전체 종목", ticker_table(5), "span2") + panel("주문", form([("수량", "10주"), ("가격", "5,040 WLD")], "매수 주문 넣기")) + "</div>")
        m = panel("치무전자", chart_svg(120)) + panel(sub or "전체 종목", ticker_table(3))
    elif kind == "quest":
        sp = {"seasons": "시즌 패스", "arcade": "아케이드 게임", "casino": "카지노 (운영 중지)", "lobby": "게임 로비", "calendar": "이벤트 달력", "progression": "성장 트리"}.get(route.split("/")[1], "퀘스트 게시판")
        qs = [("길드 광장 첫 글", "공략이나 후기를 남기세요", 0, 80, 0), ("거래소 3회 체결", "서로 다른 종목", 66, 150, 1), ("정기예금 가입", "서버 4주 이상", 0, 200, 2), ("시즌 랭킹 100위", "주간 정산", 20, 1000, 3)]
        tiers = '<div class="tiers">' + "".join(f'<div class="tier {"done" if i < 3 else ""}"><b class="n">{i + 1}</b><small>{["배지", "100 WLD", "프레임", "칭호", "전설 상자"][i]}</small></div>' for i in range(5)) + "</div>"
        d = '<div class="grid g3">' + panel(sp, quest_list(qs), "span2") + panel("내 레벨", '<div class="lvl"><b class="n">Lv. 23</b><span class="prog big"><i style="--w:68%"></i></span><small>다음 레벨까지 1,240 XP</small></div>') + panel("시즌 보상 트랙", tiers, "span3") + "</div>"
        m = panel(sp, quest_list(qs[:3])) + panel("시즌 보상", tiers)
    elif kind == "shop":
        d = '<div class="grid g3">' + panel("오늘의 진열대", items_grid(["달빛 프레임", "등불 배지", "용의 비늘 테두리", "길드 깃발", "별의 조각", "새벽 망토", "황금 열쇠 칭호"], 7), "span3") + panel("장바구니", rows([("달빛 프레임", "1,200"), ("등불 배지", "700")])) + panel("최근 구매", rows([("레트로 픽셀", "1,200"), ("벚꽃 엔딩", "900")]), "span2") + "</div>"
        m = panel("오늘의 진열대", items_grid(["달빛 프레임", "등불 배지", "용의 비늘", "길드 깃발"], 4))
    elif kind == "community":
        posts = [("[공략] 정기예금으로 레벨 빨리 올리기", "달빛기사", "댓글 24"), ("치무전자 실적 발표 정리", "등불상인", "댓글 12"), ("이번 시즌 칭호 모음", "별헤는밤", "댓글 31"), ("신규 길드원 환영합니다", "운영진", "공지")]
        d = '<div class="grid g3">' + panel("주목할 글", '<div class="feature"><div class="cover">' + scene_svg("board", 300, 120) + '</div><b>[공략] 정기예금으로 레벨 빨리 올리기</b><small>달빛기사, 서버 D+127</small></div>') + panel(title, '<ul class="posts">' + "".join(f"<li><b>{E(a)}</b><small>{E(b)}</small><em>{E(c)}</em></li>" for a, b, c in posts) + "</ul>", "span2") + "</div>"
        m = panel(title, '<ul class="posts">' + "".join(f"<li><b>{E(a)}</b><small>{E(b)}</small></li>" for a, b, c in posts[:3]) + "</ul>")
    elif kind == "article":
        art = '<article class="read"><h3>정기예금으로 레벨 빨리 올리기</h3><small>달빛기사, 서버 D+127, 6분 읽기</small><p>정기예금 퀘스트는 가입만으로 보상을 주기 때문에 초반 레벨업에 가장 효율적입니다. 만기까지 서버 4주가 걸리니 시즌 초에 가입해 두는 편이 좋습니다.</p><p>예금 이자는 원장에 매일 기록되고, 중도 해지 시에는 이자만 줄어듭니다.</p></article>'
        d = '<div class="grid g3">' + panel("본문", art, "span2") + panel("댓글 24", rows([("등불상인", "좋아요 12"), ("별헤는밤", "좋아요 4"), ("새벽길드", "좋아요 2")])) + "</div>"
        m = panel("본문", art)
    elif kind == "support":
        d = '<div class="grid g3">' + panel("내 문의", rows([("프레임 적용 문의", "답변 완료", "up"), ("출석 보상 누락", "답변 대기", "gold"), ("닉네임 변경", "처리 완료", "up")])) + panel("운영진과 대화", chat(), "span2") + "</div>"
        m = panel("운영진과 대화", chat())
    elif kind == "account":
        sheet = '<div class="sheet"><div class="medal"><img src="' + FAVICON + '" alt=""><i></i></div><div><b>달빛기사</b><small>Lv. 23, 길드 월덕, 칭호 「등불지기」</small></div></div>'
        sub = {"security": ("보안과 로그인 기기", toggles([("새 기기 로그인 알림", True), ("관리자 2단계 인증", True), ("다른 기기 모두 로그아웃", False)])), "notifications": ("알림 설정", toggles([("퀘스트 완료", True), ("시세 알림", True), ("광장 댓글", False)])), "privacy": ("개인정보", toggles([("프로필 공개", True), ("랭킹 노출", False)]))}.get(last, ("능력치", stat_tiles([("총 자산", "180,500", "gold"), ("완료 퀘스트", "312", ""), ("길드 기여", "4,210", "up")])))
        danger = "deletion" in route
        d = '<div class="grid g3">' + panel("캐릭터 정보", sheet) + panel(sub[0], sub[1], "span2") + (panel("계정 삭제 요청", '<p class="warn">삭제를 요청하면 서버 30일 뒤 계정과 보유 WLD가 영구 정리됩니다. 원장 기록은 법정 보관 기간 동안 익명으로 남습니다.</p><div class="cta danger">삭제 요청하기</div>', "span3 dangerp") if danger else panel("업적", items_grid(["첫 체결", "출석 100일", "시즌 1위권"], 3), "span3")) + "</div>"
        m = panel("캐릭터 정보", sheet) + panel(sub[0], sub[1])
    elif kind == "admin":
        tiles = stat_tiles([("활성 회원", "23", ""), ("오늘 거래", "950", ""), ("원장 불일치", "0", "up"), ("경고", "2", "down")])
        logs = table(["시각", "운영자", "조치", "결과"], [("21:02", "superadmin", f"{title} 조회", "허용"), ("20:47", "operator", "기능 스위치 변경", "승인"), ("20:11", "system", "원장 대사", "일치"), ("19:58", "operator", "IP 차단 추가", "적용")])
        sw = toggles([("카지노", False), ("주식 기업 행동", False), ("자동 경제 정책", False), ("상점", True)])
        segs = set(route.split("/"))
        if segs & {"logs", "activity", "delivery", "errors", "integrity", "system"}:
            main_p = panel(f"{title} 스트림", table(["시각", "수준", "출처", "메시지"], [("21:04:12", "INFO", "ledger", "대사 완료, 불일치 0"), ("21:03:55", "WARN", "market", "체결 지연 420ms"), ("21:02:10", "INFO", "auth", "관리자 콘솔 진입"), ("20:59:41", "ERROR", "discord", "웹훅 재시도 2회"), ("20:58:03", "INFO", "shop", "구매 영수증 발급")]), "span2")
            side = panel("필터", toggles([("오류만", False), ("경고 포함", True), ("시스템 작업", True)]))
        elif segs & {"economy", "money-flow", "mint", "central-bank", "treasury", "bank", "bonds", "pension", "kdic", "fx", "scenario-lab"}:
            main_p = panel(f"{title} 흐름", chart_svg(170), "span2")
            side = panel("정책 지표", rows([("기준금리", "3.25%", "gold"), ("주간 발행", "+64,000"), ("주간 소각", "−41,000", "down"), ("국고 비축", "2.1M")]))
        elif segs & {"security", "safety", "controls", "api-health"}:
            main_p = panel(f"{title} 현황", table(["대상", "상태", "최근 변경"], [("203.0.113.0/24", "차단", "20:58"), ("관리자 재인증", "필수", "상시"), ("API 게이트웨이", "정상", "21:00"), ("디스코드 상호작용", "서명 검증", "상시")]), "span2")
            side = panel("기능 스위치", sw)
        elif segs & {"support", "discord"}:
            main_p = panel(f"{title} 대화", chat(), "span2")
            side = panel("대기 중", rows([("출석 보상 누락", "12분", "gold"), ("닉네임 변경", "40분"), ("결제 문의", "1시간", "down")]))
        elif segs & {"blog", "content", "help", "seo", "seo-audit", "catalog"}:
            main_p = panel(f"{title} 목록", table(["제목", "상태", "언어", "갱신"], [("정기예금 공략", "발행", "KO", "D+127"), ("Money flow basics", "발행", "EN", "D+127"), ("経済の基礎", "검수 대기", "JA", "D+126"), ("编程入门", "회수", "ZH", "D+125")]), "span2")
            side = panel("검색 노출", rows([("색인된 글", "95", "up"), ("사이트맵", "정상", "up"), ("오류", "0")]))
        elif segs & {"shop", "market", "ai-news", "enterprises"}:
            main_p = panel(f"{title} 관리", ticker_table(5) if "shop" not in segs else items_grid(["달빛 프레임", "등불 배지", "길드 깃발", "황금 열쇠"], 4), "span2")
            side = panel("거래 정지", toggles([("치무전자", False), ("별빛바이오", True)]))
        elif segs & {"users", "analytics", "operations", "storage"}:
            main_p = panel(f"{title} 지표", bars([("일간 활성", 72, "var(--violet)"), ("주간 잔존", 58, "var(--mint)"), ("저장소 사용", 41, "var(--gold)")]) + chart_svg(110), "span2")
            side = panel("최근 가입", rows([("달빛기사", "D+128"), ("등불상인", "D+127"), ("별헤는밤", "D+126")]))
        else:
            main_p = panel(f"{title} 감사 로그", logs, "span2")
            side = panel("기능 스위치", sw)
        d = '<div class="grid g3">' + panel("관제 요약", tiles, "span3") + main_p + side + "</div>"
        m = panel("관제 요약", tiles) + panel("최근 조치", rows([("기능 스위치 변경", "승인"), ("원장 대사", "일치", "up")]))
    elif kind == "tool":
        if "glossary" in route or "guide" in route:
            terms = [("복리", "이자에 다시 이자가 붙는 방식"), ("기준금리", "중앙은행이 정하는 기본 금리"), ("호가", "사고팔려는 가격"), ("배당", "기업 이익을 주주에게 나누는 것")]
            body = '<dl class="terms">' + "".join(f"<dt>{E(a)}</dt><dd>{E(b)}</dd>" for a, b in terms) + "</dl>"
            d = '<div class="grid g3">' + panel(title, body, "span2") + panel("관련 계산기", rows([("복리 계산기", "열기"), ("대출 이자 계산기", "열기")])) + "</div>"
            m = panel(title, body)
        else:
            f = form([("원금", "1,000,000"), ("연 이율", "4.4%"), ("기간", "10년")], "계산하기")
            res = stat_tiles([("최종 금액", "1,538,000", "gold"), ("총 이자", "538,000", "up")])
            d = '<div class="grid g3">' + panel("입력", f) + panel("결과", res + growth_svg(140), "span2") + panel("연도별 표", table(["연차", "원금", "이자", "합계"], [(1, "1,000,000", "44,000", "1,044,000"), (5, "1,000,000", "240,000", "1,240,000"), (10, "1,000,000", "538,000", "1,538,000")]), "span3") + "</div>"
            m = panel("입력", f) + panel("결과", res)
    elif kind == "status":
        comp = [("웹 서비스", "정상", "up"), ("경제 API", "정상", "up"), ("경제 원장 DB", "정상", "up"), ("마인크래프트 서버", "점검 중", "gold"), ("디스코드 봇", "정상", "up")]
        d = '<div class="grid g3">' + panel("구성 요소", rows(comp), "span2") + panel("최근 사건", rows([("서버 D+120 시세 지연", "해결", "up")])) + "</div>"
        m = panel("구성 요소", rows(comp))
    elif kind == "auth":
        f = form([("이메일 주소", "name@example.com"), ("비밀번호", "••••••••")], {"register": "모험가 등록하기", "forgot-password": "재설정 메일 받기", "reset-password": "새 비밀번호 저장", "invite": "초대 수락하기"}.get(route.split("/")[1], "자체 계정으로 로그인"))
        social = '<div class="social"><span class="discord">디스코드로 계속하기</span><span class="google">구글로 계속하기</span></div>'
        d = '<div class="grid g2">' + panel("길드 문", f + social) + panel("처음 오셨나요?", '<ul class="steps"><li>디스코드 계정으로 바로 시작</li><li>첫 출석 보상 받기</li><li>오늘의 퀘스트 확인</li></ul>') + "</div>"
        m = panel("길드 문", f + social)
    else:  # doc
        d = '<div class="grid g3">' + panel(title, doc_body(title), "span3") + "</div>"
        m = panel(title, doc_body(title))
    return d, m


# --------------------------------------------------------------------------- page

NAV = [("홈", "home"), ("지갑", "wallet"), ("은행", "bank"), ("거래소", "market"), ("퀘스트", "quest"), ("상점", "shop"), ("광장", "community"), ("문의", "support"), ("내 계정", "account")]
ICON = {
    "home": '<path d="M3 11l9-7 9 7v9h-6v-6H9v6H3z"/>', "wallet": '<rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="16" cy="12.5" r="1.6"/>',
    "bank": '<path d="M3 9l9-5 9 5M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18"/>', "market": '<path d="M4 18l5-6 4 3 7-9"/>',
    "quest": '<path d="M6 3h11a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-3 2V5a2 2 0 0 1 2-2z"/>', "shop": '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
    "community": '<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 19c1-3 4-4 6-4s5 1 6 4"/>', "support": '<path d="M4 5h16v11H9l-5 4z"/>',
    "account": '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
}
NAV_ACTIVE = {"wallet": "wallet", "bank": "bank", "market": "market", "quest": "quest", "shop": "shop", "community": "community", "article": "community", "support": "support", "account": "account", "home": "home", "tool": "", "admin": "", "status": "", "doc": "", "auth": "account"}


def icon(name: str) -> str:
    return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICON[name]}</svg>'


def hud(compact=False) -> str:
    return (
        '<div class="hud">'
        f'<div class="medal sm"><img src="{FAVICON}" alt=""><i></i></div>'
        '<div class="who"><b>달빛기사</b><span class="xp"><i style="--w:68%"></i></span><small>Lv. 23</small></div>'
        '<div class="coins"><span class="coin-i"></span><b class="n">128,400</b></div>'
        + ("" if compact else '<div class="gems"><span class="gem-i"></span><b class="n">42</b></div><div class="bell">' + icon("support") + "<em>3</em></div>")
        + "</div>"
    )


def page(route: str) -> str:
    kind = archetype(route)
    title = title_for(route)
    active = NAV_ACTIVE.get(kind, "")
    desk_main, mob_main = content(kind, route, title)
    admin = kind == "admin"
    nav = "".join(f'<li class="{"on" if k == active else ""}">{icon(k)}<span>{n}</span></li>' for n, k in NAV)
    if admin:
        nav += '<li class="on gm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/></svg><span>GM 콘솔</span></li>'
    dock_items = [("홈", "home"), ("지갑", "wallet"), ("퀘스트", "quest"), ("거래소", "market"), ("계정", "account")]
    dock = "".join(f'<li class="{"on" if k == active else ""} {"center" if k == "quest" else ""}">{icon(k)}<span>{n}</span></li>' for n, k in dock_items)
    scene = SCENE[kind]
    crumb = " / ".join(seg_name(s) or "언어" for s in route.split("/") if s) or "홈"
    lead = LEAD[kind]
    return f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>{E(title)} | 월덕 머니버스 G1 시안</title><meta name="description" content="{E(lead)}">
<link rel="stylesheet" href="../style.css"></head>
<body class="{'is-admin' if admin else ''}">
<div class="canvas">
 <div class="desktop">
  <aside class="rail">
   <div class="brand"><img src="{FAVICON}" alt=""><b>월덕 머니버스</b></div>
   <ul class="nav">{nav}</ul>
   <div class="rail-foot"><small>서버 시각</small><b class="n">D+128 14:20</b></div>
  </aside>
  <div class="main">
   <div class="top"><div class="search">메뉴와 페이지 검색</div>{hud()}</div>
   <section class="hero k-{kind}">
    <div class="hero-text"><h1>{E(title)}</h1><p>{E(lead)}</p></div>
    <div class="hero-art">{scene_svg(scene)}</div>
   </section>
   {desk_main}
  </div>
 </div>
 <div class="phone">
  <div class="p-top"><img src="{FAVICON}" alt=""><b>{E(title)}</b>{hud(compact=True)}</div>
  <div class="p-hero k-{kind}"><h2>{E(title)}</h2><div class="hero-art">{scene_svg(scene, 340, 120)}</div></div>
  <div class="p-body">{mob_main}</div>
  <ul class="dock">{dock}</ul>
 </div>
 <footer class="stamp">G1 길드 원장 시안, {E(route)}. 표시 수치는 예시이며 실제 잔액이 아닙니다.</footer>
</div></body></html>"""


def main() -> None:
    manifest = json.loads(MANIFEST.read_text())
    routes = [r["route"] for r in manifest["routes"]]
    pages = OUT / "pages"
    pages.mkdir(parents=True, exist_ok=True)
    index = []
    for route in routes:
        name = pathlib.Path(manifest["routes"][routes.index(route)]["file"]).stem
        (pages / f"{name}.html").write_text(page(route), encoding="utf8")
        index.append({"route": route, "name": name, "archetype": archetype(route), "title": title_for(route)})
    (OUT / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding="utf8")
    print(len(index), "pages ->", pages)


if __name__ == "__main__":
    main()
