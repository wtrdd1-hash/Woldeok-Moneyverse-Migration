# QA A1325 — 채팅 이미지 접근통제 (DRAFT/HOLD)
기준 main a28bed9aa40ff74d492824ae12892a7d52132fdd, 기존 미병합 종료 PR #1621을 독립 브랜치로 복구함.

정상/차단 경로: 업로더·정당한 수신자·열린 관리자 콘솔 접근, 파일 등록/실패 정리, Android no-store/noindex, 타인 404의 캐시 금지·위조 발신자·미등록 레거시 키 차단, 앱 계정의 직접 테이블 접근 거부. Backend 집중 16/16, Android 27/27. 일회용 PostgreSQL 17.11에서 새 291번 마이그레이션과 소유권 검증 PASS. 공유 DB 변경 없음.

전체 Lint/Typecheck/Next Build/API 계약 180개/마이그레이션 연속성 PASS. 루트 및 Bot High 이상 보안 감사 PASS, Bot 테스트 11 PASS. 전체 테스트는 기존 main의 관리자 블로그 UI/테스트 불일치 1건으로 FAIL. 공식 Test 정확한 SHA 인증 E2E, 전체 실스키마 권한 검증, 백업 복원, 접근성/SEO 종합 검증은 미완료.

P0 #993 DB 사용자 식별 결합·최소권한, 레거시 미디어 전환 및 공식 릴리스 게이트 미충족. main 병합과 운영 승격 금지.
