# 기획 변경 기록 — v2026.09.22.368

- 권위 기획 v352를 안정된 `origin/main=3f42ad8c...` 및 v360까지의 release 증거와 재정합했다.
- G368-01에서 권위/버전 드리프트를 기록하고 후속 구현 이력을 보존하되 묵시적 기획 권위로 취급하지 않았다.
- G368-02 P0: 폐기된 관리자 TOTP/SecondFactor 표현을 현재 배포 통제로 계산하지 않고 runtime/DB 증거를 따르도록 했다.
- G368-03: 모바일/API 계약의 버전·혼재 endpoint 수치는 count 비교가 아니라 exact-SHA semantic machine diff로 동기화하도록 했다.
- G368-04: 미병합 관리자 shop recent-reauth 브랜치는 WIP 후보 증거이며 보안 음성시험·감사·동시성 수용 게이트를 요구한다.
- G368-05: active-session 수와 무중단 release 표현의 증거 범위를 제한했다.
- OWASP ASVS 5.0.0 및 NIST SP 800-63B-4 final 상태를 재확인했다. 기획/문서 전용이며 구현·배포 완료를 주장하지 않는다.
