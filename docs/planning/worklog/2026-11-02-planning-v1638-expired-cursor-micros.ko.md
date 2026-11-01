# 기획 v1638 — F675-215 만료 보유품 마이크로초 커서·상태 정합성
**v1638 GitHub:** Draft PR #2439 OPEN/HOLD(상위 Draft #2433), 개발 인계 #2432, 최종 SHA CI 확인 대기, 병합·배포 없음.

**2026-11-02 07:10 KST | 기능 보완 | 초안 / 배포 보류**

이전 기능 추가 v1636 → 현재 기능 보완 v1638 → 다음 기능 추가 v1640(잠정). 상위 Draft #2433, 개발 인계 #2432. 영문 정본·한국어 동등 문서만 변경, 런타임·DB·배포 제외.

## 조사 근거
- miniPC Debian 13 서비스·개발 PostgreSQL 연결 확인. main a8541927c3a351d980454c66e95a3356c47e0722 시작·중간 재조회.
- AGENTS.md, README.md, 마이그레이션 071/104/123, shop 저장소/컨트롤러, Next 보관함, Android 게이트웨이 확인. 설치된 pg의 OID 1184 파서가 `.123456`을 JS Date `.123`으로 변환하여 456마이크로초 손실 재현.
- SQL 소수 6자리 UTC 문자열·정확한 키셋, 회원+세션 HMAC 커서, 요청 사이 MVCC 한계, 페이지별 총계, 활성/만료 조회 실패와 빈 결과 구분, Android 비공개 응답을 설계.
- 07:10 KST 공개 Test·Production 버전 모두 510dbe6...으로 main과 다르고 실행 이미지 증빙 아님. QA #2391·DEV 권한 #993 미해결. 외부 근거 신규 승인 0건, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS.

## 개발 인계·배포
P0 4건/P1 6건을 PROJECT_PLAN.md·PROJECT_PLAN.ko.md에 명세. 코드 작업은 개발 B/DB·B/API·A/Web·C/Android·QA의 별도 브랜치·정확 SHA Test가 필요. 실제 수용시험·독립 복원 미실행. 기본 OFF, RELEASE HOLD. 검증 후 GitHub PR/이슈와 작업기록에 결과 반영.

- 커서 오류: 잘못되거나 변조·만료된 경우 400, 입증된 변경 409, 원본 미검증 503. 확인되지 않은 결과를 정상 빈 목록으로 표시하지 않는다.

**신규 검증:** 정책·보안·백업 171/171 PASS, 분류 24/24 PASS, QA 22/23 PASS(기존 공성전 문구 #2391 1건 FAIL), pg 정밀도 재현 PASS, 영문·국문 4쌍×9항목 PASS, git diff --check PASS. 기능 수용시험 미실행.
