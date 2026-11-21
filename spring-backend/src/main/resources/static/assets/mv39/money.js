/* Exact price ratios keep canonical decimal strings outside floating-point arithmetic. */
(function () {
  'use strict';
  function decimal(value) {
    if (typeof value === 'number' && !Number.isSafeInteger(value)) return null;
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    const match = /^(0|[1-9]\d{0,37})(?:\.(\d{1,18}))?$/.exec(String(value));
    if (!match) return null;
    const fraction = match[2] || '';
    return { units: BigInt(match[1] + fraction), scale: fraction.length };
  }
  function percentageChange(price, open) {
    const a = decimal(price), b = decimal(open);
    if (!a || !b || b.units === 0n) return null;
    const scale = Math.max(a.scale, b.scale);
    const current = a.units * 10n ** BigInt(scale - a.scale);
    const initial = b.units * 10n ** BigInt(scale - b.scale);
    const delta = current - initial;
    const magnitude = delta < 0n ? -delta : delta;
    const hundredths = (magnitude * 10000n + initial / 2n) / initial;
    return (delta < 0n ? '-' : '+') + (hundredths / 100n).toString()
      + '.' + (hundredths % 100n).toString().padStart(2, '0') + '%';
  }
  window.MV39Money = Object.freeze({ percentageChange });
})();
