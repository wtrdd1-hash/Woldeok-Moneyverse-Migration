# Operations Documentation

**English canonical** | [한국어](README.ko.md)

Operator-facing procedures and runtime contracts live here: local development, migrations, backup/recovery, production deployment, security and operational AI/runtime guidance.

- [Current runtime hygiene inventory](RUNTIME_HYGIENE_INVENTORY.md) / [한국어](RUNTIME_HYGIENE_INVENTORY.ko.md) — protected Production/Test DBs, QA container classification, bind-exposure review and cleanup rules.

Procedures must distinguish desired design from observed runtime evidence and must not embed secrets.

Release procedures follow exact-version Test, authoritative backend/DB verification, zero-downtime promotion and rollback requirements.
