#!/usr/bin/env python3
"""Read-only Moneyverse virtual-stock and critical error Telegram watcher."""
from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path
from zoneinfo import ZoneInfo

from telegram_bridge import Bridge, TelegramApi, STATE_DIR, atomic_private, redact

KST = ZoneInfo("Asia/Seoul")
STATE = STATE_DIR / "market-alerts.json"
DB_CONTAINER = os.environ.get("MONEYVERSE_MARKET_DB_CONTAINER", "woldeok-moneyverse-dev-db-1")
DB_NAME = os.environ.get("MONEYVERSE_MARKET_DB_NAME", "woldeok_moneyverse_dev")
WINDOW_PCT = Decimal("5")
DAY_PCT = Decimal("10")
COOLDOWN = 20 * 60
MAX_OBSERVATION_GAP = 10 * 60
MAX_MESSAGE_BATCH = 30
LOG_UNITS = ("moneyverse-backend.service", "moneyverse-frontend.service",
             "moneyverse-qa.service", "moneyverse-verified-blog-v1419.service",
             "nginx.service", "moneyverse-discord-bot.service")
# Explicit columns only; no account/ledger/member/private fields are ever selected.
SQL = """
BEGIN READ ONLY;
SET LOCAL statement_timeout='4000ms';
SELECT row_to_json(snapshot)::text FROM (
 SELECT
  (SELECT COALESCE(json_agg(row_to_json(s)),'[]'::json)
   FROM (SELECT symbol,name,current_price::text,day_open_price::text,active,halt_status
         FROM public.virtual_stocks ORDER BY symbol LIMIT 40)s) stocks,
  (SELECT COALESCE(json_agg(row_to_json(e)),'[]'::json)
   FROM (SELECT ev.id::text,ev.created_at::text,LEFT(ev.headline,120) headline,
                ev.source,ev.direction,ev.strength,COALESCE(s.symbol,'MARKET') symbol
         FROM public.virtual_stock_market_events ev LEFT JOIN public.virtual_stocks s
           ON s.id=ev.stock_id ORDER BY ev.created_at DESC,ev.id DESC LIMIT 100)e) events,
  (SELECT COALESCE(json_agg(row_to_json(b)),'[]'::json)
   FROM (SELECT batch.id::text,batch.created_at::text,
                COUNT(scenario.id)::int scenario_count,
                LEFT(COALESCE(string_agg(LEFT(scenario.headline,80),' / '
                  ORDER BY scenario.ordinal),''),260) headlines
         FROM public.ai_news_batches batch LEFT JOIN public.ai_news_scenarios scenario
           ON scenario.batch_id=batch.id GROUP BY batch.id,batch.created_at
         ORDER BY batch.created_at DESC,batch.id DESC LIMIT 100)b) batches
) snapshot;
COMMIT;
"""

def read_market() -> dict:
    if not re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9_.-]{0,80}", DB_CONTAINER):
        raise RuntimeError("invalid database container configuration")
    if not re.fullmatch(r"[a-zA-Z0-9_]{1,64}", DB_NAME):
        raise RuntimeError("invalid database name configuration")
    cmd = ["docker", "exec", "-u", "postgres", DB_CONTAINER,
           "psql", "-X", "-At", "-v", "ON_ERROR_STOP=1", "-d", DB_NAME, "-c", SQL]
    try:
        result = subprocess.run(cmd, text=True, capture_output=True, timeout=14)
    except (OSError, subprocess.TimeoutExpired):
        raise RuntimeError("market database read unavailable") from None
    if result.returncode:
        raise RuntimeError("market database read rejected") from None
    lines = [x for x in result.stdout.splitlines() if x.startswith("{") and x.endswith("}")]
    if len(lines) != 1:
        raise RuntimeError("market database response invalid")
    try:
        data = json.loads(lines[0])
    except ValueError:
        raise RuntimeError("market database response malformed") from None
    if not isinstance(data, dict) or any(not isinstance(data.get(k),list) for k in ("stocks","events","batches")):
        raise RuntimeError("market database collections missing")
    return data

def pct(current: str, previous: str) -> Decimal | None:
    try:
        a,b = Decimal(current),Decimal(previous)
        return ((a-b)*100/b) if a.is_finite() and b.is_finite() and a>0 and b>0 else None
    except (ValueError, InvalidOperation, ZeroDivisionError, TypeError):
        return None

def journal_errors() -> list[dict]:
    cmd = ["journalctl", "--since=-7min", "--priority=0..3",
           "--output=json", "--no-pager", "-n", "200"]
    for unit in LOG_UNITS:
        cmd += ["--unit",unit]
    try:
        result = subprocess.run(cmd, text=True, capture_output=True, timeout=9)
        if result.returncode: return []
        entries = []
        for line in result.stdout.splitlines():
            try: item=json.loads(line)
            except ValueError: continue
            if item.get("_SYSTEMD_UNIT") in LOG_UNITS and isinstance(item.get("__CURSOR"),str):
                entries.append({"unit":item["_SYSTEMD_UNIT"],"cursor":item["__CURSOR"][:400]})
        return entries
    except (OSError,subprocess.TimeoutExpired):
        return []

def propose(previous: dict, market: dict, errors: list[dict], now: datetime) -> tuple[dict,list[tuple[str,str]]]:
    """Returns new checkpoint and (stable event-id, notification) pairs."""
    day=now.astimezone(KST).date().isoformat()
    state=dict(previous)
    messages=[]
    last_seen = previous.get("observed_at")
    gap_seconds = None
    if isinstance(last_seen, str):
        try:
            then = datetime.fromisoformat(last_seen)
            if then.tzinfo is not None:
                gap_seconds = (now - then).total_seconds()
        except ValueError:
            pass
    stale = bool(previous.get("prices")) and (
        gap_seconds is None or gap_seconds > MAX_OBSERVATION_GAP
    )
    if stale:
        duration = (
            f"{gap_seconds / 3600:.1f}시간" if gap_seconds is not None
            else "이전 관측 시간 미기록"
        )
        messages.append((
            "monitor-gap:" + str(last_seen) + ":" + day,
            "⚠️ [주식시장 감시 중단·복구]\n"
            + f"이전 관측과의 간격: {duration}\n"
            + "감시 중단 중 일부 뉴스·오류가 누락될 수 있습니다. "
              "오래된 가격은 2분 급변으로 계산하지 않습니다."
        ))
    state["observed_at"] = now.isoformat()
    for field,title in (("batches","📰 [AI 주식 뉴스 생성]"),("events","📣 [주식 뉴스 시장 반영]")):
        entries=market[field]
        old_ids=set(previous.get(field,[])) if field in previous else None
        if old_ids is not None:
            for row in reversed(entries):
                uid=str(row.get("id",""))
                if not uid or uid in old_ids: continue
                if field=="batches":
                    body=(f"생성된 시나리오: {row.get('scenario_count',0)}건\n"
                          f"제목: {redact(str(row.get('headlines',''))[:240])}\n"
                          "상태: 초안 생성 (발행되지 않음)")
                else:
                    body=(f"종목: {redact(str(row.get('symbol','MARKET'))[:35])}\n"
                          f"제목: {redact(str(row.get('headline',''))[:120])}\n"
                          f"방향: {row.get('direction','?')} / 강도: {row.get('strength','?')}\n"
                          f"출처: {row.get('source','?')}\n상태: 시장 반영")
                messages.append((field+":"+uid,title+"\n"+body))
        state[field]=[str(x["id"]) for x in entries if x.get("id")][:100]
    previous_prices=previous.get("prices",{})
    previous_halts=previous.get("halts",{})
    state["prices"]={}
    state["halts"]={}
    seen_days={k:v for k,v in previous.get("daily_flags",{}).items() if v==day}
    cooldowns=dict(previous.get("cooldowns",{}))
    digest=[]
    for row in market["stocks"]:
        symbol=str(row.get("symbol",""))[:40]
        if not symbol:continue
        price=str(row.get("current_price",""))
        state["prices"][symbol]=price
        halt=str(row.get("halt_status","ACTIVE"))
        state["halts"][symbol]=halt
        if symbol in previous_halts and previous_halts[symbol]!=halt:
            messages.append(("halt:"+symbol+":"+halt,
                ("🚨 [주식 거래정지]" if halt!="ACTIVE" else "✅ [거래정지 해제]")
                +" "+redact(symbol)+" / "+redact(halt)))
        movement=pct(price,previous_prices.get(symbol,""))
        daily=pct(price,str(row.get("day_open_price","")))
        if daily is not None:
            digest.append(f"{redact(symbol)}: {price} WLD ({daily:+.2f}%)")
        if symbol not in previous_prices: continue
        cooldown=float(cooldowns.get(symbol,0) or 0)
        short=(not stale and movement is not None and abs(movement)>=WINDOW_PCT
               and now.timestamp()-cooldown>=COOLDOWN)
        day_signal=(daily is not None and abs(daily)>=DAY_PCT and seen_days.get(symbol)!=day)
        if short or day_signal:
            change=movement if short else daily
            # event time is based on the last successfully recorded price snapshot
            key=f"price:{symbol}:{price}:{previous_prices[symbol]}:{day}"
            messages.append((key,
                f"📈 [주가 급변] {redact(symbol)} / {redact(str(row.get('name',''))[:45])}\n"
                f"현재 {price} WLD / {'직전 감시' if short else '당일 시가'} 대비 {change:+.2f}%\n"
                f"당일 시가 대비 {daily:+.2f}%" if daily is not None else f"현재 {price} WLD"))
            cooldowns[symbol]=now.timestamp()
            if day_signal:seen_days[symbol]=day
    state["cooldowns"]=cooldowns
    state["daily_flags"]=seen_days
    # Send at 09:00–11:59 KST with a recovery grace window. Never send a
    # synthetic daily recap on a brand-new baseline or late in the evening.
    if (previous.get("prices") and 9 <= now.astimezone(KST).hour < 12
            and previous.get("digest_day") != day):
        messages.append(("digest:"+day,"📊 [머니버스 가상 주식시장 일일 요약]\n"
                         +"\n".join(digest[:25])+"\n가격 단위: 가상경제 WLD"))
        state["digest_day"]=day
    # Error journals are aggregated by unit, never forwarded verbatim.
    old_journals=set(previous.get("journal",[])) if "journal" in previous else None
    if old_journals is not None:
        counters={}
        for row in errors:
            if row.get("cursor") not in old_journals and row.get("unit") in LOG_UNITS:
                counters[row["unit"]]=counters.get(row["unit"],0)+1
        if counters:
            digest_key=hashlib.sha256("|".join(sorted(
                str(row.get("cursor","")) for row in errors if row.get("cursor") not in old_journals)).encode()).hexdigest()
            messages.append(("errors:"+digest_key,"🚨 [중요 서버 오류 로그 요약]\n"+
                            "\n".join(f"{k}: {v}건" for k,v in sorted(counters.items()))+
                            "\n민감정보 보호를 위해 원문 미전송"))
    state["journal"]=[row["cursor"] for row in errors if row.get("cursor")][-200:]
    if len(messages)>MAX_MESSAGE_BATCH:
        # Summarize overflow rather than silently losing its existence. This is
        # an explicit evidence record; every prior cursor is consumed only after
        # Telegram acknowledges this summary.
        remaining=messages[MAX_MESSAGE_BATCH-1:]
        checksum=hashlib.sha256("|".join(key for key,_ in remaining).encode()).hexdigest()
        messages=messages[:MAX_MESSAGE_BATCH-1]+[
            ("overflow:"+checksum,
             f"⚠️ [알림 대량 발생] 추가 중요 이벤트 {len(remaining)}건 감지. "
             "개별 내용은 운영 시스템 기록에서 확인하세요.")]
    return state,messages

def run(bot: Bridge, *, market: dict | None=None, errors: list[dict] | None=None,
        now: datetime | None=None, state_path: Path=STATE) -> int:
    if bot.chat_id() is None:
        print("MARKET_UNPAIRED: no recipient, no messages")
        return 0
    info=market if market is not None else read_market()
    entries=errors if errors is not None else journal_errors()
    now=now or datetime.now(KST)
    try:
        prior=json.loads(state_path.read_text())
        if not isinstance(prior,dict):prior={}
    except (OSError,ValueError):
        prior={}
    checkpoint,messages=propose(prior,info,entries,now)
    sent=set(prior.get("delivered",[]))
    # Receipt checkpoint after each successful send. In the event of a subsequent
    # failure, the previously sent messages will not repeat.
    for key,text in messages:
        fingerprint=hashlib.sha256(key.encode()).hexdigest()
        if fingerprint in sent:continue
        bot.send(text)
        sent.add(fingerprint)
        partial=dict(prior)
        partial["delivered"]=sorted(sent)[-500:]
        atomic_private(state_path,json.dumps(partial,ensure_ascii=False))
        prior=partial
    checkpoint["delivered"]=sorted(sent)[-500:]
    atomic_private(state_path,json.dumps(checkpoint,ensure_ascii=False))
    print(f"MARKET_OK: candidate_messages={len(messages)}")
    return 0

if __name__=="__main__":
    try:
        bot=Bridge(TelegramApi(os.environ.get("TELEGRAM_BOT_TOKEN","")),
                   STATE_DIR/"chat_id",STATE_DIR/"pairing_code",STATE_DIR/"state.json")
        sys.exit(run(bot))
    except (RuntimeError,OSError,ValueError) as exc:
        print("MARKET_FAILED: "+redact(str(exc)),file=sys.stderr)
        sys.exit(1)
