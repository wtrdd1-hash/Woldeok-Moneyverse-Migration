import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/.next/**', '**/node_modules/**', '**/generated/**', '.claude/**'] },
  js.configs.recommended,
  ...nextVitals,
  ...tseslint.configs.recommended,
  {
    settings: { react: { version: '19.1' } },
    rules: {
      // The original repository finished its TypeScript migration with zero
      // bare `any`. This project starts from that baseline, so it is an error.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      // A server action's first parameter is the previous state, which most
      // actions have no use for — but React decides the signature, not the
      // action. Naming it `_previous` says so.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // A timer handle and the callback that clears it refer to each other:
      // the callback has to be defined before the timer that calls it, and
      // the timer's handle has to exist for the callback to clear. Declaring
      // the handle first and assigning it once is the only order that works,
      // and rewriting it to satisfy the rule would obscure why.
      'prefer-const': ['error', { ignoreReadBeforeAssign: true }],
      // This repository uses App Router only; the rule searches for a legacy
      // pages directory and warns even though there is intentionally none.
      '@next/next/no-html-link-for-pages': 'off',
      // Next 16 enables two React compiler-oriented rules that would require a
      // broad behavioural refactor. Keep the pre-upgrade lint contract for now.
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // Next generates these; they are build output, not source.
    ignores: ['frontend/.next/**', 'frontend/next-env.d.ts'],
  },
  {
    // Input-sanitisation regexes name control characters on purpose: stripping
    // C0 and DEL is the point of /[<>\u0000-\u001f\u007f]/. no-control-regex
    // exists to catch a control character written by accident, which is the
    // opposite case.
    //
    // These literals are the repository's most delicate text. Editing tools
    // have, on at least four occasions in the original, replaced a
    // backslash-u escape with the raw byte it denotes -- the file still reads
    // correctly while the literal no longer means what it says. That hazard is
    // guarded by a byte-level check, not by this rule:
    //
    //   grep -rnP '[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]' backend/src
    //
    // which must print nothing, and which CI runs.
    files: ['**/*.ts'],
    rules: { 'no-control-regex': 'off' },
  },
  {
    // Operator scripts. Plain Node ESM, run inside a container on the
    // deployment host rather than bundled or executed here, so the browser
    // and Node globals they use are simply present.
    files: ['ops/**/*.mjs'],
    languageOptions: {
      globals: { console: 'readonly', fetch: 'readonly', process: 'readonly' },
    },
  },
  {
    // The backend compiles with emitDecoratorMetadata, and Nest resolves
    // constructor dependencies from the design:paramtypes that metadata
    // emits. A class named only in a constructor parameter position therefore
    // looks type-only to this rule while actually being needed at runtime:
    // rewriting such an import to `import type` erases the metadata and
    // breaks dependency injection with no compile error and no lint warning.
    // backend/src/auth/auth.module.test.ts is what catches that regression.
    files: ['backend/**/*.ts'],
    rules: { '@typescript-eslint/consistent-type-imports': 'off' },
  },
);
