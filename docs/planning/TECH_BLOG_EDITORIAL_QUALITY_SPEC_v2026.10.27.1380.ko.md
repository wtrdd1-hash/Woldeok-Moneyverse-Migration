# 기술·개발 블로그 전문성 및 자동 편집 품질 개편안 — v2026.10.27.1380

**상태: APPROVED REQUEST / PLANNING ONLY / 미구현 / 미배포**
**범위:** TECH(핀테크·소프트웨어 공학) 글 생성·출처·본문·위젯·검증·정정. 금융교육 카테고리의 유효한 복리 계산기 기능을 없애는 계획이 아니다. 기존 공개글 자동 비공개 금지(v1108)를 유지한다.
**우선순위:** 통합 마스터 > AI 블로그 검증/발행 명세(v975) > 국가별 즉시발행/무자동비공개 최신 정책(v1107/v1108) > 이 문서의 TECH 특화 품질 규칙. 플랫폼 출판 계약·보안·금융 릴리스 게이트를 완화하지 않는다.

## 1. 2026-10-27 신고 사례 및 확인된 소스 원인

사례 제목: `[AI 테크칼럼] ... 분산 원장 무결성과 BigInt 정수 회계 아키텍처: 부동소수점 오차 제로화 설계 (대한민국 에디션)`.

| 증상 / 영향 | 소스 근거(당시 origin/main 59cdc2e0) | 판정 |
| --- | --- | --- |
| 개발 글 중간에 복리 슬라이더 삽입 | `frontend/src/app/blog/[slug]/blog-post-client.tsx`: Markdown block `idx===1`에서 카테고리 확인 없이 `BlogInlineCalculator` 삽입 | 재현 가능한 렌더링 결함 |
| TECH 주제 자체가 복리 계산기로 연결 | `frontend/src/app/blog/blog-data.ts`의 `TOPIC_TEMPLATES` TECH BigInt 정의에 `calculatorHref:'/tools/compound-calculator'` 지정 | 생성 설계 결함 |
| 기술 제목과 본문이 불일치 | 동일 파일 `generatedContent`는 모든 카테고리에 거시경제 표, 개인 투자/복리 문장, AI 포트폴리오·가상 주식 CTA를 재사용 | 범용 금융 템플릿의 TECH 유출 |
| 한국 금융기관을 TECH 근거처럼 표시 | 동일 파일은 모든 기사 참고문헌 끝에 FRED·Yahoo·한국은행 ECOS를 붙임. 국가 프로필에는 `한국금융연구원(KIF) & KDI`가 설정되어 있으나 **현재 생성 문자열에서 이 필드를 실제 출력하는지는 별개이며, 직접 인용 출처라고 단정할 수 없다** | 출처-주장 연결 누락 |
| 글 분량·깊이 부족 | 공통 문단 중심, TECH 전용 재현 예제/DDL/단위·통합 테스트/실패 모드 부재. `readTimeMinutes:6` 고정 | 기술적 완결성 결여 |
| 사실 아닌 '실측' 가능성 | TECH 템플릿에 100만/1조 트랜잭션 및 +42.8원 불일치 등 증빙 없는 수치 문자열. `views:Math.floor(Math.random()*80)+20` | 수치·조회수 신뢰성 P0 |
| 발행 경계 위험 | `publishBlogPost(...)` → `addBlogPost(...,{bypassEditorialReview:true})`; `/api/blog/generate` 경로에서 발행 호출. 반면 다른 개발자 v1102 격리 브랜치에는 503 편집 게이트 수정 존재 | 실제 운영 반영 여부 별도 증명 필요 |

**신뢰성 주의:** 스크린샷은 실제 표시 증거이고 위 경로는 `origin/main` 소스 증거다. 운영 실행 버전·게시물 저장소 해시·공개 URL·자동발행 활성 여부를 이 문서만으로 동일하다고 주장하지 않는다. 기존 데이터의 변경·삭제는 하지 않는다.

## 2. 콘텐츠 유형 분리 — 생성기부터 화면까지

| 계약 | `TECH` 개발·소프트웨어 공학 | `COMPOUND/TAX/STOCKS/WEALTH/MACRO` 금융·경제교육 |
| --- | --- | --- |
| 독자 질문 | 설계 결정, 알고리즘, DB 제약, 성능, 디버깅, 재현 | 제도, 금융 수학, 생활 금융 판단을 돕는 교육 |
| 필수 본문 | 문제·환경 → 설계 대안 → 코드/DDL → 검증 시나리오 → 실패 모드 → 한계 → 재현법 → 기술 문헌 | 대상·법역·시점 → 설명·계산 가정 → 예제 → 공식 근거 → 위험/예외 |
| 참고문헌 | 언어·런타임·DB·표준·공식 API 문서와 기술 논문, 검증된 벤치마크 | 해당 국가 규제기관, 중앙은행, 공식 정책·통계 원문 |
| 기사 내 위젯 | **기본 NONE**. 직접 연관된 안전한 코드 실행/원장 균형 시각화/성능 도식만 승인 후 허용 | 공식·가정·수치가 일치하는 승인된 계산기만 허용 |
| 하단 제안 | 관련 개발 문서/아키텍처/소스 저장소·테스트 벡터 | 관련 계산기·금융 가이드(자율적 선택) |
| 무관한 블록 | 복리 예금·원금 슬라이더, 포트폴리오 광고형 진단, 임의 '실시간 시장 펄스' | 주제와 직접 연결 안 된 TECH 내부 구현 영상/코드 |

**새 타입(설계):** `editorialVertical: ENGINEERING|FINANCIAL_EDUCATION`, `subTopic`, `primaryIntent`, `evidenceRefs[]`, `claimRefs[]`, `contentDepthChecklist`, `embeds: {id,kind,anchor,reason,evidenceVersion}[]`. 기존 `category`는 하위 호환 유지. `relatedCalculatorHref`는 더 이상 모든 글의 필수 속성이 아니며 TECH에는 기본 `null`/미지정. 사전 승인 없는 Markdown/AI JSX·스크립트 실행 불가.

**한 국가 TECH 글**: 독자의 언어·코드/DB 버전·법규에 실제 차이가 없으면 국기 및 '대한민국 에디션' 제목을 자동 삽입하지 않는다. v1107의 현지 독립 원어 정책은 금융 제도별 사실에 적용하며, 공통 기술 주제를 국가 수만큼 단순 복제하지 않는다. 나라별 실제 기술 요구(예: 결제표준/데이터 보존법)가 있는 경우 법역별 차이를 확인한 뒤 현지판 제작. 구형 KR/US/JP/VN과 새 정책 KR/US/JP/CN의 불일치는 기존 데이터를 조용히 치환하지 말고 이행 맵·라우트/SEO 계약 검토 후 순방향 처리.

## 3. 개발 기사 편집 구조 및 실제 콘텐츠 깊이

**TECH 심층 기사(가이드 템플릿):**
1. 실제 해결할 문제, 대상 개발자, 사용한 런타임·DB·라이브러리의 **확인한 버전**과 시스템 경계.
2. 오류 재현: 실패하는 최소 코드와 실행 명령, 예상/실제 출력. 예: JS 부동소수점 `0.1+0.2`, 잘못된 소수 입력, 소수 단위 규칙.
3. 대안 비교: 정수 최소화폐단위, `BigInt`, PostgreSQL `numeric`, Decimal 라이브러리의 정확도·범위·직렬화·비용. JavaScript `BigInt`와 PostgreSQL `bigint`의 범위가 같다고 착각하지 않는다.
4. 보안·무결성: 원장 이중분개 `sum(debit)=sum(credit)` 불변식, DB 트랜잭션·중복 요청 멱등성·락 순서·동시성·감사·복구·대조(reconciliation). **BigInt만으로 무결성·분산합의·부정거래 방지는 보장되지 않음**.
5. 정합 코드: TypeScript 입력 파서/화폐 스케일·반올림·JSON 직렬화·경계값/음수/오버플로; DDL·트랜잭션 예시(실제 제품 코드와 공개 예제 구분).
6. 검증: 단위·속성 기반·동시성·DB 롤백·중복/재전송·백업 복원; 재현 가능한 fixture 및 PASS/FAIL 로그. 실패 사례도 제시.
7. 벤치마크가 있다면 실행 환경/날짜/버전/프로토콜/반복 횟수/원자료·스크립트/통계 요약/한계. 없으면 **성능 숫자·실측·완벽·100%·제로오차 '증명' 표현 금지**.
8. 설계의 트레이드오프, 언제 선택하지 말아야 하는지, FAQ(실제 독자 질문), 버전·발행·정정 이력, 각 주장 가까이 있는 참고문헌.

**분량 정책:** TECH 심층 가이드 편집 목표는 **국문 본문 약 3,000–6,000자 또는 해당 주제를 충분히 재현·설명할 수 있는 분량**(코드/표 제외)이고 실제 소요시간은 본문 기준으로 산출한다. 고정 6분과 마케팅 문단으로 채우기 금지. Google은 검색순위에 유리한 정해진 글자 수를 권장하지 않으므로 글자 수는 **경고·편집 점검 지표**이지 단독 자동 게시 여부의 결정자가 아니다. 짧은 기술 노트는 `TECH_NOTE`로 별도 라벨을 붙이고 제목에 '심층'을 사용하지 않는다.

## 4. 출처·실험·숫자 증거 게이트

- **출처의 단위는 기관이 아니라 주장이다.** `claim_id → title, authority/domain, exact_url, document_version, publication_date, accessed_at, quoted_scope, supporting_excerpt/hash, confidence`를 저장. 제목만 유명한 학술논문을 붙이거나 카테고리/국가에 따라 은행 출처를 자동 삽입하지 않는다.
- TECH 권장 1차 자료: TC39/ECMAScript·MDN BigInt, PostgreSQL 공식 수치형/트랜잭션 문서, IEEE 754의 정식 표준/정확한 서지정보, ACM 등 원 논문, 실제 구현 및 테스트 자료. 비슷한 주제의 논문을 엉뚱한 저널로 표기하는 교차오류를 차단한다. 금리·통계는 TECH 특정 주장에 직접 필요하고 기준시각이 검증된 경우에만 예외적으로 인용.
- **실측 숫자**는 `evidence_id`, 재현 스크립트+버전+SHA, 환경, 실행일·반복 횟수, 원시 데이터 위치, 결과 검증값, 검토 담당자 없이 게시 불가. 확보하지 못한 수치는 삭제하거나 `가상 예시`로 뚜렷하게 바꾸고 통계적 우월·실측으로 포장하지 않는다. 실제 기록 없는 페이지 조회수는 숨긴다(`Math.random()` 금지).
- 링크는 유효 HTTP URL만 받으며 DOI/표준번호/제목·기관 일치, 시간 경과·라이선스·접근성을 자동 확인하고 검증하지 못한 핵심 주장은 `REVIEW_REQUIRED`로 보류. 외부 출처 내용은 프롬프트 명령으로 신뢰하지 않는다.
- 독립 품질 검사는 단일 AI 자기검수로 대체하지 않는다. `scope_match`, `source_alignment`, `numeric_evidence`, `reproducibility`, `technical_completeness`, `locale_integrity` 각각 서버에서 평가·차단 사유를 기록한다. 정량 평점은 참고이며 **위젯 불일치/가짜 실측/무출처 핵심 주장**은 하드 실패.

## 5. 위젯 레지스트리·렌더링 계약

- 현재 `idx===1` 계산기 주입을 제거하고, 게시에 **검증된 anchor + widget_id**가 있을 때만 영역별 안전한 컴포넌트를 렌더링한다. 기본값 NONE; TECH는 복리/세금/대출 계산기 자동 삽입 금지.
- 예: `TECH_LEDGER_BALANCE_DEMO`(합계 불변식 인터랙티브 교육), `TECH_FLOAT_DECIMAL_EXAMPLE`(입력 범위 한정), `TECH_WS_LATENCY_CHART`(명시된 재현 데이터 시각화). 구현 전 별도 보안검토/테스트 필수. 공개 글이 실행 가능한 불신 코드의 전송 통로가 되면 안 된다.
- 기술 실습은 서버 권한·실계정·지갑·거래·DB 쓰기 접근 불가. 교육용 로컬 샘플만. 키보드·터치·320px~모바일 확대 대응, 가로 스크롤/overflow 검증. 배지 `Live`는 실시간 소스 검증 전 표시 불가.
- 금융 기사도 카테고리 이름만으로 위젯 자동 삽입하지 않으며 개별 글에서 `intent, formula_version, jurisdiction` 일치 시에만 허용. 무관한 제휴/전환/주식 CTA는 숨김.

## 6. 발행 처리·운영 글 정정

1. 모든 새 TECH 주제는 `TOPIC → EVIDENCE → DRAFT → TOPIC_SAFETY/TECH_QA → (GREEN validated auto-publish, otherwise editor review) → PUBLISHED → 24h review`. 새 발행기는 기존 v1107/v1108 계약과 같은 멱등 DB 영수증·사후 검토를 써야 함.
2. **TECH 자동 GREEN**은 수치·출처·코드가 실제 검증되고 금융 고위험 주장을 포함하지 않으며 재현 및 분류 검사가 완료된 경우에만 가능. 핵심 근거가 없거나 위험 모호하면 `AMBER/REVIEW_REQUIRED`, 근거 없는 실측·허위 통계는 `RED`. 자격만으로 구형 `/api/blog/generate` 파일발행 우회 허용 안 함.
3. 현재 게시물: 전체 `TECH` 글에 `CALCULATOR_MISMATCH / SOURCE_IRRELEVANT / UNVERIFIED_BENCHMARK / TEMPLATE_CONTAMINATION / DEPTH_INSUFFICIENT / FAKE_METRIC` 비공개 감사 **라벨**을 부여하여 관리자가 확인. 먼저 해당 BigInt 글을 가장 높은 정정 우선순위로 지정. 기존 공개 URL·원본·증거 유지.
4. 적법 권한의 관리자가 **수동으로만** 본문 기술 재작성·출처 교정·위젯 제거·보이는 정정 기록 적용 또는 철회. 검토 24시간 만료만으로 비공개/검색제외/삭제하지 않음. 정확 승인된 개정본 해시와 실제 발행 영수증을 요구. 기술 정정 전에는 검증되지 않은 새 콘텐츠를 추가 생성하지 않음.
5. 검색: 글 내용 실질 변경 시에만 `dateModified` 갱신, 기존 canonical 유지; 허위 SEO 실적/검색량 금지. 실제 GSC 색인·CTR은 수집된 데이터와 구분.

## 7. 코드변경 대상과 QA 테스트(후속 개발 작업)

| 작업 ID | 우선 | 변경 후보 | 검증 가능한 수용 조건 |
| --- | --- | --- | --- |
| `BLOGTECH-01` | P0 | `blog-post-client.tsx`, `blog-inline-calculator.tsx` | TECH 글 100%에서 관련없는 복리 위젯 0, FINANCE 관련 글은 적법 위젯만 |
| `BLOGTECH-02` | P0 | `blog-data.ts` 범용 `generatedContent`/TECH 템플릿 | TECH 제목·H2·본문·결론·CTA 주제 일치; 시장 펄스/복리 광고 0 |
| `BLOGTECH-03` | P0 | 주장·출처·실험 증빙 스키마/검증 | 가짜 1조 회·42.8원 실측, 무관한 ECOS 인용, 랜덤 조회수 자동 통과 0 |
| `BLOGTECH-04` | P0 | `api/blog/generate` 및 구형 bypass 경계 | 자격만으로 파일 발행 불가, v1102 변경과 충돌 방지; 새 GREEN 검증 영수증 경로만 발행 |
| `BLOGTECH-05` | P1 | TECH 작성·QA/템플릿 엔진 분리 | BigInt 글 코드+DDL+실패/복구 테스트+재현 환경을 포함; 얕은 템플릿 판별 |
| `BLOGTECH-06` | P1 | 관리자 리뷰/정정과 레거시 전수감사 | 공개글을 자동 철회하지 않고 관리자 정정 영수증/감사 이력, 원본 URL 유지 |
| `BLOGTECH-07` | P1 | 국가·다국어 TECH 메타데이터 | 기술 현지판 불필요한 국기·'KR 에디션' 강제 0; 나라별 독립 내용과 hreflang 정합 |
| `BLOGTECH-08` | P1 | 320/360/375/768/1024 모바일 QA, 접근성·SEO | 기술 데모는 좁은 화면에서 오버플로/깨진 Live 배지 0, 코드 블록 가로 스크롤 가능 |

**회귀 테스트 필수:** 동일 BigInt TECH fixture에서 위젯/금융 문구/무관한 출처가 0개인지 스냅샷이 아닌 의미 기반 검사. 금융교육 복리 글에는 재현된 계산기 결과가 남는지 확인. 본문 3문단짜리 '심층' 글, 허위 DOI, 관련 없는 DOI, 수치에 근거 URL 없거나 단위가 다름, `Math.random()` 조회수, AI 작성이 곧 자동 승인, 재시도 중복 게시, 사후검토 24/48시간 초과에 따른 자동 비공개를 모두 부정 테스트. 실제 출처 접근 실패와 DB/AI 장애 시 기존 공개글 정상 조회. 한글·영문·일본어·중국어 콘텐츠의 독립 검증 및 모바일 실사용 브라우저 QA.

## 8. 개발 순서, 협업 충돌, 배포 게이트

- `v1380.1` 원본·게시 데이터와 독립 출판 게이트 v1102 비교 및 기존 TECH 전수 읽기 감사(데이터 변경 없음).
- `v1380.2` 블로그 타입·주제별 생성기 분리, 랜덤 메트릭/무검증 실측 차단 단위 테스트.
- `v1380.3` 근거와 재현 증적 게이트·위젯 Registry/렌더러 조건화.
- `v1380.4` TECH BigInt 고품질 시범 원고 1건 및 관리자의 **수동** 공개 개정 승인 흐름.
- `v1380.5` 4언어·모바일·관리자·SEO·기존 금융교육 위젯 회귀, 정식 Test 백엔드/API/DB·세션·금융 무결성 게이트.
- `v1380.6` CI·PR + 정확 SHA Test와 백업/회복·브랜치 간 안전 병합 → 사용자 승인된 무중단 운영 승격 및 실제 서비스 검증.

**병행 작업 보호:** `auto/hourly-c-blog-editorial-gate-v1102-20261027-1945`가 기존 무검증 발행 차단을 다루므로 동일 파일을 경쟁 수정하지 않는다. Gemini·시간별 개발 A/B/C와 협업하여 소유 파일·테스트 케이스를 분리하고 통합 전 `origin/main`을 다시 조회한다. 앱 수정은 신규 독립 개발 브랜치에서만 수행한다.

**배포 진실성:** 이 `v1380`은 **기획 문서**이며 위 테스트 PASS/공식 Test/운영 승격/기존 글 수정이 완료됐다는 의미가 아니다. 부실 글 자동 삭제도 하지 않는다.

## 9. 참고 자료(규범 자료이지 사건 실측값 아님)

- Google Search Central: [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) — 독창적 분석·완결성·정확성; 검색 순위용 고정 글자 수 지침 없음.
- PostgreSQL: [Numeric Types](https://www.postgresql.org/docs/current/datatype-numeric.html) — `numeric`의 정밀도와 `bigint`의 64비트 범위를 구분.
- JavaScript: [MDN BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) — JS 정수 연산 특성과 `Number` 혼합/직렬화 제약.
- 별도 승인 시 IEEE 754 원문·Goldberg (1991, **ACM Computing Surveys**)의 정확한 서지·실제 소스 링크를 기사 특정 주장에 연결한다.
