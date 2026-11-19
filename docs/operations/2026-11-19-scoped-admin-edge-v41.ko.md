# v2026.11.19.41 — 관리자 HTML·블로그 접근 보호 실제 운영 적용

**운영에 적용된 범위: Nginx 관리자 접근 차단 2건. Java·웹 디자인 전체 승격이 아닙니다.** 2026-11-19 KST, 기존 main SHA `f488088bf50eb4659f59782dc0300a9c3bc74c69` 유지, DB/금융 쓰기 없음.

**시작:** `/admin`은 로그인 302인데 `/admin.html`과 `/admin-preview*` 4경로가 비로그인 200으로 구형 예시 화면(가짜 자산/회원수)을 노출하는 것을 확인. 기존 실제 관리자 세션/역할을 검증하는 Nginx 서브요청을 확인.

**운영 수정 A:** 해당 관리자 예시 4경로를 보호된 `/admin`으로 302 이동. 설정 전체를 SHA256 기반으로 로컬 백업(권한 0400), `nginx -t`, 무중단 reload, 실제 외부 HTTPS 4/4 302 확인. 설정 SHA `25a14d9...` → `c2c188b...`.

**운영 수정 B:** `/admin/blog-verified`가 비로그인 200 JSON 약 471KB, `/admin/blog/articles`도 200인 이유는 별도 `/admin/blog` 및 `/admin/blog/` Nginx 경로가 일반 관리자 인증 보호를 우회했기 때문. 현재 `/api/v1/admin/me`를 사용하는 기존 관리자 권한 확인을 두 경로에 붙임. 비로그인 `/admin/blog`, `/admin/blog/`, `/admin/blog-verified`, `/admin/blog/articles` 실제 외부 HTTPS 모두 302. `/`200, `/blog`200, `/admin.html`302, 관리자 API 비로그인 401, 회원 세션 API200 유지. 설정 SHA `c2c188b...` → `9b6ad3975288aee753b158786732494ccdcef01b86f6074736972ffbbd2dcdc8`.

**롤백:** 수정 전 Nginx 전문을 미니PC 로컬에만 보호 보관, 변경 검사가 실패하면 원상복구하도록 스크립트 구성. 실제 복원 실습을 한 것은 아니며 운영 앱을 재시작하지 않았습니다. 비밀 설정/원본 데이터는 GitHub에 올리지 않습니다.

**남은 것:** 두 건은 실제 운영 보안 수정이지만 신규 Java/프론트엔드 전체 기능·180경로 5회 QA·실관리자/원장/승격은 아니므로 여전히 전체 배포 보류. [English](2026-11-19-scoped-admin-edge-v41.md) / [QA](../qa/2026-11-19-spring-api-source-truth-v41.ko.md).
