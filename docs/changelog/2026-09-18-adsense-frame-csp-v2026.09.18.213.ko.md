# v2026.09.18.213 — AdSense iframe CSP Test 게이트 보완

- 브랜치: `fix/ui-adsense-frame-csp-v2026.09.18.213`
- 기준: `1457797823b4ba54fa373564ce30681d56b36100`
- 범위: frontend security header만 변경, backend/DB 변경 없음

## 수정
실제 Test edge Chromium에서 `ep2.adtrafficquality.google`, `www.google.com` frame CSP 차단을 재현했습니다. 광고 활성 `frame-src`에 adtrafficquality apex/wildcard와 정확한 `www.google.com`만 추가하며 광고 비활성은 계속 `frame-src 'none'`입니다.

## 게이트
merged exact SHA를 Test용으로 다시 build하고 browser CSP/overflow와 backend health를 검증한 뒤 별도 Production frontend canary와 Nginx 원자 전환으로 승격합니다.
