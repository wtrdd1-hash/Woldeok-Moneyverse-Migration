#!/usr/bin/env python3
"""G2 "Guild Ledger Terminal" direction mockups: 13 representative screens.

G2 refines the owner-approved G1 after the guild-home QA (v2026.11.24.1646)
and owner feedback: quieter surfaces, one action colour, gold only on the
player's own balance, tables and figures first, the ledger status strip as the
single signature. Each page holds a desktop and a phone frame; render.mjs from
game-ui-g1 screenshots them. Figures are illustrative and stamped as such.
"""
from __future__ import annotations

import html
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "scripts/design/game-ui-g2/out"
FAV = (ROOT / "frontend/public/favicon.ico").as_uri()
E = html.escape

ICON = {
    "home": '<path d="M3 11l9-7 9 7v9h-6v-6H9v6H3z"/>',
    "wallet": '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12.5h2"/>',
    "bank": '<path d="M3 9l9-5 9 5M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18"/>',
    "market": '<path d="M4 18l5-6 4 3 7-9"/>',
    "quest": '<path d="M6 3h11a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-3 2V5a2 2 0 0 1 2-2z"/>',
    "shop": '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
    "board": '<path d="M4 5h16v11H9l-5 4z"/>',
    "support": '<circle cx="12" cy="12" r="8"/><path d="M12 8v5M12 16h.01"/>',
    "account": '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
    "gm": '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/>',
}
NAV = [("게임", None), ("홈", "home"), ("퀘스트", "quest"), ("상점", "shop"), ("경제", None), ("지갑", "wallet"), ("은행", "bank"), ("거래소", "market"), ("커뮤니티", None), ("광장", "board"), ("문의", "support"), ("내 계정", "account")]
DOCK = [("홈", "home"), ("지갑", "wallet"), ("퀘스트", "quest"), ("거래소", "market"), ("계정", "account")]


def icon(name: str) -> str:
    return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICON[name]}</svg>'


def panel(title: str, body: str, cls: str = "", link: str = "", pad: bool = True) -> str:
    a = f'<a href="#">{E(link)}</a>' if link else ""
    inner = f'<div class="body">{body}</div>' if pad else body
    return f'<section class="panel {cls}"><header><h2>{E(title)}</h2>{a}</header>{inner}</section>'


def table(head, rows, right=()) -> str:
    th = "".join(f'<th class="{"r" if i in right else ""}">{E(h)}</th>' for i, h in enumerate(head))
    tr = "".join("<tr>" + "".join(f'<td class="{"r" if i in right else ""}">{c}</td>' for i, c in enumerate(r)) + "</tr>" for r in rows)
    return f'<table class="tbl"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table>'


def kv(items) -> str:
    return '<div class="kv">' + "".join(f"<div><span>{E(k)}</span><b class=\"n {c}\">{E(v)}</b></div>" for k, v, c in items) + "</div>"


def lst(items) -> str:
    return '<ul class="list">' + "".join(f"<li><span>{E(a)}</span><time>{E(b)}</time></li>" for a, b in items) + "</ul>"


STOCKS = [("치무전자", "CHIMU", "132,310,036", "−3.87%", "fall"), ("월덕모터스", "WDM", "11,184", "−1.89%", "fall"), ("월덕바이오", "WDB", "127,926", "+1.60%", "rise"), ("월덕 인더스트리", "DUCK", "3,122,257", "−1.38%", "fall"), ("월덕 스페이스", "SPACE", "8,388,903", "−1.12%", "fall"), ("등불식품", "LANT", "48,210", "+0.84%", "rise")]


def stock_rows(n=5):
    return [(f'{E(a)}<small>{b}</small>', f'<span class="n">{p}</span>', f'<span class="n {t}">{c}</span>') for a, b, p, c, t in STOCKS[:n]]


def candles(w=720, h=220) -> str:
    out, y = [], h * 0.55
    step = (w - 96) / 40
    grid = "".join(f'<line x1="0" x2="{w - 92}" y1="{gy}" y2="{gy}" style="stroke:var(--line)"/><text x="{w - 86}" y="{gy + 4}" style="fill:var(--faint);font-size:11px">{132 + (3 - k)},{k}00,000</text>' for k, gy in enumerate(range(20, h - 40, (h - 60) // 3)))
    for i in range(40):
        o = y
        y = max(16, min(h - 50, y + ((i * 37) % 23 - 11) * 3.2))
        c = "var(--rise)" if y < o else "var(--fall)"
        x = 4 + i * step
        out.append(f'<line x1="{x + step * .3:.1f}" x2="{x + step * .3:.1f}" y1="{min(o, y) - 5:.1f}" y2="{max(o, y) + 5:.1f}" style="stroke:{c}"/><rect x="{x:.1f}" y="{min(o, y):.1f}" width="{step * .6:.1f}" height="{abs(o - y) + 2:.1f}" style="fill:{c}"/>')
        vh = 4 + (i * 13) % 22
        out.append(f'<rect x="{x:.1f}" y="{h - vh}" width="{step * .6:.1f}" height="{vh}" style="fill:{c};opacity:.35"/>')
    return f'<svg class="chart" viewBox="0 0 {w} {h}" aria-hidden="true">{grid}{"".join(out)}</svg>'


def growth(w=720, h=200) -> str:
    pts = " ".join(f"{10 + i * (w - 80) / 10:.1f},{h - 30 - (h - 60) * ((1.044 ** i - 1) / (1.044 ** 10 - 1)):.1f}" for i in range(11))
    base = f'<line x1="10" x2="{w - 70}" y1="{h - 30}" y2="{h - 30}" style="stroke:var(--line)"/>'
    labels = "".join(f'<text x="{10 + i * (w - 80) / 10 - 6:.1f}" y="{h - 10}" style="fill:var(--faint);font-size:11px">{i}년</text>' for i in (0, 5, 10))
    return f'<svg class="chart" viewBox="0 0 {w} {h}" aria-hidden="true">{base}<polyline points="{pts}" style="fill:none;stroke:var(--violet);stroke-width:2.5"/>{labels}</svg>'


def screen(key: str):
    """Return (active_nav, title, lead, actions_html, desktop_grid_html, mobile_body_html, signed_in)."""
    if key == "home-guest":
        d = ('<div class="notice"><b>가입 없이 체험</b><span>복리 계산기와 경제 용어는 로그인 없이 볼 수 있습니다. WLD는 게임 재화입니다.</span><a class="btn secondary" href="#">계산기 열기</a></div>'
             '<div class="grid">'
             + panel("오늘 크게 움직인 종목", table(["종목", "현재가", "등락"], stock_rows(5), right=(1, 2)), "c8", "거래소", pad=False)
             + panel("내 자산", '<p class="muted">로그인하면 원장에 기록된 잔액이 표시됩니다.</p><a class="btn primary block" href="#" style="margin-top:16px">로그인하고 지갑 보기</a>', "c4")
             + panel("길드 공지", lst([("[서비스 안내] 업데이트 작업에 따른 일시적 서비스 불안정", "10월 14일"), ("시즌 3 퀘스트 보상표 공개", "10월 9일")]), "c7", "전체 보기", pad=False)
             + panel("어디로 갈까요", lst([("퀘스트 게시판", "보상 확인"), ("은행 금고", "예금과 대출"), ("금융 계산기", "복리와 세금")]), "c5", pad=False)
             + "</div>")
        m = ('<h1>길드 홀</h1><div class="notice"><span>계산기와 용어는 로그인 없이 볼 수 있습니다.</span></div>'
             + panel("오늘 크게 움직인 종목", table(["종목", "현재가", "등락"], stock_rows(4), right=(1, 2)), "", "거래소", pad=False)
             + panel("내 자산", '<a class="btn primary block" href="#">로그인하고 지갑 보기</a>'))
        return "home", "길드 홀", "오늘의 월덕 시장과 길드 소식입니다.", "", d, m, False
    if key == "home-member":
        d = ('<div class="grid">'
             + panel("내 자산", '<p class="balance">128,400<small>WLD</small></p><p class="muted" style="margin:4px 0 16px">원장 기준 사용 가능 잔액</p>' + kv([("주식 평가액", "52,100", ""), ("예금", "30,000", ""), ("오늘 손익", "+1,640", "rise")]) + '<div style="display:flex;gap:8px;margin-top:16px"><a class="btn primary" href="#">지갑 열기</a><a class="btn secondary" href="#">WLD 보내기</a></div>', "c4")
             + panel("보유 종목", table(["종목", "수량", "평가액", "수익률"], [("치무전자<small>CHIMU</small>", '<span class="n">3</span>', '<span class="n">396,930,108</span>', '<span class="n fall">−3.87%</span>'), ("월덕바이오<small>WDB</small>", '<span class="n">40</span>', '<span class="n">5,117,040</span>', '<span class="n rise">+1.60%</span>')], right=(1, 2, 3)), "c8", "포트폴리오", pad=False)
             + panel("오늘의 퀘스트", '<ul class="list">' + "".join(f'<li><span>{q}</span><em>{r}</em></li>' for q, r in [("시장 개장 출석", "완료, 50 WLD"), ("거래소 3회 체결", "1/3, 150 WLD"), ("광장에 글 쓰기", "0/1, 80 WLD")]) + "</ul>", "c5", "전체", pad=False)
             + panel("오늘 크게 움직인 종목", table(["종목", "현재가", "등락"], stock_rows(4), right=(1, 2)), "c7", "거래소", pad=False)
             + "</div>")
        m = ('<h1>길드 홀</h1>' + panel("내 자산", '<p class="balance">128,400<small>WLD</small></p>' + kv([("오늘 손익", "+1,640", "rise")]) + '<div style="display:flex;gap:8px;margin-top:12px"><a class="btn primary" href="#">지갑</a><a class="btn secondary" href="#">보내기</a></div>')
             + panel("오늘의 퀘스트", '<ul class="list"><li><span>거래소 3회 체결</span><em>1/3</em></li><li><span>광장에 글 쓰기</span><em>0/1</em></li></ul>', pad=False))
        return "home", "길드 홀", "내 자산과 오늘의 시장입니다.", "", d, m, True
    if key == "wallet":
        d = ('<div class="grid">'
             + panel("잔액", '<p class="balance">128,400<small>WLD</small></p><div class="metrics" style="margin-top:16px;border-top:1px solid var(--line)"><div class="metric"><small>현금성</small><b class="figure n">74,472</b></div><div class="metric"><small>주식</small><b class="figure n">34,668</b></div><div class="metric"><small>예금</small><b class="figure n">19,260</b></div><div class="metric"><small>대기 정산</small><b class="figure n">0</b></div></div>', "c12")
             + panel("거래 기록", '<div class="tabs"><a class="on" href="#">전체</a><a href="#">입금</a><a href="#">출금</a><a href="#">수수료</a></div>' + table(["시각", "내용", "상대", "금액", "잔액"], [("서버 D+128 21:04", "퀘스트 보상", "시스템", '<span class="n rise">+120</span>', '<span class="n">128,400</span>'), ("서버 D+128 20:41", "치무전자 매수", "거래소", '<span class="n fall">−5,023</span>', '<span class="n">128,280</span>'), ("서버 D+128 19:12", "상점, 달빛 프레임", "상점", '<span class="n fall">−1,200</span>', '<span class="n">133,303</span>'), ("서버 D+127 18:30", "출석 보상", "시스템", '<span class="n rise">+50</span>', '<span class="n">134,503</span>')], right=(3, 4)), "c12", "영수증 내보내기", pad=False)
             + "</div>")
        m = ('<h1>지갑</h1>' + panel("잔액", '<p class="balance">128,400<small>WLD</small></p>') + panel("거래 기록", lst([("퀘스트 보상 +120", "D+128"), ("치무전자 매수 −5,023", "D+128"), ("상점 −1,200", "D+128")]), pad=False))
        return "wallet", "지갑", "원장에 기록된 잔액과 거래입니다. 잘못된 거래는 삭제가 아니라 보정 거래로 바로잡습니다.", '<a class="btn primary" href="#">WLD 보내기</a>', d, m, True
    if key == "bank":
        d = ('<div class="grid">'
             + panel("기준금리", '<p class="figure n" style="font-size:32px">3.25%</p><p class="muted">다음 결정 서버 D+135</p>', "c4")
             + panel("예금 상품", table(["상품", "금리", "조건", ""], [("자유 예금", '<span class="n">연 2.10%</span>', "언제든 인출", '<a class="btn secondary" href="#">가입</a>'), ("길드 정기예금", '<span class="n">연 3.80%</span>', "서버 4주 만기", '<a class="btn secondary" href="#">가입</a>'), ("모험가 적금", '<span class="n">연 4.40%</span>', "매일 자동 납입", '<a class="btn secondary" href="#">가입</a>')], right=(1,)), "c8", pad=False)
             + panel("내 계약", table(["계약", "원금", "누적 이자", "만기"], [("길드 정기예금", '<span class="n">30,000</span>', '<span class="n rise">+412</span>', "D+140")], right=(1, 2)), "c8", pad=False)
             + panel("대출", kv([("이용 중", "20,000 WLD", ""), ("이번 주 이자", "84 WLD", ""), ("상환 예정", "서버 D+131", "")]), "c4")
             + "</div>")
        m = '<h1>은행</h1>' + panel("기준금리", '<p class="figure n">3.25%</p>') + panel("예금 상품", lst([("자유 예금", "연 2.10%"), ("길드 정기예금", "연 3.80%"), ("모험가 적금", "연 4.40%")]), pad=False)
        return "bank", "은행", "예금 계약과 대출을 관리합니다.", "", d, m, True
    if key == "stocks":
        d = ('<div class="grid">'
             + panel("시장", '<div class="tabs"><a class="on" href="#">전체 10</a><a href="#">관심</a><a href="#">상승</a><a href="#">하락</a></div>' + table(["종목", "현재가", "등락", "거래량", ""], [(a, p, c, '<span class="n">12,40{0}</span>'.format(i), '<a class="link" href="#">주문</a>') for i, (a, p, c) in enumerate(stock_rows(6))], right=(1, 2, 3)), "c8", pad=False)
             + panel("오늘의 시장", kv([("상승", "5종목", "rise"), ("하락", "4종목", "fall"), ("보합", "1종목", ""), ("거래 정지", "0종목", "")]), "c4")
             + "</div>")
        m = '<h1>거래소</h1>' + panel("시장", table(["종목", "현재가", "등락"], stock_rows(6), right=(1, 2)), pad=False)
        return "market", "거래소", "가상 기업 종목의 시세와 체결입니다.", "", d, m, True
    if key == "stock-detail":
        d = ('<div class="grid">'
             + panel("시세", '<div style="display:flex;align-items:baseline;gap:12px;margin-bottom:8px"><b class="figure n" style="font-size:28px">132,310,036</b><span class="n fall">−5,322,000 (−3.87%)</span><span class="pill live">실시간</span></div><div class="tabs" style="padding:0;margin-bottom:8px"><a class="on" href="#">1일</a><a href="#">1주</a><a href="#">1개월</a><a href="#">1년</a></div>' + candles(), "c8")
             + panel("주문", '<div class="form"><div class="seg"><span class="on-buy">매수</span><span>매도</span></div><div class="field"><label>수량</label><div class="input"><span class="n">1</span><em>주</em></div></div><div class="field"><label>가격</label><div class="input"><span class="n">132,310,036</span><em>WLD</em></div></div>' + kv([("주문 금액", "132,310,036", ""), ("수수료", "132,310", "")]) + '<a class="btn buy block" href="#">매수 주문</a></div>', "c4")
             + "</div>")
        m = '<h1>치무전자</h1><p><b class="figure n">132,310,036</b> <span class="n fall">−3.87%</span></p>' + panel("차트", candles(360, 160)) + '<a class="btn buy block" href="#">매수 주문</a>'
        return "market", "치무전자", "CHIMU, 초대형 반도체와 가전", "", d, m, True
    if key == "quests":
        rows = [("시장 개장 출석", "매일", 100, "50"), ("거래소 3회 체결", "매일", 33, "150"), ("길드 정기예금 가입", "시즌", 0, "200"), ("광장에 공략 글 쓰기", "주간", 0, "80")]
        body = '<ul class="list">' + "".join(f'<li style="display:grid;grid-template-columns:1fr 160px 90px;gap:16px"><span><b>{E(t)}</b> <span class="pill">{E(c)}</span></span><span class="progress" style="--w:{p}%"><i></i></span><em class="n" style="text-align:right">{r} WLD</em></li>' for t, c, p, r in rows) + "</ul>"
        d = '<div class="grid">' + panel("진행 중인 퀘스트", body, "c8", pad=False) + panel("시즌 3", kv([("내 순위", "128위", ""), ("시즌 종료", "서버 D+150", ""), ("획득 칭호", "등불지기", "")]), "c4") + "</div>"
        m = '<h1>퀘스트</h1>' + panel("진행 중인 퀘스트", '<ul class="list">' + "".join(f'<li><span>{E(t)}</span><em class="n">{r} WLD</em></li>' for t, c, p, r in rows) + "</ul>", pad=False)
        return "quest", "퀘스트", "오늘 받을 수 있는 퀘스트와 보상입니다. 보상은 완료가 확인된 뒤 원장에 기록됩니다.", "", d, m, True
    if key == "shop":
        items = [("달빛 프레임", 3, "1,200"), ("등불 배지", 1, "700"), ("용의 비늘 테두리", 2, "1,850"), ("길드 깃발", 0, "400"), ("별의 조각", 1, "950"), ("새벽 망토", 3, "2,400")]
        grid = '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr))">' + "".join(f'<div style="padding:16px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);display:grid;gap:8px"><div style="height:88px;border-radius:6px;background:var(--inset);display:flex;align-items:center;justify-content:center"><span class="rar r{r}" style="width:28px;height:28px;margin:0;border-radius:6px"></span></div><b>{E(n)}</b><span class="muted" style="font-size:12px">{["일반","희귀","영웅","전설"][r]}</span><div style="display:flex;justify-content:space-between;align-items:center"><span class="n">{p} WLD</span><a class="btn secondary" href="#" style="height:32px">구매</a></div></div>' for n, r, p in items) + "</div>"
        d = '<div class="grid">' + panel("오늘의 진열대", grid, "c8", pad=False) + panel("최근 구매", lst([("레트로 픽셀", "1,200"), ("벚꽃 엔딩", "900")]), "c4", pad=False) + "</div>"
        m = '<h1>상점</h1>' + panel("오늘의 진열대", lst([(f"{n}, {p} WLD", ["일반","희귀","영웅","전설"][r]) for n, r, p in items[:5]]), pad=False)
        return "shop", "상점", "WLD로 프레임과 꾸미기 아이템을 구매합니다. 구매 대금은 소각됩니다.", "", d, m, True
    if key == "board":
        posts = [("[공략] 정기예금으로 레벨 빨리 올리기", "달빛기사", "24", "D+127"), ("치무전자 실적 발표 정리", "등불상인", "12", "D+127"), ("이번 시즌 칭호 모음", "별헤는밤", "31", "D+126"), ("신규 길드원 환영합니다", "운영진", "8", "D+126")]
        d = '<div class="grid">' + panel("광장", '<div class="tabs"><a class="on" href="#">전체</a><a href="#">공략</a><a href="#">질문</a><a href="#">자유</a></div>' + table(["제목", "작성자", "댓글", "작성"], [(E(t), E(a), f'<span class="n">{c}</span>', d_) for t, a, c, d_ in posts], right=(2,)), "c8", pad=False) + panel("인기 태그", '<div style="display:flex;flex-wrap:wrap;gap:8px">' + "".join(f'<span class="pill">{t}</span>' for t in ["정기예금", "치무전자", "시즌3", "칭호", "초보"]) + "</div>", "c4") + "</div>"
        m = '<h1>광장</h1>' + panel("최신 글", lst([(t, d_) for t, a, c, d_ in posts]), pad=False)
        return "board", "광장", "길드원 공략과 소식입니다.", '<a class="btn primary" href="#">글쓰기</a>', d, m, True
    if key == "support":
        chat = '<div class="chat"><p class="msg me">어제 산 프레임이 프로필에 안 보여요.<small>21:02</small></p><p class="msg">확인했어요. 적용 버튼을 한 번 더 눌러 주시면 반영됩니다.<small>운영진, 21:05</small></p><p class="msg me">됐어요, 감사합니다.<small>21:06</small></p></div><div style="padding:12px 16px;border-top:1px solid var(--line);display:flex;gap:8px"><div class="input" style="flex:1"><span class="muted">메시지 입력</span></div><a class="btn primary" href="#">보내기</a></div>'
        d = '<div class="grid">' + panel("내 문의", '<ul class="list"><li><span><b>프레임 적용 문의</b></span><span class="pill live">답변 완료</span></li><li><span>출석 보상 누락</span><span class="pill warn">답변 대기</span></li><li><span>닉네임 변경</span><span class="pill">처리 완료</span></li></ul>', "c4", pad=False) + panel("프레임 적용 문의", chat, "c8", pad=False) + "</div>"
        m = '<h1>문의</h1>' + panel("프레임 적용 문의", chat, pad=False)
        return "support", "문의", "운영진과 1:1로 대화합니다.", '<a class="btn primary" href="#">새 문의</a>', d, m, True
    if key == "admin":
        d = ('<div class="notice danger-zone"><b>GM 권한</b><span>모든 조치는 감사 로그에 남습니다. 화면 수치는 각 관리자 API의 실제 조회 결과입니다.</span></div><div class="grid">'
             + panel("관제 요약", '<div class="metrics"><div class="metric"><small>활성 회원</small><b class="figure n">23</b></div><div class="metric"><small>오늘 거래</small><b class="figure n">950</b></div><div class="metric"><small>원장 불일치</small><b class="figure n ok">0</b></div><div class="metric"><small>경고</small><b class="figure n rise">2</b></div></div>', "c12", pad=False)
             + panel("감사 로그", table(["시각", "운영자", "조치", "결과"], [("21:02", "superadmin", "GM 콘솔 진입", '<span class="pill">허용</span>'), ("20:47", "operator", "기능 스위치 변경", '<span class="pill live">승인</span>'), ("20:11", "system", "원장 대사", '<span class="pill live">일치</span>')]), "c8", "전체", pad=False)
             + panel("기능 스위치", kv([("카지노", "꺼짐", ""), ("주식 기업 행동", "꺼짐", ""), ("자동 경제 정책", "꺼짐", ""), ("상점", "켜짐", "ok")]), "c4")
             + "</div>")
        m = '<h1>GM 콘솔</h1>' + panel("관제 요약", kv([("활성 회원", "23", ""), ("원장 불일치", "0", "ok"), ("경고", "2", "rise")]))
        return "gm", "GM 콘솔", "운영자 전용 관제 화면입니다.", "", d, m, True
    if key == "calculator":
        form = '<div class="form"><div class="field"><label>원금</label><div class="input"><span class="n">1,000,000</span><em>WLD</em></div></div><div class="field"><label>연 이율</label><div class="input"><span class="n">4.4</span><em>%</em></div></div><div class="field"><label>기간</label><div class="input"><span class="n">10</span><em>년</em></div></div><a class="btn primary block" href="#">계산하기</a></div>'
        d = ('<div class="grid">' + panel("입력", form, "c4")
             + panel("결과", '<div class="metrics" style="border-bottom:1px solid var(--line)"><div class="metric"><small>최종 금액</small><b class="figure n">1,538,000</b></div><div class="metric"><small>총 이자</small><b class="figure n rise">+538,000</b></div><div class="metric"><small>연평균</small><b class="figure n">4.40%</b></div><div class="metric"><small>72의 법칙</small><b class="figure n">16.4년</b></div></div><div class="body">' + growth() + "</div>", "c8", pad=False)
             + '<div class="c12"><div class="ad"><span>광고 (Sponsored)</span><span>광고 영역: 본문 뒤</span></div></div></div>')
        m = '<h1>복리 계산기</h1>' + panel("입력", form) + panel("결과", kv([("최종 금액", "1,538,000", ""), ("총 이자", "+538,000", "rise")]))
        return "", "복리 계산기", "원금과 이율로 미래 금액을 계산합니다. 결과는 교육용이며 수익을 보장하지 않습니다.", "", d, m, False
    if key == "login":
        local = '<div class="form"><div class="field"><label>이메일 주소</label><div class="input"><span class="muted">name@example.com</span></div></div><div class="field"><label>비밀번호 <a class="link" href="#" style="float:right">비밀번호 찾기</a></label><div class="input"><span class="muted">비밀번호 입력</span></div></div><a class="btn primary block" href="#">로그인</a></div>'
        social = '<div class="form"><a class="btn secondary block" href="#">디스코드로 계속하기</a><a class="btn secondary block" href="#">구글로 계속하기</a><p class="muted" style="font-size:12px">계속하면 이용약관과 개인정보처리방침에 동의한 것으로 처리됩니다.</p></div>'
        d = '<div class="grid">' + panel("자체 계정", local, "c6") + panel("간편 로그인", social, "c6") + "</div>"
        m = '<h1>로그인</h1>' + panel("간편 로그인", social) + panel("자체 계정", local)
        return "account", "로그인", "디스코드, 구글 또는 자체 계정으로 들어옵니다.", "", d, m, False
    raise KeyError(key)


SCREENS = ["home-guest", "home-member", "wallet", "bank", "stocks", "stock-detail", "quests", "shop", "board", "support", "admin", "calculator", "login"]


def page(key: str) -> str:
    active, title, lead, actions, desk, mob, signed = screen(key)
    nav = ""
    for label, ic in NAV:
        if ic is None:
            nav += f'<p class="nav-group">{E(label)}</p>'
        else:
            nav += f'<a href="#" class="{"on" if ic == active else ""}">{icon(ic)}{E(label)}</a>'
    if active == "gm":  # administrators only; members never see the GM entry
        nav += f'<p class="nav-group">운영</p><a href="#" class="gm on">{icon("gm")}GM 콘솔</a>'
    who = f'<div class="who"><img src="{FAV}" alt=""><span>달빛기사</span><b class="n gold">128,400</b></div>' if signed else '<a class="btn primary" href="#" style="height:36px">로그인</a>'
    pwho = f'<div class="who"><img src="{FAV}" alt=""><b class="n gold">128,400</b></div>' if signed else '<a class="btn primary" href="#" style="height:32px;padding:0 12px">로그인</a>'
    strip = ('<div class="strip"><div><small>서버 시간, 현실 10분이 하루</small><b class="n">D+10182, 1455주 4일</b></div>'
             '<div><small>오늘 상승</small><b class="n rise">5종목</b></div><div><small>오늘 하락</small><b class="n fall">4종목</b></div>'
             f'<div><small>기준금리</small><b class="n">3.25%</b></div><div><small>내 WLD</small><b class="n {"gold" if signed else "muted"}">{"128,400" if signed else "로그인 필요"}</b></div></div>')
    pstrip = f'<div class="p-strip"><div><small>서버</small><b class="n">D+10182</b></div><div><small>상승/하락</small><b class="n"><span class="rise">5</span> / <span class="fall">4</span></b></div><div><small>내 WLD</small><b class="n {"gold" if signed else "muted"}">{"128,400" if signed else "없음"}</b></div></div>'
    dock = "".join(f'<a href="#" class="{"on" if ic == active else ""}">{icon(ic)}{E(lb)}</a>' for lb, ic in DOCK)
    lead_html = f"<p>{E(lead)}</p>" if lead else ""
    return f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>{E(title)} | 월덕 머니버스 G2 시안</title><meta name="description" content="{E(lead)}"><link rel="stylesheet" href="../style.css"></head>
<body><div class="canvas">
 <div class="desktop">
  <aside class="rail"><div class="brand"><img src="{FAV}" alt=""><b>월덕 머니버스</b></div><nav class="nav">{nav}</nav><div class="rail-foot"><span>시즌 3, 서버 D+10182</span><span>이용약관, 개인정보</span></div></aside>
  <div class="main">
   <div class="top"><div class="search">메뉴와 페이지 검색</div><div class="sp"></div><div class="lang">한국어</div>{who}</div>
   {strip}
   <div class="content"><div class="head"><div><h1>{E(title)}</h1>{lead_html}</div><div class="actions">{actions}</div></div>{desk}</div>
  </div>
 </div>
 <div class="phone">
  <div class="p-top"><img src="{FAV}" alt=""><b>{E(title)}</b>{pwho}</div>{pstrip}
  <div class="p-body">{mob}</div>
  <nav class="dock">{dock}</nav>
 </div>
 <footer class="stamp">G2 길드 원장 단말기 시안, {E(key)}. 표시 수치는 예시이며 실제 잔액이 아닙니다.</footer>
</div></body></html>"""


def main() -> None:
    (OUT / "pages").mkdir(parents=True, exist_ok=True)
    index = []
    for key in SCREENS:
        (OUT / "pages" / f"{key}.html").write_text(page(key), encoding="utf8")
        index.append({"name": key})
    (OUT / "index.json").write_text(json.dumps(index, ensure_ascii=False), encoding="utf8")
    print(len(index), "pages")


if __name__ == "__main__":
    main()
