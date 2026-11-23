# 월덕 머니버스 — 공식 디자인 문서 허브
버전: v2026.11.23.5 | **현행 공식 디자인: 사용자 선택(OWNER SELECTED)** | 영문 정본: [English](README.md)

## 유일한 최신 전체 웹 시각 디자인 기준
**[사용자 선택 네이비·보라 통일 디자인 v2026.11.23.3](OWNER_SELECTED_UNIFIED_DESIGN_v2026.11.23.3.ko.md)** · [영문 정본](OWNER_SELECTED_UNIFIED_DESIGN_v2026.11.23.3.md).

공개·회원·금융·직업·게임·커뮤니티·인증·문의·도구·전체 관리자 페이지는 이 기준으로 디자인한다. 배경 `#0C1020`, 카드 `#151D32`, 보라 `#9C83FF`, 파랑 `#64B7FF`, 글자 `#E9F1FF`, 보조 `#A8BCD8`. 페이지별 청록·녹색을 브랜드 주색으로 사용하거나 제목만 다른 범용 카드를 복사하지 않는다. PC·모바일의 직업 진입과 직업 수행/급여/자격, 은행·적금·카드, 지갑 송금·영수증, 퀘스트·상점·관리자 상세 기능을 분리한다.

**[180개 전체 경로 디자인 원장](ALL_180_UNIFIED_UI_REGISTER_v2026.11.23.3.ko.md)** · [English](ALL_180_UNIFIED_UI_REGISTER_v2026.11.23.3.md).

## 권위와 실제 적용 상태
현행 채택 사실은 [프로젝트 기획서](../planning/PROJECT_PLAN.ko.md) 및 [통합 기획 마스터](../planning/INTEGRATED_PLANNING_MASTER.ko.md)에 기록했다. 단 **별도 디자인 PR이 main에 병합되기 전에는 main이 갱신됐다고 주장하지 않는다.** 180개 기능별 상세 상태 UI 검수, Spring MVC + Thymeleaf 코드 구현, Test·운영 승격은 미완료다.

**이미지 현황:** 새 180개 이미지는 대화에 전달한 `moneyverse-unified-ui-v2026.11.23.3.zip` 파일에 있으며 **GitHub PNG 업로드 전**이다. 기존 `all-pages-v2026.11.18.12/previews/*.png` 주소를 새 디자인 이미지로 안내하지 않는다. 바이너리 업로드·PNG 실제 URL/해시 검증이 남아 있다. [Draft PR #3376](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3376).

## 구버전 디자인 — 현행 목록에서 제외 / 과거 증빙만
| 이전 자료 | 상태 | 보존 이유 |
|---|---|---|
| [11월 18일 180개 이미지](all-pages-v2026.11.18.12/README.md) | `SUPERSEDED / HISTORICAL` | 과거 경로 기준, 기존 PNG 유지 |
| [관리자·채팅 이미지](admin-chat-v2026.11.18.13/README.md) | `SUPERSEDED / HISTORICAL` | 이전 관리자·채팅 데모 |
| [11월19일 이미지 인계서](UI_IMAGE_IMPLEMENTATION_HANDOFF_v2026.11.19.31.ko.md) | `HISTORICAL` | 원본 복원 및 인계 기록 |
| [11월18일 통합 시안 기획](../planning/ALL_PAGES_RESPONSIVE_REDESIGN_v2026.11.18.12.ko.md) | `SUPERSEDED / HISTORICAL` | 과거 와이어프레임 기준 |
| [관리자·채팅 독립 시안](../planning/ADMIN_GLOBAL_CHAT_DESIGN_v2026.11.18.13.ko.md) | `시각 디자인 SUPERSEDED` | 데모 역사; 보안·권한 기준은 유지 |
| [11월20일 기존 디자인 권위](../planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md) | `PARTIALLY SUPERSEDED` | 시각 스타일만 최신 선택 기준 우선; 5언어·보안·채팅 요구 유지 |
| [기존 디자인 지침](../DESIGN_SYSTEM_GUIDELINES.ko.md) · [반응형 기준](../RESPONSIVE_DESIGN_GUIDELINES.ko.md) | `기술 지원 규칙` | 금액 정확성·접근성·터치·오버플로 유지; 오래된 색상/외관이 신디자인을 덮지 않음 |

기존 파일 삭제로 링크를 깨뜨리지 않기 위해 [문서 표준](../DOCUMENTATION_POLICY.ko.md)에 따라 **공식 목록에서 제외하고 역사 기록으로 보존**한다.

## 배포 상태
이번 회차는 문서 정리만 수행. 기존 PNG 교체·앱 코드·API·DB·Test·운영 변경 없음. 새 PNG GitHub 반영, 기능별 PC·모바일 검수, 5언어, Spring 구현 및 정확 SHA Test·무중단 롤백 검증 후에만 운영 승격한다.
