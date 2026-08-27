import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/.next/**', '**/node_modules/**', '**/generated/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // The original repository finished its TypeScript migration with zero
      // bare `any`. This project starts from that baseline, so it is an error.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
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
