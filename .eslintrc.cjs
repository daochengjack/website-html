module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'import', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.base.json'
      }
    }
  },
  rules: {
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true }
      }
    ]
  },
  ignorePatterns: ['node_modules', 'dist', 'build', '.turbo', '.next'],
  overrides: [
    {
      files: ['apps/frontend/**/*.{ts,tsx,js,jsx}'],
      extends: ['next/core-web-vitals'],
      rules: {
        '@next/next/no-html-link-for-pages': 'off'
      }
    },
    {
      files: ['apps/backend/**/*.{ts,tsx,js,jsx}'],
      env: {
        node: true
      }
    },
    {
      files: ['*.config.{js,cjs,mjs}', '*.config.{ts}'],
      env: {
        node: true
      }
    }
  ]
};
