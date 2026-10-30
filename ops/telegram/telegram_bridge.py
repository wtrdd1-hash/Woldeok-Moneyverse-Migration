#!/usr/bin/env python3
"""Read-only Moneyverse operational Telegram alerts. Python standard library only."""
from __future__ import annotations

import argparse
import json
import os
import re
import secrets
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path
from urllib import error, parse, request
from zoneinfo import ZoneInfo

KST = ZoneInfo("Asia/Seoul")
STATE_DIR = Path("/var/lib/moneyverse-telegram")
TOKEN_PATTERN = re.compile(r"\b\d{6,12}:[A-Za-z0-9_-]{20,}\b")
CREDENTIAL_PATTERN = re.compile(
    r"(?i)\b(password|secret|token|api[_-]?key|authorization|cookie)\s*[:=]\s*[^\s,;]+"
)
CATEGORIES = ("system", "website", "database", "qa", "blog", "finance",
              "release", "github", "security", "admin", "ai", "other")
CRITICAL_SERVICES = ("moneyverse-backend.service", "moneyverse-frontend.service",
                     "moneyverse-discord-bot.service", "nginx.service", "docker.service")
TIMERS = ("moneyverse-qa.timer", "moneyverse-backup.timer",
          "moneyverse-verified-blog-v1419.timer", "moneyverse-telegram-market.timer")
ONESHOT = ("moneyverse-qa.service", "moneyverse-backup.service",
           "moneyverse-verified-blog-v1419.service")


def redact(value: str) -> str:
    value = TOKEN_PATTERN.sub("[REDACTED_TOKEN]", value)
    value = CREDENTIAL_PATTERN.sub(lambda m: m.group(1) + "=[REDACTED]", value)
    value = re.sub(r"[\x00-\x08\x0b-\x1f\x7f]", " ", value)
    return value[:3200]


def atomic_private(path: Path, contents: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    fd, temp = tempfile.mkstemp(prefix=".telegram-", dir=str(path.parent))
    try:
        with os.fdopen(fd, "w", encoding="utf8") as stream:
            stream.write(contents)
            stream.flush()
            os.fsync(stream.fileno())
        os.chmod(temp, 0o600)
        os.replace(temp, path)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)


def state_for(bridge: "Bridge") -> dict:
    try:
        state = json.loads(bridge.state.read_text(encoding="utf8"))
        return state if isinstance(state, dict) else {}
    except (OSError, ValueError):
        return {}


class TelegramApi:
    def __init__(self, token: str):
        if not TOKEN_PATTERN.fullmatch(token):
            raise ValueError("TELEGRAM_BOT_TOKEN is invalid or unset")
        self.url = "https://api.telegram.org/bot" + token + "/"

    def call(self, method: str, data: dict) -> dict:
        if method not in ("getUpdates", "sendMessage"):
            raise ValueError("unsupported Telegram operation")
        encoded = parse.urlencode(data).encode("utf8")
        req = request.Request(self.url + method, data=encoded, method="POST")
        try:
            with request.urlopen(req, timeout=12) as response:
                result = json.loads(response.read(2_000_000))
        except error.HTTPError as exc:
            raise RuntimeError("Telegram API HTTP " + str(exc.code)) from None
        except (error.URLError, TimeoutError, ValueError):
            raise RuntimeError("Telegram API unavailable or invalid response") from None
        if not isinstance(result, dict):
            raise RuntimeError("Telegram API returned invalid JSON shape")
        if result.get("ok") is not True:
            raise RuntimeError("Telegram API rejected the operation")
        return result


class Bridge:
    def __init__(self, api: TelegramApi | None, chat: Path, pair: Path, state: Path):
        self.api = api
        self.chat = chat
        self.pair = pair
        self.state = state

    def chat_id(self) -> int | None:
        try:
            value = self.chat.read_text(encoding="ascii").strip()
            number = int(value)
            return number if number > 0 else None
        except (OSError, ValueError):
            return None

    def send(self, message: str) -> None:
        chat_id = self.chat_id()
        if chat_id is None:
            raise RuntimeError("Telegram private chat not paired; send /start <pairing-code> first")
        if self.api is None:
            raise RuntimeError("Telegram API unavailable")
        result = self.api.call("sendMessage", {
            "chat_id": chat_id, "text": redact(message),
            "disable_web_page_preview": "true",
        })
        if not result.get("result", {}).get("message_id"):
            raise RuntimeError("Telegram send did not return a receipt")


def scan_pairing(bridge: Bridge) -> bool:
    """Only the first private /start <random-code> may bind this deployment."""
    if bridge.chat_id() is not None or not bridge.pair.exists():
        return False
    expected = bridge.pair.read_text(encoding="ascii").strip()
    state = state_for(bridge)
    offset = int(state.get("offset", 0))
    if bridge.api is None:
        raise RuntimeError("Telegram API unavailable")
    result = bridge.api.call("getUpdates", {
        "offset": offset, "timeout": 0, "limit": 50,
        "allowed_updates": json.dumps(["message"]),
    })
    paired = False
    for update in result.get("result", []):
        offset = max(offset, int(update["update_id"]) + 1)
        message = update.get("message", {})
        chat = message.get("chat", {})
        author = message.get("from", {})
        if (chat.get("type") != "private" or not isinstance(chat.get("id"), int)
                or chat["id"] <= 0 or author.get("id") != chat["id"]):
            continue
        if secrets.compare_digest(str(message.get("text", "")).strip(), "/start " + expected):
            atomic_private(bridge.chat, str(chat["id"]) + "\n")
            bridge.pair.unlink(missing_ok=True)
            paired = True
            break
    state["offset"] = offset
    atomic_private(bridge.state, json.dumps(state))
    if paired:
        bridge.send("✅ Moneyverse 텔레그램 알림 연결 완료\n"
                    "시스템·QA·자동 블로그·백업·배포·금융 점검 등 중요한 운영 상태를 전송합니다. "
                    "개인정보·토큰·원장 원문은 전송하지 않습니다.")
    return paired


def systemctl(unit: str) -> dict[str, str]:
    try:
        proc = subprocess.run(
            ["systemctl", "show", unit,
              "--property=ActiveState,Result,LoadState,SubState,NextElapseUSecMonotonic,NextElapseUSecRealtime",
             "--no-pager"],
            text=True, capture_output=True, timeout=5, check=False,
        )
        if proc.returncode:
            return {"ActiveState": "unknown", "Result": "unknown",
                    "LoadState": "unknown"}
        return dict(line.split("=", 1) for line in proc.stdout.splitlines() if "=" in line)
    except (OSError, subprocess.TimeoutExpired):
        return {"ActiveState": "unknown", "Result": "unknown",
                "LoadState": "unknown"}


def unit_snapshot() -> dict[str, tuple[str, str]]:
    results = {}
    for unit in CRITICAL_SERVICES:
        data = systemctl(unit)
        state = data.get("ActiveState", "unknown")
        results[unit] = ("OK" if state == "active" else "CRITICAL", state)
    for unit in TIMERS:
        data = systemctl(unit)
        state = data.get("ActiveState", "unknown")
        if unit == "moneyverse-telegram-market.timer" and state == "active":
            # systemd can report active/elapsed with no next trigger: a silent outage.
            mono = data.get("NextElapseUSecMonotonic", "")
            real = data.get("NextElapseUSecRealtime", "")
            phase = data.get("SubState", "")
            has_next = any(x and x != "infinity" for x in (mono, real))
            if phase != "waiting" or not has_next:
                results[unit] = ("CRITICAL", "unscheduled:" + phase)
                continue
        results[unit] = ("OK" if state == "active" else "WARNING", state)
    for unit in ONESHOT:
        data = systemctl(unit)
        result = data.get("Result", "unknown")
        results[unit] = ("OK" if result == "success" and data.get("LoadState", "loaded") != "not-found"
                         else "CRITICAL", result)
    for disk in ("/", "/srv/moneyverse-data"):
        try:
            usage = shutil.disk_usage(disk)
            percent = round(usage.used * 100 / usage.total)
            severity = "CRITICAL" if percent >= 95 else "WARNING" if percent >= 90 else "OK"
            results["disk:" + disk] = (severity, str(percent) + "%")
        except OSError:
            results["disk:" + disk] = ("WARNING", "unavailable")
    return results


def reconcile(bridge: Bridge, state: dict, snapshot: dict[str, tuple[str, str]],
              now_day: str) -> None:
    """Only send on transition; persist successful dispatches, retry failures."""
    previous = state.setdefault("last", {})
    for key, (level, value) in snapshot.items():
        current = {"level": level, "value": value}
        prior = previous.get(key)
        if prior == current:
            continue
        if level == "OK" and prior is None:
            previous[key] = current
            continue
        if level == "OK":
            message = "✅ [복구] " + key + " — " + value
        else:
            message = ("🚨" if level == "CRITICAL" else "⚠️") + " [" + level + "] " + key + " — " + value
        bridge.send("Moneyverse 운영 알림\n" + message + "\n기준일: " + now_day + " KST")
        previous[key] = current
        atomic_private(bridge.state, json.dumps(state, ensure_ascii=False))
    atomic_private(bridge.state, json.dumps(state, ensure_ascii=False))


def summary(snapshot: dict[str, tuple[str, str]]) -> str:
    flagged = [(k, s, v) for k, (s, v) in snapshot.items() if s != "OK"]
    if flagged:
        lines = [f"{level}: {redact(key)} = {redact(value)}" for key, level, value in flagged[:18]]
    else:
        lines = ["감시 대상 서비스·타이머·디스크에서 이상이 감지되지 않았습니다."]
    disk = [f"{key} {value}" for key, (_, value) in snapshot.items() if key.startswith("disk:")]
    return "📋 Moneyverse 운영 요약 (KST)\n" + "\n".join(lines + disk)


def main() -> int:
    p = argparse.ArgumentParser(description="Moneyverse Telegram event delivery and operations monitor")
    p.add_argument("action", choices=("check", "pair-code", "summary", "emit"))
    p.add_argument("--category", choices=CATEGORIES, default="other")
    p.add_argument("--severity", choices=("INFO", "WARNING", "CRITICAL"), default="INFO")
    p.add_argument("--message", help="Non-sensitive summary; --message-file is preferred for automation")
    p.add_argument("--message-file", type=Path)
    args = p.parse_args()

    # Pair-code generation never talks to Telegram and never needs a bot credential.
    api = None if args.action == "pair-code" else TelegramApi(os.environ.get("TELEGRAM_BOT_TOKEN", ""))
    bridge = Bridge(api, STATE_DIR / "chat_id", STATE_DIR / "pairing_code",
                    STATE_DIR / "state.json")
    if args.action == "pair-code":
        if bridge.chat_id() is not None:
            print("Already paired; no new pairing code will be generated.")
            return 0
        if not bridge.pair.exists():
            atomic_private(bridge.pair, secrets.token_urlsafe(18))
        print("Open https://t.me/woldeok_moneyverse_bot and send:\n/start " +
              bridge.pair.read_text(encoding="ascii").strip())
        return 0

    if args.action == "check":
        scan_pairing(bridge)
        if bridge.chat_id() is None:
            print("UNPAIRED: no messages delivered. Use pair-code and private /start.")
            return 0
        now = datetime.now(KST)
        snap = unit_snapshot()
        state = state_for(bridge)
        reconcile(bridge, state, snap, now_day=now.date().isoformat())
        state = state_for(bridge)
        if now.hour >= 9 and state.get("daily_summary") != now.date().isoformat():
            bridge.send(summary(snap))
            state["daily_summary"] = now.date().isoformat()
            atomic_private(bridge.state, json.dumps(state, ensure_ascii=False))
        print("CHECK_OK: transitions reconciled")
        return 0

    if args.action == "summary":
        bridge.send(summary(unit_snapshot()))
        print("SUMMARY_SENT")
        return 0

    message = args.message
    if args.message_file:
        message = args.message_file.read_text(encoding="utf8")
    if not message or not message.strip():
        p.error("emit requires --message or --message-file")
    bridge.send(f"Moneyverse [{args.category.upper()}] [{args.severity}]\n{message}")
    print("EVENT_SENT")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (RuntimeError, OSError, ValueError) as exc:
        print("FAILED: " + redact(str(exc)), file=sys.stderr)
        sys.exit(1)
