# 변경기록 — 광고 기본 활성화 v2026.09.13.42

기준일: 2026-09-13
변경 유형: 프론트엔드 / 릴리스 정책 / 문서
런타임 배포: 정확한 SHA로 Test 검증 후 Production 반영
영문 기준 문서: `docs/changelog/2026-09-13-ads-default-enabled-v2026.09.13.42.md`

## 변경 이유

검토된 AdSense 연동과 공개 페이지 광고 배치는 이미 구현되어 있었지만, Production 릴리스 자동화가 광고를 기본 비활성화하고 자동 `workflow_run` 릴리스에서 게시자/슬롯 값을 비우고 있었다. 따라서 광고 코드가 정상이어도 자동 운영 릴리스 뒤 실제 사이트에서는 광고가 사라질 수 있었다.

필수 중간 재확인 과정에서 인프라 운영 작업이 이미 `v2026.09.13.41`까지 사용한 것이 확인되어, 이번 최종 릴리스는 다음 순서인 **v2026.09.13.42**를 사용한다.

## 변경 내용

- 광고 스위치가 없을 때 검토된 공개 콘텐츠 광고를 기본 활성화한다.
- `frontend/Dockerfile`의 `ADS_ENABLED` 기본값을 `true`로 변경했다.
- `frontend/src/lib/adsense.ts`는 기본 활성화하되 게시자/슬롯 형식 검증과 명시적 `ADS_ENABLED=false` 중지 기능을 유지한다.
- `frontend/next.config.ts`의 CSP도 같은 기본 활성화 정책에 맞추고, 명시적으로 끄면 AdSense origin을 제거한다.
- Production 자동 릴리스에서 승인된 게시자 `ca-pub-5220225531544323`과 슬롯 `2118692561`을 기본 사용한다.
- 수동 Production 릴리스도 광고 기본 활성화이며, 긴급 정책/법률 대응을 위한 명시적 비활성화는 유지한다.
- 격리 Test는 `ADS_ENABLED=false`와 빈 광고 식별자를 명시해 실제 광고 트래픽이 발생하지 않도록 유지한다.
- 기본 활성화/명시적 비활성화 및 CSP 동작을 회귀 테스트로 고정했다.
- 영문/한국어 Living Project Plan과 SEO·광고 운영 점검 문서를 동기화했다.

## 광고 배치 경계는 유지

기본 활성화는 사이트 전체 광고를 의미하지 않는다. 기존 allowlist 및 차단 경계는 유지한다. 검토된 공개 콘텐츠 화면에서만 광고를 허용하며 로그인/계정, 지갑/송금, 시장/주식, 대출, 카지노/게임 조작, 관리자, 오류/상태 등 민감하거나 핵심 거래 화면은 광고 없이 유지한다.

## 검증 증빙

문서 추가 전 구현 SHA `2b984ae556cdead7f757d889dd9117b7eeb151cd`는 Test Candidate 실행 `34747780450`에서 secret 검사, lint, typecheck, build, DB migration, 전체 test, Prisma 변경 방지, 운영 의존성 audit를 통과했다. 같은 SHA의 불변 Test 이미지 빌드도 이어서 수행했다. 최종 문서 포함 HEAD는 병합/Production 승격 전에 정확한 SHA 기준 Test Candidate 게이트를 다시 통과해야 한다.

## 롤백

긴급 정책/법률 대응 시 `ADS_ENABLED=false`로 광고를 명시적으로 끌 수 있다. 필요하면 Production GitOps 이미지 참조를 직전 검증 SHA로 되돌린다. 이 변경에는 DB migration이나 데이터 롤백이 필요하지 않다.
