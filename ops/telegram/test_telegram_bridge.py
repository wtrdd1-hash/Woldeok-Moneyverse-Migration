import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from telegram_bridge import Bridge, redact, state_for, scan_pairing, reconcile, unit_snapshot


class FakeApi:
    def __init__(self, updates=None, fail=False):
        self.updates = updates or []
        self.sent = []
        self.fail = fail

    def call(self, method, data):
        if method == "getUpdates":
            return {"ok": True, "result": self.updates}
        if method == "sendMessage":
            if self.fail:
                raise RuntimeError("simulated network outage")
            self.sent.append(data)
            return {"ok": True, "result": {"message_id": len(self.sent)}}
        raise AssertionError(method)


class BridgeTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.chat = self.root / "chat_id"
        self.pair = self.root / "pairing_code"
        self.state = self.root / "state.json"
        self.api = FakeApi()
        self.bridge = Bridge(self.api, self.chat, self.pair, self.state)

    def test_redaction(self):
        raw = "token=abcdef password: very_secret 123456789:ABCDEFGHIJKLMNOPQRSTUVXYZ"
        clean = redact(raw)
        self.assertNotIn("very_secret", clean)
        self.assertNotIn("ABCDEFGHIJKLMNOPQRSTUVXYZ", clean)

    def test_pair_private_chat_only_and_confirmation(self):
        self.pair.write_text("pair-Aa9")
        self.api.updates = [
            {"update_id": 1, "message": {"chat": {"id": -12, "type": "group"},
                                           "from": {"id": 3}, "text": "/start pair-Aa9"}},
            {"update_id": 2, "message": {"chat": {"id": 99, "type": "private"},
                                           "from": {"id": 99}, "text": "/start wrong"}},
            {"update_id": 3, "message": {"chat": {"id": 77, "type": "private"},
                                           "from": {"id": 77}, "text": "/start pair-Aa9"}},
        ]
        self.assertTrue(scan_pairing(self.bridge))
        self.assertEqual(self.chat.read_text().strip(), "77")
        self.assertFalse(self.pair.exists())
        self.assertEqual(len(self.api.sent), 1)
        self.assertFalse(scan_pairing(self.bridge))

    def test_failing_send_does_not_mark_healthy(self):
        self.chat.write_text("777")
        state = state_for(self.bridge)
        api = FakeApi(fail=True)
        self.bridge.api = api
        with self.assertRaises(RuntimeError):
            reconcile(self.bridge, state, {"backend": ("CRITICAL", "inactive")}, now_day="2026-10-29")
        self.assertFalse(self.state.exists())

    def test_transition_dedup_and_recovery(self):
        self.chat.write_text("777")
        snapshot = {"qa": ("CRITICAL", "failed")}
        reconcile(self.bridge, state_for(self.bridge), snapshot, now_day="2026-10-29")
        self.assertEqual(len(self.api.sent), 1)
        reconcile(self.bridge, state_for(self.bridge), snapshot, now_day="2026-10-29")
        self.assertEqual(len(self.api.sent), 1)
        reconcile(self.bridge, state_for(self.bridge), {"qa": ("OK", "success")}, now_day="2026-10-29")
        self.assertEqual(len(self.api.sent), 2)
        self.assertIn("복구", self.api.sent[-1]["text"])

    @patch("telegram_bridge.systemctl")
    def test_snapshot_flags_qa_failure_and_blog_timer_disabled(self, show):
        show.side_effect = lambda unit: {
            "moneyverse-qa.service": {"ActiveState": "failed", "Result": "exit-code"},
            "moneyverse-verified-blog-v1419.timer": {"ActiveState": "inactive", "Result": "success"},
        }.get(unit, {"ActiveState": "active", "Result": "success"})
        data = unit_snapshot()
        self.assertEqual(data["moneyverse-qa.service"][0], "CRITICAL")
        self.assertEqual(data["moneyverse-verified-blog-v1419.timer"][0], "WARNING")


if __name__ == "__main__":
    unittest.main()
