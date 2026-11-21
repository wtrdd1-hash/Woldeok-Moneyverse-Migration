# 월덕 머니버스 (Woldeok Moneyverse) 공식 브랜드 아이콘 및 에셋 규격서

## 1. 개요 및 심볼 마크 권위 (Design Authority)
월덕 머니버스의 공식 브랜드 심볼은 가상 경제 금융 플랫폼의 최고 권위와 신뢰, 우주적 확장성을 상징하는 입체 3D 엠블럼입니다.
- **심볼 구조**:
  - **3D Silver "W"**: 월덕(Woldeok) 및 부(Wealth)를 상징하는 메인 이니셜
  - **Royal Crown (왕관)**: 최상위 가상 금융 통화 및 복식부기 원장의 무결성을 상징
  - **Laurel Wreath (월계수 관)**: 커뮤니티의 번영과 승리, 금융적 성공
  - **Brilliant Diamond (다이아몬드)**: 단단하고 투명한 복식부기 회계 원장
  - **Cosmic Orbit Ring (우주 궤도 링)**: 머니버스의 시공간을 초월한 무한 확장 경제 생태계
  - **Glow Squircle Badge**: 둥근 사각(Squircle) 형태의 네온 바이올렛 테두리 발광 프레임

## 2. 공식 컬러 팔레트 (Design Tokens)
| 토큰명 | HEX 코드 | 용도 |
| :--- | :--- | :--- |
| `mv-brand-bg` | `#0C1020` | 심볼 배경 심연(Dark Abyss) |
| `mv-brand-border-glow` | `#9C83FF` | 스쿼클 외곽선 바이올렛 글로우 |
| `mv-brand-orbit` | `#8B5CF6` / `#64B7FF` | 우주 궤도 링 및 그라데이션 |
| `mv-brand-silver-hi` | `#FFFFFF` | W 및 왕관 하이라이트 |
| `mv-brand-silver-mid` | `#E9F1FF` | W 바디 및 다이아몬드 면 |
| `mv-brand-silver-shadow` | `#64748B` | 입체 음영 및 월계수 잎 |

## 3. 에셋 매트릭스 및 파일 경로 규격
| 파일명 | 해상도 / 포맷 | 대상 경로 | 역할 |
| :--- | :--- | :--- | :--- |
| `favicon.ico` | 16x16, 32x32, 48x48 (ICO) | `/favicon.ico` | 브라우저 탭 기본 파비콘 |
| `apple-touch-icon.png` | 180x180 (PNG) | `/apple-touch-icon.png` | iOS 홈 화면 바로가기 아이콘 |
| `android-chrome-192x192.png` | 192x192 (PNG) | `/images/` | 안드로이드 PWA 홈 화면 |
| `android-chrome-512x512.png` | 512x512 (PNG) | `/images/` | PWA 스플래시 화면 |
| `woldeok-symbol.png` | 128x128 (PNG) | `/images/woldeok-symbol.png` | 상단 내비바 및 사이드바 로고 뱃지 |
| `woldeok-official-icon.png` | 1024x1024 (PNG) | `/images/woldeok-official-icon.png` | 고해상도 공식 마스터 브랜드 로고 |
| `logo.png` | 512x512 (PNG) | `/images/logo.png` | 시스템 기본 브랜드 이미지 |

## 4. 서빙 아키텍처 및 캐시 정책
1. **Nginx 직접 서빙**:
   - `/favicon.ico` 및 `/apple-touch-icon.png`는 WAS(Spring Boot)를 거치지 않고 Nginx 정적 alias를 통해 즉시 응답 (HTTP 200).
   - `/images/` 경로는 `/srv/moneyverse-data/frontend-static/images/`로 매핑되어 정적 서빙.
2. **Spring Boot 백엔드 JAR 내장**:
   - `BOOT-INF/classes/static/` 내부에 `favicon.ico` 및 이미지 에셋이 내장되어 단독 컨테이너 또는 WAS 직통 호출 시에도 100% 동일한 공식 아이콘 출력 보장.
3. **HTML 메타 태그 표준 선언**:
   ```html
   <link rel="icon" type="image/x-icon" href="/favicon.ico">
   <link rel="icon" type="image/png" sizes="32x32" href="/images/woldeok-symbol.png">
   <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
   ```
