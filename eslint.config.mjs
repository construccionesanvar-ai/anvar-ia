// Lint del proyecto: `npm run lint`. Reglas recomendadas de ESLint, con los
// globales que corresponden a cada parte (Node para el build y las funciones,
// navegador para public/app.js, que es un script clásico sin módulos).
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'servicios/', '**/*.html'] },
  js.configs.recommended,
  {
    files: ['src/**/*.mjs', 'scripts/**/*.mjs', 'tests/**/*.mjs', 'eslint.config.mjs'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: globals.node },
  },
  {
    // El E2E ejecuta funciones dentro del navegador (page.evaluate).
    files: ['scripts/e2e.mjs'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    files: ['api/**/*.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: globals.node },
  },
  {
    files: ['public/app.js'],
    languageOptions: { ecmaVersion: 2020, sourceType: 'script', globals: globals.browser },
  },
  {
    rules: {
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
      eqeqeq: ['error', 'smart'],
      'no-var': 'off',
    },
  },
];
