module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['standard', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  plugins: [],
  rules: {},
  globals: {
    wx: true,
    App: true,
    getApp: true,
    Page: true,
    getCurrentPages: true,
    Component: true,
    Behavior: true,
    WechatMiniprogram: true,
  },
  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-var-requires': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/ban-ts-comment': 0,
      },
    },
  ],
}
