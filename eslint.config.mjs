import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { languageOptions: { globals: globals.browser } },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
