import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';

const route="'/api/v1/content/announcements'";
const sourceFiles=[
 'frontend/src/app/page.tsx',
 'frontend/src/app/announcements/page.tsx',
 'frontend/src/app/announcements/[announcementId]/page.tsx',
 'frontend/src/app/sitemap-announcements.xml/route.ts',
];
describe('announcements frontend uses the deployed public content API',()=>{
 it('content AppContentController defines the mounted public GET',()=>{
  const src=readFileSync('backend/src/content/app-content.controller.ts','utf8');
  assert.match(src,/@Controller\('content'\)/);
  assert.match(src,/@Get\('announcements'\)/);
 });
 for(const file of sourceFiles)it(`${file} points at deployed public API`,()=>{
  const src=readFileSync(file,'utf8');
  assert.ok(src.includes(route),`missing live public announcement endpoint in ${file}`);
  assert.ok(!src.includes("'/api/v1/announcements'"),`dead announcement endpoint persisted in ${file}`);
 });
});
