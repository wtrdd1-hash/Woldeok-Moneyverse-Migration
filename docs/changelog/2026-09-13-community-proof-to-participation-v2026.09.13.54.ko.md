# 변경기록 — 커뮤니티 증거→참여 성장 v2026.09.13.54

날짜: 2026-09-13
범위: 소비자 성장 기획만
영문 canonical: `docs/changelog/2026-09-13-community-proof-to-participation-v2026.09.13.54.md`

## 추가
- `COMMUNITY_PROOF_TO_PARTICIPATION_GROWTH_SPEC.md` Living 소비자 성장 기획 추가.
- 가장 큰 acquisition/activation 공백을 비회원·첫 방문자에게 보이는 진실한 사회적 증거 부족으로 정의.
- 커뮤니티 증거를 편집된 세계 증거, 집계된 public-safe 활동, opt-in 사용자 산출물, 실시간 참여의 4단계로 정리.
- 첫 30초·첫 3분·첫 세션 목표 추가.
- 관찰자→참여자 canonical funnel과 D1/D3/D7/D14/D30 연속성 추가.
- 활동이 적거나 로비가 비어 있을 때 가짜 동시접속 대신 정직한 비동기 증거를 사용하는 원칙 추가.
- SEO, 공유, 크리에이터/커뮤니티 협업, paid acquisition의 소비자 성장 기준 추가.
- 가짜 사용자·메시지·부풀린 활동량·금융성과 후기 등 인위적 social proof 금지.
- 괴롭힘/doxxing, 피싱/악성링크, 공개/비공개 누출, 봇·스팸·astroturfing, 미성년자 위험을 보안·개인정보 guardrail로 추가.
- retention-safe monetization 순서, 5개 실험, acquisition/activation/retention/viral/trust KPI 추가.

## 리서치 근거
직접채택:
- Discord 2026-08-20: discovery를 노출량이 아니라 실제 플레이·리텐션으로 평가하고 사회적 맥락을 참여로 연결.
- Reddit Verified Profiles 2026-07-09 업데이트: 사칭 위험이 있는 순간에는 공식/검증 정체성 신호가 중요.
- Google Search Central UGC 스팸 방지 가이드: abuse policy, 신고, 스팸계정 대응을 UGC 확장의 전제조건으로 사용.
- Naver Search Advisor 최신 가이드: 사용자 가치 우선, 색인/비색인 경계, 저품질 대량생성·사용자 혼동·피싱 방지.

참고만:
- Reddit 2026-06-29 People Are The Best: 진짜 인간 대화가 브랜드/발견 자산이 될 수 있다는 방향.
- Roblox 2026-01-07 연령 기반 채팅 안전 업데이트: 다층·연령 인지 안전 방향. 얼굴 연령추정 자체는 채택하지 않음.

## Runtime audit
공개 서비스 검증 가능.
확인 사항:
- 홈과 로비 정상 접근;
- game-only 고지 존재;
- 로비에서 비밀번호·인증코드·실제 금융정보·주소·연락처 게시 금지 안내;
- 공개 로비가 조용/비어 보일 수 있으며 메시지 전송은 로그인 필요;
- 월간 소식과 `/announcements`는 아직 비어 있음;
- 공개면에는 이미 스폰서 영역 존재;
- 약관은 피싱·사칭·악성코드·자동화 악용을 금지;
- 개인정보처리방침은 광고를 검토된 공개면으로 제한하고 경제활동·잔액·거래·취향을 광고 타기팅에 제공하지 않는다고 명시.

## 유지한 경계
- 런타임 코드/API/DB/인증/인프라/보안 아키텍처 변경 없음.
- 기존 인증/세션/RBAC/원장/보안 경계 유지.
- WLD/WDX는 virtual/simulated/game-only 유지.
- 개인화 금융·보안·사적 관계 데이터는 기본 비공개.
- 이 문서만으로 경제적 referral reward나 공개 UGC 확대를 승인하지 않음.

## 다음 우선순위
`공개 증거 → 30~90초 관찰 → 맥락형 행동 하나 → 필요 시 가입 → 첫 기여/가치 → D1 → D7`을 먼저 검증하고, 그 전에는 공개 UGC·알림량·광고 인벤토리·개인화 공개 피드·경제적 referral incentive를 확대하지 않는다.