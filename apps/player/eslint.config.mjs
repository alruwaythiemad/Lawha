import tseslint from 'typescript-eslint';
import lawha from '@lawha/eslint-plugin-lawha';

export default tseslint.config(
  { ignores: ['dist/**', 'src/generated/**', 'node_modules/**'] },
  ...tseslint.configs.recommended,
  {
    // Scoped to component code, per Task 5 — packages/tokens is where
    // these literals legitimately live.
    files: ['src/**/*.{ts,tsx}'],
    plugins: { lawha },
    rules: {
      'lawha/no-literal-design-values': 'error',
      'lawha/no-physical-direction-properties': 'error',
      'lawha/no-assembled-user-visible-strings': 'error',
      'lawha/no-dom-order-inversion': 'error',
    },
  },
);
