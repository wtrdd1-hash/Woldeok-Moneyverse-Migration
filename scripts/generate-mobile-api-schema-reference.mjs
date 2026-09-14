import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contract = JSON.parse(fs.readFileSync(path.join(root, 'docs/mobile-api-contract.json'), 'utf8'));

function esc(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function typeText(schema) {
  if (!schema) return 'unknown';
  if (schema.const !== undefined) return `${schema.type ?? typeof schema.const}=${JSON.stringify(schema.const)}`;
  if (schema.oneOf) return [...new Set(schema.oneOf.map(typeText))].join(' | ');
  if (schema.allOf) return schema.allOf.map(typeText).join(' & ');
  if (schema.type === 'array') return `${typeText(schema.items)}[]`;
  if (schema.type === 'tuple') return `[${(schema.items ?? []).map(typeText).join(', ')}]`;
  let text = schema.type ?? 'object';
  if (schema.format) text += ` (${schema.format})`;
  return text;
}

function constraints(schema) {
  if (!schema) return '';
  const out = [];
  for (const key of ['minimum', 'maximum', 'minLength', 'maxLength', 'pattern', 'example', 'description']) {
    if (schema[key] !== undefined) out.push(`${key}=${JSON.stringify(schema[key])}`);
  }
  if (schema.enum) out.push(`enum=${schema.enum.map((v) => JSON.stringify(v)).join(',')}`);
  if (schema.const !== undefined) out.push(`const=${JSON.stringify(schema.const)}`);
  return out.join('; ');
}

function flatten(schema, prefix = '', required = true, rows = [], depth = 0) {
  if (!schema || depth > 8) return rows;
  if (schema.oneOf || schema.allOf || !schema.properties) {
    if (prefix) rows.push([prefix, required, typeText(schema), constraints(schema)]);
    return rows;
  }
  if (prefix) rows.push([prefix, required, typeText(schema), constraints(schema)]);
  const req = new Set(schema.required ?? []);
  for (const [name, child] of Object.entries(schema.properties ?? {})) {
    const next = prefix ? `${prefix}.${name}` : name;
    if (child?.type === 'array') {
      rows.push([`${next}[]`, req.has(name), typeText(child), constraints(child)]);
      if (child.items?.properties) flatten(child.items, `${next}[]`, true, rows, depth + 1);
    } else if (child?.properties) {
      flatten(child, next, req.has(name), rows, depth + 1);
    } else {
      rows.push([next, req.has(name), typeText(child), constraints(child)]);
    }
  }
  return rows;
}

function parameterRows(parameters = []) {
  return parameters.map((p) => [p.name, p.in, Boolean(p.required), typeText(p.schema ?? p), constraints(p.schema ?? p)]);
}

function table(headers, rows) {
  if (!rows.length) return '_None._\n';
  return `| ${headers.join(' | ')} |\n|${headers.map(() => '---').join('|')}|\n${rows.map((r) => `| ${r.map(esc).join(' | ')} |`).join('\n')}\n`;
}
function renderEndpoint(endpoint, ko) {
  const lines = [];
  const title = ko ? endpoint.purpose : endpoint.summary;
  lines.push(`## \`${endpoint.method}\` \`${endpoint.path}\` — ${title}`);
  lines.push('');
  lines.push(ko ? `- 인증/권한: ${endpoint.authorization}` : `- Authorization: ${endpoint.authorization}`);
  lines.push(ko ? `- 성공 상태: ${(endpoint.successStatuses ?? []).join(', ')}` : `- Success status: ${(endpoint.successStatuses ?? []).join(', ')}`);
  lines.push(ko ? `- 응답 모드: ${endpoint.responseMode}` : `- Response mode: ${endpoint.responseMode}`);
  lines.push(ko ? `- 성공 후 동기화: ${endpoint.afterSuccess}` : `- After success: ${endpoint.afterSuccess}`);
  lines.push(`- Operation ID: \`${endpoint.operationId}\``);
  lines.push('');
  lines.push(ko ? '### 경로/쿼리 파라미터' : '### Path/query parameters');
  lines.push('');
  lines.push(table(
    ko ? ['이름', '위치', '필수', '타입', '제약'] : ['Name', 'In', 'Required', 'Type', 'Constraints'],
    parameterRows(endpoint.parameters),
  ));
  lines.push(ko ? '### 요청 본문' : '### Request body');
  lines.push('');
  if (!endpoint.requestBody) {
    lines.push(ko ? '_요청 본문 없음._' : '_No request body._');
  } else if (endpoint.requestBody.mode === 'raw-bytes') {
    lines.push(`- Content-Type: \`${endpoint.requestBody.mediaType}\``);
    lines.push(`- ${ko ? '최대 크기' : 'Maximum size'}: ${endpoint.requestBody.maxBytes} bytes`);
    lines.push(`- ${ko ? '허용 이미지' : 'Accepted images'}: ${endpoint.requestBody.acceptedImageTypes.join(', ')}`);
    lines.push(`- ${endpoint.requestBody.note}`);
  } else {
    lines.push(`- Content-Type: \`${endpoint.requestBody.mediaType}\``);
    if (endpoint.requestBody.schemaName) lines.push(`- DTO: \`${endpoint.requestBody.schemaName}\``);
    lines.push('');
    lines.push(table(
      ko ? ['필드', '필수', '타입', '제약'] : ['Field', 'Required', 'Type', 'Constraints'],
      flatten(endpoint.requestBody.resolvedSchema).map(([a,b,c,d]) => [a,b,c,d]),
    ));
  }
  lines.push('');
  lines.push(ko ? '### 성공 응답 필드' : '### Success response fields');
  lines.push('');
  if (endpoint.responseMode === 'binary') {
    lines.push(ko ? '_바이너리 본문. JSON 디코딩 금지._' : '_Binary body. Do not JSON-decode._');
  } else if (endpoint.responseMode === 'empty') {
    lines.push(ko ? '_본문 없음._' : '_No response body._');
  } else {
    lines.push(table(
      ko ? ['필드', '필수', '타입', '제약/의미'] : ['Field', 'Required', 'Type', 'Constraints/meaning'],
      flatten(endpoint.responseSchema).map(([a,b,c,d]) => [a,b,c,d]),
    ));
    lines.push(ko
      ? '> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.'
      : '> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.');
  }
  lines.push('');
  return lines.join('\n');
}

function render(ko) {
  const lines = [];
  lines.push(ko ? '# 모바일 앱 API 요청·응답 스키마 레퍼런스' : '# Mobile App API Request/Response Schema Reference');
  lines.push('');
  lines.push(ko ? '[English](mobile-api-schema-reference.md) | **한국어** | [기계 판독 계약](mobile-api-contract.json)' : '**English** | [한국어](mobile-api-schema-reference.ko.md) | [Machine contract](mobile-api-contract.json)');
  lines.push('');
  lines.push(`${ko ? '업데이트 버전' : 'Update version'}: **${contract.contractVersion}**`);
  lines.push('');
  lines.push(ko
    ? `이 문서는 ${contract.endpoints.length}개 앱 API 각각의 실제 요청 파라미터, DTO 필드, 타입/제약, 성공 상태코드, 성공 응답 필드를 기록한다. 다른 AI나 앱 개발자는 이 문서와 \`mobile-api-contract.json\`을 기준으로 코드를 생성하고 필드명을 추측하지 않는다.`
    : `This document records actual request parameters, DTO fields, constraints, success statuses, and success response fields for all ${contract.endpoints.length} app APIs. App developers and code-generating AIs should use this file together with \`mobile-api-contract.json\` and must not guess field names.`);
  lines.push('');
  lines.push(ko ? '## 공통 호환성 규칙' : '## Common compatibility rules');
  lines.push('');
  const rules = ko ? [
    'Base URL은 `https://easy-scraping.com/app-api/v1`이다.',
    'JSON 응답은 기존 키를 삭제하지 않고 snake_case 키의 camelCase 별칭을 재귀적으로 추가한다. 기존 camelCase와 충돌하면 기존 camelCase 값이 우선이다.',
    '로그인/세션은 persistent secure CookieJar를 사용하고 write는 문서가 요구하는 경우 최신 `X-CSRF-Token`을 보낸다.',
    '2xx만 성공으로 처리하고 4xx/5xx는 성공 DTO로 역직렬화하지 않는다.',
    'nullable 값은 화면에 문자열 `null`로 표시하지 않는다.',
    'raw image upload는 JSON/base64/multipart가 아니라 raw bytes를 보낸다.',
  ] : [
    'Base URL is `https://easy-scraping.com/app-api/v1`.',
    'JSON responses preserve original keys and recursively add camelCase aliases for snake_case keys. Existing camelCase wins on collision.',
    'Use one persistent secure CookieJar; send the latest `X-CSRF-Token` on writes that require CSRF.',
    'Only 2xx is success. Never deserialize 4xx/5xx as a success DTO.',
    'Never render nullable fields as the literal string `null`.',
    'Raw image uploads send decoded bytes, not JSON/base64/multipart.',
  ];
  for (const rule of rules) lines.push(`- ${rule}`);
  lines.push('');
  for (const endpoint of contract.endpoints) lines.push(renderEndpoint(endpoint, ko));
  return `${lines.join('\n')}\n`;
}

fs.writeFileSync(path.join(root, 'docs/mobile-api-schema-reference.md'), render(false));
fs.writeFileSync(path.join(root, 'docs/mobile-api-schema-reference.ko.md'), render(true));
console.log(`generated schema references for ${contract.endpoints.length} endpoints`);
