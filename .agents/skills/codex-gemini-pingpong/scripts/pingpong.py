#!/usr/bin/env python3
"""Bounded advisory Codex↔Gemini review. Does not apply code or deploy."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone

MAX_INPUT_BYTES = 24 * 1024
MAX_OUTPUT_CHARS = 12000
STATE_DIR = Path.home() / ".local" / "state" / "moneyverse-agent-pingpong"
PINNED_GEMINI = (
    Path.home() / ".local" / "share" / "moneyverse-agent-toolchain"
    / "gemini-cli-v0.70.0" / "node_modules" / ".bin" / "gemini"
)
SENSITIVE = re.compile(
    r"(?i)(-----BEGIN [A-Z ]*PRIVATE KEY-----|"
    r"\b(?:sk-[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9]{12,}|"
    r"AIza[A-Za-z0-9_-]{20,}|AKIA[A-Z0-9]{16})\b|"
    r"\bBearer\s+[A-Za-z0-9._-]{12,}|"
    r"\b(?:api[_-]?key|access[_-]?token|password|secret)\s*[:=]\s*[^\s]{8,})"
)


def cli_path(name: str) -> str | None:
    resolved = shutil.which(name)
    if resolved:
        return resolved
    if name == "gemini" and PINNED_GEMINI.is_file():
        return str(PINNED_GEMINI)
    return None


def sanitized_input(path: Path) -> str:
    if not path.is_file() or path.stat().st_size > MAX_INPUT_BYTES:
        raise ValueError("A regular UTF-8 briefing file <= 24 KiB is required.")
    text = path.read_text(encoding="utf-8")
    if not text.strip() or "\x00" in text:
        raise ValueError("Empty or binary briefing is not allowed.")
    if SENSITIVE.search(text):
        raise ValueError("Possible credential in briefing. Redact it before sending.")
    return text


def scrub_output(text: str) -> str:
    return SENSITIVE.sub("[REDACTED]", text[:MAX_OUTPUT_CHARS])


def call_agent(argv: list[str], prompt: str, scratch: Path, timeout: int) -> subprocess.CompletedProcess[str]:
    try:
        result = subprocess.run(
            argv, input=prompt, cwd=scratch, text=True, encoding="utf-8",
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError("Agent request timed out; no automatic retry.") from exc
    if result.returncode != 0:
        # stderr may contain sensitive credential or environment details.
        raise RuntimeError(f"Agent process failed (exit={result.returncode}); no raw stderr emitted.")
    return result


def ask_codex(executable: str, prompt: str, scratch: Path, timeout: int) -> str:
    reply = scratch / "codex-last-message.txt"
    call_agent(
        [executable, "exec", "--sandbox", "read-only", "--skip-git-repo-check",
         "--output-last-message", str(reply), "-"],
        prompt, scratch, timeout,
    )
    if not reply.is_file():
        raise RuntimeError("Codex did not write its final message.")
    answer = scrub_output(reply.read_text(encoding="utf-8"))
    if not answer.strip():
        raise RuntimeError("Codex returned an empty answer.")
    return answer


def ask_gemini(executable: str, prompt: str, scratch: Path, timeout: int) -> str:
    result = call_agent(
        [executable, "--approval-mode", "plan", "--output-format", "json", "--prompt", prompt],
        "", scratch, timeout,
    )
    try:
        obj = json.loads(result.stdout)
        answer = obj["response"]
    except (json.JSONDecodeError, KeyError, TypeError) as exc:
        raise RuntimeError("Gemini returned no valid JSON response.") from exc
    if not isinstance(answer, str) or not answer.strip():
        raise RuntimeError("Gemini returned an empty answer.")
    return scrub_output(answer)


def save_private(payload: dict) -> Path:
    STATE_DIR.mkdir(parents=True, exist_ok=True, mode=0o700)
    STATE_DIR.chmod(0o700)
    name = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ-") + secrets.token_hex(4) + ".json"
    dest = STATE_DIR / name
    fd = os.open(dest, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    return dest


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true", help="Check CLI files only; never authenticate or call models.")
    mode.add_argument("--run", action="store_true", help="Send a reviewed brief to both configured model CLIs.")
    parser.add_argument("--input", type=Path, help="Approved and sanitized UTF-8 brief.")
    parser.add_argument("--rounds", type=int, default=2, choices=(1, 2, 3))
    parser.add_argument("--timeout", type=int, default=120, help="Timeout per model call, seconds (30–180).")
    args = parser.parse_args()

    codex, gemini = cli_path("codex"), cli_path("gemini")
    if args.check:
        print(f"codex={'AVAILABLE' if codex else 'MISSING'}")
        print(f"gemini={'AVAILABLE' if gemini else 'MISSING'}")
        print("model_auth=NOT_TESTED; review_loop=NOT_RUN")
        return 0 if codex and gemini else 2
    if not 30 <= args.timeout <= 180:
        parser.error("--timeout must be between 30 and 180 seconds.")
    if not args.input or not codex or not gemini:
        parser.error("--run requires --input and both installed CLIs (authentication configured separately).")
    try:
        brief = sanitized_input(args.input)
        history: list[dict[str, str | int]] = []
        feedback = ""
        with tempfile.TemporaryDirectory(prefix="mv-pingpong-") as directory:
            scratch = Path(directory)
            for number in range(1, args.rounds + 1):
                codex_prompt = (
                    "You are an independent technical reviewer, not a code editor. "
                    "Do not access files, credentials, repositories, networks or tools. "
                    "Assess architecture, correctness, QA, security, and uncertainties. "
                    "Never claim tests ran. Reply in English with evidence gaps.\n\n"
                    f"Reviewed brief:\n{brief}\n\nPrior Gemini critique:\n{feedback or '(first round)'}"
                )
                proposal = ask_codex(codex, codex_prompt, scratch, args.timeout)
                gemini_prompt = (
                    "You are an independent peer reviewer, not a code editor. "
                    "Do not access files, credentials, repositories, networks or tools. "
                    "Challenge unsupported claims, concurrency risks, QA gaps and security hazards. "
                    "End with one exact line: VERDICT: ACCEPT or VERDICT: REVISE. "
                    "ACCEPT only if no significant review issue remains.\n\n"
                    f"Reviewed brief:\n{brief}\n\nCodex analysis:\n{proposal}"
                )
                feedback = ask_gemini(gemini, gemini_prompt, scratch, args.timeout)
                history.append({"round": number, "codex": proposal, "gemini": feedback})
                if re.search(r"(?m)^VERDICT:\s*ACCEPT\s*$", feedback):
                    break
        destination = save_private({
            "version": "v2026.11.22.1",
            "scope": "advisory_only_no_code_changes",
            "brief_sha256": hashlib.sha256(brief.encode("utf-8")).hexdigest(),
            "converged": bool(re.search(r"(?m)^VERDICT:\s*ACCEPT\s*$", feedback)),
            "history": history,
        })
        print(f"review_rounds={len(history)}")
        print("models_responded=YES; source_tests=NOT_RUN; production=NOT_TOUCHED")
        print(f"private_evidence={destination}")
        return 0
    except (OSError, UnicodeError, ValueError, RuntimeError) as exc:
        print(f"REVIEW_BLOCKED: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
