import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
const cases = [
 {source:'frontend/src/components/discord-banner.tsx', route:'/tools', old:'/attendance', label:'Check Attendance Roulette'},
 {source:'frontend/src/components/calculator-retention-funnel.tsx', route:'/guide/career-mastery', old:'/career-guide'},
 {source:'frontend/src/components/floating-support-chat-widget.tsx', route:'/guide', old:'/guide/getting-started'},
 {source:'frontend/src/app/roadmap/roadmap-view.tsx', route:'/guide/dopamine-system', old:'/pet', label:'덕이 펫 기능 안내'},
];
describe('active navigation CTA targets correspond to a real page',()=>{
 for(const item of cases) it(`${item.source} points to real ${item.route} instead of deleted ${item.old}`,()=>{
  const text=readFileSync(item.source,'utf8');
  assert.ok(existsSync(`frontend/src/app${item.route}/page.tsx`),'missing actual target route');
  assert.ok(text.includes(`href="${item.route}"`),'expected authored link not in source');
  assert.ok(!text.includes(`href="${item.old}"`),'dead CTA still present');
  if(item.label) assert.ok(text.includes(item.label),'truthful user-facing action label missing');
 });
});
