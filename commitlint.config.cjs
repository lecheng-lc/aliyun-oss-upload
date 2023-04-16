/**
 * @description commit-msg校验规则
 * @link https://commitlint.js.org/#/
 * @typeEnum
 * feat 新增功能
 * fix bug修复
 * refactor 代码重构
 * style 不影响程序逻辑的代码修改(修改空白字符，补全缺失的分号等)
 * test 新增测试用例或是更新现有测试
 * revert 回滚某个更早之前的提交
 * chore 改变构建流程、或者增加依赖库、工具等
 * merge 代码合并
 * docs 文档改动
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['docs', 'feat', 'fix', 'refactor', 'docs', 'chore', 'style', 'revert', 'merge']],
    'type-case': [0],
    'type-empty': [0],
    'scope-empty': [0],
    'scope-case': [0],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never'],
    'header-max-length': [0, 'always', 72],
  },
}
