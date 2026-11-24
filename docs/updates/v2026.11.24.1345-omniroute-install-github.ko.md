# OmniRoute 격리 설치 — v2026.11.24.1345

사용자 설치 승인 후 도입 검토 PR #3434에 이어 실행. [공식 저장소](https://github.com/cheaper-inference/OmniRoute), 이미지 3.8.54, 고정 다이제스트 `sha256:2c4c755a54f8ce5341bc1856580b71f47a0f16a9afab4a55f84d540810631f68`. 개발 전용 컨테이너 `moneyverse-omniroute-local`, 별도 브리지 네트워크와 영속 볼륨. 호스트 루프백 `http://127.0.0.1:20128`만 공개, 외부 프록시 없음. API 키 필수, 별도 생성 비밀값은 접근 제한된 로컬 env 파일에만 저장. 공급자 및 기존 AI CLI 라우팅 연결 없음. 회원정보·비밀값 외부 모델 전송 없음.

메모리 2GiB 및 메모리+스왑 동일 한도, V8 1024MiB, CPU 0.75, PID 256 제한, 권한 상승 금지 및 capabilities 제거, 로그 크기 제한. healthy, OOM=false, /api/health HTTP 200, 미인증 /v1/models 및 합성 채팅 HTTP 401. 대시보드 307 리다이렉트, 실제 로그인·외부 모델 응답은 미검증. 측정 메모리 479.9MiB. unless-stopped 자동 재시작. Moneyverse 앱·Test·운영 배포 및 기존 AI 라우팅 변경 없음. 가벼운 실행 검증이며 코딩 에이전트 부하 검증 아님. 호스트 공유 자원 압박 발생 시 컨테이너 중단. 기존 승격 규정 유지.

외부 사용은 SSH 접근이 설정된 경우 신뢰된 SSH 로컬 포워딩 이용. 초기 비밀번호는 ~/skill-install-records/v2026.11.24-omniroute-install/runtime.env에 보관(커밋 및 로그 출력 금지). 중단 `docker stop moneyverse-omniroute-local`, 재시작 `docker start moneyverse-omniroute-local`. 볼륨 보존. 공급자 연결 및 유료 자동 전환은 별도 설정 전 미적용.

## 서버 시간 작업기록
```text
2026-11-24T13:43:50+09:00 START: owner explicitly authorized installation; isolated local instance, no provider routing changes
2026-11-24T13:44:35+09:00 CHECKPOINT: reviewed upstream docker and env configuration
2026-11-24T13:45:10+09:00 CHECKPOINT: pinned image pulled; pending bounded runtime smoke
2026-11-24T13:45:28+09:00 CHECKPOINT: isolated bounded container created and health probe performed
2026-11-24T13:45:37+09:00 FINISH: health healthy, loopback-only published port, unauthenticated inference HTTP 401, restart unless-stopped; provider accounts unconnected; no Moneyverse runtime changes
```
