# Woldeok Moneyverse 공식 브랜드 아이콘 디자인 & 적용 가이드라인 (v1.0)

> **버전**: v1.0.0 (2026-11-21)  
> **상태**: 승인 및 메인 배포 완료 (Active & Live)  
> **표준 에셋 경로**: `frontend/public/images/woldeok-official-icon.png`

---

## 1. 개요 및 심볼 철학

Woldeok Moneyverse의 공식 아이콘은 디지털 금융 주권과 차세대 머니버스 경제 시스템의 신뢰성, 권위, 안정성을 시각화한 마스터 엠블럼입니다.

```
       👑 [Crown] 최고위 금융 권위 및 글로벌 주권
         \
     ┌───────┐
     │   W   │ [Metallic 'W'] Woldeok의 정체성 및 견고한 금융 원장
     └───────┘
     /   │   \
   🍃    💎    🪐
[월계수] [다이아몬드] [궤도 링]
승리·신뢰  가치 보존  글로벌 머니버스
```

### 핵심 시각 요소
1. **중앙 입체 'W' 로고**: 크롬 메탈릭 텍스처와 바이올렛 반사광을 지닌 중심 워드마크로, 금융 시스템의 견고성과 기술적 우수성을 상징합니다.
2. **상단 임페리얼 크라운 (Crown)**: 최고 등급의 금융 기관 및 주권적 가치를 상징합니다.
3. **하단 프리즘 다이아몬드 (Diamond)**: 불변의 원장 무결성과 이용자의 안전한 자산 보존을 상징합니다.
4. **좌우 실버 월계수관 (Laurel Wreath)**: 지속 가능한 성장과 승리, 커뮤니티의 신뢰를 상징합니다.
5. **바이올렛 네온 궤도 링 (Orbital Ring)**: 금융과 데이터가 끊김 없이 순환하는 머니버스 생태계를 표현합니다.
6. **네온 스퀘어클 (Squircle) 프레임**: iOS, Android, macOS, Windows 전 플랫폼에 완벽히 대응하는 라운드 코너와 네온 이중 글로우 효과를 적용했습니다.

---

## 2. 컬러 팔레트 & 텍스처 규격

| 용도 | 색상 코드 (Hex) | 설명 |
| :--- | :--- | :--- |
| **Primary Violet** | `#7C3AED` (Deep Violet) | 궤도 및 외곽 글로우의 메인 테마 |
| **Neon Purple** | `#C084FC` (Light Neon) | 입체 반사광 및 발광 하이라이트 |
| **Dark Background** | `#0D071E` (Dark Cosmos) | 배경 엠블럼 베이스 심도 |
| **Chrome Metallic** | `#F8FAFC` ~ `#CBD5E1` | 중앙 'W' 및 왕관/월계수의 메탈릭 질감 |
| **Prism Jewel** | `#A855F7` ~ `#E9D5FF` | 하단 다이아몬드 굴절 광채 |

---

## 3. 플랫폼별 에셋 배치 및 변환 규격

| 플랫폼 / 파일 경로 | 해상도 / 포맷 | 적용 대상 및 역할 |
| :--- | :--- | :--- |
| `frontend/public/images/woldeok-official-icon.png` | `1024x1024` PNG (RGB 8-bit) | 마스터 고해상도 공식 엠블럼 원본 |
| `frontend/public/favicon.ico` | Multi-size (`16x16`, `32x32`, `48x48`) | 웹 브라우저 탭 파비콘 (레거시 지원) |
| `frontend/public/favicon.png` | `512x512` PNG | 모던 브라우저 및 고해상도 탭 아이콘 |
| `frontend/public/apple-touch-icon.png` | `180x180` PNG | iOS Safari 홈 화면 바로가기 아이콘 |
| `frontend/public/manifest.json` 내 `icons` | `192x192`, `512x512` PNG | PWA (Progressive Web App) 설치 아이콘 |
| `frontend/public/og-image.png` (및 메타 태그) | `1200x630` PNG (중앙 엠블럼) | 카카오톡, 디스코드, 트위터 OpenGraph 미리보기 |

---

## 4. 프론트엔드 UI/컴포넌트 적용 가이드

### 1) 상단 네비게이션 헤더 (`Header.tsx`)
```tsx
<Link href="/" className="flex items-center gap-2.5">
  <img 
    src="/images/woldeok-official-icon.png" 
    alt="Woldeok Logo" 
    className="w-8 h-8 rounded-lg shadow-[0_0_12px_rgba(168,85,247,0.4)] transition-transform hover:scale-105"
  />
  <span className="font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">
    Woldeok
  </span>
</Link>
```

### 2) 모바일 바텀 시트 및 웰컴 배너
- 모바일 320px ~ 390px 뷰포트에서 아이콘 크기는 최대 `32px x 32px`로 제한하여 텍스트 오버플로우를 원천 방지(`flex-shrink-0` 필수 부여).
- 다크 모드 배경(`bg-[#0a0518]`)과 조화를 이루도록 보라색 앰비언트 글로우(`drop-shadow-[0_0_8px_rgba(147,51,234,0.3)]`) 권장.

---

## 5. 지침 및 금지 사항 (Brand Don'ts)

1. **비율 왜곡 금지**: 종횡비 1:1을 강제 유지해야 하며 가로/세로 단독 리사이징을 엄격히 금지합니다.
2. **색상 변조 금지**: 공식 승인된 바이올렛-크롬 팔레트 이외의 임의 색상 필터(모노크롬 흑백 제외) 적용을 금지합니다.
3. **크롭(잘림) 금지**: 스퀘어클 외곽 테두리와 월계수관 끝부분이 프레임 밖으로 잘려 나가지 않도록 최소 8%의 안전 여백(Safe Padding)을 준수합니다.
