module.exports = {
  env: {
    es6: true
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  extends: 'eslint:recommended',
  rules: {
    'no-multi-assign': ['error'],
    'brace-style': ['error', '1tbs'],
    eqeqeq: ['error', 'smart'],
    quotes: ['error', 'double', { allowTemplateLiterals: true }],
    'linebreak-style': ['error', 'unix'],
    semi: ['error', 'always'],
    indent: ['error', 'tab'],
    'eol-last': ['error', 'always'],
    'consistent-return': 0,
    'space-in-parens': ['error', 'never'],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always'
      }
    ],
    'space-before-blocks': ['error', 'always'],
    'space-infix-ops': ['error', { int32Hint: false }],
    'spaced-comment': ['warn', 'always', { exceptions: ['!'] }],
    'prefer-arrow-callback': 1,
    'prefer-spread': 1,
    'prefer-rest-params': 1,
    'template-curly-spacing': ['warn', 'never'],
    'no-multiple-empty-lines': ['error'],
    'no-unused-vars': ['error', { vars: 'all', args: 'none' }],
    'no-useless-constructor': 1,
    'no-var': 2,
    'no-duplicate-imports': 2,
    'no-console': 'off',
    'no-extra-semi': 2,
    'no-eval': 2,
    'no-invalid-this': 1,
    'no-new-func': 2,
    'no-return-await': 1,
    'no-self-compare': 2,
    'no-with': 2,
    'no-new-object': 2,
    'no-trailing-spaces': 2,
    'comma-spacing': ['error', { before: false, after: true }],
    'object-curly-spacing': ['error', 'always'],
    'prefer-object-spread': 1
  }
}
