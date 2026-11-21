import {existsSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,relative,join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';

function files(root){
  if(!existsSync(root))return [];
  return readdirSync(root,{withFileTypes:true}).flatMap(entry=>entry.isSymbolicLink()?[]:entry.isDirectory()?files(join(root,entry.name)):[join(root,entry.name)]);
}
function references(text){
  return [...new Set([...text.matchAll(/(['"`])(\/api\/[^'"`\r\n]*)\1/g)].map(match=>match[2]))].sort();
}
/** Static references identify review work; they never prove a browser action or a live endpoint. */
export function buildFrontendCoverage(inputRoot){
  const root=resolve(inputRoot),app=join(root,'frontend/src/app');
  const pages=files(app).filter(path=>/\/page\.(?:tsx|ts|jsx|js)$/.test(path)).map(page=>{
    const directory=dirname(page),segments=relative(app,directory).split(/[\\/]/).filter(Boolean);
    const route='/'+segments.filter(part=>!/^\(.*\)$/.test(part)&&!part.startsWith('@')).join('/');
    const sources=readdirSync(directory,{withFileTypes:true}).filter(entry=>entry.isFile()&&/\.(?:tsx?|jsx?)$/.test(entry.name)&&!/(?:\.test\.|\.spec\.)/.test(entry.name)).map(entry=>join(directory,entry.name)).sort();
    const text=sources.map(path=>readFileSync(path,'utf8')).join('\n');
    return {route,requiresFixture:/\[|\{|\(\./.test(route)||segments.some(s=>s.startsWith('@')||s.startsWith('(.)')),
      sourceFiles:sources.map(path=>relative(root,path).replaceAll('\\','/')),
      apiReferences:references(text),exports:[...new Set([...text.matchAll(/export\s+(?:async\s+)?(?:function|const|class)\s+([A-Za-z_$][\w$]*)/g)].map(match=>match[1]))].sort(),
      lexicalFormCount:[...text.matchAll(/<form\b/g)].length,lexicalHandlerCount:[...text.matchAll(/\bon(?:Click|Submit|Change)\s*=/g)].length,
      liveVerification:'NOT_RUN',actionAcceptance:'UNVERIFIED',referenceKind:'LEXICAL_NOT_EXECUTION'};
  }).sort((a,b)=>a.route.localeCompare(b.route)||a.sourceFiles[0].localeCompare(b.sourceFiles[0]));
  const nativeMappings=[];
  for(const path of files(join(root,'spring-backend/src/main/java')).filter(path=>path.endsWith('.java'))){
    const text=readFileSync(path,'utf8');
    const classHead=text.slice(0,text.search(/\bclass\s/));
    const classMapping=classHead.match(/@RequestMapping\(([^)]*)\)/s);
    const prefixes=classMapping?[...classMapping[1].matchAll(/"(\/[^"]*)"/g)].map(m=>m[1]):[''];
    for(const match of text.matchAll(/@GetMapping\(([^)]*)\)/gs)){
      if(!/TEXT_HTML|text\/html/.test(match[1]))continue;
      for(const value of [...match[1].matchAll(/"(\/[^"]*)"/g)].map(m=>m[1]))for(const prefix of prefixes){
        nativeMappings.push({route:prefix.replace(/\/$/,'')+value,sourceFile:relative(root,path).replaceAll('\\','/'),requiresFixture:/[\[\{*]/.test(value),productionAcceptance:'UNVERIFIED'});
      }
    }
  }
  return {schemaVersion:1,method:'source reference inventory, not runtime or feature acceptance',warnings:[
    'Imports, runtime expressions, generated routes, server actions and authorization require separate tracing.',
    'A source export, form or API string does not prove that an enabled browser action succeeds.',
    'Native mappings are source candidates; release routing and authenticated acceptance remain independent.'
  ],summary:{nextPageCandidates:pages.length,nativeHtmlMappingCandidates:nativeMappings.length,lexicalForms:pages.reduce((n,p)=>n+p.lexicalFormCount,0),lexicalHandlers:pages.reduce((n,p)=>n+p.lexicalHandlerCount,0)},pages,nativeMappings:nativeMappings.sort((a,b)=>a.route.localeCompare(b.route))};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const args=process.argv.slice(2),root=args.includes('--root')?args[args.indexOf('--root')+1]:process.cwd();
  const data=JSON.stringify(buildFrontendCoverage(root),null,2)+'\n';
  if(args.includes('--output'))writeFileSync(args[args.indexOf('--output')+1],data);else process.stdout.write(data);
}
