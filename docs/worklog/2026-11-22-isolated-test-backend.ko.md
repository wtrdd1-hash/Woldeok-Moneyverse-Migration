# 독립 Test 백엔드 복구 — 2026-11-22
정본: [English worklog](2026-11-22-isolated-test-backend.md).

## Before work — 작업 전
승인된 정확한 소스 f0336fded606과 동일한 불변 JAR로 독립 Test API 및 합성 DB를 복구한다. 기존 JVM, 미분류 DB, Production 및 Nginx는 변경하지 않는다. 상위 작업자가 통합과 배포를 담당한다.

## In progress — 진행
- [x] AGENTS, 현재 계획, 관련 작업 기록 및 메모리 프로토콜 확인.
- [x] 경계 테스트 RED→GREEN 및 독립 검토 지적 4건 수정; 상위 작업자 소스 검증.
- [x] 새 전용 컨테이너와 볼륨에 원본 ci-apply.mjs로348개 마이그레이션 적용.
- [x] 제한된 moneyverse_app, 읽기 전용 Hikari, 작업 스케줄 비활성화, 봇 오프라인 및 루프백 네트워크 확인.
- [x] 실제 DB 기반 주식10행/게시판0행, 익명 세션 및 위조 신원 거부 검증.
- [x] 비밀정보 없는 수락 JSON 전달.

## Finished — 완료
Python 테스트10/10, 실패0, 구문 검사 통과. 실제 Test 수락17/17 통과. API55438, DB55436, DB명 moneyverse_nov18_public_test. 사용자/신원/세션 각각0이며348개 마이그레이션의 순서와 체크섬이 소스와 일치한다. 현재 PID556244의 열린 JAR과 소스 버전이 승인된 아티팩트와 일치한다.

비공개 지갑/잔액/관리자 및 위조 신원 요청은401이다. 공개 지갑 요약은 로그인 전 화면용200이며 signedIn=false와 null 잔액만 반환한다. Test Origin은 허용되고 Production Origin은403으로 거부된다. 최초 진단에서 공개 요약을 비공개 지갑으로 분류한 문제와 Hikari 로거 환경변수의 대소문자 문제를 구분하여 수정했다. API 기능을 바꾸거나 권한을 완화하지 않았다.

이 작업은 독립된 비공개 Test 복구만 완료했다. Production/Nginx 변경, 커밋, 푸시는 하지 않았다. 실제 회원/관리자 로그인, 금융 및 사용자 변경, 전체 API, Production 백엔드 승인은 미검증이다. 초기 실행 증명 설정은 service Restart=no 및 Docker restart=no이므로 재부팅 후 Test 연속성은 상위 작업자의 후속 평가 대상이다.

## 연속성 후속 작업 — Before work / In progress / Finished
- [x] 상위 작업자가 재시작 및 부팅 연속성 변경을 승인하고 새 소스를 직접 검증했다.
- [x] 정책 회귀 테스트 RED→GREEN, 전체 보조 테스트12/12 통과.
- [x] 현재 관리자 PID/유닛, 원본 비공개 유닛 바이트, 열린 JAR/CWD, 전용 컨테이너 신원 및 기존 부팅 링크 부재를 변경 전 확인했다.
- [x] 전용 유닛만 제한된 실패 재시작 정책으로 변경하고 부팅 활성화했다. 전용 DB 컨테이너만 unless-stopped 정책으로 변경했다.
- [x] 새 PID566098에서 실제 Test 수락17/17 및 연속성 정책 확인을 통과했다.

기존 원본 유닛 및 자격증명 파일은 그대로 보존되었다. 비공개 기록과 비밀정보 없는 JSON 내보내기에 변경 전후 inode/해시, 루트 소유 부팅 링크 및 운영 소스 다이제스트 차이를 기록했다. 소유권과 선행조건을 확인한 제한적 파일 교체이며 원자적 compare-and-swap 보장을 주장하지 않는다.

이 후속 결과가 앞선 초기 Restart=no/Docker restart=no 상태를 대체한다. 실제 호스트 재부팅이나 강제 장애 실험은 하지 않았다. Nginx, Production, 기존 미분류 프로세스/DB 및 SQL/애플리케이션 동작은 변경하지 않았다. 공개 Test 브라우저 검증은 상위 작업자가 계속한다.
