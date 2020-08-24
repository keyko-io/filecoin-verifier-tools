module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2020: true,
  },
  extends: [
    'standard',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    camelcase: 'off',
    'comma-dangle': ['error', 'always-multiline'],
  },
}
