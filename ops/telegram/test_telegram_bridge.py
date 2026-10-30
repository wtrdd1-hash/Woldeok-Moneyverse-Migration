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
    def test_active_but_elapsed_market_timer_is_degraded(self, show):
        def fake(unit):
            if unit == "moneyverse-telegram-market.timer":
                return {"ActiveState":"active","Result":"success","LoadState":"loaded",
                        "SubState":"elapsed","NextElapseUSecMonotonic":"infinity"}
            return {"ActiveState":"active","Result":"success","LoadState":"loaded",
                    "SubState":"waiting","NextElapseUSecMonotonic":"2min"}
        show.side_effect=fake
        signals=unit_snapshot()
        self.assertEqual(signals["moneyverse-telegram-market.timer"][0],"CRITICAL")
        self.assertIn("unscheduled",signals["moneyverse-telegram-market.timer"][1])

    @patch("telegram_bridge.systemctl")
    def test_scheduled_market_timer_is_healthy(self, show):
        show.return_value={"ActiveState":"active","Result":"success","LoadState":"loaded",
                           "SubState":"waiting","NextElapseUSecMonotonic":"2min"}
        self.assertEqual(unit_snapshot()["moneyverse-telegram-market.timer"][0],"OK")

    @patch("telegram_bridge.systemctl")
    def test_running_market_dispatch_is_not_a_stalled_timer(self, show):
        def healthy(unit):
            if unit == "moneyverse-telegram-market.timer":
                return {"ActiveState":"active","Result":"success","LoadState":"loaded",
                        "SubState":"running","NextElapseUSecRealtime":"",
                        "NextElapseUSecMonotonic":"infinity"}
            return {"ActiveState":"active","Result":"success","LoadState":"loaded",
                    "SubState":"waiting","NextElapseUSecRealtime":"Fri 2026-10-30 09:24 KST"}
        show.side_effect=healthy
        self.assertEqual(unit_snapshot()["moneyverse-telegram-market.timer"][0],"OK")

    @patch("telegram_bridge.systemctl")
    def test_failed_market_worker_is_critical_even_when_timer_is_waiting(self, show):
        def worker_failed(unit):
            if unit == "moneyverse-telegram-market.service":
                return {"Result":"exit-code","ActiveState":"failed","LoadState":"loaded"}
            return {"ActiveState":"active","Result":"success","LoadState":"loaded",
                    "SubState":"waiting","NextElapseUSecRealtime":"Fri 2026-10-30 09:24 KST"}
        show.side_effect=worker_failed
        self.assertEqual(unit_snapshot()["moneyverse-telegram-market.service"][0],"CRITICAL")

    @patch("telegram_bridge.systemctl")
    def test_calendar_market_timer_uses_next_realtime_not_infinite_monotonic(self, show):
        show.return_value={"ActiveState":"active","Result":"success","LoadState":"loaded",
                           "SubState":"waiting","NextElapseUSecMonotonic":"infinity",
                           "NextElapseUSecRealtime":"Fri 2026-10-30 09:12:00 KST"}
        self.assertEqual(unit_snapshot()["moneyverse-telegram-market.timer"][0],"OK")

    @patch("telegram_bridge.shutil.disk_usage")
    @patch("telegram_bridge.systemctl")
    def test_disk_critical_when_only_three_percent_available(self, show, disk):
        from types import SimpleNamespace
        show.return_value={"ActiveState":"active","Result":"success","LoadState":"loaded",
                           "SubState":"waiting","NextElapseUSecRealtime":"Fri 2026-10-30 09:20 KST"}
        # Linux reserved blocks are not available to the service account.
        # used / total = 93% looks like WARNING but only 3% free is CRITICAL.
        disk.return_value=SimpleNamespace(total=100, used=93, free=3)
        current=unit_snapshot()
        self.assertEqual(current["disk:/"],("CRITICAL","97%"))
        self.assertEqual(current["disk:/srv/moneyverse-data"],("CRITICAL","97%"))

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
