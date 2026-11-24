"""Offline synthetic tests for the bounded two-agent advisory runner."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

RUNNER = Path(__file__).resolve().parents[1] / "pingpong.py"

CODEX_MOCK = """#!/usr/bin/env python3
import os, pathlib, sys
args = sys.argv
if '--sandbox' not in args or args[args.index('--sandbox') + 1] != 'read-only':
    raise SystemExit(71)
out = pathlib.Path(args[args.index('--output-last-message') + 1])
out.write_text('Codex proposal: validate contracts and independent QA.\\n', encoding='utf-8')
with open(os.environ['CALLS_FILE'], 'a', encoding='utf-8') as f:
    f.write('codex\\n')
"""
GEMINI_MOCK = """#!/usr/bin/env python3
import json, os, sys
if '--approval-mode' not in sys.argv or sys.argv[sys.argv.index('--approval-mode') + 1] != 'plan':
    raise SystemExit(72)
with open(os.environ['CALLS_FILE'], 'a', encoding='utf-8') as f:
    f.write('gemini\\n')
with open(os.environ['CALLS_FILE'], encoding='utf-8') as f:
    count = sum(line.strip() == 'gemini' for line in f)
verdict = 'REVISE' if os.environ.get('MOCK_REVISE') == '1' and count == 1 else 'ACCEPT'
print(json.dumps({'response': 'Independent critique: check Test and Production evidence.\\nVERDICT: ' + verdict}))
"""


class PingPongTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="pingpong-test-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.home = self.root / "home"
        self.home.mkdir()
        self.bin = self.root / "bin"
        self.bin.mkdir()
        self.calls = self.root / "calls.txt"
        self.write_mock("codex", CODEX_MOCK)
        self.write_mock("gemini", GEMINI_MOCK)
        self.brief = self.root / "approved.txt"
        self.brief.write_text("Synthetic architecture review; no customer or operational information.\n", encoding="utf-8")
        self.env = dict(os.environ)
        self.env.update(
            HOME=str(self.home), PATH=str(self.bin) + os.pathsep + os.environ.get("PATH", ""),
            CALLS_FILE=str(self.calls),
        )

    def write_mock(self, name, source):
        path = self.bin / name
        path.write_text(source, encoding="utf-8")
        path.chmod(0o700)

    def run_cmd(self, *args):
        return subprocess.run(
            [sys.executable, str(RUNNER), *args],
            env=self.env, cwd=self.root, text=True,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=15,
        )

    def results(self):
        path = self.home / ".local/state/moneyverse-agent-pingpong"
        return list(path.glob("*.json")) if path.exists() else []

    def test_preflight_never_calls_models(self):
        completed = self.run_cmd("--check")
        self.assertEqual(completed.returncode, 0, completed.stderr)
        self.assertIn("model_auth=NOT_TESTED", completed.stdout)
        self.assertFalse(self.calls.exists())
        self.assertEqual(self.results(), [])

    def test_accept_stops_after_one_exchange_and_writes_private_evidence(self):
        completed = self.run_cmd("--run", "--input", str(self.brief), "--rounds", "3")
        self.assertEqual(completed.returncode, 0, completed.stderr)
        self.assertIn("review_rounds=1", completed.stdout)
        self.assertEqual(self.calls.read_text(encoding="utf-8").splitlines(), ["codex", "gemini"])
        evidence, = self.results()
        payload = json.loads(evidence.read_text(encoding="utf-8"))
        self.assertTrue(payload["converged"])
        self.assertEqual(payload["scope"], "advisory_only_no_code_changes")
        self.assertNotIn("Synthetic architecture review", evidence.read_text(encoding="utf-8"))
        self.assertEqual(evidence.stat().st_mode & 0o777, 0o600)
        self.assertEqual(evidence.parent.stat().st_mode & 0o777, 0o700)

    def test_revise_uses_second_round_and_stops_at_bound(self):
        self.env["MOCK_REVISE"] = "1"
        completed = self.run_cmd("--run", "--input", str(self.brief), "--rounds", "2")
        self.assertEqual(completed.returncode, 0, completed.stderr)
        self.assertIn("review_rounds=2", completed.stdout)
        self.assertEqual(len(self.calls.read_text().splitlines()), 4)

    def test_credential_blocks_before_any_model_call(self):
        self.brief.write_text("password=verySecretPassword123", encoding="utf-8")
        completed = self.run_cmd("--run", "--input", str(self.brief))
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("Possible credential", completed.stderr)
        self.assertFalse(self.calls.exists())
        self.assertEqual(self.results(), [])

    def test_empty_file_blocks_before_model_call(self):
        self.brief.write_text("", encoding="utf-8")
        completed = self.run_cmd("--run", "--input", str(self.brief))
        self.assertNotEqual(completed.returncode, 0)
        self.assertFalse(self.calls.exists())

    def test_bad_round_count_is_rejected(self):
        completed = self.run_cmd("--run", "--input", str(self.brief), "--rounds", "9")
        self.assertNotEqual(completed.returncode, 0)
        self.assertFalse(self.calls.exists())


if __name__ == "__main__":
    unittest.main()
