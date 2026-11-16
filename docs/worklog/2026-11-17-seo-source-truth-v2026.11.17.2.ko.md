# SEO 실제 데이터 출처 긴급 복구 — v2026.11.17.2

## 시작 기록 — 2026-11-17 KST
- 사용자 승인: SEO 복구. 실제 QA 통과 후에만 운영 무중단 반영.
- 시작 origin/main SHA: `86777fb2d5a1f8bbc680453368c0a5f04b5c7715`.
- 별도 브랜치/워크트리: `fix/seo-node-source-truth-v2026.11.17.2` (타 에이전트 작업 보존).
- 권위 문서: AGENTS, PROJECT_PLAN, 통합 마스터, 문서 정책, SEO 사이트맵 규격 점검. 운영 승격 HOLD 조건은 실증으로 판단.
- 재현: 내부 :4400에서 관리자 SEO 조회 404 및 가짜 Spring 통계 확인. :4550 Spring GSC도 고정 통계를 반환하고 제출 시 실제 요청 없이 성공 응답.
- :4500 NestJS SEO 공개 통계는 기존 계약 형식, 비인증 관리자 3개 API는 401 거부 확인.
- 원인: Nginx :4400의 SEO 경로가 계약 미완성 Spring으로 이동되어 Next 관리자 조회가 실패.
- 범위: SEO 경로만 기존 실측·보안 기능을 가진 NestJS로 복구. DB/금전/인증·타 Spring 경로 변경 금지. 크롤러 관측/실제 검색 색인 구분 유지.
- 시작 상태: 미복구, 운영/테스트/데이터 변경 없음.

## 중간 기록 — 재현·독립 테스트
- 기존 4400에서 테스트 8개 실패: Spring 고정 응답, 관리자 404, GSC·감사·제출 인증 부재. 테스트 RED 확인.
- 독립 Nginx 4401에 SEO Node 경로 분기 설치, 공개 JSON/비공개 차단/기존 별칭/인증키 동등성 PASS. 독립 4403 권한 보호에서 익명 6건 차단·모의 승인 6건 및 권한 서버 503 통과.
- Next `api/admin/seo-audit` 실제 익명 조회 200 재현. Nest 관리자 검증 추가 TDD RED→GREEN. 정적 퍼널 4,870/651/순위 CTR 가짜 데이터 검증 테스트 RED→GREEN. 관련 테스트 50/50.
- 작업 중 `origin/main` 재확인: 시작과 같은 SHA. Nginx 공개 서버의 타 에이전트 기존 `v2026.11.17.1` 관리자 사용자 보호 보존.

## 종료 기록 — 운영 게이트웨이 반영 / 프론트 미배포
- 1차 운영 Nginx 적용 직후 QA 이전 워커 응답 감지 → 자동 원복; 새로운 워커 준비 유예 2초 추가. 2차 zero-downtime reload 후 SEO API 정상 계약, 관리자 401, Next 공개 200, 익명 SEO 세 경로 401 PASS.
- 사후 드문 auth_request 503이 Nginx 500으로 변환됨을 발견하여, 503 실패 보존 매핑 적용; 별도 RED→GREEN 독립 테스트 후 무중단 재적용.
- 운영 독립 읽기전용 검증 13/13 PASS; nginx -t PASS; Node/Spring/홈 200. 원복 백업: `/srv/moneyverse-data/reports/seo-recovery-v2026.11.17.2/moneyverse-nginx-before-20261117T004603.conf`, `seo-edge-auth-before-failclosed-503.conf`. 실제 IndexNow 제출 안 함.
- Spring 직접 :4550 가짜 SEO 구현은 그대로, 운영은 Nginx를 통해 NestJS로 우회. 운영 프론트 정적 퍼널 표시도 그대로이며 현재 소스 개선은 브랜치 전용. 관리자 실제 로그인·실제 GSC 및 전체 CI 미실시; Java 및 프론트 정식 운영 승격 HOLD.

## GitHub 종료 인계
- Draft PR #3206: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3206
- PR 검토 대기. Nginx 운영 완화 조치는 반영되었으나 프론트 소스와 Spring 완전 전환은 운영 배포하지 않음.
