import importlib.util
import json
import pathlib
import unittest

SCRIPT = pathlib.Path(__file__).resolve().parents[1] / "check-app-role-acl.py"
spec = importlib.util.spec_from_file_location("acl_gate", SCRIPT)
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


def baseline():
    return {
        "database": "isolated_test",
        "app_role_exists": True,
        "required_tables_missing": [],
        "bank_overload_count": 6,
        "protected_direct_dml": [],
        "unreviewed_direct_dml": [],
        "default_app_grants": [],
        "public_bank_overloads": [],
    }


class AppRoleAclGateTests(unittest.TestCase):
    def test_secure_snapshot_passes(self):
        self.assertEqual(gate.evaluate(baseline()), ("PASS", []))

    def test_critical_direct_write_fails(self):
        data = baseline()
        data["protected_direct_dml"] = [{"table": "account_balances", "privilege": "UPDATE"}]
        status, findings = gate.evaluate(data)
        self.assertEqual(status, "FAIL")
        self.assertIn("PROTECTED_DIRECT_DML", findings)

    def test_unreviewed_app_table_writes_fail_even_if_financial_tables_are_clean(self):
        data = baseline()
        data["unreviewed_direct_dml"] = [{"table": "member_board_posts", "privilege": "UPDATE"}]
        self.assertEqual(gate.evaluate(data), ("FAIL", ["UNREVIEWED_APP_DML"]))

    def test_future_default_grants_fail(self):
        data = baseline()
        data["default_app_grants"] = [{"object": "r", "privilege": "INSERT"}]
        self.assertEqual(gate.evaluate(data)[0], "FAIL")
        self.assertIn("UNSCOPED_DEFAULT_APP_GRANTS", gate.evaluate(data)[1])

    def test_public_bank_overload_fails(self):
        data = baseline()
        data["public_bank_overloads"] = ["bank_transfer_pocket(p_key text, ...)"]
        self.assertEqual(gate.evaluate(data), ("FAIL", ["PUBLIC_BANK_EXECUTE"]))

    def test_missing_schema_never_claims_pass(self):
        data = baseline()
        data["bank_overload_count"] = 0
        self.assertEqual(gate.evaluate(data), ("UNKNOWN", ["MISSING_BANK_FUNCTIONS"]))
        data = baseline()
        data["required_tables_missing"] = ["account_balances"]
        self.assertEqual(gate.evaluate(data), ("UNKNOWN", ["MISSING_PROTECTED_TABLES"]))

    def test_missing_role_never_claims_pass(self):
        data = baseline()
        data["app_role_exists"] = False
        self.assertEqual(gate.evaluate(data), ("UNKNOWN", ["MISSING_APP_ROLE"]))

    def test_invalid_payload_never_claims_pass(self):
        self.assertEqual(gate.evaluate({})[0], "UNKNOWN")
        with self.assertRaises(ValueError):
            gate.parse_snapshot("not json")
        self.assertEqual(gate.parse_snapshot(json.dumps(baseline()))["database"], "isolated_test")


if __name__ == "__main__":
    unittest.main()
