# v2026.10.03.509 — 글로벌 성장·해외 SEO 권위 통합 작업기록

상태: PLANNING / 문서 전용 통합
일자: 2026-10-03
브랜치: `docs/global-growth-seo-integration-v2026.10.03.509`
시작 `origin/main`: `ddec006e75ffcaf866c3c6d0a82edc2b96372917`
원본 설계: `origin/docs/global-growth-seo-v2026.10.02.507` @ `470da720`
범위: 승인된 v507 글로벌 SEO, 한국어 기본 locale, GeoIP 보조 현지화, 해외 서비스 포트폴리오, 광고수익 설계를 최신 권위 기획 체계에 통합하되 v508 보안/런타임 증거는 덮어쓰지 않는다.

## 시작 기록
- 모든 remote를 갱신하고 현재 `origin/main`이 `ddec006e`(v508 보안 수정)임을 확인했다.
- 문서 거버넌스, 현재 프로젝트 기획서, 통합 기획 마스터, v508 내부 업데이트, v507 글로벌 성장 작업기록/상세명세를 다시 확인했다.
- v507 기준점 이후 main 변경과 v507 변경은 파일 경로가 겹치지 않음을 확인했지만, 통합은 반드시 최신 main에서 새 브랜치로 수행한다.
- 제품/공개 fallback locale은 한국어(`ko`)이며 명시 locale URL과 저장된 사용자 선택이 GeoIP/Accept-Language 추천보다 우선한다.
- 공개 색인 URL은 IP/브라우저 언어만으로 강제 전환하지 않는다. GeoIP는 언어 추천/selector 기본값과 비색인 온보딩의 보조 신호로만 사용한다.
- 사업/세무/법률 상위 권위가 명시적으로 바뀌기 전까지 현금 수익화는 광고 전용 상태를 유지한다.
- 이번 작업은 문서 전용이며 런타임 코드, DB, Test, Production을 변경하지 않는다.

## 계획 통합 산출물
1. v507 글로벌 성장 상세 명세와 조사기록을 최신 main 위에 복원한다.
2. PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, 국제 locale/jurisdiction, 검색 노출, 제품 성장, 광고수익 명세와 문서 인덱스에 v507 결정을 통합한다.
3. 영문 canonical + 한국어 필수 2차언어 쌍을 유지한다.
4. v509 delta, 내부 업데이트, GitHub 업데이트, 종료 작업기록을 추가한다.
5. 작업 중간과 종료 직전 `origin/main`을 재확인하고, 같은 권위 파일이 변경되면 즉시 재조정한다.
6. 문서 범위 검증 후 브랜치/PR만 올리며 런타임 승격은 하지 않는다.

## 작업 상태
STARTED
