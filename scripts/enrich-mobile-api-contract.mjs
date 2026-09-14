import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const configPath = path.join(root, 'backend/tsconfig.json');
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));
const program = ts.createProgram(config.fileNames, config.options);
const checker = program.getTypeChecker();
const contract = JSON.parse(fs.readFileSync(path.join(root, 'docs/mobile-api-contract.json'), 'utf8'));

const methods = new Map();
for (const source of program.getSourceFiles()) {
  if (!source.fileName.includes('/backend/src/') || !source.fileName.endsWith('.controller.ts')) continue;
  ts.forEachChild(source, (node) => {
    if (!ts.isClassDeclaration(node) || !node.name) return;
    for (const member of node.members) {
      if (!ts.isMethodDeclaration(member) || !member.name || !ts.isIdentifier(member.name)) continue;
      methods.set(`${node.name.text}_${member.name.text}`, member);
    }
  });
}

function unwrapPromise(type) {
  return checker.getPromisedTypeOfPromise(type) ?? type;
}

function schemaOf(type, depth = 0, seen = new Set()) {
  type = unwrapPromise(type);
  if (depth > 7) return { type: 'object', note: 'depth-limited' };
  if (type.flags & ts.TypeFlags.Any) return { type: 'any' };
  if (type.flags & ts.TypeFlags.Unknown) return { type: 'unknown' };
  if (type.flags & ts.TypeFlags.Never) return { type: 'never' };
  if (type.flags & ts.TypeFlags.Void) return { type: 'void' };
  if (type.flags & ts.TypeFlags.Undefined) return { type: 'undefined' };
  if (type.flags & ts.TypeFlags.Null) return { type: 'null' };
  if (type.flags & ts.TypeFlags.StringLiteral) return { type: 'string', const: type.value };
  if (type.flags & ts.TypeFlags.NumberLiteral) return { type: 'number', const: type.value };
  if (type.flags & ts.TypeFlags.BooleanLiteral) return { type: 'boolean', const: type.intrinsicName === 'true' };
  if (type.flags & ts.TypeFlags.StringLike) return { type: 'string' };
  if (type.flags & ts.TypeFlags.NumberLike) return { type: 'number' };
  if (type.flags & ts.TypeFlags.BooleanLike) return { type: 'boolean' };
  if (type.flags & ts.TypeFlags.BigIntLike) return { type: 'bigint' };
  if (type.isUnion?.()) return { oneOf: type.types.map((t) => schemaOf(t, depth + 1, new Set(seen))) };
  if (type.isIntersection?.()) return { allOf: type.types.map((t) => schemaOf(t, depth + 1, new Set(seen))) };

  const text = checker.typeToString(type);
  if (text === 'Date') return { type: 'string', format: 'date-time' };
  if (text === 'Buffer' || text.startsWith('Buffer<')) return { type: 'binary' };
  if (checker.isArrayType(type)) {
    const args = checker.getTypeArguments(type);
    return { type: 'array', items: schemaOf(args[0] ?? checker.getAnyType(), depth + 1, new Set(seen)) };
  }
  if (checker.isTupleType(type)) {
    return { type: 'tuple', items: checker.getTypeArguments(type).map((t) => schemaOf(t, depth + 1, new Set(seen))) };
  }

  const id = type.id;
  if (id && seen.has(id)) return { type: 'object', ref: text };
  if (id) seen.add(id);
  const properties = {};
  const required = [];
  for (const prop of checker.getPropertiesOfType(type)) {
    if (prop.name === 'then' || prop.name === 'catch' || prop.name === 'finally') continue;
    const decl = prop.valueDeclaration ?? prop.declarations?.[0];
    if (!decl) continue;
    if (ts.isMethodDeclaration(decl) || ts.isMethodSignature(decl) || ts.isFunctionDeclaration(decl)) continue;
    const propType = checker.getTypeOfSymbolAtLocation(prop, decl);
    properties[prop.name] = schemaOf(propType, depth + 1, new Set(seen));
    if (!(prop.flags & ts.SymbolFlags.Optional)) required.push(prop.name);
  }
  if (Object.keys(properties).length === 0) return { type: 'object', tsType: text };
  const out = { type: 'object', properties };
  if (required.length) out.required = required;
  return out;
}

const rawImageUploads = new Set([
  'BoardImageController_upload',
  'MemberPhotoController_upload',
  'ProfileController_uploadImage',
]);

let enriched = 0;
for (const endpoint of contract.endpoints) {
  const member = methods.get(endpoint.operationId);
  if (!member) throw new Error(`controller method not found: ${endpoint.operationId}`);
  const sig = checker.getSignatureFromDeclaration(member);
  if (!sig) throw new Error(`signature unavailable: ${endpoint.operationId}`);
  endpoint.responseSchema = schemaOf(checker.getReturnTypeOfSignature(sig));
  endpoint.responseCompatibility = {
    preferredFieldNaming: 'camelCase',
    legacySnakeCasePreserved: true,
    camelCaseAliasesAddedRecursively: true,
  };
  if (rawImageUploads.has(endpoint.operationId) && endpoint.requestBody) {
    endpoint.requestBody.mediaType = 'application/octet-stream';
    endpoint.requestBody.mode = 'raw-bytes';
    endpoint.requestBody.acceptedImageTypes = ['image/png', 'image/jpeg', 'image/webp'];
    endpoint.requestBody.maxBytes = 4 * 1024 * 1024;
    endpoint.requestBody.note = 'Send decoded image bytes directly. Do not send JSON, base64, or multipart.';
  }
  enriched += 1;
}
contract.compatibility = {
  fieldNaming: 'camelCase+legacy',
  rule: 'The app gateway preserves every original JSON key and recursively adds a camelCase alias for each snake_case key when that alias does not already exist.',
  collisionRule: 'An existing camelCase key is authoritative and is never overwritten by an alias.',
  binaryBodiesAreNotTransformed: true,
  errorsUseProblemJson: true,
  contractHeaders: ['x-moneyverse-api-version', 'x-moneyverse-contract-version', 'x-moneyverse-field-naming'],
};
contract.generatedFrom = {
  responseTypes: 'backend TypeScript controller return types',
  requestTypes: 'NestJS OpenAPI DTO metadata captured in requestBody.resolvedSchema',
};
fs.writeFileSync(path.join(root, 'docs/mobile-api-contract.json'), `${JSON.stringify(contract, null, 2)}\n`);
console.log(`enriched ${enriched} endpoints; controller methods=${methods.size}`);
