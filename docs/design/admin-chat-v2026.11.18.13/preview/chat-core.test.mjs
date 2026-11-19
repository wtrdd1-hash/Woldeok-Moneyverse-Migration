import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePageContext,
  validateDraft,
  previewSubmission,
  getLauncherGeometry,
  createChatState,
  transitionChatState
} from './chat-core.mjs';

test('route category excludes personal IDs, tokens, fragments, and API details', () => {
  assert.equal(normalizePageContext('/admin/users/550e8400-e29b-41d4-a716-446655440000?token=s3cr3t#secret'), 'admin');
  assert.equal(normalizePageContext('/wallet/activity/transactions/private-id?key=abc'), 'wallet');
  assert.equal(normalizePageContext('/stocks/ANY_STOCK?account=private'), 'stocks');
  assert.equal(normalizePageContext('/board/my-post'), 'community');
  assert.equal(normalizePageContext('https://other.example/admin/users/123?token=123'), 'other');
  assert.equal(normalizePageContext('//evil.example/admin/unsafe'), 'other');
  assert.equal(normalizePageContext('/api/v1/support/threads'), 'other');
});

test('blank, zero length and >1000 Unicode code points are invalid', () => {
  assert.deepEqual(validateDraft('  '), { ok:false, error:'EMPTY', normalized:'' });
  assert.deepEqual(validateDraft(''), { ok:false, error:'EMPTY', normalized:'' });
  assert.equal(validateDraft('✔️'.repeat(501)).error, 'TOO_LONG');
  assert.equal(validateDraft('hello').ok, true);
  assert.equal(validateDraft('x'.repeat(1000)).ok, true);
  assert.equal(validateDraft('x'.repeat(1001)).error, 'TOO_LONG');
});

test('preview submit never claims sent, regardless of valid user input or login', () => {
  const authorized=previewSubmission({authenticated:true,text:'도와주세요',category:'bug',context:'/wallet/secret?id=3'});
  assert.equal(authorized.status,'not_sent');
  assert.equal(authorized.ok,false);
  assert.match(authorized.message,/미리보기|전송되지/);
  assert.equal(authorized.category,'bug');
  assert.equal(authorized.context,'wallet');
  assert.equal('ticketId' in authorized,false);
  const guest=previewSubmission({authenticated:false,text:'도와주세요',category:'bug',context:'/account'});
  assert.equal(guest.status,'require_login');
  assert.equal(previewSubmission({authenticated:true,text:' '}).status,'invalid');
});

test('floating circle stays above bottom navigation and remains touch accessible', () => {
  const narrow=getLauncherGeometry({viewportWidth:320,safeAreaInset:16,hasBottomNav:true});
  assert.ok(narrow.bottom >= 96);
  assert.equal(narrow.size,56);
  assert.ok(narrow.right>=12);
  const wide=getLauncherGeometry({viewportWidth:1440,safeAreaInset:0,hasBottomNav:false});
  assert.equal(wide.bottom,24);
});

test('same SPA global state persists a draft and panel across route switches without URL secrets', () => {
  let state=createChatState({authenticated:true,initialPath:'/quests'});
  state=transitionChatState(state,{type:'OPEN'});
  state=transitionChatState(state,{type:'SET_DRAFT',text:'자료 오류를 문의합니다'});
  state=transitionChatState(state,{type:'NAVIGATE',path:'/admin/users/secret-123?token=hush'});
  assert.equal(state.open,true);
  assert.equal(state.draft,'자료 오류를 문의합니다');
  assert.equal(state.context,'admin');
  assert.equal(JSON.stringify(state).includes('hush'),false);
  state=transitionChatState(state,{type:'SIGN_OUT'});
  assert.equal(state.draft,'');
  assert.equal(state.directDraft,'');
  assert.equal(state.authenticated,false);
  assert.equal(state.open,false);
});

test('switch support and direct tabs without mixing drafts; preserve no successful send', () => {
  let state=createChatState({authenticated:true,initialPath:'/'});
  state=transitionChatState(state,{type:'SET_DRAFT',text:'고객센터 문의'});
  state=transitionChatState(state,{type:'SWITCH_TAB',tab:'direct'});
  state=transitionChatState(state,{type:'SET_DRAFT',text:'개인 채팅'});
  assert.equal(state.directDraft,'개인 채팅');
  assert.equal(state.draft,'고객센터 문의');
  state=transitionChatState(state,{type:'SUBMIT_PREVIEW'});
  assert.equal(state.notice.status,'not_sent');
  assert.equal(state.directDraft,'개인 채팅');
  state=transitionChatState(state,{type:'SWITCH_TAB',tab:'support'});
  assert.equal(state.draft,'고객센터 문의');
});

test('unknown category names cannot be smuggled into a context', () => {
  assert.equal(previewSubmission({authenticated:true,text:'test',category:'<script>alert(1)</script>',context:'/chat'}).category,'other');
});

test('pre-sanitized community route category survives simulated submission', () => {
  let state=createChatState({authenticated:true,initialPath:'/board'});
  state=transitionChatState(state,{type:'SET_DRAFT',text:'게시글 문의'});
  state=transitionChatState(state,{type:'SUBMIT_PREVIEW'});
  assert.equal(state.notice.context,'community');
  assert.equal(state.notice.status,'not_sent');
});
