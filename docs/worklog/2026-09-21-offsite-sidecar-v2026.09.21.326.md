# Off-host checksum verification — v2026.09.21.326

## English canonical

### Checklist
- [x] Planned: inspect the latest main, open DR PR, CI result, and automated review findings.
- [x] In progress: reproduce the source-path checksum ambiguity from the backup sidecar contract.
- [x] Completed: verify the digest against the fetched encrypted archive itself before decryption.
- [ ] Validation pending: GitHub required checks on the exact branch SHA.
- [ ] Deployment pending: merge only after required checks pass; Production remains blocked by existing migration-authority/DR gates.

### Result
The prior off-host restore proposal copied the SHA-256 sidecar unchanged and invoked `sha256sum -c`. Because the backup producer may record an absolute source-host archive path, that can verify the wrong local object or fail on a replacement host. The restore drill now parses only a single 64-hex digest from the fetched sidecar and compares it directly to the fetched encrypted archive. Local restore behavior is unchanged.

## 한국어

### 체크리스트
- [x] 계획: 최신 main, 열린 DR PR, CI 결과, 자동 리뷰 지적을 확인했다.
- [x] 진행: backup sidecar의 원본 경로로 인해 잘못된 파일을 검증할 수 있는 문제를 확인했다.
- [x] 완료: 복호화 전에 내려받은 암호화 아카이브 자체의 SHA-256과 sidecar digest를 직접 비교하도록 수정했다.
- [ ] 검증 대기: exact branch SHA의 GitHub required checks.
- [ ] 배포 대기: required checks 성공 후에만 병합하며 기존 migration-authority/DR blocker가 해소되기 전 Production 승격은 하지 않는다.
