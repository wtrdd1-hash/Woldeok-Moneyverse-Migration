import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../spring-backend/src/main/resources/'+p,import.meta.url),'utf8');
test('manual locale changes retain real publication window and bound scope counters',()=>{
  const scope={dataset:{publicFormat:'publicationScope',publicCount:'7',publicLimit:'24'},textContent:''};
  let handler;const window={MV39Locale:{tx:()=>'{count} records / limit {limit}',current:()=> 'vi'},addEventListener:(name,fn)=>{handler=fn;}};
  const document={readyState:'complete',querySelector:()=>null,querySelectorAll:selector=>selector==='[data-public-format]'?[scope]:[]};
  vm.runInNewContext(read('static/assets/mv43/public.js'),{window,document,URL});
  assert.equal(scope.textContent,'7 records / limit 24');handler();assert.equal(scope.textContent,'7 records / limit 24');
});
