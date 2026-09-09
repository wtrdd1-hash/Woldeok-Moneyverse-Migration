# 이미지 렌더링 보안 강화 및 성능 정리

날짜: 2026-09-09
브랜치: `fix/image-hardening-20260909`

## 범위

- 프론트엔드의 갤러리, 게시판, 공지, 프로필, 코스메틱, 관리자 콘텐츠 이미지 경로 전체 점검
- 외부/회원 제공 URL과 사용자 권한에 의존하는 이미지의 개인정보·SSRF 경계 유지
- 보호 이미지를 Next.js 이미지 최적화 서버로 우회시키지 않으면서 불필요한 원시 `<img>` 경고 제거
- 브라우저 로컬 미리보기 object URL 수명주기 정리

## 변경 사항

- 공개 same-origin 갤러리·공지·게시판 이미지를 `next/image`와 반응형 `sizes`, 안정적인 fill 컨테이너로 전환
- 외부 HTTPS 콘텐츠 이미지는 `unoptimized`로 브라우저가 직접 가져오도록 유지하여 Next.js 서버가 운영자/회원 제공 원격 URL을 대신 요청하지 않도록 제한
- 프로필, 회원 미승인 제출물, 관리자 검토 이미지, 코스메틱처럼 사용자 권한에 의존하는 이미지는 `unoptimized`를 명시하여 optimizer 요청에서 쿠키가 사라지거나 SSRF 프록시가 되는 문제 방지
- 외부 호스트가 요청을 받는 경로에 비동기 디코딩 및 `no-referrer` 정책 적용
- 프로필 아바타는 기본 lazy loading으로 변경하고 기존 이미지 오류 시 이니셜 fallback 유지
- 관리자 공지의 로컬 파일 미리보기는 파일 교체/컴포넌트 해제 시 이전 `blob:` URL을 해제하여 브라우저 메모리 누적 방지
- 남은 원시 `<img>`는 브라우저 로컬 `blob:` 미리보기 1곳뿐이며, optimizer로 보낼 이유가 없어 범위가 제한된 ESLint 예외를 사용

## 검증

- `eslint .`: 오류 0, 이미지 최적화 경고 없음
- 전체 workspace typecheck: contract/database/backend/frontend 통과
- Frontend Vitest: 51개 파일, 533개 테스트 통과
- Next.js production build 통과
- `git diff --check` 통과

## 배포 상태

- [x] 이미지 수정 구현 및 로컬 검증
- [ ] 최신 `origin/main` rebase 후 재검증
- [ ] 브랜치 push 및 CI/테스트 배포
- [ ] 테스트 사이트 이미지 라우트/반응형 렌더링 검증
- [ ] 검증 성공 후 `main` 병합
- [ ] 운영 배포 및 운영 검증
