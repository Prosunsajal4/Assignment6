export default [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        alert: 'readonly',
        localStorage: 'readonly',
        JSON: 'readonly',
      },
    },
    rules: {
      // Best practices
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'debug'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Code quality
      'eqeqeq': ['error', 'always'],
      'no-implicit-coercion': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      
      // Best practices for security
      'no-script-url': 'error',
      'no-with': 'error',
      'no-proto': 'error',
      
      // Style consistency
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'always-multiline'],
      'indent': ['error', 2],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    },
  },
];