# v2026.09.22.336

- Release safety: require isolated Test backend and frontend runtime identities to match the same attested application SHA before Production images can be built.
- Fail closed on split releases where `/api/version` and `/frontend-version` disagree.
- Record runtime identity coherence in the isolated-Test attestation and add executable regression coverage.
