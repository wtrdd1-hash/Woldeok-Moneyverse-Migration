#!/usr/bin/env python3
"""Audited, bounded event-time 7/30-day log archive. Opt-in; never edits raw logs."""
from __future__ import annotations

import argparse
import base64
import contextlib
import datetime as dt
import fcntl
import gzip
import hashlib
import heapq
import hmac
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import time
from typing import Iterator

UTC = dt.timezone.utc
SOURCES = frozenset(("NGINX_ACCESS", "NGINX_ERROR", "SPRING_BACKEND", "FRONTEND", "LEGACY_BACKEND"))
CLASSES = ("routine", "important")
RETENTION_DAYS = {"routine": 7, "important": 30}
MAX_RECORD_CHARS = 2048
MAX_READ_BYTES = 8 * 1024 * 1024
MAX_QUERY_BYTES = 128 * 1024 * 1024
DEFAULT_ROOT = "/var/lib/moneyverse/log-archive"
DEFAULT_CONFIG = "/etc/moneyverse/log-archive-sources.json"
DEFAULT_SOURCES = {
    "NGINX_ACCESS": {"kind": "file", "path": "/var/log/nginx/access.log"},
    "NGINX_ERROR": {"kind": "file", "path": "/var/log/nginx/error.log"},
    "SPRING_BACKEND": {"kind": "journal", "unit": "moneyverse-spring-backend.service"},
    "FRONTEND": {"kind": "journal", "unit": "moneyverse-release-v1546-frontend.service"},
    "LEGACY_BACKEND": {"kind": "journal", "unit": "moneyverse-release-v1546-backend.service"},
}
NGINX_TS = re.compile(r"\[(\d\d/[A-Za-z]{3}/\d{4}:\d\d:\d\d:\d\d [+-]\d{4})\]")
NGINX_ERR_TS = re.compile(r"^(\d{4}/\d\d/\d\d \d\d:\d\d:\d\d)")
STATUS_RE = re.compile(r'"\s+(\d{3})\s')
SENSITIVE_FIELD = re.compile(
    r"(?i)\b(?:password|passwd|access_token|refresh_token|id_token|api[_-]?key|client_secret|secret|csrf[_-]?token|session[_-]?id|mv_session|otp(?:[_-]?code)?|authorization)\s*[=:]\s*['\"]?[^\s&;,}\"']+"
)
JSON_SENSITIVE = re.compile(r'(?i)(["\'](?:password|passwd|access_token|refresh_token|id_token|api[_-]?key|client_secret|secret|csrf[_-]?token|session[_-]?id|mv_session|token|otp)["\']\s*:\s*["\'])[^"\']+(["\'])')
URL_QUERY = re.compile(r"([?&][A-Za-z0-9_.~-]+=)[^&\s\"']+")
BEARER = re.compile(r"(?i)\bBearer\s+[A-Za-z0-9._~+/-]+")
AUTH_HEADER = re.compile(r"(?i)\b(?:Authorization|Proxy-Authorization|X-Api-Key|X-Auth-Token)\s*:\s*[^\r\n]+")
COOKIE = re.compile(r"(?i)\b(?:Cookie|Set-Cookie)\s*:\s*[^\r\n]+")
IPV4 = re.compile(r"(?<![\w.])(?:\d{1,3}\.){3}\d{1,3}(?![\w.])")
IPV6 = re.compile(r"(?i)(?<![\w:])(?:[0-9a-f]{1,4}:){2,7}[0-9a-f]{1,4}(?![\w:])")
EMAIL = re.compile(r"(?i)[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}")
UUID = re.compile(r"(?i)\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b")
SECURITY_EVENTS = re.compile(r"(?i)(?<!\w)(?:exception|error|fatal|critical|security|unauthori[sz]ed|authentication failure|otp failed|permission denied|privilege escalation|fraud|outage|admin log history|audit|panic)(?!\w)")


def parse_utc(value: str) -> dt.datetime:
    if not isinstance(value, str) or len(value) > 50:
        raise ValueError("invalid timestamp")
    try:
        d = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
        if d.tzinfo is None:
            raise ValueError("naive timestamp not permitted")
        return d.astimezone(UTC)
    except (TypeError, ValueError) as exc:
        raise ValueError("invalid UTC timestamp") from exc


def utc_now() -> dt.datetime:
    return dt.datetime.now(UTC)


def iso(value: dt.datetime) -> str:
    return value.astimezone(UTC).isoformat(timespec="microseconds").replace("+00:00", "Z")


def redact(raw: str) -> str:
    result = str(raw).replace("\r", " ").replace("\0", "").replace("\x1b", "?")
    result = result[:MAX_RECORD_CHARS]
    result = COOKIE.sub("[REDACTED-COOKIE]", result)
    result = AUTH_HEADER.sub("[REDACTED-AUTH]", result)
    result = BEARER.sub("Bearer [REDACTED]", result)
    result = JSON_SENSITIVE.sub(r"\1[REDACTED]\2", result)
    result = SENSITIVE_FIELD.sub("[REDACTED-FIELD]", result)
    result = URL_QUERY.sub(r"\1[REDACTED]", result)
    result = IPV4.sub("[REDACTED-IP]", result)
    result = IPV6.sub("[REDACTED-IP]", result)
    result = EMAIL.sub("[REDACTED-EMAIL]", result)
    result = UUID.sub("[REDACTED-UUID]", result)
    return result


def classify(source: str, severity: str, status: int | None, message: str) -> str:
    if source not in SOURCES:
        raise ValueError("source not allowed")
    if source == "NGINX_ERROR":
        return "important"
    if source == "NGINX_ACCESS":
        return "important" if status is not None and (status >= 500 or status == 429) else "routine"
    if status is not None and (status >= 500 or status == 429):
        return "important"
    if severity.upper() in {"ERROR", "CRITICAL", "ALERT", "EMERG", "FATAL"}:
        return "important"
    if SECURITY_EVENTS.search(message):
        return "important"
    return "routine"


def hour_bucket(when: dt.datetime) -> str:
    return when.strftime("%Y-%m-%dT%H")


def file_digest(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        while chunk := stream.read(256 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def replace_bytes_atomic(path: Path, data: bytes) -> None:
    path.parent.mkdir(mode=0o750, parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix=".log-stage-", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            os.fchmod(stream.fileno(), 0o640)
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


class Archive:
    def __init__(self, root: str | Path, create: bool = True):
        base = Path(root)
        if base.is_symlink():
            raise ValueError("symlink root forbidden")
        if create:
            base.mkdir(parents=True, mode=0o750, exist_ok=True)
        elif not base.is_dir():
            raise IOError("archive not initialized")
        self.root = base.resolve()
        self.cursor_key = self.root / ".cursor-key"
        self.lock_file = self.root / ".archive-lock"
        if create and not self.cursor_key.exists():
            fd = os.open(self.cursor_key, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            with os.fdopen(fd, "wb") as file:
                file.write(os.urandom(32))
        self.key = self.cursor_key.read_bytes()
        if len(self.key) < 32:
            raise ValueError("invalid archive cursor secret")

    @contextlib.contextmanager
    def locked(self, exclusive: bool):
        with self.lock_file.open("ab" if exclusive else "rb") as lock:
            fcntl.flock(lock, fcntl.LOCK_EX if exclusive else fcntl.LOCK_SH)
            try:
                yield
            finally:
                fcntl.flock(lock, fcntl.LOCK_UN)

    def filename(self, cls: str, source: str, when: dt.datetime) -> Path:
        if source not in SOURCES or cls not in CLASSES:
            raise ValueError("unknown archive source/class")
        return self.root / cls / source / (hour_bucket(when) + ".jsonl")

    def ingest(self, source: str, rows: list[dict], now: dt.datetime | None = None) -> int:
        if source not in SOURCES:
            raise ValueError("source not allowed")
        now = now or utc_now()
        batches: dict[Path, list[bytes]] = {}
        for row in rows:
            timestamp = parse_utc(row["timestamp"])
            if timestamp > now + dt.timedelta(minutes=5):
                raise ValueError("log timestamp in future")
            if (now - timestamp) > dt.timedelta(days=31):
                continue
            severity = str(row.get("severity", "INFO")).upper()[:12]
            message = redact(str(row.get("message", "")))
            status = row.get("status_code")
            if status is not None:
                status = int(status)
            cls = classify(source, severity, status, message)
            # A collector-derived stable ID supports reconnect and idempotent cursor pagination.
            ident = str(row.get("id", ""))[:128]
            if not ident:
                ident = hashlib.sha256((source + iso(timestamp) + message).encode()).hexdigest()[:32]
            entry = {
                "timestamp": iso(timestamp), "source": source, "class": cls,
                "severity": severity, "id": hashlib.sha256((source + ":" + ident).encode()).hexdigest()[:32],
                "message": message,
            }
            path = self.filename(cls, source, timestamp)
            batches.setdefault(path, []).append((json.dumps(entry, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8"))
        with self.locked(True):
            for path, batch in batches.items():
                path.parent.mkdir(parents=True, mode=0o750, exist_ok=True)
                fd = os.open(path, os.O_WRONLY | os.O_APPEND | os.O_CREAT | os.O_NOFOLLOW, 0o640)
                try:
                    with os.fdopen(fd, "ab") as stream:
                        for line in batch:
                            stream.write(line)
                        stream.flush()
                        os.fsync(stream.fileno())
                except Exception:
                    raise
        return sum(map(len, batches.values()))

    def _iter_segments(self, source: str, cls: str) -> Iterator[Path]:
        folder = self.root / cls / source
        if not folder.exists():
            return
        for path in sorted(folder.iterdir(), reverse=True):
            if path.name.endswith((".jsonl", ".jsonl.gz")) and re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}\.jsonl(?:\.gz)?", path.name):
                yield path

    def _read_segment(self, path: Path) -> Iterator[dict]:
        if path.is_symlink():
            raise IOError("symlinked archive segment rejected")
        if path.suffix == ".gz":
            checksum = path.with_name(path.name + ".sha256")
            if not checksum.is_file() or checksum.read_text(encoding="ascii").strip() != file_digest(path):
                raise IOError("compressed archive checksum mismatch")
            opener = gzip.open
        else:
            opener = open
        count = 0
        with opener(path, "rb") as stream:
            for line in stream:
                count += len(line)
                if count > MAX_QUERY_BYTES:
                    raise IOError("archive segment budget exceeded")
                if len(line) > 2 * MAX_RECORD_CHARS:
                    raise IOError("oversized archive record")
                try:
                    value = json.loads(line)
                except (ValueError, UnicodeError) as exc:
                    raise IOError("invalid archive record") from exc
                if not isinstance(value, dict) or not {"timestamp", "class", "source", "id", "message"} <= value.keys():
                    raise IOError("unexpected archive record")
                yield value

    def _save_segment(self, path: Path, rows: list[dict]) -> None:
        if not rows:
            path.unlink(missing_ok=True)
            path.with_name(path.name + ".sha256").unlink(missing_ok=True)
            return
        blob = "".join(json.dumps(r, ensure_ascii=False, separators=(",", ":")) + "\n" for r in rows).encode()
        if path.suffix == ".gz":
            compressed = gzip.compress(blob, compresslevel=6, mtime=0)
            replace_bytes_atomic(path, compressed)
            replace_bytes_atomic(path.with_name(path.name + ".sha256"), file_digest(path).encode() + b"\n")
        else:
            replace_bytes_atomic(path, blob)

    def maintain(self, now: dt.datetime | None = None) -> dict:
        now = now or utc_now()
        compressed, purged = 0, 0
        with self.locked(True):
            for cls in CLASSES:
                cutoff = now - dt.timedelta(days=RETENTION_DAYS[cls])
                for source in SOURCES:
                    for path in list(self._iter_segments(source, cls)):
                        rows = list(self._read_segment(path))
                        remaining = [row for row in rows if parse_utc(row["timestamp"]) >= cutoff]
                        purged += len(rows) - len(remaining)
                        if len(remaining) != len(rows):
                            self._save_segment(path, remaining)
                        if not remaining:
                            continue
                        if path.suffix != ".gz":
                            hour = parse_utc(path.stem + ":00:00Z")
                            if hour + dt.timedelta(hours=1) < now:
                                gzpath = path.with_name(path.name + ".gz")
                                if gzpath.exists():
                                    previous = list(self._read_segment(gzpath))
                                    known = {(r["timestamp"], r["id"]) for r in previous}
                                    remaining = previous + [r for r in remaining if (r["timestamp"], r["id"]) not in known]
                                self._save_segment(gzpath, remaining)
                                path.unlink()
                                compressed += 1
            return {"compressed": compressed, "expiredRecords": purged, "at": iso(now)}

    def _encode_cursor(self, data: dict) -> str:
        payload = json.dumps(data, separators=(",", ":"), sort_keys=True).encode()
        mac = hmac.new(self.key, payload, hashlib.sha256).digest()
        return base64.urlsafe_b64encode(payload + mac).decode().rstrip("=")

    def _decode_cursor(self, token: str) -> dict:
        if not isinstance(token, str) or len(token) > 1024:
            raise ValueError("invalid pagination cursor")
        try:
            raw = base64.urlsafe_b64decode(token + "=" * (-len(token) % 4))
            if base64.urlsafe_b64encode(raw).decode().rstrip("=") != token:
                raise ValueError("noncanonical pagination cursor")
            payload, mac = raw[:-32], raw[-32:]
            if not hmac.compare_digest(hmac.new(self.key, payload, hashlib.sha256).digest(), mac):
                raise ValueError("cursor authentication failed")
            value = json.loads(payload)
            if not isinstance(value, dict) or "last" not in value:
                raise ValueError("invalid cursor")
            return value
        except (ValueError, TypeError) as exc:
            raise ValueError("invalid pagination cursor") from exc

    def query(
        self, source: str, classification: str, start: dt.datetime, end: dt.datetime,
        needle: str, limit: int, cursor: str | None, now: dt.datetime | None = None
    ) -> dict:
        now = now or utc_now()
        if source not in SOURCES or classification not in ("routine", "important", "all"):
            raise ValueError("invalid log query")
        if not (1 <= limit <= 500) or len(needle) > 120 or any(ord(c) < 32 for c in needle):
            raise ValueError("invalid pagination bounds")
        if start.tzinfo is None or end.tzinfo is None or end < start or end > now + dt.timedelta(minutes=5):
            raise ValueError("invalid UTC interval")
        classes = CLASSES if classification == "all" else (classification,)
        normalized = (source, classification, iso(start), iso(end), needle.casefold())
        fingerprint = hashlib.sha256(json.dumps(normalized, ensure_ascii=False).encode()).hexdigest()
        last = None
        if cursor:
            payload = self._decode_cursor(cursor)
            if payload.get("scope") != fingerprint or payload.get("exp", 0) < int(now.timestamp()):
                raise ValueError("cursor scope changed or expired")
            last = tuple(payload["last"])
        heap: list[tuple[str, str, dict]] = []
        seen: set[tuple[str, str]] = set()
        bytes_read = 0
        with self.locked(False):
            for cls in classes:
                cutoff = now - dt.timedelta(days=RETENTION_DAYS[cls])
                effective_start = max(start, cutoff)
                for path in self._iter_segments(source, cls):
                    bucket = parse_utc(path.name[:13] + ":00:00Z")
                    if bucket > end or bucket + dt.timedelta(hours=1) < effective_start:
                        continue
                    for row in self._read_segment(path):
                        bytes_read += len(row["message"]) + 256
                        if bytes_read > MAX_QUERY_BYTES:
                            raise IOError("query scan budget exceeded")
                        timestamp = parse_utc(row["timestamp"])
                        key = (iso(timestamp), str(row["id"]))
                        if timestamp < effective_start or timestamp > end or (last is not None and key >= last):
                            continue
                        if row["class"] != cls or row["source"] != source:
                            raise IOError("archive source/class corruption")
                        if needle.casefold() not in str(row["message"]).casefold():
                            continue
                        if key in seen:
                            continue
                        seen.add(key)
                        pair = (key[0], key[1], row)
                        if len(heap) < limit + 1:
                            heapq.heappush(heap, pair)
                        elif pair[:2] > heap[0][:2]:
                            heapq.heapreplace(heap, pair)
        ordered = sorted(heap, key=lambda p: (p[0], p[1]), reverse=True)
        more = len(ordered) > limit
        rows = [p[2] for p in ordered[:limit]]
        new_cursor = None
        if more:
            last_row = ordered[limit - 1]
            new_cursor = self._encode_cursor({
                "scope": fingerprint, "last": [last_row[0], last_row[1]],
                "exp": int((now + dt.timedelta(minutes=15)).timestamp()),
            })
        return {"source": source, "classification": classification, "entries": rows,
                "totalCount": len(rows), "nextCursor": new_cursor,
                "status": "OK" if rows else "EMPTY", "timestamp": iso(now)}


def allowed_sources(config_path: str) -> dict:
    path = Path(config_path)
    if path.is_file():
        result = json.loads(path.read_text(encoding="utf-8"))
    elif config_path == DEFAULT_CONFIG:
        result = DEFAULT_SOURCES
    else:
        raise IOError("source config not found")
    if not isinstance(result, dict) or not set(result) <= SOURCES:
        raise ValueError("unrecognized log source configuration")
    for spec in result.values():
        if not isinstance(spec, dict):
            raise ValueError("invalid source specification")
        if spec.get("kind") == "file":
            if not str(spec.get("path", "")).startswith("/var/log/nginx/"):
                raise ValueError("file source must be a fixed Nginx log")
        elif spec.get("kind") == "journal":
            if not re.fullmatch(r"moneyverse-[a-zA-Z0-9_.@-]+\.service", str(spec.get("unit", ""))):
                raise ValueError("invalid systemd service")
        else:
            raise ValueError("unrecognized collector")
    return result


def collect_file(archive: Archive, source: str, spec: dict, state: dict, now: dt.datetime) -> int:
    path = Path(spec["path"])
    if path.is_symlink() or not path.is_file():
        raise IOError("nginx log source missing or unsafe")
    old = state.get(source, {})
    st = path.stat()
    files: list[tuple[Path, int, int]] = []
    if st.st_ino == old.get("inode"):
        files.append((path, int(old.get("offset", 0)), st.st_ino))
    else:
        previous = path.with_name(path.name + ".1")
        if old and previous.exists() and previous.stat().st_ino == old.get("inode"):
            files.append((previous, int(old.get("offset", 0)), previous.stat().st_ino))
        elif old:
            raise IOError("nginx file rolled beyond collection checkpoint")
        files.append((path, 0, st.st_ino))
    rows = []
    last_offset = 0
    for file, offset, inode in files:
        with file.open("rb") as stream:
            stream.seek(0, os.SEEK_END)
            size = stream.tell()
            if size < offset:
                raise IOError("nginx log truncated before collection")
            if size - offset > MAX_READ_BYTES:
                raise IOError("nginx collection backlog exceeds one-run budget")
            stream.seek(offset)
            content = stream.read(MAX_READ_BYTES)
            final_newline = content.rfind(b"\n")
            if final_newline < 0 and content:
                # No complete record; leave the cursor at its previous position.
                state[source] = {"inode": inode, "offset": offset}
                continue
            if final_newline >= 0:
                complete = content[:final_newline + 1]
                for index, line in enumerate(complete.splitlines()):
                    text = line.decode("utf-8", errors="replace")
                    if source == "NGINX_ACCESS":
                        match = NGINX_TS.search(text)
                        status = STATUS_RE.search(text)
                        if not match or not status:
                            raise IOError("invalid Nginx access timestamp/status")
                        when = dt.datetime.strptime(match.group(1), "%d/%b/%Y:%H:%M:%S %z").astimezone(UTC)
                        status_code = int(status.group(1))
                    else:
                        match = NGINX_ERR_TS.match(text)
                        if not match:
                            raise IOError("invalid Nginx error timestamp")
                        when = dt.datetime.strptime(match.group(1), "%Y/%m/%d %H:%M:%S").replace(tzinfo=dt.timezone(dt.timedelta(hours=9))).astimezone(UTC)
                        status_code = None
                    rows.append({"timestamp": iso(when), "message": text,
                                 "severity": "ERROR" if source == "NGINX_ERROR" else "INFO",
                                 "status_code": status_code,
                                 "id": "{}:{}:{}".format(inode, offset, index)})
                last_offset = offset + len(complete)
            else:
                last_offset = offset
        state[source] = {"inode": inode, "offset": last_offset}
    return archive.ingest(source, rows, now)


def collect_journal(archive: Archive, source: str, spec: dict, state: dict, now: dt.datetime) -> int:
    old = state.get(source, {})
    argv = ["journalctl", "--quiet", "--no-pager", "--output=json", "-u", spec["unit"]]
    if old.get("cursor"):
        argv.append("--after-cursor=" + old["cursor"])
    else:
        argv.append("--since=" + iso(now - dt.timedelta(minutes=30)))
    process = subprocess.run(argv, capture_output=True, timeout=12, check=False)
    if process.returncode != 0 or len(process.stdout) > MAX_READ_BYTES:
        raise IOError("systemd journal collection failure/budget")
    rows = []
    last_cursor = old.get("cursor")
    for line in process.stdout.splitlines():
        item = json.loads(line)
        timestamp = dt.datetime.fromtimestamp(int(item["__REALTIME_TIMESTAMP"]) / 1_000_000, UTC)
        priority = int(item.get("PRIORITY", 6))
        severity = "ERROR" if priority <= 3 else "WARN" if priority <= 4 else "INFO"
        cursor = item.get("__CURSOR")
        if not cursor:
            raise IOError("journald cursor missing")
        rows.append({"timestamp": iso(timestamp), "severity": severity, "message": str(item.get("MESSAGE", "")),
                     "id": cursor})
        last_cursor = cursor
    inserted = archive.ingest(source, rows, now)
    if last_cursor:
        state[source] = {"cursor": last_cursor}
    return inserted


def collect(archive: Archive, config: dict, now: dt.datetime) -> dict:
    state_path = archive.root / ".collector-state.json"
    state = json.loads(state_path.read_text(encoding="utf-8")) if state_path.is_file() else {}
    result = {"at": iso(now), "sources": {}, "status": "OK"}
    for source, spec in config.items():
        # A source's checkpoint is advanced only after all its redacted archive writes finish.
        saved = json.loads(json.dumps(state))
        try:
            count = (collect_file if spec["kind"] == "file" else collect_journal)(archive, source, spec, state, now)
            replace_bytes_atomic(state_path, json.dumps(state, separators=(",", ":")).encode())
            result["sources"][source] = {"status": "OK", "received": count}
        except (OSError, ValueError, KeyError, subprocess.TimeoutExpired) as exc:
            state = saved
            result["sources"][source] = {"status": "UNAVAILABLE", "detail": type(exc).__name__}
            result["status"] = "DEGRADED"
    quota = int(os.environ.get("MONEYVERSE_LOG_ARCHIVE_MAX_BYTES", "1073741824"))
    occupied = sum(p.stat().st_size for p in archive.root.rglob("*") if p.is_file())
    result["archiveBytes"] = occupied
    result["quotaBytes"] = quota
    result["usagePercent"] = round(occupied / max(1, quota) * 100, 2)
    if occupied >= quota * .9:
        result["status"] = "DEGRADED"  # Critical events are never purged early for capacity.
    replace_bytes_atomic(archive.root / ".collector-status.json", json.dumps(result).encode())
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=DEFAULT_ROOT)
    parser.add_argument("--config", default=DEFAULT_CONFIG)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("collect")
    sub.add_parser("maintain")
    sub.add_parser("status")
    query = sub.add_parser("query")
    query.add_argument("--source", required=True)
    query.add_argument("--classification", default="routine", choices=["routine", "important", "all"])
    query.add_argument("--from", dest="start", required=True)
    query.add_argument("--to", dest="end", required=True)
    query.add_argument("--filter", dest="needle", default="")
    query.add_argument("--limit", type=int, default=100)
    query.add_argument("--cursor")
    args = parser.parse_args()
    try:
        archive = Archive(args.root, create=args.command in ("collect", "maintain"))
        now = utc_now()
        if args.command == "collect":
            result = collect(archive, allowed_sources(args.config), now)
        elif args.command == "maintain":
            result = archive.maintain(now)
        elif args.command == "status":
            state_path = archive.root / ".collector-state.json"
            result = {"status": "OK" if state_path.is_file() else "UNAVAILABLE", "timestamp": iso(now)}
        else:
            status_file = archive.root / ".collector-status.json"
            if not status_file.is_file():
                raise IOError("collector has not reported readiness")
            status = json.loads(status_file.read_text(encoding="utf-8"))
            if (now - parse_utc(status["at"])) > dt.timedelta(minutes=5) or \
               status.get("sources", {}).get(args.source, {}).get("status") != "OK":
                raise IOError("collector source unavailable or stale")
            result = archive.query(args.source, args.classification, parse_utc(args.start),
                                   parse_utc(args.end), args.needle, args.limit, args.cursor, now)
        print(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
        return 0 if result.get("status") not in ("DEGRADED", "UNAVAILABLE") else 2
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
        print(json.dumps({"status": "UNAVAILABLE", "reason": type(exc).__name__}), file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
