/**
 * Public read-only v24 Next snapshots are served by Spring as immutable HTML,
 * not a running Next RSC server. Next <Link> client transitions send Flight
 * requests and misinterpret Spring HTML. Use native document navigation until
 * real Next Flight OR equivalent Spring page transitions are fully verified.
 *
 * IMPORTANT: only inject on the 13 allowlisted v24 static public HTML routes.
 * Do not change login/admin/member routes or override user intent for modifier
 * clicks, downloads, external links, hash anchors or target=_blank.
 */
(() => {
  'use strict';
  if (window.__mvStaticSnapshotNativeNavigation === 'v2026.11.18.27') return;
  window.__mvStaticSnapshotNativeNavigation = 'v2026.11.18.27';
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    let target = event.target;
    if (!(target instanceof Element)) target = target?.parentElement;
    const anchor = target?.closest?.('a[href]');
    if (!anchor || anchor.hasAttribute('download') || anchor.getAttribute('target') && anchor.getAttribute('target') !== '_self') return;
    const raw = anchor.getAttribute('href');
    if (!raw || raw.startsWith('#') || raw.startsWith('javascript:') || raw.startsWith('mailto:') || raw.startsWith('tel:')) return;
    let destination;
    try { destination = new URL(anchor.href, window.location.href); } catch { return; }
    if (!['http:', 'https:'].includes(destination.protocol) || destination.origin !== window.location.origin) return;
    if (destination.pathname === location.pathname && destination.search === location.search && destination.hash) return;
    // Runs in capture phase before React's delegated bubble listeners.
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(destination.href);
  }, true);
})();
