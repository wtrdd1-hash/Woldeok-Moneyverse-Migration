# UI 이미지 구현 인계서 — v2026.11.19.31

**상태:** 이미지 원본 복구 / 실제 프론트엔드 구현 미검증. **영문 정본:** [English](UI_IMAGE_IMPLEMENTATION_HANDOFF_v2026.11.19.31.md). **변경 범위:** 문서·디자인 리소스만. Spring/기존 프론트엔드/DB/Test/운영은 변경하지 않음.

## 원인

- 11월 18일 신규 디자인은 실제로 [PR #3268](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3268)에 **180개 PC+모바일 합본 SVG**, [PR #3270](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3270)에 **관리자 PC·모바일 SVG 2개**와 별도 채팅 데모로 올라갔다.
- 두 PR이 **미병합 종료**되고 원래 원격 작업 브랜치가 삭제되어 이미지 URL이 지속 가능하지 않았다. PR 종료 댓글에는 통합되었다고 적혔지만, 감사 당시 GitHub `origin/main` SHA `0590fac4`와 미니PC 통합 Spring 작업 HEAD `b988877285` 양쪽에서 해당 디자인 경로를 발견하지 못했다.
- GitHub의 폐쇄된 PR 참조(`refs/pull/3268/head` / `refs/pull/3270/head`)에서 원본을 복구해 **별도 문서 브랜치**에 담았다. 아직 `main`에 반영됐다고 말할 수 없다.
- 이 SVG는 화면 구성용 **개념 시안**이며, ChatGPT 대화에서 렌더링된 이미지의 픽셀 단위 원본이거나 실제 작동 페이지 캡처라고 확인된 자료는 아니다. 디자인 정확도는 원본 승인 이미지와 재비교해야 한다.

## 제미나이 구현 시 반드시 열어야 하는 경로

| 범위 | 실제 이미지/자료 | 사용 방법 |
| --- | --- | --- |
| 전체 180개 화면 | [화면별 180개 이미지 인덱스](all-pages-v2026.11.18.12/README.md), [갤러리](all-pages-v2026.11.18.12/gallery.html) | [화면 URL→SVG 목록 JSON](all-pages-v2026.11.18.12/routes-manifest.json) |
| 홈페이지 | [홈 PC·모바일 이미지](all-pages-v2026.11.18.12/previews/home.svg) | `/` 실제 구현 시 비교 |
| 관리자 PC | [관리자 데스크톱 디자인](admin-chat-v2026.11.18.13/references/admin-console-desktop.svg) | 실제 관리자 데이터와 권한 연동 |
| 관리자 모바일 | [관리자 모바일 디자인](admin-chat-v2026.11.18.13/references/admin-console-mobile.svg) | 터치·테이블·안전영역 QA |
| 관리자/전역 채팅 | [관리자 채팅 데모 명세](admin-chat-v2026.11.18.13/README.md) | 기존 로그인과 Spring 보안 검증 전 실제 채팅 API 접속 금지 |

[전체 화면 EN 기획](../planning/ALL_PAGES_RESPONSIVE_REDESIGN_v2026.11.18.12.md) / [한국어 기획](../planning/ALL_PAGES_RESPONSIVE_REDESIGN_v2026.11.18.12.ko.md), [관리자 EN 기획](../planning/ADMIN_GLOBAL_CHAT_DESIGN_v2026.11.18.13.md) / [한국어 기획](../planning/ADMIN_GLOBAL_CHAT_DESIGN_v2026.11.18.13.ko.md).

기획 당시 전체 화면은 GitHub 178개 실제 라우트와 미니PC 전용 후보 2개(`/admin/logs/errors`, `/calculators`)다. **현재 통합 기획의 최신 지시는 모든 웹 프론트엔드를 Java Spring Boot MVC+Thymeleaf 기반으로 전환하는 것**이다. 기존 Next.js 프로젝트 파일이 역사적 시안 생성 출처라는 이유로 Node.js/Next.js 운영 런타임을 재도입하면 안 된다. 현재 Spring 라우트/기능 인벤토리를 다시 기준으로 잡을 것.

## 구현 및 QA 필수 확인

1. 화면별 PC·모바일 SVG와 이전에 승인된 실제 디자인의 차이를 확인한다. 이미지는 동작하는 화면이 아니므로 구성요소, 디자인 토큰, 모달, 버튼, 데이터 흐름을 실제 Spring 화면으로 구현한다.
2. 각 버튼·입력·탭·금융·관리자 기능은 실제 서버 API, 로그인/관리자 권한, DB 원장, 성공·실패·UNKNOWN·빈 상태와 연결한다. 임의 숫자나 성공 메시지로 대체 금지.
3. 320/390/768/1440px, 200% 확대, 모바일 safe area, 가로 넘침, 키보드와 Escape, 대비·터치 영역을 검증한다. 영어 기본/한국어 보조. 전역 문의 원형 버튼은 단일 56px 원칙을 지킨다.
4. 새 개발 브랜치·별도 Test 서버·Spring 빌드·실제 브라우저 UI 비교·인증된 API E2E·보안·금융 검증·정확한 SHA·복구/롤백 확인 후 운영 무중단 승격한다. 이미지 업로드만으로 배포 승인 불가.
5. 제미나이의 현재 작업과 파일 소유권 충돌 금지. 시작·중간·종료 작업로그와 GitHub/내부 업데이트 내역을 남긴다.

## 검증 증거

- 180개 SVG 원본 존재, SHA-256 모두 서로 다름, XML 180/180 정상, viewBox 존재. **PC·모바일 합본 파일 180개**이며 360개 개별 PNG가 아님.
- 관리자 SVG 2개 XML 정상. ZIP 183개 엔트리 및 10개 엔트리 CRC 정상. 화면 목록 180개와 실제 파일 대응 오류 0.
- **실제 디자인 시각 일치, Spring 구현 완료, 로그인/API 작동, Test/운영 배포는 이 복구 작업에서 검증하지 않았다.**

**결론:** 이미지는 만들어졌으나 PR 폐쇄·브랜치 삭제 후 제미나이가 찾을 수 없는 상태였고, 이번에 원본을 복원한 별도 인계 브랜치를 준비했다. 본 브랜치는 배포나 프론트엔드 구현 완료가 아니다.
