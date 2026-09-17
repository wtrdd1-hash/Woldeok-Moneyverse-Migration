# 월덕 머니버스 — 국제 규정 준수 근거 매트릭스

> 버전: v2026.09.17.177
> 기준일: 2026-09-17
> 목적: 제품기획용 권위자료 우선 조사 색인, 법률자문 아님
> 영문 기준 문서: [INTERNATIONAL_COMPLIANCE_REFERENCE_MATRIX.md](INTERNATIONAL_COMPLIANCE_REFERENCE_MATRIX.md)

## 조사 원칙

검색 결과 수가 많다는 사실을 법적 품질로 보지 않는다. 중복, SEO 요약, 오래된 블로그, 출처 없는 커뮤니티 글은 출시게이트가 아니다. 현행 법령/규제기관/스토어 정책을 1순위, 판례를 2순위, 공중보건·동료심사 연구를 안전설계 참고로 사용한다.

## 핵심 근거와 제품 반영

| 권역 | 권위자료 | 제품 반영 |
| --- | --- | --- |
| Google 국제 SEO | Search Central 다국어/다지역, hreflang, locale-adaptive 문서 | 언어별 URL, self-canonical, 상호 hreflang, x-default, 강제 IP/언어 redirect 금지 |
| 대한민국 게임 | 게임산업법/GRAC + Google Play/Apple 한국 등급정책 | 카지노는 GRAC/19+ 정책/채널 증거 전 차단, 게임결과 환전경로 금지 |
| 대한민국 결제 | 전자상거래법 제13조 제6항/시행령 제20조의2 + 공정위 | 정기결제 가격인상·무료→유료 전환에 현행 30일 전 동의/고지 정책 |
| 대한민국 광고 | 개인정보위 행태정보 정책 | 맥락광고 우선, 개인화는 실제 광고스택과 처리근거 검토 후 |
| 미국 아동 | FTC COPPA | 전용 아동서비스 전 known-under-13 제외 |
| 미국 Washington | RCW 9.46.0285 + `Kater v. Churchill Downs` | 현금화가 없어도 플레이권 연장 크레딧이 가치로 판단될 수 있어 WA 카지노 기본 차단 |
| EEA | DSA + GDPR 아동정보 + Consumer Rights Directive | 미성년자 타게팅광고 금지, dark pattern 금지, 회원국별 13~16 동의연령, 디지털계약 사전정보/철회 |
| 독일 | JuSchG §10b/§14a + USK 운용 | 도박유사 메커니즘·구매압박 등 이용위험이 연령등급에 영향을 줄 수 있어 국가별 청소년보호/등급 overlay 필요 |
| 프랑스 | ANJ | 실제현금 온라인카지노는 강하게 금지되는 경계이므로 simulated/no-cash 기능도 실제현금·추천 루프와 완전 분리하고 현지검토 전 차단 |
| 스페인 | DGOJ loot-box 자료 + Juego Seguro 2026–2030 | 비디오게임 랜덤보상과 도박의 경계를 규제기관이 지속 관찰하므로 유료 랜덤아이템 BLOCK, 카지노 현지검토 필요 |
| 영국 | Gambling Commission 가상재화/social gaming/RTS | 교환·거래 가능한 아이템 가치 경계 차단, 강한 확률게임 안전 UX 채택 |
| 호주 | Australian Classification | simulated gambling R18+ 최소등급, 미등급/연령증거 없으면 차단 |
| 일본 | FSA Payment Services Act 자료 + PPC APPI Q&A | 현금구매 게임머니 도입 시 선불지급수단 검토, 아동정보 별도 검토 |
| 브라질 | 연방 2026 디지털 아동보호/분류 규정 | 미성년자·loot-box·과몰입 설계 포함 현지 검토 후 출시 |
| CA/SG/TW/CN | 이번 회차 launch-grade 법률조사 미완료 | 카지노/규제 유료화는 REVIEW_REQUIRED/BLOCK 유지 |

## 원문 URL 색인

세부 URL은 영문 기준 문서에 기록한다. 주요 원문은 Google Search Central, law.go.kr, GRAC/스토어 정책, PIPC/FTC, EU Commission, UK Gambling Commission, Washington Legislature/Ninth Circuit, FTC COPPA, Australian Classification, Japan FSA/PPC, Brazil Planalto다.

## 출시 증거 규칙

고위험 기능을 `ALLOW`로 바꾸려면 URL이 있다는 것만으로 부족하다. 확인일, 적용 국가/주/채널, 실제 제품 구조, 검토 owner, 만료/재검토일, 필요한 등급번호/인증, exact policy version을 함께 저장한다.
