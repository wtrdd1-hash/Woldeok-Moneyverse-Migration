#!/usr/bin/env python3
"""Fail closed on a PostgreSQL ACL snapshot; never connects or mutates a database."""

import json
import sys


FIELDS = (
    "database",
    "app_role_exists",
    "required_tables_missing",
    "bank_overload_count",
    "protected_direct_dml",
    "default_app_grants",
    "public_bank_overloads",
)


def parse_snapshot(payload):
    try:
        value = json.loads(payload)
    except (json.JSONDecodeError, TypeError) as exc:
        raise ValueError("invalid PostgreSQL ACL JSON snapshot") from exc
    if not isinstance(value, dict):
        raise ValueError("PostgreSQL ACL snapshot must be a JSON object")
    return value


def evaluate(snapshot):
    if not isinstance(snapshot, dict) or any(key not in snapshot for key in FIELDS):
        return "UNKNOWN", ["INVALID_SNAPSHOT"]

    unknown = []
    if snapshot["app_role_exists"] is not True:
        unknown.append("MISSING_APP_ROLE")
    if snapshot["required_tables_missing"]:
        unknown.append("MISSING_PROTECTED_TABLES")
    if not isinstance(snapshot["bank_overload_count"], int) or snapshot["bank_overload_count"] < 1:
        unknown.append("MISSING_BANK_FUNCTIONS")

    failures = []
    for field, reason in (
        ("protected_direct_dml", "PROTECTED_DIRECT_DML"),
        ("default_app_grants", "UNSCOPED_DEFAULT_APP_GRANTS"),
        ("public_bank_overloads", "PUBLIC_BANK_EXECUTE"),
    ):
        if not isinstance(snapshot[field], list):
            unknown.append("INVALID_" + field.upper())
        elif snapshot[field]:
            failures.append(reason)

    if failures:
        return "FAIL", failures + unknown
    if unknown:
        return "UNKNOWN", unknown
    return "PASS", []


def main():
    try:
        snapshot = parse_snapshot(sys.stdin.read())
        status, findings = evaluate(snapshot)
        database = snapshot.get("database", "<unknown>")
    except ValueError:
        status, findings, database = "UNKNOWN", ["INVALID_JSON"], "<unknown>"
    print(json.dumps(
        {"status": status, "database": database, "findings": findings},
        ensure_ascii=False,
        separators=(",", ":"),
    ))
    return {"PASS": 0, "FAIL": 1, "UNKNOWN": 2}[status]


if __name__ == "__main__":
    raise SystemExit(main())
