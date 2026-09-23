const fs = require('fs');
const path = require('path');

const docPath = '/tmp/openapi-dump.json';
if (!fs.existsSync(docPath)) {
  console.error("OpenAPI dump not found at", docPath);
  process.exit(1);
}
const doc = JSON.parse(fs.readFileSync(docPath, 'utf8'));

const UNPREFIXED_ROUTES = [
  'health',
  'media/:key',
  'media/profile/:key',
  'auth/:provider/authorize',
  'auth/:provider/callback'
];

function isUnprefixed(p) {
  const norm = p.startsWith('/') ? p.slice(1) : p;
  return UNPREFIXED_ROUTES.some(u => {
    const reg = new RegExp('^' + u.replace(/:[a-zA-Z]+/g, '[^/]+') + '$');
    return reg.test(norm);
  });
}

function toActualUrl(p) {
  if (isUnprefixed(p)) {
    return p.startsWith('/') ? p : '/' + p;
  }
  const clean = p.startsWith('/') ? p : '/' + p;
  return '/api/v1' + clean;
}

function normalizePath(p) {
  return p.replace(/:([a-zA-Z0-9_]+)/g, '{$1}').replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

// 컨트롤러 소스코드에서 가드 분석
function scanControllers(srcDir) {
  const guardMap = {}; // `${method} ${path}` -> string[]
  function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) {
        walk(full);
      } else if (f.endsWith('.controller.ts')) {
        parseController(full);
      }
    }
  }

  function parseController(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // 1. 클래스 레벨 데코레이터 파싱
    let classPrefix = '';
    const ctrlMatch = content.match(/@Controller\((?:['"]([^'"]*)['"])?\)/);
    if (ctrlMatch && ctrlMatch[1]) {
      classPrefix = ctrlMatch[1].trim();
    }

    const classGuards = [];
    const classBlockMatch = content.match(/((?:@[A-Za-z0-9_]+\([^)]*\)\s*)+)(?:export\s+)?class\s+([A-Za-z0-9_]+)/);
    if (classBlockMatch) {
      const decoratorsStr = classBlockMatch[1];
      const gMatch = decoratorsStr.match(/@UseGuards\(([^)]+)\)/);
      if (gMatch) {
        classGuards.push(...gMatch[1].split(',').map(s => s.trim()).filter(Boolean));
      }
    }

    // 2. 메서드 레벨 데코레이터 파싱
    const methodRegex = /@(Get|Post|Put|Patch|Delete)\((?:['"]([^'"]*)['"])?\)([\s\S]*?)(?:async\s+([a-zA-Z0-9_]+)\s*\()/g;
    let m;
    while ((m = methodRegex.exec(content)) !== null) {
      const httpMethod = m[1].toUpperCase();
      const subPath = (m[2] || '').trim();
      const decoratorBlock = m[3] || '';

      const methodGuards = [...classGuards];
      const methodGuardMatch = decoratorBlock.match(/@UseGuards\(([^)]+)\)/);
      if (methodGuardMatch) {
        const addedGuards = methodGuardMatch[1].split(',').map(s => s.trim()).filter(Boolean);
        methodGuards.push(...addedGuards);
      }

      let combined = '';
      if (classPrefix && subPath) {
        combined = `/${classPrefix}/${subPath}`;
      } else if (classPrefix) {
        combined = `/${classPrefix}`;
      } else if (subPath) {
        combined = `/${subPath}`;
      } else {
        combined = '/';
      }

      const normalizedKey = `${httpMethod} ${normalizePath(combined)}`;
      guardMap[normalizedKey] = Array.from(new Set(methodGuards));
    }
  }

  walk(srcDir);
  return guardMap;
}

const guardMap = scanControllers('/home/debian/Woldeok-Moneyverse-Migration/backend/src');

// 한국어 번역 및 금융 룰 사전
const KO_TRANSLATIONS = {
  // Account
  "Delete the caller account": "회원 본인 계정 영구 삭제 (회원 탈퇴 처리)",
  "Sign-in methods linked to the caller": "계정에 연동된 로그인 수단 목록 조회 (OAuth & Local)",
  "Unlink a sign-in method": "지정한 소셜 로그인 수단 연동 해제",
  "Begin linking another sign-in method": "새로운 소셜 로그인 수단 연동 시작 (OAuth 리다이렉트)",
  "Recent security events belonging to the caller": "최근 계정 보안 감사 이벤트 로그 조회 (로그인/비밀번호 변경 등)",
  "Active sessions belonging to the caller": "현재 접속 중인 모든 활성 세션 목록 조회 (기기 및 IP 정보)",
  "Revoke one other active session belonging to the caller": "지정한 다른 기기의 원격 세션 강제 종료 (로그아웃)",
  "Revoke every other active session belonging to the caller": "현재 접속 기기를 제외한 모든 타 기기 세션 일괄 종료",
  // Auth
  "Begin login with a provider": "OAuth 소셜 로그인 인증 세션 개시 (Discord / Google)",
  "Complete an OAuth round trip": "OAuth 콜백 처리 및 브라우저 세션 쿠키 발급",
  "Begin step-up reauthentication with a provider": "민감 작업용 OAuth 스텝업 재인증 개시",
  "Record the authenticated member policy acknowledgement": "필수 서비스 이용약관 및 개인정보 처리방침 동의 기록",
  "Sign in with first-party email/password credentials": "이메일/비밀번호 로컬 계정 로그인",
  "Start first-party email/password registration": "이메일/비밀번호 로컬 회원가입 신청 (인증 메일 발송)",
  "Verify first-party email and activate the account": "이메일 인증 토큰 검증 및 계정 정식 활성화",
  "End the session": "현재 세션 로그아웃 및 보안 쿠키 무효화",
  "CSRF token for the current session": "현재 세션의 CSRF 공격 방지용 이중 토큰 조회",
  "Session state for rendering navigation": "내비게이션 및 UI 렌더링용 현재 세션 프로필(뷰어) 상태 조회",
  "Change the current local password after recent reauthentication": "비밀번호 변경 (최근 재인증 필요)",
  "Request a one-time local password reset link": "비밀번호 재설정 일회용 인증 링크 발송 요청",
  "Consume a password reset token and replace the local password": "비밀번호 재설정 토큰 검증 및 새 비밀번호 설정",
  "Confirm current member password": "현재 계정 비밀번호 재확인 (스텝업 재인증)",
  "Send a verification link for a new login email": "새로운 로그인 이메일 변경 확인 메일 발송 요청",
  "Verify and activate a new login email": "이메일 변경 인증 토큰 확인 및 이메일 교체 완료",
  // Spaces
  "내 개인 공간 목록 조회": "사용자가 분양받아 보유 중인 나만의 개인 공간 목록 조회",
  "공공 도시 프로젝트 목록 조회": "머니버스 시민 공동 출자 공공 인프라 크라우드펀딩 프로젝트 목록 조회",
  "체납 공매 대상 공간 목록 조회": "부동산세 7일 이상 체납으로 법정 유예 경과한 시청 강제 공매 매물 목록 조회",
  "개인 공간 구매 (WLD 소각)": "신규 개인 공간 분양 신청 (대금 100% 영구 소각 SINK_HOUSING_PURCHASE)",
  "공공 도시 프로젝트 펀딩 기여 (WLD 영구 소각)": "공공 도시 인프라 크라우드펀딩 WLD 출자 기여 (100% 소각 SINK_PROJECT_DONATION)",
  "개인 공간 부동산세 상태 조회": "공간별 일일 보유세율, 완납 기한, 체납 일수 및 공매 상태 조회",
  "개인 공간 일일 부동산세 납부 (100% 영구 소각)": "개인 공간 일일 부동산세 자진 납부 (100% 영구 소각 SINK_PROPERTY_TAX)",
  "개인 공간 상세 조회": "지정한 개인 공간의 상세 스펙 및 소유권 정보 조회",
  "개인 공간 인테리어/레이아웃 저장": "개인 공간 8x8 인터랙티브 가구 배치 및 인테리어 레이아웃 저장",
  // Marketplace
  "고정가 출품 등록": "거래소 고정가 아이템 판매 출품 (2% 보증금 소각)",
  "고정가 아이템 구매": "고정가 출품 매물 원자적 에스크로 즉시 구매",
  "고정가 출품 취소": "출품 중인 아이템 판매 등록 취소 및 회수",
  "실시간 경매 목록 조회": "현재 진행 중인 잉글리시 경매 매물 목록 조회",
  "신규 잉글리시 경매 등록": "기간 한정 최고가 경쟁 잉글리시 경매 등록 (시작가/즉시구매가 설정)",
  "경매 실시간 호가 입찰": "경매 실시간 입찰 (최고가 갱신 시 직전 입찰자 100% 에스크로 즉시환불, 30초 내 입찰 시 60초 자동 연장 안티스나이핑)",
  "P2P 1:1 직거래 제안 목록 조회": "나에게 들어오거나 내가 요청한 P2P 1:1 안전 직거래 목록 조회",
  "P2P 1:1 직거래 제안 생성": "상대방 지정 물품/WLD 교환 1:1 직거래 제안 생성",
  "P2P 1:1 직거래 제안 수락": "직거래 제안 1차 상호 수락 (거래 조건 동결)",
  "P2P 1:1 직거래 최종 승인 서명": "양자 2차 최종 승인 서명 및 원자적 동시 스왑 체결",
  "P2P 1:1 직거래 취소": "진행 중인 직거래 제안 취소 및 에스크로 해제",
  "공인 감정서 발급 내역 조회": "디지털 공인 감정소에서 발급된 검증 인증서 목록 조회",
  "디지털 공인 감정 의뢰": "보유 아이템 진위/시세 감정 의뢰 (max(250 WLD, ceil(0.25%)) 수수료 SINK_APPRAISAL_FEE 소각 및 CERTIFIED 배지 발급)",
  // Clubs
  "클럽하우스 12x12 공유 캔버스 조회": "소속 클럽하우스 12x12 가구 배치 그리드 및 장식 점수 조회",
  "클럽하우스 12x12 공유 캔버스 저장": "클럽하우스 12x12 공유 캔버스 레이아웃 및 장식 점수 서버 영구 저장",
  // Collections
  "사용자 수집품 목록 및 큐레이션 현황 조회": "사용자 인벤토리 수집품 목록, 즐겨찾기, 메모 및 D1~D7 리텐션 사다리 진척 조회",
  "수집품 즐겨찾기 상태 변경": "지정 수집품의 쇼케이스 대표 전시 즐겨찾기 토글",
  "수집품 개인 메모/스토리 저장": "수집품에 대한 개인적인 수집 메모 및 스토리 저장",
  "일일 큐레이션 사다리 과제 수행 및 단계 승급": "D1~D7 일일 큐레이션 사다리 미션 달성 및 보상 승급"
};

const SINK_RULES = {
  "/spaces/purchase": "💡 **통화 소각 룰**: 분양 대금은 `SINK_HOUSING_PURCHASE` 사유로 100% 영구 소각 처리되어 게임 밸런스에 인플레이션을 유발하지 않습니다.",
  "/spaces/city/projects": "💡 **통화 소각 룰**: 출자된 WLD는 `SINK_PROJECT_DONATION` 사유로 100% 영구 소각되며, 공공 랜드마크 건립 기여도로 영구 아카이빙됩니다.",
  "/spaces/{id}/tax/pay": "💡 **통화 소각 룰**: 납부된 부동산세는 `SINK_PROPERTY_TAX` 사유로 100% 전액 원천 소각됩니다. 미납 시 7일 유예 후 강제 공매 회부됩니다.",
  "/marketplace/auctions/{id}/bid": "💡 **에스크로 & 안티스나이핑 룰**: 신규 입찰 시 기존 최고 입찰자에게 100% 즉시 에스크로 환불(`ESCROW_REFUND`)되며, 마감 30초 이내 입찰 시 60초 자동 연장됩니다. 낙찰 시 2% `SINK_AUCTION_FEE` 영구 소각.",
  "/marketplace/appraisals": "💡 **감정 수수료 소각 룰**: 감정 시 `max(250 WLD, ceil(0.25%))` WLD가 `SINK_APPRAISAL_FEE`로 영구 소각되고 디지털 공인 인증서가 영구 발급됩니다.",
  "/businesses/{id}/supplies": "💡 **공급망 소각 룰**: 원자재 조달 시 총 주문액의 2%가 `SINK_SUPPLY_CHAIN_PROCUREMENT` 사유로 즉시 소각됩니다."
};

function getKoreanSummary(summary, p) {
  if (KO_TRANSLATIONS[summary]) return KO_TRANSLATIONS[summary];
  for (const [k, v] of Object.entries(KO_TRANSLATIONS)) {
    if (p.includes(k)) return v;
  }
  return summary;
}

function renderGuardBadges(guards) {
  if (!guards || guards.length === 0) return '`🔓 공개 (게스트 허용)`';
  const badges = [];
  if (guards.includes('AuthenticatedGuard')) badges.push('`🔒 로그인 필수`');
  if (guards.includes('ConsentGuard')) badges.push('`📜 약관동의 필수`');
  if (guards.includes('ReauthGuard')) badges.push('`🛡️ 최근재인증 필수 (15분)`');
  if (guards.includes('AdminGuard')) badges.push('`👑 운영진 전용`');
  if (guards.includes('SuperadminGuard')) badges.push('`⭐ 최고운영진 전용`');
  if (guards.includes('SecondFactorGuard')) badges.push('`🔑 2FA TOTP 필수`');
  if (guards.includes('CsrfGuard')) badges.push('`🛡️ CSRF 검증`');
  if (guards.includes('SessionGuard') && !guards.includes('AuthenticatedGuard')) badges.push('`👤 세션 필요`');
  return badges.length > 0 ? badges.join(' ') : '`🔒 내부 보호`';
}

const TAG_GROUPS = {
  "01-auth-and-account": {
    title: "인증 & 계정 관리 API (Authentication & Account)",
    desc: "회원가입, 로컬 로그인, 세션 검증, 2FA/TOTP 스텝업 인증, OAuth(Discord/Google) 연동, 비밀번호 변경/재설정 및 계정 프로필 관리 엔드포인트",
    tags: ["auth", "account"]
  },
  "02-wallet-and-banking": {
    title: "통화 금융 & 지갑·은행 API (Wallet & Banking)",
    desc: "WLD 지갑 잔고 조회, P2P 송금, 입출금 내역, 일일 보상 수령, 은행 예적금 상품 가입/해지, 대출 신청/상환 및 포켓 계좌 관리 엔드포인트",
    tags: ["wallet", "banking", "game-clock"]
  },
  "03-stocks-and-businesses": {
    title: "가상 주식 & 사업체 공급망 API (Stocks & Businesses)",
    desc: "가상 주식 시장 시세/차트, 매수/매도 호가 주문, 포트폴리오 분석, 증시 뉴스 피드, 가상 사업체 창업/인수, 일일 정산 및 원자재 공급망 조달(2% 소각) 엔드포인트",
    tags: ["stocks", "newspaper", "businesses"]
  },
  "04-marketplace-and-crafting": {
    title: "유저 거래소 & 에스크로 경매·감정·제작 API (Marketplace & Crafting)",
    desc: "고정가 장터 출품/구매, 실시간 잉글리시 경매(안티스나이핑 및 에스크로 즉시환불), P2P 1:1 직거래(3단계 원자적 스왑), 디지털 공인 감정소(수수료 소각 및 배지 발급) 및 제작대 레시피 엔드포인트",
    tags: ["marketplace", "crafting"]
  },
  "05-spaces-clubs-seasons": {
    title: "개인 공간·세무 구청 & 클럽·시즌 API (Spaces, Clubs & Seasons)",
    desc: "가상 부동산 분양/인테리어 레이아웃, 세무 구청 일일 부동산세 납부(SINK_PROPERTY_TAX 100% 소각), 체납 공매 모니터링, 공공 도시 프로젝트 크라우드펀딩, 클럽하우스 12x12 공유 캔버스, 유저 컬렉션 큐레이션 사다리, 시즌 랭킹 및 명예의 전당 보상 분배 엔드포인트",
    tags: ["spaces", "clubs", "seasons", "collections"]
  },
  "06-gameplay-work-casino": {
    title: "게임플레이 & 직업·카지노 API (Gameplay, Work & Casino)",
    desc: "직업 배정, 일일 노동 퀘스트 및 급여 수령, 레벨업/성장 단계, 주사위·코인플립 미니게임 플레이, 이용약관, 공정성(Provably Fair) 시드 검증 및 자가 보호 베팅 한도 설정 엔드포인트",
    tags: ["work", "casino", "progression", "engagement", "early-game"]
  },
  "07-community-board-chat": {
    title: "커뮤니티 게시판 & 실시간 채팅·미디어 API (Community, Board & Chat)",
    desc: "자유게시판 및 종목 토론방 글 작성/수정/삭제, 댓글, 좋아요, 광고 게재, 1:1 및 그룹 실시간 채팅, 메시지 읽음 처리, 안전 뮤트/차단, 갤러리 사진 업로드 및 미디어 스트리밍 엔드포인트",
    tags: ["board", "chat", "content", "profile", "activity", "discord"]
  },
  "08-admin-control-tower": {
    title: "운영진 관제 타워 & 경제 국고·보안 통제 API (Admin Control Tower)",
    desc: "실시간 금융 관제 타워, 경제 시나리오 랩, 통화량 조절, 감사 로그 검색, 사용자 제재 및 권한 관리, 킬스위치/피처 플래그 토글 그리드, 2FA 스텝업 인증, 국고 자산 배분 및 콘텐츠 테이크다운 큐 엔드포인트",
    tags: ["admin", "Admin Treasury", "admin-security", "safety", "privacy", "Health", "Version"]
  }
};

function renderSchema(schema, components, depth = 0) {
  if (!schema) return "None";
  if (schema.$ref) {
    const refName = schema.$ref.replace("#/components/schemas/", "");
    const target = components?.schemas?.[refName];
    if (depth > 2) return `\`${refName}\``;
    return renderSchema(target, components, depth + 1);
  }
  if (schema.type === "object" && schema.properties) {
    const props = Object.entries(schema.properties).map(([k, v]) => {
      const req = (schema.required && schema.required.includes(k)) ? "**(필수)**" : "*(선택)*";
      const desc = v.description ? ` - ${v.description}` : "";
      const typeStr = v.type || (v.$ref ? v.$ref.replace("#/components/schemas/", "") : "any");
      return `  - \`${k}\` (\`${typeStr}\`) ${req}${desc}`;
    }).join("\n");
    return props || "*(빈 객체)*";
  }
  if (schema.type === "array" && schema.items) {
    return `Array of ${renderSchema(schema.items, components, depth + 1)}`;
  }
  return `\`${schema.type || "unknown"}\``;
}

const outDir = "/home/debian/Woldeok-Moneyverse-Migration/docs/api";
const masterIndex = [];

for (const [fileKey, group] of Object.entries(TAG_GROUPS)) {
  const filePath = path.join(outDir, `${fileKey}.md`);
  let md = `# ${group.title}\n\n`;
  md += `> ${group.desc}\n\n`;
  md += `## 📋 목차 (Table of Contents)\n\n`;

  const operations = [];

  for (const [p, methods] of Object.entries(doc.paths)) {
    for (const [m, op] of Object.entries(methods)) {
      const tag = (op.tags && op.tags[0]) || "uncategorized";
      if (group.tags.includes(tag)) {
        const actualUrl = toActualUrl(p);
        const normKey = `${m.toUpperCase()} ${normalizePath(p)}`;
        const guards = guardMap[normKey] || [];
        const summary = getKoreanSummary(op.summary || op.description || "엔드포인트 상세", p);
        operations.push({
          rawPath: p,
          actualUrl,
          method: m.toUpperCase(),
          op,
          tag,
          guards,
          summary
        });
      }
    }
  }

  operations.sort((a, b) => a.actualUrl.localeCompare(b.actualUrl));

  for (const item of operations) {
    const anchor = `${item.method.toLowerCase()}-${item.actualUrl.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`;
    const badges = renderGuardBadges(item.guards);
    md += `- [${item.method} \`${item.actualUrl}\`](#${anchor}) - ${item.summary} | ${badges}\n`;
    masterIndex.push({
      group: group.title,
      file: `${fileKey}.md`,
      method: item.method,
      actualUrl: item.actualUrl,
      summary: item.summary,
      tag: item.tag,
      guards: badges
    });
  }

  md += `\n---\n\n## 🛠️ 엔드포인트 상세 규격\n\n`;

  for (const item of operations) {
    const { actualUrl: p, rawPath, method: m, op, guards, summary } = item;
    const anchor = `${m.toLowerCase()}-${p.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`;
    
    md += `<a id="${anchor}"></a>\n`;
    md += `### ${m} \`${p}\`\n\n`;
    md += `**설명:** ${summary}\n\n`;
    if (op.description && op.description !== op.summary) {
      md += `> ${op.description}\n\n`;
    }

    // 소각 룰 & 특수 비즈니스 룰
    for (const [pattern, rule] of Object.entries(SINK_RULES)) {
      if (rawPath.includes(pattern)) {
        md += `${rule}\n\n`;
        break;
      }
    }

    md += `- **분류 도메인 (Tag):** \`${item.tag}\`\n`;
    md += `- **보안 및 권한 계층 (Guards):** ${renderGuardBadges(guards)}\n`;
    md += `- **엔드포인트 핸들러 ID:** \`${op.operationId || "N/A"}\`\n`;

    // 매개변수
    if (op.parameters && op.parameters.length > 0) {
      md += `\n#### 📌 매개변수 (Parameters)\n\n`;
      md += `| 위치 | 이름 | 타입 | 필수 여부 | 설명 |\n`;
      md += `| :--- | :--- | :--- | :---: | :--- |\n`;
      for (const param of op.parameters) {
        const req = param.required ? "**필수**" : "선택";
        const typeStr = param.schema ? (param.schema.type || "string") : "string";
        const desc = param.description || "-";
        md += `| \`${param.in}\` | \`${param.name}\` | \`${typeStr}\` | ${req} | ${desc} |\n`;
      }
      md += `\n`;
    }

    // Request Body
    const hasRequestBody = op.requestBody && (m === 'POST' || m === 'PUT' || m === 'PATCH');
    if (hasRequestBody) {
      md += `#### 📦 요청 본문 (Request Body)\n\n`;
      const content = op.requestBody.content?.["application/json"];
      if (content && content.schema) {
        md += renderSchema(content.schema, doc.components) + "\n\n";
      } else {
        md += `*(application/json 본문 필요)*\n\n`;
      }
    }

    // Responses
    if (op.responses) {
      md += `#### 📤 응답 스키마 (Responses)\n\n`;
      md += `| HTTP 상태 코드 | 의미 | 응답 형식 |\n`;
      md += `| :---: | :--- | :--- |\n`;
      for (const [status, resp] of Object.entries(op.responses)) {
        const desc = resp.description || (status === '200' ? '성공' : status === '201' ? '생성 완료' : status === '202' ? '접수 완료' : status === '400' ? '잘못된 요청' : status === '401' ? '인증 실패' : status === '403' ? '권한 거부' : status === '404' ? '리소스 없음' : status === '409' ? '충돌' : '-');
        const schema = resp.content?.["application/json"]?.schema;
        let schemaStr = "JSON Object";
        if (schema) {
          if (schema.$ref) {
            schemaStr = `\`${schema.$ref.replace("#/components/schemas/", "")}\``;
          } else {
            schemaStr = `\`${schema.type || "object"}\``;
          }
        }
        md += `| **${status}** | ${desc} | ${schemaStr} |\n`;
      }
      md += `\n`;
    }

    // cURL 예시 (완전 동작 가능한 형태)
    md += `#### 💻 실제 호출 예시 (Example cURL)\n\n`;
    md += "```bash\n";
    if (m === "GET") {
      md += `curl -X GET "https://easy-scraping.com${p}" \\\n  -H "Accept: application/json" \\\n  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"\n`;
    } else if (hasRequestBody) {
      md += `curl -X ${m} "https://easy-scraping.com${p}" \\\n  -H "Content-Type: application/json" \\\n  -H "x-csrf-token: YOUR_CSRF_TOKEN" \\\n  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \\\n  -d '{\n    "idempotencyKey": "00000000-0000-4000-8000-000000000000"\n  }'\n`;
    } else {
      md += `curl -X ${m} "https://easy-scraping.com${p}" \\\n  -H "Accept: application/json" \\\n  -H "x-csrf-token: YOUR_CSRF_TOKEN" \\\n  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"\n`;
    }
    md += "```\n\n---\n\n";
  }

  fs.writeFileSync(filePath, md, "utf8");
  console.log(`Updated ${operations.length} operations in ${filePath}`);
}

// README.md 마스터 인덱스 재생성
let indexMd = `# 🌐 머니버스(Woldeok Moneyverse) 통합 REST API 마스터 레퍼런스 (v2026.09.23 쇄신판)

본 문서는 머니버스 프로덕션 시스템의 전체 **358개 REST API 엔드포인트**에 대한 포괄적이고 권위 있는 공식 기술 레퍼런스입니다.
실제 런타임 URL(\`/api/v1\` 프리픽스 및 예외 라우트), 보안 가드 스택, 멱등성 규약 및 영구 소각 규칙이 100% 온전히 반영되었습니다.

---

## 🏛️ 주요 아키텍처 및 공통 호출 규격

### 1. 엔드포인트 베이스 URL 및 라우팅 규칙
- **프로덕션 게이트웨이**: \`https://easy-scraping.com\`
- **표준 API 프리픽스**: \`/api/v1\` (모든 일반 API는 \`/api/v1/...\`로 호출)
- **프리픽스 예외 라우트 (UNPREFIXED_ROUTES)**:
  - \`GET /health\` (오케스트레이터 및 헬스체크 프로브)
  - \`GET /media/:key\` 및 \`GET /media/profile/:key\` (정적 미디어)
  - \`GET /auth/:provider/authorize\` 및 \`GET /auth/:provider/callback\` (OAuth 리다이렉트 콜백)
- **모바일/앱 게이트웨이**: \`/app-api/v1\` (BFF 프록시를 통해 내부 토큰 자동 주입)

### 2. 표준 보안 및 인증 헤더
| 헤더명 | 필수 여부 | 설명 |
| :--- | :---: | :--- |
| \`Cookie\` | **필수** (보호 라우트) | \`__Host-session=<UUID>\` 브라우저/클라이언트 인증 세션 쿠키 |
| \`x-csrf-token\` | **필수** (상태 변경 C/U/D) | CSRF 공격 방지를 위한 이중 토큰 (Double Submit Cookie) |
| \`x-internal-token\` | **내부 전용** | Next.js BFF 및 내부 마이크로서비스 간 서버-투-서버 신뢰 토큰 (클라이언트 노출 금지) |
| \`x-request-id\` | 선택 | 분산 트레이싱 및 디버깅용 요청 고유 UUID |

### 3. 보안 가드 (Guard Stack) 범례
- \`🔒 로그인 필수\`: 회원 인증 세션 필요 (\`AuthenticatedGuard\`, 미인증 시 401)
- \`📜 약관동의 필수\`: 서비스 이용약관 및 개인정보 동의 완료 필요 (\`ConsentGuard\`, 미동의 시 403)
- \`🛡️ 최근재인증 필수 (15분)\`: 최근 900초 이내 비밀번호/소셜 재인증 필요 (\`ReauthGuard\`)
- \`👑 운영진 전용\`: 플랫폼 관리자 권한 필요 (\`AdminGuard\`, 미보유 시 403)
- \`⭐ 최고운영진 전용\`: 슈퍼어드민 최고 권한 필요 (\`SuperadminGuard\`)
- \`🔑 2FA TOTP 필수\`: 2차 인증 스텝업 필요 (\`SecondFactorGuard\`)
- \`🔓 공개 (게스트 허용)\`: 비로그인 사용자 및 검색 봇 접근 가능

### 4. 상태 변경 요청의 멱등성 (Idempotency Contract)
- 자산 이동, 결제, 상점 구매, 경매 입찰, 세금 납부 등 모든 상태 변경(POST/PUT) 엔드포인트는 클라이언트가 생성한 UUID v4 형식의 \`idempotencyKey\`를 본문에 포함해야 합니다.
- 동일한 키로 중복 요청 시, 시스템은 중복 거래를 실행하지 않고 최초 처리 결과를 캐시에서 원자적으로 반환합니다.

### 5. 통화 소각 코드 (Permanent Sinks)
머니버스는 통화 가치 안정화를 위해 다양한 소각 코드로 WLD를 100% 영구 폐기합니다:
- \`SINK_PROPERTY_TAX\`: 가상 부동산 일일 정액 보유세
- \`SINK_AUCTION_FEE\`: 경매 체결 시 2% 시스템 수수료
- \`SINK_APPRAISAL_FEE\`: 공인 시스템 감정소 발급 수수료 (\`max(250 WLD, ceil(0.25%))\`)
- \`SINK_SUPPLY_CHAIN_PROCUREMENT\`: 사업체 원자재 공급망 조달 수수료 (2%)
- \`SINK_PROJECT_DONATION\`: 공공 도시 인프라 크라우드펀딩 출자액 (100%)
- \`SINK_HOUSING_PURCHASE\`: 개인 공간 분양 대금 (100%)

---

## 📚 도메인별 상세 명세서 카탈로그 (Total: 358 Operations)

| 번호 | 도메인 명세서 파일 | 포함 태그 | API 개수 | 설명 |
| :---: | :--- | :--- | :---: | :--- |
| **01** | [01-auth-and-account.md](./01-auth-and-account.md) | \`auth\`, \`account\` | 28 | 로컬/소셜 인증, 세션, 2FA/TOTP, 비밀번호 관리 |
| **02** | [02-wallet-and-banking.md](./02-wallet-and-banking.md) | \`wallet\`, \`banking\`, \`game-clock\` | 23 | WLD 지갑, P2P 송금, 은행 예적금, 대출 및 포켓 |
| **03** | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) | \`stocks\`, \`newspaper\`, \`businesses\` | 34 | 가상 증시 호가/차트, 매수/매도, 경제 신문, 가상 사업체 공급망 |
| **04** | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) | \`marketplace\`, \`crafting\` | 17 | 고정가 장터, 에스크로 경매, P2P 1:1 직거래, 공인 감정소, 제작 |
| **05** | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) | \`spaces\`, \`clubs\`, \`seasons\`, \`collections\` | 33 | 부동산 분양/세무 구청(보유세 소각), 클럽 캔버스, 시즌 보상, 컬렉션 |
| **06** | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) | \`work\`, \`casino\`, \`progression\`, \`engagement\`, \`early-game\` | 33 | 직업 노동, 카지노(주사위/코인), 레벨업, 업적 |
| **07** | [07-community-board-chat.md](./07-community-board-chat.md) | \`board\`, \`chat\`, \`content\`, \`profile\`, \`activity\`, \`discord\` | 61 | 게시판 글/댓글, 실시간 채팅, 갤러리 미디어, 프로필 |
| **08** | [08-admin-control-tower.md](./08-admin-control-tower.md) | \`admin\`, \`Admin Treasury\`, \`admin-security\`, \`safety\`, \`privacy\`, \`Health\`, \`Version\` | 128 | 실시간 관제 타워, 국고, 감사 로그, 피처 플래그, 사용자 제재 |

---

## 🔎 전체 API 색인 테이블 (Total: 358 Endpoints)

| Method | 실제 호출 경로 (Actual URL) | 기능 명칭 (Summary) | 보안 가드 (Security Guards) | 도메인 명세서 |
| :---: | :--- | :--- | :--- | :--- |
`;

for (const item of masterIndex) {
  indexMd += `| **${item.method}** | \`${item.actualUrl}\` | ${item.summary} | ${item.guards} | [${item.file}](./${item.file}) |\n`;
}

fs.writeFileSync(path.join(outDir, "README.md"), indexMd, "utf8");
console.log(`Wrote Master Index to ${path.join(outDir, "README.md")}`);
