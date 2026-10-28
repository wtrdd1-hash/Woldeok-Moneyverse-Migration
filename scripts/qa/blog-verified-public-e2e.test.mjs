import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
import { strict as assert } from 'node:assert';

const sha = 'a'.repeat(40);
let hasPost = false;
const item = {
  slug:'2026-10-28-us-coding-4',country:'US',locale:'en-US',topic:'CODING',
  receipt:'123e4567-e89b-12d3-a456-426614174000',status:'PUBLISHED',
  primary_source_url:'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
  content:'Documentation overview: '.repeat(110)+'https://developer.mozilla.org/en-US/docs/Web/JavaScript'
};
const server = createServer((req,res)=>{
  res.setHeader('Content-Type','application/json');
  const path = req.url;
  if (path === '/api/version') return res.end(JSON.stringify({id:sha}));
  if (path === '/api/v1/admin/blog-verified'){res.statusCode=403;return res.end('{}');}
  if (path === '/api/v1/blog/verified')return res.end(JSON.stringify({
    success:true,count:hasPost?1:0,posts:hasPost?[item]:[]
  }));
  if (path === '/api/v1/blog/verified/'+item.slug)return res.end(JSON.stringify({success:true,post:item}));
  res.statusCode=404;res.end('{}');
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
try {
  for (const requirePost of [false,true]) {
    hasPost=requirePost;
    const result=await exec(process.execPath,['scripts/qa/blog-verified-public-e2e.mjs'],{
      cwd:new URL('../../',import.meta.url).pathname,
      env:{...process.env,BLOG_QA_ORIGIN:'http://127.0.0.1:'+port,
        BLOG_QA_SHA:sha,BLOG_QA_REQUIRE_POST:requirePost?'true':'false'},
      encoding:'utf8',timeout:5000
    });
    assert.match(result.stdout,/READ_ONLY_QA_PASS/);
  }
  await assert.rejects(exec(process.execPath,['scripts/qa/blog-verified-public-e2e.mjs'],{
    cwd:new URL('../../',import.meta.url).pathname,
    env:{...process.env,BLOG_QA_ORIGIN:'https://easy-scraping.com',BLOG_QA_SHA:sha},
    timeout:5000
  }));
}finally{server.close();}
console.log('QA production-target guard PASS');
