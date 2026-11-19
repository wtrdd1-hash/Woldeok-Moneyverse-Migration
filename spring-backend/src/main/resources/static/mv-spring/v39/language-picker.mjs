import {
  SUPPORTED_LOCALES, normalizeLocale, detectBrowserLocale,
  resolvePreference, buildLanguageUrl, readCookie
} from './locale-core.mjs';

const MANUAL_COOKIE = 'wdmv_locale';
const DETECTED_COOKIE = 'wdmv_detected_locale';
const SHARED_PREFERENCE_KEY = 'wdmv_locale_preference';

const names = Object.freeze({
  en: 'English', ko: '한국어', ja: '日本語', zh: '简体中文', vi: 'Tiếng Việt'
});

const copy = Object.freeze({
  en: { title:'Choose language', auto:'Automatic (browser language)', fallback:'The content of this Spring page currently uses English. Translation is still in progress.' },
  ko: { title:'언어 선택', auto:'자동 감지 (브라우저 언어)', fallback:'이 Spring 페이지 본문은 현재 영어로 표시됩니다. 번역 적용 중입니다.' },
  ja: { title:'言語を選択', auto:'自動検出（ブラウザー）', fallback:'このSpringページの本文は現在英語で表示されます。翻訳作業中です。' },
  zh: { title:'选择语言', auto:'自动检测（浏览器）', fallback:'此 Spring 页面的正文目前以英语显示，翻译正在进行中。' },
  vi: { title:'Chọn ngôn ngữ', auto:'Tự động (trình duyệt)', fallback:'Nội dung trang Spring này hiện hiển thị bằng tiếng Anh. Bản dịch đang được hoàn thiện.' }
});

function preferredBrowserLanguages() {
  const list = Array.isArray(navigator.languages) ? navigator.languages : [];
  return list.length > 0 ? list : [navigator.language].filter(Boolean);
}

function writeCookie(name, value, maxAge = 60 * 60 * 24 * 365) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = name + '=' + encodeURIComponent(value)
    + '; Path=/; Max-Age=' + maxAge + '; SameSite=Lax' + secure;
}

function labelNode(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

function option(text, selected, locale, handler) {
  const button = labelNode('button', text);
  button.type = 'button';
  button.className = 'mv-language-option';
  button.setAttribute('aria-pressed', String(selected));
  if (locale) {
    button.lang = locale;
    button.dataset.lang = locale;
  } else {
    button.dataset.mvAuto = 'true';
  }
  button.addEventListener('click', handler);
  return button;
}

function readSharedPreference() {
  try {
    const value = window.localStorage.getItem(SHARED_PREFERENCE_KEY);
    return value === 'auto' || normalizeLocale(value) ? value : null;
  } catch { return null; }
}

function writeSharedPreference(value) {
  try { window.localStorage.setItem(SHARED_PREFERENCE_KEY, value); }
  catch { /* Private mode or storage denied; cookie is enough for site navigation. */ }
}

function navigateTo(language, auto) {
  writeSharedPreference(auto ? 'auto' : language);
  if (auto) {
    writeCookie(MANUAL_COOKIE, '', 0);
    writeCookie(DETECTED_COOKIE, language);
  } else {
    writeCookie(MANUAL_COOKIE, language);
    writeCookie(DETECTED_COOKIE, '', 0);
  }
  const target = buildLanguageUrl(location.href, language, auto);
  window.location.assign(target);
}

function buildPicker(slot, locale, mode) {
  const localized = copy[locale] || copy.en;
  const details = document.createElement('details');
  details.className = 'mv-language-picker';
  details.dataset.mvLanguagePicker = 'v2026.11.19.39.1';
  const summary = document.createElement('summary');
  summary.setAttribute('aria-label', localized.title);
  summary.append(labelNode('span', '🌐'));
  const active = labelNode('span', locale.toUpperCase());
  active.className = 'mv-language-code';
  summary.append(active);
  details.append(summary);

  const panel = document.createElement('div');
  panel.className = 'mv-language-panel';
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', localized.title);
  panel.append(labelNode('strong', localized.title));
  const browserLocale = detectBrowserLocale(preferredBrowserLanguages());
  panel.append(option(localized.auto + ' · ' + browserLocale.toUpperCase(), mode === 'auto', null,
    () => navigateTo(browserLocale, true)));

  for (const value of SUPPORTED_LOCALES) {
    const selected = mode === 'manual' && value === locale;
    panel.append(option(names[value] + (selected ? ' ✓' : ''), selected, value,
      () => navigateTo(value, false)));
  }

  const translated = String(slot.dataset.mvNativeTranslations || 'en,ko').split(',');
  if (!translated.includes(locale)) {
    const disclaimer = labelNode('p', localized.fallback);
    disclaimer.className = 'mv-language-fallback';
    disclaimer.setAttribute('role', 'note');
    panel.append(disclaimer);
  }
  details.append(panel);
  slot.replaceChildren(details);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && details.open) {
      details.open = false;
      summary.focus();
    }
  });
}

function bootLanguagePickers() {
  const slots = document.querySelectorAll('[data-mv-language-slot]');
  if (!slots.length) return;
  const url = new URL(window.location.href);
  const manualCookie = readCookie(document.cookie, MANUAL_COOKIE);
  const sharedPreference = readSharedPreference();
  const isAutoUrl = url.searchParams.get('mv_auto') === '1';
  // The other eight Spring member screens already use wdmv_locale_preference
  // before wdmv_locale. Keep that precedence so switching across page families
  // never revives a stale manual selection.
  const manualSetting = sharedPreference === 'auto' ? null : (sharedPreference || manualCookie);
  const preference = resolvePreference({
    urlLanguage: url.searchParams.get('lang') || url.searchParams.get('locale'),
    isAutoUrl,
    savedLanguage: manualSetting,
    browserLanguages: preferredBrowserLanguages()
  });

  const rendered = normalizeLocale(url.searchParams.get('lang'));
  if (rendered !== preference.locale || (preference.mode === 'auto' && !isAutoUrl)) {
    // Every supported native Spring route receives ?lang=..., which allows EN/KO
    // server-rendered content to follow browser/manual selection. The picker
    // must never silently declare JA/ZH/VI native business copy translated.
    window.location.replace(buildLanguageUrl(url.href, preference.locale, preference.mode === 'auto'));
    return;
  }
  for (const slot of slots) buildPicker(slot, preference.locale, preference.mode);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootLanguagePickers, { once:true });
} else {
  bootLanguagePickers();
}
