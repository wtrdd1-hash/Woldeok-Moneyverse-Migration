# v2026.09.14.1 — 내부 작업일지: 모바일 OAuth 브라우저 핸드오프

범위: Discord 승인은 브라우저에서 끝나지만 Android 앱이 콜백을 받지 못해 `/app-api/v1/auth/mobile/handoff`를 전혀 호출하지 않는 것으로 재현·확인된 네이티브 로그인 공백을 수정합니다.

작업 전 확인: 현재 인증·배포 요구사항을 다시 확인했습니다. 저장소에는 이미 `client=mobile` 저장, 1회용 handoff code 생성, HTTPS 302로 커스텀 URI 스킴에 직접 이동하는 구현이 있었습니다. 새 설치 상태에서의 사용자 검증 결과를 기준으로 남은 실패 지점을 브라우저→앱 전환으로 좁혔습니다.

구현: handoff code가 있는 모바일 OAuth callback은 최소 완료 HTML 응답을 반환합니다. 고정 커스텀 스킴 URI를 `window.location.replace`로 즉시 시도하고, 자동 외부 앱 실행이 차단되는 브라우저를 위해 사용자가 누를 수 있는 앱 열기 링크를 제공합니다. 웹 로그인·연결·재인증 리다이렉트는 변경하지 않았습니다.

보안: 호출자 지정 return URI는 추가하지 않았고 OAuth authorization code/state를 로그에 남기지 않습니다. 완료 응답은 `no-store`, `noindex`, 제한적 CSP를 적용하고 딥링크 값을 이스케이프합니다.

검증: contract build, 프론트엔드 typecheck가 통과했고 전체 프론트엔드 Vitest 56개 파일 / 548개 테스트가 통과했습니다. 작업 중간에 기획·배포 계약을 다시 확인했습니다. 격리 테스트 스택에서 exact SHA 및 백엔드/DB smoke가 통과하기 전에는 Production 승격하지 않습니다.