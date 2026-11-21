"""Require complete non-skipped disposable PostgreSQL JUnit proof; never echo fixture output."""
import re
import sys
from pathlib import Path
import xml.etree.ElementTree as ET


def main():
    args = sys.argv[1:]
    if (len(args) != 5 or args[0] != "--class" or args[2] != "--minimum"
            or not re.fullmatch(r"com\.moneyverse\.[A-Za-z0-9_.]+", args[1])
            or not re.fullmatch(r"[1-9][0-9]*", args[3])):
        raise ValueError()
    minimum = int(args[3])
    path = Path(args[4])
    if minimum > 1_000_000 or path.stat().st_size > 8 * 1024 * 1024:
        raise ValueError()
    data = path.read_bytes()
    if re.search(br"<!DOCTYPE|<!ENTITY", data, re.IGNORECASE):
        raise ValueError()
    root = ET.fromstring(data)
    if root.tag != "testsuite" or root.get("name") != args[1]:
        raise ValueError()
    counts = {}
    for key in ("tests", "failures", "errors", "skipped"):
        raw = root.get(key, "")
        if not re.fullmatch(r"0|[1-9][0-9]*", raw):
            raise ValueError()
        counts[key] = int(raw)
    if (counts["tests"] < minimum or counts["failures"] or counts["errors"] or counts["skipped"]
            or len(root.findall("testcase")) != counts["tests"]
            or any(node.tag in {"failure", "error", "skipped", "testsuite"} for node in list(root.iter())[1:])):
        raise ValueError()
    print("Native PostgreSQL read evidence: tests=" + str(counts["tests"]) + " failures=0 errors=0 skipped=0")


if __name__ == "__main__":
    try:
        main()
    except Exception:
        print("Invalid native PostgreSQL evidence", file=sys.stderr)
        raise SystemExit(1) from None
