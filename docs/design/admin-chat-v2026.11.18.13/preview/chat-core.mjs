/**
 * UI-only chat state. No network calls, no persistent storage and no identity headers.
 * Production support integration must be separately approved after Spring auth fixes.
 */
const PAGE_CATEGORIES = Object.freeze({
  admin: 'admin',
  community: 'community',
  wallet: 'wallet',
  bank: 'wallet',
  stocks: 'stocks',
  treasury: 'wallet',
  shop: 'shop',
  inventory: 'shop',
  quests: 'quests',
  work: 'quests',
  chat: 'community',
  board: 'community',
  clubs: 'community',
  blog: 'community',
  support: 'support',
  account: 'account',
  profile: 'account',
  login: 'account'
});

const CATEGORIES = new Set(['account', 'ledger', 'trading', 'item', 'bug', 'other']);

export function normalizePageContext(input) {
  if (typeof input !== 'string' || input.length > 2048) return 'other';
  const raw = input.trim();
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return 'other';
  try {
    const path = new URL(raw, 'https://moneyverse.preview.invalid').pathname;
    const first = path.split('/').filter(Boolean)[0]?.toLowerCase() ?? '';
    if (!first) return 'home';
    return Object.hasOwn(PAGE_CATEGORIES, first) ? PAGE_CATEGORIES[first] : 'other';
  } catch {
    return 'other';
  }
}

export function validateDraft(input) {
  const normalized = typeof input === 'string' ? input.trim() : '';
  if (!normalized) return { ok: false, error: 'EMPTY', normalized: '' };
  if (Array.from(normalized).length > 1000) {
    return { ok: false, error: 'TOO_LONG', normalized };
  }
  return { ok: true, error: null, normalized };
}

export function previewSubmission({ authenticated, text, category = 'other', context = '/' }) {
  const validation = validateDraft(text);
  if (!validation.ok) {
    return { ok: false, status: 'invalid', error: validation.error, message: '문의 내용을 확인해 주세요.' };
  }
  if (!authenticated) {
    return { ok: false, status: 'require_login', message: '실제 문의 및 1:1 채팅은 로그인이 필요합니다.' };
  }
  // Deliberately NEVER claim success nor call a backend in demo mode.
  return {
    ok: false,
    status: 'not_sent',
    category: CATEGORIES.has(category) ? category : 'other',
    context: normalizePageContext(context),
    message: '디자인 미리보기입니다. 메시지는 실제로 전송되지 않았습니다.'
  };
}

export function getLauncherGeometry({ viewportWidth, safeAreaInset = 0, hasBottomNav = true }) {
  const mobile = Number.isFinite(viewportWidth) && viewportWidth < 640;
  const safe = Math.max(0, Number.isFinite(safeAreaInset) ? safeAreaInset : 0);
  return Object.freeze({
    bottom: mobile ? (hasBottomNav ? 80 + safe : 20 + safe) : 24,
    right: mobile ? 14 : 24,
    size: 56
  });
}

export function createChatState({ authenticated = false, initialPath = '/' } = {}) {
  return Object.freeze({
    open: false,
    tab: 'support',
    draft: '',
    directDraft: '',
    category: 'other',
    context: normalizePageContext(initialPath),
    authenticated: Boolean(authenticated),
    notice: null
  });
}

export function transitionChatState(state, action) {
  switch (action?.type) {
    case 'OPEN': return Object.freeze({ ...state, open: true });
    case 'CLOSE': return Object.freeze({ ...state, open: false });
    case 'NAVIGATE':
      return Object.freeze({ ...state, context: normalizePageContext(action.path) });
    case 'SWITCH_TAB':
      return action.tab === 'support' || action.tab === 'direct'
        ? Object.freeze({ ...state, tab: action.tab, notice: null }) : state;
    case 'SET_CATEGORY':
      return Object.freeze({ ...state, category: CATEGORIES.has(action.category) ? action.category : 'other' });
    case 'SET_DRAFT':
      return state.tab === 'direct'
        ? Object.freeze({ ...state, directDraft: String(action.text ?? ''), notice: null })
        : Object.freeze({ ...state, draft: String(action.text ?? ''), notice: null });
    case 'SIGN_IN':
      return Object.freeze({ ...state, authenticated: true, notice: null });
    case 'SIGN_OUT':
      return Object.freeze({ ...state, authenticated: false, open: false, draft: '', directDraft: '', notice: null });
    case 'SUBMIT_PREVIEW': {
      const text = state.tab === 'direct' ? state.directDraft : state.draft;
      const result = previewSubmission({
        authenticated: state.authenticated, text, category: state.category, context: '/' + state.context
      });
      return Object.freeze({ ...state, notice: result });
    }
    default:
      throw new Error('Unknown chat action: ' + String(action?.type));
  }
}
