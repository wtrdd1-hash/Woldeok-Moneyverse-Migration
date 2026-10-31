# 개발 C v1225 — 플레이어 마켓 원본 근거 검증 (한국어 보조)

## 시작 — 2026-10-31 15:40 KST
- 기준 `origin/main` `65193a0940778ac659e4d4952589ee49c291c30f`; 독립 브랜치 `auto/hourly-c-marketplace-source-truth-v1225-20261031-1545`.
- 미니PC Debian 13.6 연결 및 주요 서비스 7개·개발 PostgreSQL 정상. 공유 DB·공식 Test·Production 변경 금지.
- AGENTS, README/README.ko, 영문 정본/국문 통합기획, 열린 PR·CI·A/B/QA·이전 C v1224 확인. 최근 열린 PR에서 마켓플레이스 중복 작업 미발견.
- P0: 지갑 조회 실패 시 1,000 WLD 가짜 잔액, 보유품 실패 시 빈 배열, 초기 가짜 매물과 로컬 WLD 차감·아이템 생성. 반면 기존 Nest 인증 API GET `/api/v1/marketplace/listings`는 실제 DB 조회를 제공하나 DB 권한/공식 Test 동작은 별도 검증 필요.
- 설계: 본인 인증 읽기 전용 시장, 실제 API의 엄격한 응답 검증, 확인된 빈 결과와 장애 분리. 임의 시세·거래량·매입/제작/입찰 성공 제거. SQL/원장/타 작업 변경 없음. 모바일·접근성·비색인·재시도·테스트 포함.

## 진행 중
- [x] RED 테스트.
- [x] 실제 읽기 API 기반 안전한 화면.
- [x] 최종 SHA 검증 및 릴리스 차단 사유 기록.

## 종료 — 2026-10-31 15:53 KST (운영 보류)
- `/marketplace` 진입 화면은 실제 인증 API 매물만 읽기 전용으로 표시하고, 가짜 1,000 WLD 잔액·매물·거래량·클라이언트 가상 결제/제작 성공을 제거. 별도 하위 경로는 검증 범위 외.
- 신규 SQL 313의 SECURITY DEFINER 활성/본인 매물 조회 함수 및 Nest 호출 전환. 앱 계정의 원본 테이블 직접 SELECT/INSERT 권한 회수. 공유 DB·원장 변경 없음.
- 집중 Frontend 6/6, Backend 2/2 및 기존 컨트롤러 5/5 PASS. 전체 lint 오류 0·경고 1049, Typecheck PASS, app-api 184 PASS. 빌드 산출물 생성(정적 608개)했으나 원격 명령 재시도로 중복 실행되어 최종 SHA 재확인 필요.
- 전체 Frontend 2,778 PASS, Backend 2,780 PASS/501 SKIP(마지막 본인 조회 테스트 추가 이전), Database 62 PASS/4 SKIP, Contract 41 PASS, 보안·릴리스 27 PASS. 격리 PostgreSQL 17.11 신규 마이그레이션 **312/312 PASS**, 원본 SELECT/INSERT 거부 및 함수 EXECUTE 허용, 읽기 전용 조회 정상, 컨테이너 삭제.
- 운영 의존성 감사 PASS, 전체 의존성 취약점 13건 FAIL, 전체 경로 QA `--inventory` 누락 FAIL. 로컬 인증 설정 미비로 HTTP 500, 실제 X-Robots-Tag index/follow 문제 #2012. 공식 exact-SHA Test 인증 E2E·원격 필수 CI·독립 복원·운영 승격 미완료.
- 기존 #2041/#1334와 연계, 중복 이슈 생성 금지. main 병합·Test/Production 배포·GitOps·롤백 없음. 개발 A/B/QA/Gemini 및 핵심 예약 5개 유지. 최종 SHA/CI 증거는 커밋 후 GitHub 및 별도 내부 기록에 남김.

### 중간 — 2026-10-31 15:41 KST
- 기존 화면에 대한 RED 실패 확인 후 구현, 신규 집중 테스트 6/6 PASS.
- `/marketplace` 진입 화면은 기존 인증 API만 조회하며 정상 빈 목록과 장애를 분리. 임의 잔액·로컬 거래 완료 제거. 하위 경로는 이번 범위 외.
- 최신 main SHA 동일. 개발 DB에서 앱 계정의 마켓 원본 테이블 직접 SELECT 권한 확인: 최소 권한 개선 필요, 운영 권한 증거 아님.

### 중간 2 — 2026-10-31 15:43 KST
- 새 PostgreSQL 17.11에서 기존 마이그레이션 311/311 적용. 앱 계정의 마켓 테이블 직접 SELECT가 차단되어 기존 Nest 조회는 42501 실패함을 재현. 개발 DB 권한은 과도하게 열려 있었음.
- 전방 마이그레이션 313에 SECURITY DEFINER 매물/본인 조회 함수, 고정 search_path, 직접 권한 회수와 EXECUTE만 허용. Nest는 함수 호출로 전환. 금융 쓰기 없음.
- PostgreSQL numeric(20,4)의 정수 가격 표현을 안전하게 처리하고 소수 WLD는 거부. Frontend 집중 6/6, Backend 집중 6/6 PASS, 수정 파일 lint 오류 0건.
