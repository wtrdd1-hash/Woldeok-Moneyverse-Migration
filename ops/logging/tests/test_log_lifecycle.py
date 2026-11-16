import datetime as dt
import gzip
import json
import tempfile
import unittest
from pathlib import Path

from ops.logging.log_lifecycle import Archive, classify, redact, parse_utc, collect_file

UTC = dt.timezone.utc


def event(ts, ident, message="ok", severity="INFO", status=None):
    return {"timestamp": ts.isoformat(), "id": ident, "message": message, "severity": severity, "status_code": status}


class LifecycleTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = Path(self.tmp.name)
        self.arc = Archive(self.path)
        self.now = dt.datetime(2026, 11, 17, 0, 0, tzinfo=UTC)

    def test_source_classification_and_secret_removal(self):
        self.assertEqual(classify("NGINX_ACCESS", "INFO", 200, "GET /ok"), "routine")
        self.assertEqual(classify("NGINX_ACCESS", "INFO", 503, "GET /broken"), "important")
        self.assertEqual(classify("NGINX_ERROR", "INFO", None, "notice"), "important")
        self.assertEqual(classify("SPRING_BACKEND", "ERROR", None, "Exception"), "important")
        raw = "Authorization: Bearer really-secret Cookie: mv_session=abc user=jane@example.com ip=192.0.2.43 GET /?token=importantSecret"
        safe = redact(raw)
        for term in ("really-secret", "abc", "jane@example.com", "192.0.2.43", "importantSecret"):
            self.assertNotIn(term, safe)

    def test_7_and_30_day_event_time_expiry_and_compressed_history(self):
        current = self.now
        items = [
            event(current - dt.timedelta(days=7, minutes=1), "r-old"),
            event(current - dt.timedelta(days=7) + dt.timedelta(minutes=1), "r-new"),
            event(current - dt.timedelta(days=30, minutes=1), "i-old", "ERROR: failed", "ERROR"),
            event(current - dt.timedelta(days=30) + dt.timedelta(minutes=1), "i-new", "ERROR: failed", "ERROR"),
        ]
        self.arc.ingest("SPRING_BACKEND", items, current)
        self.arc.maintain(current)
        r = self.arc.query("SPRING_BACKEND", "routine", current - dt.timedelta(days=8), current, "", 50, None, current)
        i = self.arc.query("SPRING_BACKEND", "important", current - dt.timedelta(days=31), current, "", 50, None, current)
        self.assertEqual([x["timestamp"] for x in r["entries"]], [(current - dt.timedelta(days=7) + dt.timedelta(minutes=1)).isoformat(timespec="microseconds").replace("+00:00", "Z")])
        self.assertEqual(len(i["entries"]), 1)
        self.assertTrue(list(self.path.rglob("*.gz")))
        self.assertFalse(any("i-old" in p.read_text(errors="ignore") for p in self.path.rglob("*.jsonl")))

    def test_redaction_before_indexing_and_querying(self):
        self.arc.ingest("NGINX_ACCESS", [event(self.now, "e1", "GET /auth?token=TOP_SECRET from 192.0.2.10")], self.now)
        got = self.arc.query("NGINX_ACCESS", "routine", self.now - dt.timedelta(minutes=1), self.now, "TOP_SECRET", 100, None, self.now)
        self.assertEqual(got["entries"], [])
        data = self.arc.query("NGINX_ACCESS", "routine", self.now - dt.timedelta(minutes=1), self.now, "", 100, None, self.now)
        self.assertNotIn("TOP_SECRET", json.dumps(data))
        self.assertNotIn("192.0.2.10", json.dumps(data))

    def test_query_page_cursor_tampering_or_filter_change_denied(self):
        self.arc.ingest("FRONTEND", [event(self.now, str(x)) for x in range(5)], self.now)
        first = self.arc.query("FRONTEND", "routine", self.now - dt.timedelta(hours=1), self.now, "", 2, None, self.now)
        self.assertEqual(len(first["entries"]), 2)
        self.assertIsNotNone(first["nextCursor"])
        nxt = self.arc.query("FRONTEND", "routine", self.now - dt.timedelta(hours=1), self.now, "", 2, first["nextCursor"], self.now)
        self.assertEqual(len(nxt["entries"]), 2)
        with self.assertRaises(ValueError):
            self.arc.query("FRONTEND", "routine", self.now - dt.timedelta(hours=1), self.now, "other", 2, first["nextCursor"], self.now)
        with self.assertRaises(ValueError):
            self.arc.query("FRONTEND", "routine", self.now - dt.timedelta(hours=1), self.now, "", 2, first["nextCursor"][:-1]+"A", self.now)

    def test_checksum_tampering_is_unavailable_not_empty(self):
        self.arc.ingest("NGINX_ERROR", [event(self.now - dt.timedelta(days=1), "e1", "failed")], self.now)
        self.arc.maintain(self.now)
        path = next(self.path.rglob("*.gz"))
        path.write_bytes(path.read_bytes()+b"tamper")
        with self.assertRaises(IOError):
            self.arc.query("NGINX_ERROR", "important", self.now - dt.timedelta(days=2), self.now, "", 10, None, self.now)

    def test_unknown_source_and_oversized_page_fail_closed(self):
        with self.assertRaises(ValueError):
            self.arc.ingest("../../etc/passwd", [event(self.now, "x")], self.now)
        with self.assertRaises(ValueError):
            self.arc.query("FRONTEND", "all", self.now - dt.timedelta(days=31), self.now, "", 501, None, self.now)

    def test_nginx_ingest_with_inode_offset_and_rotation(self):
        path = self.path / "access.log"
        line = '198.51.100.8 - - [17/Nov/2026:09:00:00 +0900] "GET /private?token=SEC123 HTTP/1.1" 502 34\n'
        path.write_text(line)
        state = {}
        self.assertEqual(collect_file(self.arc, "NGINX_ACCESS", {"kind": "file", "path": str(path)}, state, self.now), 1)
        self.assertEqual(collect_file(self.arc, "NGINX_ACCESS", {"kind": "file", "path": str(path)}, state, self.now), 0)
        path.rename(self.path / "access.log.1")
        path.write_text('203.0.113.7 - - [17/Nov/2026:09:00:00 +0900] "GET /safe HTTP/1.1" 200 12\n')
        self.assertEqual(collect_file(self.arc, "NGINX_ACCESS", {"kind": "file", "path": str(path)}, state, self.now), 1)
        important = self.arc.query("NGINX_ACCESS", "important", self.now - dt.timedelta(minutes=1), self.now, "", 10, None, self.now)
        routine = self.arc.query("NGINX_ACCESS", "routine", self.now - dt.timedelta(minutes=1), self.now, "", 10, None, self.now)
        self.assertEqual(len(important["entries"]), 1)
        self.assertEqual(len(routine["entries"]), 1)
        self.assertNotIn("SEC123", json.dumps(important))
        self.assertNotIn("198.51.100.8", json.dumps(important))

    def test_malformed_nginx_record_does_not_advance_or_invent_timestamp(self):
        path = self.path / "access.log"
        path.write_text('not an nginx access line\n')
        state = {}
        with self.assertRaises(IOError):
            collect_file(self.arc, "NGINX_ACCESS", {"kind": "file", "path": str(path)}, state, self.now)
        self.assertNotIn("NGINX_ACCESS", state)

    def test_late_arrival_merges_with_previously_compressed_hour(self):
        earlier = self.now - dt.timedelta(days=1)
        self.arc.ingest("SPRING_BACKEND", [event(earlier, "older", "ERROR happened", "ERROR")], self.now)
        self.arc.maintain(self.now)
        self.arc.ingest("SPRING_BACKEND", [event(earlier + dt.timedelta(seconds=1), "late", "ERROR happened", "ERROR")], self.now)
        self.arc.maintain(self.now)
        history = self.arc.query("SPRING_BACKEND", "important", self.now - dt.timedelta(days=2), self.now, "", 20, None, self.now)
        self.assertEqual(len(history["entries"]), 2)
        self.assertEqual(len(list(self.path.rglob("*.gz"))), 1)

    def test_missing_archive_fail_closed_for_read_only_reader(self):
        with self.assertRaises(IOError):
            Archive(self.path / "does-not-exist", create=False)
        self.assertNotIn("SECRET_VALUE", redact('{"token":"SECRET_VALUE"}'))


if __name__ == "__main__":
    unittest.main()
