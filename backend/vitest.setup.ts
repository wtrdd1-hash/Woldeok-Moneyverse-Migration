import { VERSION_NEUTRAL } from '@nestjs/common';

// Ensure VERSION_NEUTRAL symbol has a clean string representation for template strings
if (typeof VERSION_NEUTRAL === 'symbol') {
  Object.defineProperty(Symbol.prototype, 'toString', {
    value: function (this: symbol) {
      return this.description ?? '';
    },
    configurable: true,
    writable: true,
  });
}
