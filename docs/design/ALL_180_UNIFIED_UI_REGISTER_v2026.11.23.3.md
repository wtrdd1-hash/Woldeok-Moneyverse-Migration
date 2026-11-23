# Unified 180-route PC + mobile UI design register

Version: v2026.11.23.3 | Status: DESIGN_CONCEPT / NOT_IMPLEMENTED
Korean: [한국어](ALL_180_UNIFIED_UI_REGISTER_v2026.11.23.3.ko.md)

## Source of truth
- Follow [PROJECT_PLAN](../../planning/PROJECT_PLAN.md), [INTEGRATED_PLANNING_MASTER](../../planning/INTEGRATED_PLANNING_MASTER.md), and approved Nov18 UI authority.
- 180 entries map 1:1 to the original [Nov18 design gallery](../all-pages-v2026.11.18.12/README.md), including 2 BRANCH_ONLY_CONCEPT routes.
- All 180 newly rendered PC/mobile composites were produced as separate downloadable package in the conversation, checked against the route register; **NOT yet uploaded as GitHub PNGs** due to lack of accessible MiniPC and connector binary-transfer support.
- These represent systematic page-layout concepts, **not evidence of every planned feature's full element/state design or functional implementation**. No API, auth, DB, Test or Production validation. All figures are design samples.

## Unified design contract
- Background `#0C1020`; card `#151D32`; purple primary `#9C83FF`; secondary blue `#64B7FF`; foreground `#E9F1FF`; muted `#A8BCD8`.
- PC: persistent sidebar including Jobs, Wallet, Banking, Stocks, Quests, Shop and Support, with global search, locale selection and single chat launcher. Mobile: bottom Home/Bank/Stocks/Jobs/Quests/More and task-specific entry points.
- Domain-specific layouts: career selection / task / mastery / qualifications / payroll; financial transfer or savings / cards / ledger receipts; quest progress / claim; shop catalogue / purchase; administration permission / approvals / audit.
- Default English, second Korean, also Japanese, Simplified Chinese, Vietnamese; PNGs are Korean review samples and **not full five-language render QA**.
- Prior to acceptance: all action, loading, empty, error, permission, confirm and receipt states, 320–1920px responsive, accessibility, real authorized data source, Spring MVC + Thymeleaf Test must be validated. No false transaction success.

## Complete route register
| # | Route | Original name | Family | Required domain workflow |
|---:|---|---|---|---|
| 1 | `/` | 홈 대시보드 | 홈 | 정보·탐색·상태·설정 |
| 2 | `/[locale]/blog` | 블로그 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 3 | `/[locale]/blog/[slug]` | 블로그 · 상세 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 4 | `/[locale]/guide/glossary` | 가이드 · 용어사전 | 회원·공통 | 정보·탐색·상태·설정 |
| 5 | `/[locale]/guide/glossary/[term]` | 가이드 · 용어사전 · 용어 | 회원·공통 | 정보·탐색·상태·설정 |
| 6 | `/[locale]/tools/compound-interest-calculator` | 금융 도구 · 복리 계산기 | 금융 도구 | 정보·탐색·상태·설정 |
| 7 | `/[locale]/tools/compound-interest-calculator/[preset]` | 금융 도구 · 복리 계산기 · 프리셋 | 금융 도구 | 정보·탐색·상태·설정 |
| 8 | `/account` | 계정 | 회원·공통 | 정보·탐색·상태·설정 |
| 9 | `/account-deletion` | 계정 삭제 | 법률·안전 | 내용·권리·동의·문의 |
| 10 | `/account/notifications` | 계정 · 알림 | 회원·공통 | 정보·탐색·상태·설정 |
| 11 | `/account/privacy` | 계정 · 개인정보 | 회원·공통 | 정보·탐색·상태·설정 |
| 12 | `/account/security` | 계정 · 보안 | 회원·공통 | 정보·탐색·상태·설정 |
| 13 | `/admin` | 관리자 대시보드 | 관리자 | 권한별 조회·검토·승인·감사 |
| 14 | `/admin/analytics` | 관리자 · 분석 | 관리자 | 권한별 조회·검토·승인·감사 |
| 15 | `/admin/api-health` | 관리자 · API 상태 | 관리자 | 권한별 조회·검토·승인·감사 |
| 16 | `/admin/bank` | 관리자 · 은행 | 관리자 | 권한별 조회·검토·승인·감사 |
| 17 | `/admin/blog` | 관리자 · 블로그 | 관리자 | 권한별 조회·검토·승인·감사 |
| 18 | `/admin/bonds` | 관리자 · 국채 | 관리자 | 권한별 조회·검토·승인·감사 |
| 19 | `/admin/catalog` | 관리자 · 카탈로그 | 관리자 | 권한별 조회·검토·승인·감사 |
| 20 | `/admin/central-bank` | 관리자 · 중앙은행 | 관리자 | 권한별 조회·검토·승인·감사 |
| 21 | `/admin/content` | 관리자 · 콘텐츠 | 관리자 | 권한별 조회·검토·승인·감사 |
| 22 | `/admin/controls` | 관리자 · 기능 제어 | 관리자 | 권한별 조회·검토·승인·감사 |
| 23 | `/admin/discord` | 관리자 · 디스코드 | 관리자 | 권한별 조회·검토·승인·감사 |
| 24 | `/admin/economy` | 관리자 · 경제 운영 | 관리자 | 권한별 조회·검토·승인·감사 |
| 25 | `/admin/economy/scenario-lab` | 관리자 · 경제 운영 · 경제 시나리오 | 관리자 | 권한별 조회·검토·승인·감사 |
| 26 | `/admin/enterprises` | 관리자 · 국영기업 | 관리자 | 권한별 조회·검토·승인·감사 |
| 27 | `/admin/fx` | 관리자 · 외환 | 관리자 | 권한별 조회·검토·승인·감사 |
| 28 | `/admin/help` | 관리자 · 도움말 | 관리자 | 권한별 조회·검토·승인·감사 |
| 29 | `/admin/kdic` | 관리자 · 예금보험 | 관리자 | 권한별 조회·검토·승인·감사 |
| 30 | `/admin/logs` | 관리자 · 로그 | 관리자 | 권한별 조회·검토·승인·감사 |
| 31 | `/admin/logs/activity` | 관리자 · 로그 · 활동 | 관리자 | 권한별 조회·검토·승인·감사 |
| 32 | `/admin/logs/delivery` | 관리자 · 로그 · 전송 | 관리자 | 권한별 조회·검토·승인·감사 |
| 33 | `/admin/logs/errors` | 관리자 · 로그 · 오류 | 관리자 | 권한별 조회·검토·승인·감사 |
| 34 | `/admin/logs/integrity` | 관리자 · 로그 · 무결성 | 관리자 | 권한별 조회·검토·승인·감사 |
| 35 | `/admin/logs/system` | 관리자 · 로그 · 시스템 | 관리자 | 권한별 조회·검토·승인·감사 |
| 36 | `/admin/market` | 관리자 · 시장 | 관리자 | 권한별 조회·검토·승인·감사 |
| 37 | `/admin/market/ai-news` | 관리자 · 시장 · AI 뉴스 | 관리자 | 권한별 조회·검토·승인·감사 |
| 38 | `/admin/mint` | 관리자 · 조폐국 | 관리자 | 권한별 조회·검토·승인·감사 |
| 39 | `/admin/money-flow` | 관리자 · 자금 흐름 | 관리자 | 권한별 조회·검토·승인·감사 |
| 40 | `/admin/operations/storage` | 관리자 · 운영 · 저장소 | 관리자 | 권한별 조회·검토·승인·감사 |
| 41 | `/admin/pension` | 관리자 · 연금 | 관리자 | 권한별 조회·검토·승인·감사 |
| 42 | `/admin/safety` | 관리자 · 안전 | 관리자 | 권한별 조회·검토·승인·감사 |
| 43 | `/admin/security` | 관리자 · 보안 | 관리자 | 권한별 조회·검토·승인·감사 |
| 44 | `/admin/seo` | 관리자 · 검색 최적화 | 관리자 | 권한별 조회·검토·승인·감사 |
| 45 | `/admin/seo-audit` | 관리자 · SEO 감사 | 관리자 | 권한별 조회·검토·승인·감사 |
| 46 | `/admin/shop` | 관리자 · 상점 | 관리자 | 권한별 조회·검토·승인·감사 |
| 47 | `/admin/support` | 관리자 · 고객지원 | 관리자 | 권한별 조회·검토·승인·감사 |
| 48 | `/admin/treasury` | 관리자 · 국고 | 관리자 | 권한별 조회·검토·승인·감사 |
| 49 | `/admin/treasury/grants` | 관리자 · 국고 · 지원금 | 관리자 | 권한별 조회·검토·승인·감사 |
| 50 | `/admin/users` | 관리자 · 회원 | 관리자 | 권한별 조회·검토·승인·감사 |
| 51 | `/admin/users/[id]` | 관리자 · 회원 · 상세 | 관리자 | 권한별 조회·검토·승인·감사 |
| 52 | `/admin/work` | 관리자 · 직업 | 관리자 | 직업 정책·자격 승인·승급 심사·감사 기록 |
| 53 | `/advisor` | 자산 가이드 | 금융·경제 | 자산·조건·확인·거래·내역 |
| 54 | `/announcements` | 공지사항 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 55 | `/announcements/[announcementId]` | 공지사항 · 공지 상세 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 56 | `/arcade` | 아케이드 | 게임·성장 | 진행·선택·보상·기록 |
| 57 | `/bank` | 은행 | 금융·경제 | 계좌·입출금·적금·카드·거래 내역 |
| 58 | `/bank/savings-pot` | 은행 · 적금 | 금융·경제 | 자산·조건·확인·거래·내역 |
| 59 | `/blog` | 블로그 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 60 | `/blog/[slug]` | 블로그 · 상세 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 61 | `/board` | 게시판 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 62 | `/board/[postId]` | 게시판 · 게시글 상세 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 63 | `/bonds` | 국채 | 금융·경제 | 자산·조건·확인·거래·내역 |
| 64 | `/businesses` | 사업 | 금융·경제 | 자산·조건·확인·거래·내역 |
| 65 | `/businesses/ventures` | 사업 · 스타트업 | 금융·경제 | 자산·조건·확인·거래·내역 |
| 66 | `/calculators` | 계산기 | 금융 도구 | 정보·탐색·상태·설정 |
| 67 | `/calendar` | 일정 | 게임·성장 | 진행·선택·보상·기록 |
| 68 | `/casino` | 카지노 | 게임·성장 | 진행·선택·보상·기록 |
| 69 | `/central-bank` | 중앙은행 | 금융·경제 | 자산·조건·확인·거래·내역 |
| 70 | `/chat` | 채팅 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 71 | `/clubs` | 클럽 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 72 | `/clubs/[clubId]` | 클럽 · 클럽 상세 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 73 | `/clubs/[clubId]/members` | 클럽 · 클럽 상세 · 멤버 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 74 | `/clubs/new` | 클럽 · 신규 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 75 | `/clubs/warfare` | 클럽 · 클럽전 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 76 | `/collections` | 컬렉션 | 게임·성장 | 진행·선택·보상·기록 |
| 77 | `/dashboard` | 대시보드 | 회원·공통 | 정보·탐색·상태·설정 |
| 78 | `/data-deletion` | 데이터 삭제 | 법률·안전 | 내용·권리·동의·문의 |
| 79 | `/design-preview` | 디자인 미리보기 | 회원·공통 | 정보·탐색·상태·설정 |
| 80 | `/developer` | 개발자 | 회원·공통 | 정보·탐색·상태·설정 |
| 81 | `/enterprises` | 국영기업 | 금융·경제 | 자산·조건·확인·거래·내역 |
| 82 | `/features` | 기능 | 회원·공통 | 정보·탐색·상태·설정 |
| 83 | `/forgot-password` | 비밀번호 찾기 | 인증 | 인증·입력 검증·보안 상태 |
| 84 | `/fx` | 외환 | 금융·경제 | 자산·조건·확인·거래·내역 |
| 85 | `/gallery` | 갤러리 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 86 | `/gallery/[photoId]` | 갤러리 · 사진 상세 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 87 | `/gallery/submit` | 갤러리 · 등록 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 88 | `/guide` | 가이드 | 회원·공통 | 정보·탐색·상태·설정 |
| 89 | `/guide/career-mastery` | 가이드 · 직업 숙련 | 회원·공통 | 정보·탐색·상태·설정 |
| 90 | `/guide/dopamine-system` | 가이드 · 성장 | 회원·공통 | 정보·탐색·상태·설정 |
| 91 | `/guide/glossary` | 가이드 · 용어사전 | 회원·공통 | 정보·탐색·상태·설정 |
| 92 | `/guide/glossary/[term]` | 가이드 · 용어사전 · 용어 | 회원·공통 | 정보·탐색·상태·설정 |
| 93 | `/guide/stock-trading` | 가이드 · 주식 거래 | 회원·공통 | 정보·탐색·상태·설정 |
| 94 | `/guide/virtual-banking` | 가이드 · 가상 은행 | 회원·공통 | 정보·탐색·상태·설정 |
| 95 | `/help` | 도움말 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 96 | `/help/[slug]` | 도움말 · 상세 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 97 | `/inventory` | 보관함 | 게임·성장 | 진행·선택·보상·기록 |
| 98 | `/invite/[code]` | 초대 · 초대 링크 | 회원·공통 | 정보·탐색·상태·설정 |
| 99 | `/kdic` | 예금보험 | 금융·경제 | 자산·조건·확인·거래·내역 |
| 100 | `/lobby` | 로비 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 101 | `/login` | 로그인 | 인증 | 인증·입력 검증·보안 상태 |
| 102 | `/login/providers` | 로그인 · 소셜 인증 | 인증 | 인증·입력 검증·보안 상태 |
| 103 | `/marketplace` | 마켓 | 게임·성장 | 진행·선택·보상·기록 |
| 104 | `/marketplace/auction` | 마켓 · 경매 | 게임·성장 | 진행·선택·보상·기록 |
| 105 | `/mint` | 조폐국 | 금융·경제 | 자산·조건·확인·거래·내역 |
| 106 | `/newspaper` | 신문 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 107 | `/pension` | 연금 | 금융·경제 | 자산·조건·확인·거래·내역 |
| 108 | `/prediction` | 예측 | 금융·경제 | 자산·조건·확인·거래·내역 |
| 109 | `/privacy` | 개인정보 | 법률·안전 | 내용·권리·동의·문의 |
| 110 | `/profile` | 프로필 | 회원·공통 | 정보·탐색·상태·설정 |
| 111 | `/profile/[userId]` | 프로필 · 사용자 상세 | 회원·공통 | 정보·탐색·상태·설정 |
| 112 | `/profile/settings` | 프로필 · 설정 | 회원·공통 | 정보·탐색·상태·설정 |
| 113 | `/progression` | 성장 | 게임·성장 | 진행·선택·보상·기록 |
| 114 | `/progression/prestige` | 성장 · 명성 | 게임·성장 | 진행·선택·보상·기록 |
| 115 | `/quests` | 퀘스트 | 게임·성장 | 일일/주간/메인 퀘스트·진행·보상 |
| 116 | `/register` | 회원가입 | 인증 | 인증·입력 검증·보안 상태 |
| 117 | `/reset-password` | 비밀번호 재설정 | 인증 | 인증·입력 검증·보안 상태 |
| 118 | `/roadmap` | 로드맵 | 회원·공통 | 정보·탐색·상태·설정 |
| 119 | `/safety` | 안전 | 법률·안전 | 내용·권리·동의·문의 |
| 120 | `/safety/takedown` | 안전 · 게시 중단 | 법률·안전 | 내용·권리·동의·문의 |
| 121 | `/search` | 검색 | 회원·공통 | 정보·탐색·상태·설정 |
| 122 | `/seasons` | 시즌 | 게임·성장 | 진행·선택·보상·기록 |
| 123 | `/shop` | 상점 | 게임·성장 | 카탈로그·상품상세·구매확인·영수증 |
| 124 | `/shop/catalog` | 상점 · 카탈로그 | 게임·성장 | 카탈로그·상품상세·구매확인·영수증 |
| 125 | `/spaces` | 공간 | 게임·성장 | 진행·선택·보상·기록 |
| 126 | `/spaces/real-estate` | 공간 · 부동산 | 게임·성장 | 진행·선택·보상·기록 |
| 127 | `/status` | 상태 | 회원·공통 | 정보·탐색·상태·설정 |
| 128 | `/stocks` | 주식 | 금융·경제 | 종목·호가·관심·주문 확인·체결내역 |
| 129 | `/stocks/[symbol]` | 주식 · 종목 상세 | 금융·경제 | 종목·호가·관심·주문 확인·체결내역 |
| 130 | `/stocks/alerts` | 주식 · 알림 | 금융·경제 | 종목·호가·관심·주문 확인·체결내역 |
| 131 | `/stocks/community` | 주식 · 토론 | 금융·경제 | 종목·호가·관심·주문 확인·체결내역 |
| 132 | `/stocks/compare` | 주식 · 비교 | 금융·경제 | 종목·호가·관심·주문 확인·체결내역 |
| 133 | `/stocks/derivatives` | 주식 · 파생상품 | 금융·경제 | 종목·호가·관심·주문 확인·체결내역 |
| 134 | `/stocks/history` | 주식 · 내역 | 금융·경제 | 종목·호가·관심·주문 확인·체결내역 |
| 135 | `/stocks/league` | 주식 · 리그 | 금융·경제 | 종목·호가·관심·주문 확인·체결내역 |
| 136 | `/stocks/portfolio` | 주식 · 포트폴리오 | 금융·경제 | 종목·호가·관심·주문 확인·체결내역 |
| 137 | `/stocks/watchlist` | 주식 · 관심종목 | 금융·경제 | 종목·호가·관심·주문 확인·체결내역 |
| 138 | `/support` | 고객지원 | 커뮤니티 | 목록·상세·게시/문의·알림·상태 |
| 139 | `/terms` | 이용약관 | 법률·안전 | 내용·권리·동의·문의 |
| 140 | `/tools` | 금융 도구 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 141 | `/tools/capital-gains-tax-calculator` | 금융 도구 · 양도세 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 142 | `/tools/capital-gains-tax-calculator/[preset]` | 금융 도구 · 양도세 계산기 · 프리셋 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 143 | `/tools/compound-calculator` | 금융 도구 · 복리 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 144 | `/tools/compound-calculator/[preset]` | 금융 도구 · 복리 계산기 · 프리셋 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 145 | `/tools/crypto-apy-calculator` | 금융 도구 · 가상자산 수익률 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 146 | `/tools/dividend-tax-calculator` | 금융 도구 · 배당세 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 147 | `/tools/dividend-tax-calculator/[ticker]` | 금융 도구 · 배당세 계산기 · 종목 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 148 | `/tools/farming-calculator` | 금융 도구 · 직업 수익 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 149 | `/tools/farming-calculator/[preset]` | 금융 도구 · 직업 수익 계산기 · 프리셋 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 150 | `/tools/fire-calculator` | 금융 도구 · 경제적 자유 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 151 | `/tools/gift-tax-calculator` | 금융 도구 · 증여세 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 152 | `/tools/gift-tax-calculator/[preset]` | 금융 도구 · 증여세 계산기 · 프리셋 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 153 | `/tools/goal-wealth-calculator` | 금융 도구 · 목표 자산 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 154 | `/tools/isa-calculator` | 금융 도구 · ISA 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 155 | `/tools/isa-calculator/[slug]` | 금융 도구 · ISA 계산기 · 상세 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 156 | `/tools/kimchi-premium-calculator` | 금융 도구 · 김치 프리미엄 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 157 | `/tools/kimchi-premium-calculator/[preset]` | 금융 도구 · 김치 프리미엄 계산기 · 프리셋 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 158 | `/tools/loan-interest-calculator` | 금융 도구 · 대출 이자 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 159 | `/tools/loan-interest-calculator/[preset]` | 금융 도구 · 대출 이자 계산기 · 프리셋 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 160 | `/tools/pension-tax-calculator` | 금융 도구 · 연금 세금 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 161 | `/tools/pension-tax-calculator/[slug]` | 금융 도구 · 연금 세금 계산기 · 상세 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 162 | `/tools/quant-studio` | 금융 도구 · 퀀트 스튜디오 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 163 | `/tools/real-estate-calculator` | 금융 도구 · 부동산 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 164 | `/tools/real-estate-calculator/[preset]` | 금융 도구 · 부동산 계산기 · 프리셋 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 165 | `/tools/retirement-calculator` | 금융 도구 · 은퇴 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 166 | `/tools/retirement-calculator/[slug]` | 금융 도구 · 은퇴 계산기 · 상세 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 167 | `/tools/salary-calculator` | 금융 도구 · 급여 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 168 | `/tools/salary-calculator/[preset]` | 금융 도구 · 급여 계산기 · 프리셋 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 169 | `/tools/stock-calculator` | 금융 도구 · 주식 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 170 | `/tools/stock-calculator/[preset]` | 금융 도구 · 주식 계산기 · 프리셋 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 171 | `/tools/tax-calculator` | 금융 도구 · 세금 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 172 | `/tools/youth-leap-calculator` | 금융 도구 · 청년도약 계산기 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 173 | `/tools/youth-leap-calculator/[preset]` | 금융 도구 · 청년도약 계산기 · 프리셋 | 금융 도구 | 계산기별 입력 조건·실행·결과·가정 |
| 174 | `/treasury` | 국고 | 금융·경제 | 자산·조건·확인·거래·내역 |
| 175 | `/verify-email` | 이메일 확인 | 인증 | 인증·입력 검증·보안 상태 |
| 176 | `/verify-email-change` | 이메일 변경 확인 | 인증 | 인증·입력 검증·보안 상태 |
| 177 | `/wallet` | 지갑 | 금융·경제 | WLD 잔액·송금·받기·거래 기록·영수증 |
| 178 | `/wallet/activity` | 지갑 · 활동 | 금융·경제 | WLD 잔액·송금·받기·거래 기록·영수증 |
| 179 | `/wallet/activity/transactions/[transactionId]` | 지갑 · 활동 · 거래 상세 · 거래 상세 | 금융·경제 | WLD 잔액·송금·받기·거래 기록·영수증 |
| 180 | `/work` | 직업 | 게임·성장 | 직업 8종·선택/전직·업무 수락·완료 제출·급여/EXP·영수증 |

## Required next validation
1. Upload/commit **actual PNG assets** to this branch, retaining v2026.11.18 originals as historical, with hashes and indexed verified links. Until then do not claim GitHub image upload.
2. Compare images element-by-element to every active feature in the integrated master. 180 route file coverage is not full functional completeness. Correct any generic or incomplete flows.
3. Obtain image approval, then implement in isolated Spring MVC+Thymeleaf branch and run exact-SHA Test/API/security/accessibility/zero-downtime release gates. **No Test/Production promotion from this design-only change.**
