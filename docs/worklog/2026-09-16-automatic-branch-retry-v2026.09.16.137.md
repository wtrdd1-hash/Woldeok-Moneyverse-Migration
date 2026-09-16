# v2026.09.16.137 — Automatic retry and reconciliation for stuck branches

- Reconciled branch pushes now explicitly dispatch `Build Test Candidate`, because GITHUB_TOKEN-authenticated pushes do not reliably start another workflow run.
- Managed branches with two or more failed candidate runs for the same exact HEAD SHA are automatically reconciled against current `main` instead of repeatedly testing the same broken head.
- Reconciled heads still require a fresh exact-SHA candidate success before merge.
- Identical-to-main results are closed/deleted; clean validated results are merged with source deletion.
- This closes the remaining failure mode where a broken or reconciled branch could remain indefinitely and defeat the branch-cleanup objective.
