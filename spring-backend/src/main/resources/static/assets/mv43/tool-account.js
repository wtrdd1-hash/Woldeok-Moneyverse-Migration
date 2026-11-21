(() => {
  'use strict';
  const start = () => {
    const box = document.getElementById('auth-actions');
    if (!box || !document.querySelector('[data-public-title]')) return;
    let state = {kind: 'loading'}, generation = 0, busy = false;
    const tx = key => window.MV39Locale?.tx(key) || key;
    const element = (tag, kind, text) => {
      const node = document.createElement(tag);
      node.setAttribute('data-tool-account', kind);
      node.textContent = text;
      return node;
    };
    const render = () => {
      box.replaceChildren();
      if (state.kind === 'member') {
        const profile = element('a', 'profile', state.name || tx('account'));
        profile.href = '/account'; profile.className = 'auth-profile';
        const logout = element('button', 'logout', tx('logout'));
        logout.type = 'button'; logout.className = 'auth-link'; logout.disabled = busy || !state.csrf;
        if (!state.csrf) logout.setAttribute('title', tx('unavailable'));
        const owner = state.id, revision = generation;
        logout.addEventListener('click', () => { if (!busy && state.csrf && revision === generation) void signOut(owner); });
        box.append(profile, logout);
      } else if (state.kind === 'guest') {
        const login = element('a', 'login', tx('login')); login.href = '/login'; login.className = 'auth-link'; box.append(login);
      } else {
        const status = element('span', 'status', tx(state.kind === 'loading' ? 'loading' : 'unavailable'));
        status.setAttribute('role', 'status'); box.append(status);
        if (state.kind === 'unavailable') {
          const retry = element('button', 'retry', tx('retry')); retry.type = 'button'; retry.className = 'auth-link';
          retry.addEventListener('click', refresh); box.append(retry);
        }
      }
    };
    const json = async (url, options) => {
      const response = await window.fetch(url, {credentials: 'same-origin', cache: 'no-store', redirect: 'error', ...options});
      if (response.status !== 200 || !/^application\/json(?:\s*;|$)/i.test(response.headers.get('Content-Type') || '')) throw new Error('unavailable');
      return response.json();
    };
    const snapshot = async () => {
      const body = await json('/api/v1/auth/session', {method: 'GET', headers: {Accept: 'application/json'}});
      if (body?.ok !== true || body.success !== true || typeof body.authenticated !== 'boolean' || body.signedIn !== body.authenticated) throw new Error('unavailable');
      if (!body.authenticated) {
        if (body.user !== null) throw new Error('unavailable');
        return {kind: 'guest'};
      }
      const user = body.user, id = user?.id;
      if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) throw new Error('unavailable');
      if ([user.userId, body.id, body.userId].some(alias => alias !== undefined && alias !== id)) throw new Error('unavailable');
      const csrf = typeof body.csrfToken === 'string' && body.csrfToken.length > 0 && body.csrfToken.length <= 4096 && !/[\x00-\x20\x7f]/.test(body.csrfToken) ? body.csrfToken : '';
      const name = typeof user.displayName === 'string' && user.displayName.length <= 160 ? user.displayName : '';
      return {kind: 'member', id, name, csrf};
    };
    async function refresh() {
      const revision = ++generation; state = {kind: 'loading'}; render();
      try { const next = await snapshot(); if (revision === generation) state = next; }
      catch { if (revision === generation) state = {kind: 'unavailable'}; }
      if (revision === generation) render();
    }
    async function signOut(owner) {
      busy = true; const revision = ++generation; state = {kind: 'loading'}; render();
      try {
        const fresh = await snapshot();
        if (revision !== generation) return;
        if (fresh.kind !== 'member' || fresh.id !== owner || !fresh.csrf) { state = fresh; return; }
        const receipt = await json('/api/v1/auth/logout', {method: 'POST', headers: {Accept: 'application/json', 'X-CSRF-Token': fresh.csrf}});
        if (receipt?.ok !== true || receipt.success !== true) throw new Error('unavailable');
        if (revision !== generation) return;
        const after = await snapshot();
        if (revision !== generation) return;
        if (after.kind !== 'guest') throw new Error('unavailable');
        state = after;
      } catch { if (revision === generation) state = {kind: 'unavailable'}; }
      finally { busy = false; render(); }
    }
    window.addEventListener('focus', refresh);
    window.addEventListener('mv39-language-change', render);
    void refresh();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true}); else start();
})();
